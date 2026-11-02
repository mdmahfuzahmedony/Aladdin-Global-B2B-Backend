import { Router } from "express";

import {
  getSettings,
  updateSettings,
  getMaintenanceStatus,
} from "../../controllers/admin/settings.controller";

const router = Router();

// ============================================================
// GET: /api/settings
// Database থেকে saved settings আনে
// ============================================================

router.get("/", getSettings);

// ============================================================
// GET: /api/settings/maintenance
// শুধু maintenance status আনে
// ============================================================

router.get(
  "/maintenance",
  getMaintenanceStatus
);

// ============================================================
// POST: /api/settings/update
// Settings save/update করে
// ============================================================

router.post(
  "/update",
  updateSettings
);

export default router;