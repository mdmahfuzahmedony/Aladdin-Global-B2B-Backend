import { Router } from "express";
import {
  getAllBackups,
  getBackupStats,
  getVendorWiseBackupStatus,
} from "../../controllers/admin/backupAdmin.controller";

const router = Router();

router.get("/", getAllBackups);
router.get("/stats", getBackupStats);
router.get("/vendor-wise", getVendorWiseBackupStatus);

export default router;
