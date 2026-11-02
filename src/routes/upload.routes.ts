import { Router } from "express";
import multer from "multer";

import {
  requireAuth,
  requireRole,
} from "../middleware/auth-middleware";

import {
  uploadProductImage,
  deleteProductImage,
  uploadStoreImage,
  uploadBannerImage,
  uploadCategoryImage,
} from "../controllers/Upload.controller";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

/* =========================================================
   PRODUCT IMAGE
========================================================= */

router.post(
  "/product-image",
  requireAuth,
  requireRole(
    "SUPER_ADMIN",
    "MANAGER",
    "VENDOR"
  ),
  upload.single("file"),
  uploadProductImage
);

router.delete(
  "/product-image",
  requireAuth,
  requireRole(
    "SUPER_ADMIN",
    "MANAGER",
    "VENDOR"
  ),
  deleteProductImage
);

/* =========================================================
   VENDOR STORE IMAGE
========================================================= */

router.post(
  "/store-image",
  requireAuth,
  requireRole("VENDOR"),
  upload.single("file"),
  uploadStoreImage
);

/* =========================================================
   ADMIN BANNER IMAGE
========================================================= */

router.post(
  "/banner-image",
  requireAuth,
  requireRole(
    "SUPER_ADMIN",
    "MANAGER"
  ),
  upload.single("file"),
  uploadBannerImage
);

/* =========================================================
   CATEGORY IMAGE
========================================================= */

router.post(
  "/category-image",
  requireAuth,
  requireRole(
    "SUPER_ADMIN",
    "MANAGER"
  ),
  upload.single("file"),
  uploadCategoryImage
);

export default router;