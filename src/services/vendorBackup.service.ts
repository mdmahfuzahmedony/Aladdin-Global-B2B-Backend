import { prisma } from "../config/prisma";
import { decrypt, encrypt } from "../utils/encryption";
import {
  buildDriveClient,
  createDriveFolder,
  getOrCreateRootFolder,
  refreshAccessToken,
  uploadPDFToDrive,
  verifyFileExists,
} from "./googleDrive.service";
import {
  generateCustomerPDF,
  generateProductPDF,
  CustomerRecord,
  ProductRecord,
} from "./pdfGenerator.service";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-BD", { timeZone: "Asia/Dhaka" });
}

function formatDateTime(date: Date): string {
  return date
    .toLocaleString("en-BD", {
      timeZone: "Asia/Dhaka",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(/[/: ,]/g, "-");
}

function padNumber(n: number): string {
  return String(n).padStart(3, "0");
}

// ─── Get Valid Access Token (auto-refresh) ────────────────────────────────────

async function getValidAccessToken(googleDriveId: string): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const record = await prisma.vendorGoogleDrive.findUniqueOrThrow({
    where: { id: googleDriveId },
  });

  const accessToken = decrypt(record.accessToken);
  const refreshToken = decrypt(record.refreshToken);

  // Refresh if expires within next 5 minutes
  const isExpired = record.tokenExpiry <= new Date(Date.now() + 5 * 60 * 1000);
  if (!isExpired) return { accessToken, refreshToken };

  const refreshed = await refreshAccessToken(refreshToken);
  await prisma.vendorGoogleDrive.update({
    where: { id: googleDriveId },
    data: { accessToken: encrypt(refreshed.accessToken), tokenExpiry: refreshed.expiry },
  });

  return { accessToken: refreshed.accessToken, refreshToken };
}

// ─── Collect Customer Data Snapshot ──────────────────────────────────────────

async function collectCustomerData(vendorId: string): Promise<CustomerRecord[]> {
  const orders = await prisma.customerOrder.findMany({
    where: { vendorOrders: { some: { vendorId } } },
    include: {
      customer: { select: { fullName: true, phone: true, email: true } },
      items: {
        where: { vendorId },
        select: { productTitle: true, quantity: true, unitPrice: true, totalPrice: true },
      },
      payments: {
        select: { amount: true, provider: true, createdAt: true, status: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // Group by customer
  type CustomerEntry = {
    name: string;
    phone: string;
    salesTotal: number;
    paidTotal: number;
    sales: CustomerRecord["salesHistory"];
    payments: CustomerRecord["paymentHistory"];
  };

  const customerMap = new Map<string, CustomerEntry>();

  for (const order of orders) {
    const customerId = order.customerId;
    const name = order.customer?.fullName ?? order.shippingName ?? "Unknown";
    const phone = order.customer?.phone ?? order.customer?.email ?? order.shippingPhone ?? "-";

    const existing: CustomerEntry = customerMap.get(customerId) ?? {
      name,
      phone,
      salesTotal: 0,
      paidTotal: 0,
      sales: [] as CustomerRecord["salesHistory"],
      payments: [] as CustomerRecord["paymentHistory"],
    };

    const orderTotal = order.items.reduce(
      (sum: number, item: { totalPrice: { toNumber?: () => number } & (number | object) }) =>
        sum + Number(item.totalPrice),
      0
    );

    const description = order.items
      .map((i) => `${i.productTitle} x${i.quantity}`)
      .join(", ");

    existing.salesTotal += orderTotal;
    existing.sales.push({
      date: formatDate(order.createdAt),
      amount: orderTotal,
      description,
    });

    // Count only PAID payments
    for (const payment of order.payments) {
      if (payment.status === "PAID") {
        const paidAmt = Number(payment.amount);
        existing.paidTotal += paidAmt;
        existing.payments.push({
          date: formatDate(payment.createdAt),
          amount: paidAmt,
          method: payment.provider,
        });
      }
    }

    customerMap.set(customerId, existing);
  }

  return [...customerMap.values()].map(
    (c): CustomerRecord => ({
      name: c.name,
      phone: c.phone,
      totalDue: Math.max(0, c.salesTotal - c.paidTotal),
      totalPaid: c.paidTotal,
      salesHistory: c.sales,
      paymentHistory: c.payments,
    })
  );
}

// ─── Collect Product Data Snapshot ───────────────────────────────────────────

async function collectProductData(vendorId: string): Promise<ProductRecord[]> {
  const products = await prisma.product.findMany({
    where: { vendorId },
    include: {
      category: { select: { name: true } },
      pricing: { select: { customerRegularPrice: true } },
    },
  });

  return products.map(
    (p): ProductRecord => ({
      name: p.title ?? "Unnamed Product",
      category: p.category?.name ?? "Uncategorized",
      purchasePrice: 0, // purchase price not stored in schema
      sellingPrice: p.pricing?.customerRegularPrice ?? 0,
      stock: p.stockQuantity ?? 0,
      description: p.description ?? undefined,
    })
  );
}

// ─── Main Backup Runner ───────────────────────────────────────────────────────

export async function runVendorBackup(vendorId: string): Promise<void> {
  // 1. Load Google Drive connection
  const googleDriveRecord = await prisma.vendorGoogleDrive.findUnique({ where: { vendorId } });
  if (!googleDriveRecord || !googleDriveRecord.connected) {
    throw new Error("Google Drive not connected. Please connect your Google Drive first.");
  }

  // 2. Load vendor info
  const vendor = await prisma.vendor.findUniqueOrThrow({
    where: { id: vendorId },
    select: { storeName: true },
  });

  // 3. Get next backup number
  const lastBackup = await prisma.vendorBackup.findFirst({
    where: { vendorId },
    orderBy: { backupNumber: "desc" },
    select: { backupNumber: true },
  });
  const backupNumber = (lastBackup?.backupNumber ?? 0) + 1;

  // 4. Create backup record
  const backup = await prisma.vendorBackup.create({
    data: { vendorId, googleDriveId: googleDriveRecord.id, backupNumber, status: "PENDING" },
  });

  try {
    // 5. Snapshot
    await prisma.vendorBackup.update({
      where: { id: backup.id },
      data: { status: "SNAPSHOT_TAKEN", startedAt: new Date() },
    });

    const [customers, products] = await Promise.all([
      collectCustomerData(vendorId),
      collectProductData(vendorId),
    ]);

    await prisma.vendorBackup.update({
      where: { id: backup.id },
      data: { customerCount: customers.length, productCount: products.length, status: "PDF_GENERATING" },
    });

    // 6. Generate PDFs
    const backupLabel = padNumber(backupNumber);
    const dateStr = formatDateTime(new Date());

    const [customerPdfBuffer, productPdfBuffer] = await Promise.all([
      generateCustomerPDF(vendor.storeName, backupLabel, customers),
      generateProductPDF(vendor.storeName, backupLabel, products),
    ]);

    await prisma.vendorBackup.update({ where: { id: backup.id }, data: { status: "UPLOADING" } });

    // 7. Drive upload
    const { accessToken, refreshToken } = await getValidAccessToken(googleDriveRecord.id);
    const drive = buildDriveClient(accessToken, refreshToken);

    const rootFolderId = await getOrCreateRootFolder(drive, googleDriveRecord.driveFolderName);
    const storeFolderId = await getOrCreateRootFolder(drive, `${vendor.storeName} — Backups`);
    const backupFolderName = `Backup #${backupLabel} — ${dateStr}`;
    const backupFolderId = await createDriveFolder(drive, backupFolderName, storeFolderId);

    const customerFileName = `Backup-${backupLabel}_Customers-Due_${dateStr}.pdf`;
    const productFileName = `Backup-${backupLabel}_Products_${dateStr}.pdf`;

    const [customerUpload, productUpload] = await Promise.all([
      uploadPDFToDrive(drive, customerFileName, customerPdfBuffer, backupFolderId),
      uploadPDFToDrive(drive, productFileName, productPdfBuffer, backupFolderId),
    ]);

    await prisma.vendorBackup.update({ where: { id: backup.id }, data: { status: "VERIFYING" } });

    // 8. Verify
    const [customerOk, productOk] = await Promise.all([
      verifyFileExists(drive, customerUpload.fileId),
      verifyFileExists(drive, productUpload.fileId),
    ]);

    if (!customerOk || !productOk) {
      throw new Error("Drive file verification failed — one or both files not found after upload.");
    }

    // 9. Mark SUCCESS
    await prisma.vendorBackup.update({
      where: { id: backup.id },
      data: {
        status: "SUCCESS",
        completedAt: new Date(),
        backupFolderName,
        backupFolderId,
        customerPdfName: customerFileName,
        customerPdfUrl: customerUpload.viewUrl,
        customerPdfFileId: customerUpload.fileId,
        productPdfName: productFileName,
        productPdfUrl: productUpload.viewUrl,
        productPdfFileId: productUpload.fileId,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await prisma.vendorBackup.update({
      where: { id: backup.id },
      data: { status: "FAILED", errorMessage: message, retryCount: { increment: 1 } },
    });
    throw err;
  }
}

// ─── Retry Failed Backup ──────────────────────────────────────────────────────

export async function retryBackup(backupId: string, vendorId: string): Promise<void> {
  const backup = await prisma.vendorBackup.findFirst({
    where: { id: backupId, vendorId, status: "FAILED" },
  });
  if (!backup) throw new Error("Backup not found or not in FAILED state");

  await prisma.vendorBackup.update({
    where: { id: backupId },
    data: { status: "PENDING", errorMessage: null },
  });

  await runVendorBackup(vendorId);
}
