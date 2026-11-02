
import { Router } from "express";

import {
  requireAuth,
  requireRole,
} from "../../middleware/auth-middleware";

import {
  createDeliveryPayment,
  getMyPayments,
} from "../../controllers/customer/customer-payment.controller";

const router = Router();

// Delivery charge payment record তৈরি
router.post(
  "/initiate",
  requireAuth,
  requireRole("CUSTOMER"),
  createDeliveryPayment
);

// লগইন করা Customer-এর সব Payment
router.get(
  "/",
  requireAuth,
  requireRole("CUSTOMER"),
  getMyPayments
);

export default router;
