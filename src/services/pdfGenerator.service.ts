import PDFDocument from "pdfkit";
import { Writable } from "stream";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CustomerRecord {
  name: string;
  phone: string;
  address?: string;
  totalDue: number;
  totalPaid: number;
  salesHistory: { date: string; amount: number; description: string }[];
  paymentHistory: { date: string; amount: number; method: string }[];
}

export interface ProductRecord {
  name: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  description?: string;
  imageRef?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pdfToBuffer(doc: PDFKit.PDFDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const writable = new Writable({
      write(chunk, _enc, cb) {
        chunks.push(chunk);
        cb();
      },
    });
    doc.pipe(writable);
    writable.on("finish", () => resolve(Buffer.concat(chunks)));
    writable.on("error", reject);
    doc.end();
  });
}

function drawHeader(doc: PDFKit.PDFDocument, title: string, vendorName: string, backupNumber: string) {
  // Navy header bar
  doc.rect(0, 0, doc.page.width, 70).fill("#12233F");

  doc
    .fillColor("#D6A419")
    .fontSize(18)
    .font("Helvetica-Bold")
    .text("Aladdin Global B2B", 40, 20);

  doc
    .fillColor("#ffffff")
    .fontSize(11)
    .font("Helvetica")
    .text(`${title}  |  ${vendorName}`, 40, 44);

  doc
    .fillColor("#aaaaaa")
    .fontSize(9)
    .text(`Backup #${backupNumber}  |  Generated: ${new Date().toLocaleString("en-BD", { timeZone: "Asia/Dhaka" })}`, { align: "right" });

  doc.moveDown(2);
}

function drawSectionTitle(doc: PDFKit.PDFDocument, text: string) {
  doc
    .fillColor("#12233F")
    .fontSize(12)
    .font("Helvetica-Bold")
    .text(text);
  doc
    .moveTo(doc.x, doc.y)
    .lineTo(doc.page.width - 40, doc.y)
    .strokeColor("#D6A419")
    .lineWidth(1)
    .stroke();
  doc.moveDown(0.5);
}

function drawTableRow(
  doc: PDFKit.PDFDocument,
  columns: { text: string; width: number }[],
  isHeader = false,
  y?: number
) {
  const startX = 40;
  const rowY = y ?? doc.y;
  const rowHeight = 20;

  if (isHeader) {
    doc.rect(startX, rowY, doc.page.width - 80, rowHeight).fill("#f0f4ff");
  } else if (!isHeader) {
    doc.rect(startX, rowY, doc.page.width - 80, rowHeight).fill("#fafafa").stroke("#e2e8f0");
  }

  let x = startX;
  for (const col of columns) {
    doc
      .fillColor(isHeader ? "#12233F" : "#334155")
      .fontSize(isHeader ? 9 : 8.5)
      .font(isHeader ? "Helvetica-Bold" : "Helvetica")
      .text(col.text, x + 4, rowY + 5, { width: col.width - 8, lineBreak: false });
    x += col.width;
  }

  doc.y = rowY + rowHeight + 2;
}

// ─── Customer PDF ─────────────────────────────────────────────────────────────

export async function generateCustomerPDF(
  vendorName: string,
  backupNumber: string,
  customers: CustomerRecord[]
): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 40, size: "A4" });

  drawHeader(doc, "Customer & Due Report", vendorName, backupNumber);

  // Summary box
  const totalCustomers = customers.length;
  const totalDue = customers.reduce((sum, c) => sum + c.totalDue, 0);
  const totalPaid = customers.reduce((sum, c) => sum + c.totalPaid, 0);

  doc.roundedRect(40, doc.y, doc.page.width - 80, 50, 6).fill("#fff7e6");
  const summaryY = doc.y + 10;
  doc.fillColor("#92400e").fontSize(9).font("Helvetica-Bold");
  doc.text(`Total Customers: ${totalCustomers}`, 55, summaryY);
  doc.text(`Total Due: ৳${totalDue.toFixed(2)}`, 200, summaryY);
  doc.text(`Total Collected: ৳${totalPaid.toFixed(2)}`, 350, summaryY);
  doc.y = summaryY + 35;
  doc.moveDown(1);

  // Customer list table
  drawSectionTitle(doc, "Customer List");

  const colWidths = [25, 120, 90, 80, 80, 115];
  const cols = ["#", "Name", "Phone", "Total Due (৳)", "Paid (৳)", "Address"];

  drawTableRow(doc, cols.map((text, i) => ({ text, width: colWidths[i] })), true);

  customers.forEach((c, idx) => {
    if (doc.y > doc.page.height - 100) doc.addPage();

    drawTableRow(doc, [
      { text: String(idx + 1), width: colWidths[0] },
      { text: c.name, width: colWidths[1] },
      { text: c.phone, width: colWidths[2] },
      { text: c.totalDue.toFixed(2), width: colWidths[3] },
      { text: c.totalPaid.toFixed(2), width: colWidths[4] },
      { text: c.address ?? "-", width: colWidths[5] },
    ]);
  });

  doc.moveDown(2);

  // Detailed due breakdown per customer
  for (const customer of customers) {
    if (customer.salesHistory.length === 0 && customer.paymentHistory.length === 0) continue;
    if (doc.y > doc.page.height - 150) doc.addPage();

    drawSectionTitle(doc, `${customer.name} — Detail`);

    if (customer.salesHistory.length > 0) {
      doc.fillColor("#475569").fontSize(9).font("Helvetica-Bold").text("Sales:");
      doc.moveDown(0.3);

      const sCols = [100, 80, 330];
      drawTableRow(doc, [
        { text: "Date", width: sCols[0] },
        { text: "Amount (৳)", width: sCols[1] },
        { text: "Description", width: sCols[2] },
      ], true);

      for (const sale of customer.salesHistory) {
        if (doc.y > doc.page.height - 60) doc.addPage();
        drawTableRow(doc, [
          { text: sale.date, width: sCols[0] },
          { text: sale.amount.toFixed(2), width: sCols[1] },
          { text: sale.description, width: sCols[2] },
        ]);
      }
      doc.moveDown(0.5);
    }

    if (customer.paymentHistory.length > 0) {
      doc.fillColor("#475569").fontSize(9).font("Helvetica-Bold").text("Payments:");
      doc.moveDown(0.3);

      const pCols = [100, 80, 330];
      drawTableRow(doc, [
        { text: "Date", width: pCols[0] },
        { text: "Amount (৳)", width: pCols[1] },
        { text: "Method", width: pCols[2] },
      ], true);

      for (const payment of customer.paymentHistory) {
        if (doc.y > doc.page.height - 60) doc.addPage();
        drawTableRow(doc, [
          { text: payment.date, width: pCols[0] },
          { text: payment.amount.toFixed(2), width: pCols[1] },
          { text: payment.method, width: pCols[2] },
        ]);
      }
    }

    doc.moveDown(1.5);
  }

  // Footer
  const pageCount = (doc as any).bufferedPageRange().count;
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);
    doc
      .fillColor("#94a3b8")
      .fontSize(8)
      .text(`Page ${i + 1} of ${pageCount}  |  Aladdin Global B2B  |  Confidential`, 40, doc.page.height - 30, {
        align: "center",
      });
  }

  return pdfToBuffer(doc);
}

// ─── Product PDF ──────────────────────────────────────────────────────────────

export async function generateProductPDF(
  vendorName: string,
  backupNumber: string,
  products: ProductRecord[]
): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 40, size: "A4", bufferPages: true });

  drawHeader(doc, "Product Inventory Report", vendorName, backupNumber);

  // Summary
  const totalProducts = products.length;
  const totalStock = products.reduce((s, p) => s + p.stock, 0);
  const totalValue = products.reduce((s, p) => s + p.stock * p.purchasePrice, 0);

  doc.roundedRect(40, doc.y, doc.page.width - 80, 50, 6).fill("#f0fdf4");
  const sy = doc.y + 10;
  doc.fillColor("#166534").fontSize(9).font("Helvetica-Bold");
  doc.text(`Total Products: ${totalProducts}`, 55, sy);
  doc.text(`Total Stock Units: ${totalStock}`, 200, sy);
  doc.text(`Inventory Value: ৳${totalValue.toFixed(2)}`, 370, sy);
  doc.y = sy + 35;
  doc.moveDown(1);

  drawSectionTitle(doc, "Product Inventory");

  const colWidths = [25, 150, 90, 65, 65, 55, 60];
  drawTableRow(doc, [
    { text: "#", width: colWidths[0] },
    { text: "Product Name", width: colWidths[1] },
    { text: "Category", width: colWidths[2] },
    { text: "Purchase ৳", width: colWidths[3] },
    { text: "Selling ৳", width: colWidths[4] },
    { text: "Stock", width: colWidths[5] },
    { text: "Margin %", width: colWidths[6] },
  ], true);

  products.forEach((p, idx) => {
    if (doc.y > doc.page.height - 100) doc.addPage();

    const margin = p.purchasePrice > 0
      ? (((p.sellingPrice - p.purchasePrice) / p.purchasePrice) * 100).toFixed(1)
      : "-";

    drawTableRow(doc, [
      { text: String(idx + 1), width: colWidths[0] },
      { text: p.name, width: colWidths[1] },
      { text: p.category, width: colWidths[2] },
      { text: p.purchasePrice.toFixed(2), width: colWidths[3] },
      { text: p.sellingPrice.toFixed(2), width: colWidths[4] },
      { text: String(p.stock), width: colWidths[5] },
      { text: `${margin}%`, width: colWidths[6] },
    ]);
  });

  // Footer
  const pageCount = (doc as any).bufferedPageRange().count;
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);
    doc
      .fillColor("#94a3b8")
      .fontSize(8)
      .text(`Page ${i + 1} of ${pageCount}  |  Aladdin Global B2B  |  Confidential`, 40, doc.page.height - 30, {
        align: "center",
      });
  }

  return pdfToBuffer(doc);
}
