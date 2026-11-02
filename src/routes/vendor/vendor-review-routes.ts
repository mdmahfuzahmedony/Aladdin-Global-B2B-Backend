
import { Router } from "express";

import {
  bulkUpdateVendorReviewStatus,
  getVendorReviewById,
  getVendorReviews,
  updateVendorReviewStatus,
} from "../../controllers/vendor/vendor-review-controller";
import { requireAuth, requireRole } from "../../middleware/auth-middleware";



const router = Router();

// লগইন করা এবং VENDOR role থাকা বাধ্যতামূলক
router.use(requireAuth, requireRole("VENDOR"));

router.get("/", getVendorReviews);

// Bulk route-টি :id route-এর আগে
router.patch("/bulk-status", bulkUpdateVendorReviewStatus);

router.get("/:id", getVendorReviewById);
router.patch("/:id/status", updateVendorReviewStatus);

export default router;
