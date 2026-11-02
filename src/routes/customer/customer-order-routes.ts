import { Router } from "express";

import {
  requireAuth,
  requireRole,
} from "../../middleware/auth-middleware";

import {
  cancelMyCustomerOrder,
  createCodOrder,
  createCustomerOrder,
  getMyCustomerOrderDetails,
  getMyCustomerOrders,
  validateCustomerCoupon,
} from "../../controllers/customer/customer-order.controller";
import { createPendingCheckout } from "../../controllers/payments/pending-checkout.controller";


const router = Router();

// ============================================
// CREATE CASH ON DELIVERY (COD) ORDER
// POST /api/customer/orders/cod
// ============================================
router.post(
  "/cod",
  requireAuth,
  requireRole("CUSTOMER"),
  createCodOrder
);

// ============================================
// CREATE PENDING CHECKOUT
// POST /api/customer/orders/checkout
// ============================================
router.post(
  "/checkout",
  requireAuth,
  requireRole("CUSTOMER"),
  createPendingCheckout
);

// ============================================
// VALIDATE CUSTOMER COUPON
// POST /api/customer/orders/validate-coupon
// ============================================
router.post(
  "/validate-coupon",
  requireAuth,
  requireRole("CUSTOMER"),
  validateCustomerCoupon
);

// ============================================
// CREATE CUSTOMER ORDER
// POST /api/customer/orders
// পুরোনো Order API
// ============================================
router.post(
  "/",
  requireAuth,
  requireRole("CUSTOMER"),
  createCustomerOrder
);

// ============================================
// GET CUSTOMER ORDERS
// GET /api/customer/orders
// ============================================
router.get(
  "/",
  requireAuth,
  requireRole("CUSTOMER"),
  getMyCustomerOrders
);

// ============================================
// GET CUSTOMER ORDER DETAILS
// GET /api/customer/orders/:orderId
// ============================================
router.get(
  "/:orderId",
  requireAuth,
  requireRole("CUSTOMER"),
  getMyCustomerOrderDetails
);

// ============================================
// CANCEL CUSTOMER ORDER
// PATCH /api/customer/orders/:orderId/cancel
// ============================================
router.patch(
  "/:orderId/cancel",
  requireAuth,
  requireRole("CUSTOMER"),
  cancelMyCustomerOrder
);

export default router;
