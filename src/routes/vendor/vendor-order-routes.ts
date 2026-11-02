
import { Router } from "express";
import {
  getVendorOrderDetails,
  getVendorOrders,
  updateVendorOrderStatus,
  deleteVendorOrder,
  bulkDeleteVendorOrders,
} from "../../controllers/vendor/vendor-order-controller";
import { requireAuth } from "../../middleware/auth-middleware";

const router = Router();

// Vendor order list
router.get("/", requireAuth, getVendorOrders);

// Bulk delete — অবশ্যই /:orderId-এর আগে
router.delete("/bulk", requireAuth, bulkDeleteVendorOrders);

// Single order details
router.get("/:orderId", requireAuth, getVendorOrderDetails);

// Update order status
router.patch("/:orderId/status", requireAuth, updateVendorOrderStatus);

// Delete a single order
router.delete("/:orderId", requireAuth, deleteVendorOrder);

export default router;
