
import express, { Router } from "express";
import {
  bookSteadfastCourier,
  getSteadfastTracking,
  handleSteadfastWebhook,
} from "../controllers/courier.controller";
import {
  requireAuth,
  requireRole,
} from "../middleware/auth-middleware";

const router = Router();

// =====================================================
// STEADFAST WEBHOOK
// Public endpoint for Steadfast server (verified via X-Signature)
// =====================================================
router.post(
  "/steadfast/webhook",
  express.raw({ type: "application/json" }),
  handleSteadfastWebhook
);

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleSteadfastWebhook
);

// Seller নিজের VendorOrder-এর জন্য Steadfast বুক করবে
router.post(
  "/vendor-orders/:vendorOrderId/book",
  requireAuth,
  requireRole("VENDOR"),
  bookSteadfastCourier
);

// Seller নিজের VendorOrder-এর Tracking Status দেখবে
router.get(
  "/vendor-orders/:vendorOrderId/tracking",
  requireAuth,
  requireRole("VENDOR"),
  getSteadfastTracking
);

export default router;
