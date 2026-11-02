
import { Router } from "express";
import { getVendorDashboardOverview } from "../../controllers/vendor/vendor-dashboard-controller";
import { requireAuth } from "../../middleware/auth-middleware";

const router = Router();

router.get(
  "/overview",
  requireAuth,
  getVendorDashboardOverview
);

export default router;
