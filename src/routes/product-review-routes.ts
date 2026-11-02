
import { Router } from "express";

import { requireAuth } from "../middleware/auth-middleware";
import { createProductReview, getProductReviews } from "../controllers/product-review-controller";

const router = Router();

// নির্দিষ্ট প্রোডাক্টের প্রকাশিত রিভিউ দেখাবে
router.get("/:productId/reviews", getProductReviews);

// লগইন করা কাস্টমার রিভিউ জমা দিতে পারবে
router.post("/:productId/reviews", requireAuth, createProductReview);

export default router;
