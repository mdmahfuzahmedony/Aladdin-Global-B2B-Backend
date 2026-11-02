import { Router } from "express";

import {
  requireAuth,
  requireRole,
} from "../middleware/auth-middleware";

import {
  createBrand,
  getBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
} from "../controllers/Brand.controller";

const router = Router();

// =====================================================
// GET ALL BRANDS
// =====================================================

router.get("/", getBrands);

// =====================================================
// GET BRAND BY ID
// =====================================================

router.get("/:id", getBrandById);

// =====================================================
// CREATE BRAND
// =====================================================

router.post(
  "/",
  requireAuth,
  requireRole("SUPER_ADMIN", "MANAGER"),
  createBrand
);

// =====================================================
// UPDATE BRAND
// =====================================================

router.put(
  "/:id",
  requireAuth,
  requireRole("SUPER_ADMIN", "MANAGER"),
  updateBrand
);

// =====================================================
// DELETE BRAND
// =====================================================

router.delete(
  "/:id",
  requireAuth,
  requireRole("SUPER_ADMIN", "MANAGER"),
  deleteBrand
);

export default router;