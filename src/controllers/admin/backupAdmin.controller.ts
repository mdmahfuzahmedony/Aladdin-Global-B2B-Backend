import { Request, Response } from "express";
import { prisma } from "../../config/prisma";

// ─── GET /api/admin/backups ───────────────────────────────────────────────────
// Admin view: all vendor backups with stats

export async function getAllBackups(req: Request, res: Response) {
  try {
    const { vendorId, status, page = "1", limit = "20" } = req.query as Record<string, string>;

    const take = Math.min(Number(limit), 100);
    const skip = (Number(page) - 1) * take;

    const where: any = {};
    if (vendorId) where.vendorId = vendorId;
    if (status) where.status = status;

    const [backups, total] = await Promise.all([
      prisma.vendorBackup.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take,
        skip,
        include: {
          vendor: { select: { storeName: true } },
        },
      }),
      prisma.vendorBackup.count({ where }),
    ]);

    return res.json({
      success: true,
      data: backups,
      pagination: { total, page: Number(page), limit: take },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to get backups" });
  }
}

// ─── GET /api/admin/backups/stats ─────────────────────────────────────────────

export async function getBackupStats(req: Request, res: Response) {
  try {
    const [
      totalVendors,
      connectedVendors,
      totalBackups,
      successBackups,
      failedBackups,
      pendingBackups,
    ] = await Promise.all([
      prisma.vendor.count(),
      prisma.vendorGoogleDrive.count({ where: { connected: true } }),
      prisma.vendorBackup.count(),
      prisma.vendorBackup.count({ where: { status: "SUCCESS" } }),
      prisma.vendorBackup.count({ where: { status: "FAILED" } }),
      prisma.vendorBackup.count({
        where: { status: { in: ["PENDING", "SNAPSHOT_TAKEN", "PDF_GENERATING", "UPLOADING", "VERIFYING"] } },
      }),
    ]);

    return res.json({
      success: true,
      data: {
        totalVendors,
        connectedVendors,
        disconnectedVendors: totalVendors - connectedVendors,
        totalBackups,
        successBackups,
        failedBackups,
        pendingBackups,
        successRate: totalBackups > 0 ? ((successBackups / totalBackups) * 100).toFixed(1) : "0",
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to get stats" });
  }
}

// ─── GET /api/admin/backups/vendor-wise ───────────────────────────────────────

export async function getVendorWiseBackupStatus(req: Request, res: Response) {
  try {
    const vendors = await prisma.vendor.findMany({
      select: {
        id: true,
        storeName: true,
        googleDrive: {
          select: { connected: true, googleEmail: true, connectedAt: true },
        },
        backups: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            backupNumber: true,
            status: true,
            completedAt: true,
            customerCount: true,
            productCount: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ success: true, data: vendors });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to get vendor-wise status" });
  }
}
