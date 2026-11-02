import { Router } from "express";

import {
  requireAuth,
  requireRole,
} from "../middleware/auth-middleware";

import { createManager } from "../controllers/manager.controller";

const router = Router();

// Super Admin only
router.post(
  "/create",
  requireAuth,
  requireRole("SUPER_ADMIN"),
  createManager
);

export default router;