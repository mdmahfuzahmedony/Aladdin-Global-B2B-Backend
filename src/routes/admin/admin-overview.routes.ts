import { Router } from "express";
import { requireAuth } from "../../middleware/auth-middleware";
import { getAdminOverview } from "../../controllers/admin/admin-overview.controller";

const router = Router();

// GET /api/admin/overview
router.get("/", requireAuth, getAdminOverview);

export default router;
