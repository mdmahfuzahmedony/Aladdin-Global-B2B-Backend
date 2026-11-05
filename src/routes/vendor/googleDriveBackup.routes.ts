import { Router } from "express";
import {
  getGoogleAuthUrl,
  getDriveStatus,
  disconnectDrive,
  getBackupHistory,
  retryFailedBackup,
  toggleStoreActive,
} from "../../controllers/vendor/googleDriveBackup.controller";

const router = Router();

// Google Drive connection
router.get("/google-drive/auth-url", getGoogleAuthUrl);
router.get("/google-drive/status", getDriveStatus);
router.delete("/google-drive/disconnect", disconnectDrive);

// Backup history
router.get("/backups", getBackupHistory);
router.post("/backups/:id/retry", retryFailedBackup);

// Store toggle (the main feature)
router.patch("/settings/store-toggle", toggleStoreActive);

export default router;
