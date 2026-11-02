import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth-middleware";
import { getAdminReports } from "../../controllers/admin/admin-report-controller";

const router = Router();

router.get(
  "/",
  requireAuth,
  requireRole("SUPER_ADMIN", "MANAGER", "ADMIN"),
  getAdminReports
);

export default router;
