// import { Router } from "express";

// import {
//   getOrders,
//   getOrderById,
//   createOrder,
//   updateOrderStatus,
//   updatePaymentStatus,
//   deleteOrder,
//   getOrderStats,
// } from "../controllers/order.controller";

// import {
//   requireAuth,
//   requireRole,
// } from "../middleware/auth-middleware";

// const router = Router();

// /*
// |--------------------------------------------------------------------------
// | Order Statistics
// |--------------------------------------------------------------------------
// */

// router.get(
//   "/stats",
//   requireAuth,
//   requireRole("SUPER_ADMIN", "MANAGER"),
//   getOrderStats
// );

// /*
// |--------------------------------------------------------------------------
// | Get All Orders
// |--------------------------------------------------------------------------
// */

// router.get(
//   "/",
//   requireAuth,
//   requireRole("SUPER_ADMIN", "MANAGER"),
//   getOrders
// );

// /*
// |--------------------------------------------------------------------------
// | Create Order
// |--------------------------------------------------------------------------
// */

// router.post(
//   "/",
//   requireAuth,
//   createOrder
// );

// /*
// |--------------------------------------------------------------------------
// | Get Single Order
// |--------------------------------------------------------------------------
// */

// router.get(
//   "/:id",
//   requireAuth,
//   getOrderById
// );

// /*
// |--------------------------------------------------------------------------
// | Update Order Status
// |--------------------------------------------------------------------------
// */

// router.patch(
//   "/:id/status",
//   requireAuth,
//   requireRole("SUPER_ADMIN", "MANAGER"),
//   updateOrderStatus
// );

// /*
// |--------------------------------------------------------------------------
// | Update Payment Status
// |--------------------------------------------------------------------------
// */

// router.patch(
//   "/:id/payment-status",
//   requireAuth,
//   requireRole("SUPER_ADMIN", "MANAGER"),
//   updatePaymentStatus
// );

// /*
// |--------------------------------------------------------------------------
// | Delete Order
// |--------------------------------------------------------------------------
// */

// router.delete(
//   "/:id",
//   requireAuth,
//   requireRole("SUPER_ADMIN", "MANAGER"),
//   deleteOrder
// );

// export default router;