
import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth-middleware";
import { createDeliveryPayment } from "../services/payment.service";
import { bkashCallback, completeMockDeliveryPayment, initiateDeliveryPayment } from "../controllers/payments/payment.controller";
import { getMyPayments } from "../controllers/customer/customer-payment.controller";



const router = Router();

// Customer নিজের delivery payment record তৈরি করবে
router.post(
  "/delivery-charge",
  requireAuth,
  requireRole("CUSTOMER"),
  createDeliveryPayment
);

// Customer bKash payment শুরু করবে
router.post(
  "/delivery/initiate",
  requireAuth,
  requireRole("CUSTOMER"),
  initiateDeliveryPayment
);

// Development-only Mock payment complete
router.post(
  "/delivery/mock/complete",
  requireAuth,
  requireRole("CUSTOMER"),
  completeMockDeliveryPayment
);

// bKash gateway callback
// Gateway redirect-এর সময় customer session নাও থাকতে পারে।
// তাই controller-এর মধ্যে server-side transaction verification বাধ্যতামূলক।
router.get(
  "/delivery/bkash/callback",
  bkashCallback
);

// Customer নিজের payment history দেখবে
router.get(
  "/my-payments",
  requireAuth,
  requireRole("CUSTOMER"),
  getMyPayments
);



export default router;
