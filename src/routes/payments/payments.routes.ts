import { Router } from "express";

import {
  requireAuth,
  requireRole,
} from "../../middleware/auth-middleware";

import {
  bkashCallback,
  completeMockDeliveryPayment,
  initiateDeliveryPayment,
} from "../../controllers/payments/payment.controller";

import {
  getMyPayments,
} from "../../controllers/customer/customer-payment.controller";

const router = Router();

router.post(
  "/delivery/initiate",
  requireAuth,
  requireRole("CUSTOMER"),
  initiateDeliveryPayment
);

router.post(
  "/delivery/mock/complete",
  requireAuth,
  requireRole("CUSTOMER"),
  completeMockDeliveryPayment
);

router.get(
  "/delivery/bkash/callback",
  bkashCallback
);

router.get(
  "/my-payments",
  requireAuth,
  requireRole("CUSTOMER"),
  getMyPayments
);

export default router;