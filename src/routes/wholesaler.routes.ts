import { Router } from "express";

import {
  registerWholesaler,
} from "../controllers/wholesaler.controller";

const router = Router();

// Wholesaler Registration
router.post("/register", registerWholesaler);

export default router;