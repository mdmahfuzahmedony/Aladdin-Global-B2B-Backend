
import { Router } from "express";
import { requireAuth } from "../../middleware/auth-middleware";
import { getVendorReports } from "../../controllers/vendor/vendor-reports-controller";

const router = Router();

router.get("/", requireAuth, getVendorReports);

export default router;