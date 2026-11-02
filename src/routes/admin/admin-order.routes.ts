
import { Router } from "express";
import {
  requireAuth,
  requireRole,
} from "../../middleware/auth-middleware";

import {
  getAdminOrderDetails,
  getAllAdminOrders,
  updateAdminVendorOrderStatus,
} from "../../controllers/admin/admin-order.controller";

const router = Router();

// সব Admin order route-এ authentication ও Super Admin / Manager role লাগবে
router.use(requireAuth, requireRole("SUPER_ADMIN", "MANAGER"));

// সব CustomerOrder দেখা, সার্চ, ফিল্টার ও pagination
router.get("/", getAllAdminOrders);

// একটি CustomerOrder-এর বিস্তারিত দেখা
router.get("/:orderId", getAdminOrderDetails);

// নির্দিষ্ট VendorOrder-এর status আপডেট
router.patch(
  "/vendor/:vendorOrderId/status",
  updateAdminVendorOrderStatus
);

export default router;
