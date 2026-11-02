import { Router } from "express";

import { requireAuth } from "../../middleware/auth-middleware";

import {
  getActivities,
} from "../../controllers/admin/activity-controller";

const router = Router();

router.get(
  "/",
  requireAuth,
  getActivities
);

export default router;