
import { Router } from "express";

import {
  requireAuth,
  requireRole,
} from "../middleware/auth-middleware";

import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getHomeProducts,
  getProductBySlug,
  getProducts,
  updateProduct,
} from "../controllers/Product.controller";

const router = Router();

// =====================================================
// HOME PRODUCTS
// GET /api/products/home/:placement
// =====================================================

router.get(
  "/home/:placement",
  getHomeProducts
);

// =====================================================
// PUBLIC PRODUCTS
// GET /api/products
// GET /api/products?type=new-arrivals
// GET /api/products?type=flash-sale
// GET /api/products?type=featured
// GET /api/products?type=best-sellers
// GET /api/products?search=iphone
// =====================================================

router.get(
  "/",
  getProducts
);

// =====================================================
// GET ALL PRODUCTS (ADMIN)
// GET /api/products/admin/all
// =====================================================

router.get(
  "/admin/all",
  requireAuth,
  requireRole("SUPER_ADMIN", "MANAGER"),
  getAllProducts
);

// =====================================================
// CREATE PRODUCT WITH OPTIONAL COUPON
// POST /api/products
// =====================================================

router.post(
  "/",
  requireAuth,
  requireRole("SUPER_ADMIN", "MANAGER", "VENDOR"),
  createProduct
);

// =====================================================
// PRODUCT DETAILS BY SLUG
// GET /api/products/:slug
// =====================================================

router.get(
  "/:slug",
  getProductBySlug
);

// =====================================================
// UPDATE PRODUCT
// PUT /api/products/:id
// =====================================================

router.put(
  "/:id",
  requireAuth,
  requireRole("SUPER_ADMIN", "MANAGER", "VENDOR"),
  updateProduct
);

// =====================================================
// DELETE PRODUCT
// DELETE /api/products/:id
// =====================================================

router.delete(
  "/:id",
  requireAuth,
  requireRole("SUPER_ADMIN", "MANAGER", "VENDOR"),
  deleteProduct
);

export default router;
