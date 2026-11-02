
import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";

import {
  registerVendor,
  getVendors,
  getMyStoreSettings,
  updateMyStoreSettings,
  getMyVendorProducts,
  getVendorStore,
  getVendorDetails,
  updateVendor,
  updateVendorStatus,
  bulkUpdateVendorStatus,
  deleteVendor,
  bulkDeleteVendors,
  requestStoreChange,
  getMyStoreChangeRequests,
  getAdminVendorChangeRequests,
  reviewVendorChangeRequest,
} from "../controllers/vendor.controller";

import {
  getMyProductCoupon,
  createMyProductCoupon,
  updateMyCoupon,
  updateMyCouponStatus,
  deleteMyCoupon,
} from "../controllers/vendor/vendorCoupon.controller";

import {
  requireAuth,
  requireRole,
} from "../middleware/auth-middleware";

const router = Router();

// Allowed document formats: PDF, JPG, JPEG, PNG, WebP
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const uploadVendorDocuments = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB per file
    files: 4,
    fields: 30,
    parts: 40,
  },

  fileFilter: (_req, file, callback) => {
    const mimeType = file.mimetype.toLowerCase();

    console.log("[VENDOR FILE FILTER HIT]", {
      filename: file.originalname,
      mimetype: mimeType,
      fieldName: file.fieldname,
    });

    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      callback(
        new Error(
          `Unsupported file type "${mimeType}". Allowed: PDF, JPG, JPEG, PNG, WebP.`
        )
      );
      return;
    }

    callback(null, true);
  },
});

// Accept four separate document fields
const handleUpload = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  uploadVendorDocuments.fields([
    { name: "nidFrontDocument", maxCount: 1 },
    { name: "nidBackDocument", maxCount: 1 },
    { name: "tradeLicenseDocument", maxCount: 1 },
    { name: "tinDocument", maxCount: 1 },
  ])(req, res, (error: unknown) => {
    if (error) {
      console.error("[VENDOR UPLOAD ERROR]", error);

      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          res.status(400).json({
            success: false,
            message: "à¦ªà§à¦°à¦¤à¦¿à¦Ÿà¦¿ à¦«à¦¾à¦‡à¦²à§‡à¦° à¦¸à¦¾à¦‡à¦œ à¦¸à¦°à§à¦¬à§‹à¦šà§à¦š à§¨à§¦ MB à¦¹à¦¤à§‡ à¦ªà¦¾à¦°à¦¬à§‡à¥¤",
          });
          return;
        }

        if (error.code === "LIMIT_UNEXPECTED_FILE") {
          res.status(400).json({
            success: false,
            message:
              "à¦…à¦ªà§à¦°à¦¤à§à¦¯à¦¾à¦¶à¦¿à¦¤ à¦«à¦¾à¦‡à¦² à¦«à¦¿à¦²à§à¦¡à¥¤ NID Front, NID Back, Trade License à¦“ TIN-à¦à¦° field name à¦ªà¦°à§€à¦•à§à¦·à¦¾ à¦•à¦°à§‹à¥¤",
          });
          return;
        }

        if (error.code === "LIMIT_FILE_COUNT") {
          res.status(400).json({
            success: false,
            message: "à¦¸à¦°à§à¦¬à§‹à¦šà§à¦š à§ªà¦Ÿà¦¿ à¦«à¦¾à¦‡à¦² à¦†à¦ªà¦²à§‹à¦¡ à¦•à¦°à¦¾ à¦¯à¦¾à¦¬à§‡à¥¤",
          });
          return;
        }

        if (error.code === "LIMIT_PART_COUNT") {
          res.status(400).json({
            success: false,
            message: "à¦…à¦¨à§à¦°à§‹à¦§à§‡ à¦…à¦¤à¦¿à¦°à¦¿à¦•à§à¦¤ form fields à¦¬à¦¾ files à¦°à§Ÿà§‡à¦›à§‡à¥¤",
          });
          return;
        }

        res.status(400).json({
          success: false,
          message: `File upload error: ${error.message}`,
        });
        return;
      }

      res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "File upload failed.",
      });
      return;
    }

    next();
  });
};

// POST /api/vendors/register
router.post(
  "/register",
  handleUpload,
  (req: Request, _res: Response, next: NextFunction) => {
    console.log(
      "[VENDOR REGISTER] Content-Type:",
      req.headers["content-type"]
    );

    console.log(
      "[VENDOR REGISTER] Body fields:",
      Object.keys(req.body ?? {})
    );

    const files = req.files as
      | Record<string, Express.Multer.File[]>
      | undefined;

    console.log(
      "[VENDOR REGISTER] Uploaded files:",
      Object.entries(files ?? {}).map(([field, items]) => ({
        field,
        files: items.map((file) => ({
          name: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
        })),
      }))
    );

    next();
  },
  registerVendor
);

// GET /api/vendors
router.get(
  "/",
  requireAuth,
  requireRole("SUPER_ADMIN", "MANAGER"),
  getVendors
);

// GET /api/vendors/store/settings
router.get(
  "/store/settings",
  requireAuth,
  requireRole("VENDOR"),
  getMyStoreSettings
);

// PUT /api/vendors/store/settings
router.put(
  "/store/settings",
  requireAuth,
  requireRole("VENDOR"),
  updateMyStoreSettings
);

// POST /api/vendors/store/change-request
router.post(
  "/store/change-request",
  requireAuth,
  requireRole("VENDOR"),
  requestStoreChange
);

// GET /api/vendors/store/change-request
router.get(
  "/store/change-request",
  requireAuth,
  requireRole("VENDOR"),
  getMyStoreChangeRequests
);

// GET /api/vendors/change-requests/all
router.get(
  "/change-requests/all",
  requireAuth,
  requireRole("SUPER_ADMIN", "MANAGER"),
  getAdminVendorChangeRequests
);

// PATCH /api/vendors/change-requests/:id/review
router.patch(
  "/change-requests/:id/review",
  requireAuth,
  requireRole("SUPER_ADMIN", "MANAGER"),
  reviewVendorChangeRequest
);

// GET /api/vendors/me/products
router.get(
  "/me/products",
  requireAuth,
  requireRole("VENDOR"),
  getMyVendorProducts
);

// Product coupon routes
// GET    /api/vendors/me/products/:productId/coupon
// POST   /api/vendors/me/products/:productId/coupon
// PUT    /api/vendors/me/products/:productId/coupon
// PATCH  /api/vendors/me/products/:productId/coupon/status
// DELETE /api/vendors/me/products/:productId/coupon
router.get(
  "/me/products/:productId/coupon",
  requireAuth,
  requireRole("VENDOR", "SUPER_ADMIN", "MANAGER"),
  getMyProductCoupon
);

router.post(
  "/me/products/:productId/coupon",
  requireAuth,
  requireRole("VENDOR", "SUPER_ADMIN", "MANAGER"),
  createMyProductCoupon
);

router.put(
  "/me/products/:productId/coupon",
  requireAuth,
  requireRole("VENDOR", "SUPER_ADMIN", "MANAGER"),
  updateMyCoupon
);

router.patch(
  "/me/products/:productId/coupon",
  requireAuth,
  requireRole("VENDOR", "SUPER_ADMIN", "MANAGER"),
  updateMyCoupon
);

router.patch(
  "/me/products/:productId/coupon/status",
  requireAuth,
  requireRole("VENDOR", "SUPER_ADMIN", "MANAGER"),
  updateMyCouponStatus
);

router.delete(
  "/me/products/:productId/coupon",
  requireAuth,
  requireRole("VENDOR", "SUPER_ADMIN", "MANAGER"),
  deleteMyCoupon
);

// Public vendor store
router.get("/store/:vendorId", getVendorStore);

// Vendor details
router.get("/:vendorId", getVendorDetails);

// Update vendor
router.put(
  "/:vendorId",
  requireAuth,
  requireRole("SUPER_ADMIN", "MANAGER"),
  updateVendor
);

// Bulk update vendor status
router.patch(
  "/bulk-status",
  requireAuth,
  requireRole("SUPER_ADMIN", "MANAGER"),
  bulkUpdateVendorStatus
);

// Update vendor status
router.patch(
  "/:vendorId/status",
  requireAuth,
  requireRole("SUPER_ADMIN", "MANAGER"),
  updateVendorStatus
);

// Bulk delete vendors
router.delete(
  "/bulk",
  requireAuth,
  requireRole("SUPER_ADMIN", "MANAGER"),
  bulkDeleteVendors
);

// Delete vendor
router.delete(
  "/:vendorId",
  requireAuth,
  requireRole("SUPER_ADMIN", "MANAGER"),
  deleteVendor
);

export default router;
