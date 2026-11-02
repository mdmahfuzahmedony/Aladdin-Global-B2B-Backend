import { Router } from "express";

import {
  requireAuth,
  requireRole,
} from "../middleware/auth-middleware";

import {
  bulkCreateCategories,
  createCategory,
  getCategories,
  deleteCategory,
  getMainCategoriesWithProductCount,
  reorderCategories,
  updateCategoryImage,
} from "../controllers/Category.controller";

const router = Router();

/**
 * --------------------------------------------------------------------------
 * Public category API
 * --------------------------------------------------------------------------
 * Homepage-এ category দেখানোর জন্য login প্রয়োজন নেই।
 */
router.get(
  "/main-with-count",
  getMainCategoriesWithProductCount
);

/**
 * --------------------------------------------------------------------------
 * Protected category APIs
 * --------------------------------------------------------------------------
 */

// Category list
router.get(
  "/",
  requireAuth,
  requireRole("SUPER_ADMIN", "MANAGER", "VENDOR"),
  getCategories
);

// Create main category or subcategory
router.post(
  "/",
  requireAuth,
  requireRole("SUPER_ADMIN", "MANAGER"),
  createCategory
);

// Bulk create categories
router.post(
  "/bulk-create",
  requireAuth,
  requireRole("SUPER_ADMIN", "MANAGER"),
  bulkCreateCategories
);

// Reorder main categories and subcategories
router.patch(
  "/reorder",
  requireAuth,
  requireRole("SUPER_ADMIN", "MANAGER"),
  reorderCategories
);

router.patch(
  "/:id/image",
  requireAuth,
  requireRole("SUPER_ADMIN", "MANAGER"),
  updateCategoryImage
);

// Delete category
router.delete(
  "/:id",
  requireAuth,
  requireRole("SUPER_ADMIN", "MANAGER"),
  deleteCategory
);

export default router;