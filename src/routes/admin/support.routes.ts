import { Router } from "express";

import {
  getSupportSettings,
  updateSupportSettings,
} from "../../controllers/admin/support.controller";

const router = Router();

// GET: /api/support
router.get("/", getSupportSettings);

// POST: /api/support/update
router.post("/update", updateSupportSettings);

export default router;