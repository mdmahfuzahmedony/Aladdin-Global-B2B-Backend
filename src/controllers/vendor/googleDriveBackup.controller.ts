import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { encrypt } from "../../utils/encryption";
import {
  exchangeCodeForTokens,
  getAuthUrl,
} from "../../services/googleDrive.service";
import { runVendorBackup, retryBackup } from "../../services/vendorBackup.service";

// ─── GET /api/vendor/google-drive/auth-url ────────────────────────────────────
// Returns Google OAuth URL for vendor to click

export async function getGoogleAuthUrl(req: Request, res: Response) {
  try {
    const vendorId = (req as any).vendor?.vendorId as string;
    if (!vendorId) return res.status(401).json({ success: false, error: "Unauthorized" });

    const url = getAuthUrl(vendorId);
    return res.json({ success: true, data: { url } });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to generate auth URL" });
  }
}

// ─── GET /api/google/callback ─────────────────────────────────────────────────
// OAuth callback — saves tokens in DB

export async function googleOAuthCallback(req: Request, res: Response) {
  const { code, state: vendorId, error } = req.query as Record<string, string>;

  const frontendBase = process.env.FRONTEND_URL || "http://localhost:3000";

  if (error || !code || !vendorId) {
    return res.redirect(`${frontendBase}/vendor/settings?drive=error&msg=${encodeURIComponent(error ?? "Missing code")}`);
  }

  try {
    const { accessToken, refreshToken, expiry, email } = await exchangeCodeForTokens(code);

    await prisma.vendorGoogleDrive.upsert({
      where: { vendorId },
      update: {
        accessToken: encrypt(accessToken),
        refreshToken: encrypt(refreshToken),
        tokenExpiry: expiry,
        googleEmail: email,
        connected: true,
        updatedAt: new Date(),
      },
      create: {
        vendorId,
        accessToken: encrypt(accessToken),
        refreshToken: encrypt(refreshToken),
        tokenExpiry: expiry,
        googleEmail: email,
        connected: true,
        driveFolderName: "Aladdin B2B Backups",
      },
    });

    return res.redirect(`${frontendBase}/vendor/settings?drive=connected&email=${encodeURIComponent(email)}`);
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    return res.redirect(`${frontendBase}/vendor/settings?drive=error&msg=token-exchange-failed`);
  }
}

// ─── GET /api/vendor/google-drive/status ─────────────────────────────────────

export async function getDriveStatus(req: Request, res: Response) {
  try {
    const vendorId = (req as any).vendor?.vendorId as string;
    if (!vendorId) return res.status(401).json({ success: false, error: "Unauthorized" });

    const record = await prisma.vendorGoogleDrive.findUnique({
      where: { vendorId },
      select: { connected: true, googleEmail: true, connectedAt: true, driveFolderName: true },
    });

    return res.json({
      success: true,
      data: record
        ? { connected: record.connected, email: record.googleEmail, connectedAt: record.connectedAt, folderName: record.driveFolderName }
        : { connected: false },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to get Drive status" });
  }
}

// ─── DELETE /api/vendor/google-drive/disconnect ───────────────────────────────

export async function disconnectDrive(req: Request, res: Response) {
  try {
    const vendorId = (req as any).vendor?.vendorId as string;
    if (!vendorId) return res.status(401).json({ success: false, error: "Unauthorized" });

    await prisma.vendorGoogleDrive.updateMany({
      where: { vendorId },
      data: { connected: false },
    });

    return res.json({ success: true, message: "Google Drive disconnected" });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to disconnect" });
  }
}

// ─── GET /api/vendor/backups ──────────────────────────────────────────────────

export async function getBackupHistory(req: Request, res: Response) {
  try {
    const vendorId = (req as any).vendor?.vendorId as string;
    if (!vendorId) return res.status(401).json({ success: false, error: "Unauthorized" });

    const backups = await prisma.vendorBackup.findMany({
      where: { vendorId },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        backupNumber: true,
        status: true,
        errorMessage: true,
        retryCount: true,
        customerCount: true,
        productCount: true,
        customerPdfUrl: true,
        productPdfUrl: true,
        backupFolderName: true,
        startedAt: true,
        completedAt: true,
        createdAt: true,
      },
    });

    return res.json({ success: true, data: backups });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to get backup history" });
  }
}

// ─── POST /api/vendor/backups/:id/retry ──────────────────────────────────────

export async function retryFailedBackup(req: Request, res: Response) {
  try {
    const vendorId = (req as any).vendor?.vendorId as string;
    const { id: backupId } = req.params;
    if (!vendorId) return res.status(401).json({ success: false, error: "Unauthorized" });

    // Run async — return immediately, backup runs in background
    void retryBackup(String(backupId), String(vendorId)).catch((err: unknown) =>
      console.error(`Backup retry failed for vendor ${vendorId}:`, err)
    );

    return res.json({ success: true, message: "Backup retry started" });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to start retry" });
  }
}

// ─── PATCH /api/vendor/settings/store-toggle ─────────────────────────────────
// The CORE toggle — backup-first, then go offline

export async function toggleStoreActive(req: Request, res: Response) {
  try {
    const vendorId = (req as any).vendor?.vendorId as string;
    if (!vendorId) return res.status(401).json({ success: false, error: "Unauthorized" });

    const { active } = req.body as { active: boolean };

    // If turning ON — just turn on, no backup needed
    if (active) {
      await prisma.vendorSettings.updateMany({
        where: { vendorId },
        data: { storeActive: true },
      });

      return res.json({ success: true, data: { storeActive: true }, message: "Store is now online" });
    }

    // Turning OFF — check Drive connection
    const driveRecord = await prisma.vendorGoogleDrive.findUnique({
      where: { vendorId },
      select: { connected: true, id: true },
    });

    if (!driveRecord || !driveRecord.connected) {
      return res.status(400).json({
        success: false,
        error: "Google Drive not connected. Connect your Drive before going offline.",
        code: "DRIVE_NOT_CONNECTED",
      });
    }

    // Start backup process (runs synchronously here — returns after completion/failure)
    try {
      await runVendorBackup(vendorId);
    } catch (backupErr) {
      const message = backupErr instanceof Error ? backupErr.message : "Backup failed";
      return res.status(500).json({
        success: false,
        error: `Backup failed: ${message}. Store remains online. Please retry.`,
        code: "BACKUP_FAILED",
      });
    }

    // Backup succeeded — now go offline
    await prisma.vendorSettings.updateMany({
      where: { vendorId },
      data: { storeActive: false },
    });

    return res.json({
      success: true,
      data: { storeActive: false },
      message: "Backup complete. Store is now offline.",
    });
  } catch (err) {
    console.error("Toggle error:", err);
    return res.status(500).json({ success: false, error: "Failed to toggle store" });
  }
}
