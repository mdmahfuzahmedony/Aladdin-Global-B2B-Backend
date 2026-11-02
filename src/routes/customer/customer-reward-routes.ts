import { Router } from "express";
import { requireAuth } from "../../middleware/auth-middleware";
import { getMyRewardPoints } from "../../controllers/customer/customer-reward.controller";

const router = Router();

router.get("/me", requireAuth, getMyRewardPoints);
router.get("/", requireAuth, getMyRewardPoints);

export default router;
