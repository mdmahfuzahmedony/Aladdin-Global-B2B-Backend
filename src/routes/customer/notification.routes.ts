import { Router } from "express";

import {
  getNotificationSettings,
  updateNotificationSettings,
  getMyNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteMyNotification,
} from "../../controllers/customer/notification.controller";

import { requireAuth } from "../../middleware/auth-middleware";

const router = Router();

/* =========================================================
   ALL CUSTOMER NOTIFICATION ROUTES REQUIRE LOGIN
========================================================= */

router.use(requireAuth);

/* =========================================================
   CUSTOMER NOTIFICATION SETTINGS
========================================================= */

// GET customer notification preferences
router.get(
  "/settings",
  getNotificationSettings
);

// UPDATE customer notification preferences
router.patch(
  "/settings",
  updateNotificationSettings
);

/* =========================================================
   CUSTOMER NOTIFICATIONS
========================================================= */

// Get all my notifications
router.get(
  "/",
  getMyNotifications
);

// Get unread notification count
router.get(
  "/unread-count",
  getUnreadNotificationCount
);

// Mark one notification as read
router.patch(
  "/:id/read",
  markNotificationAsRead
);

// Mark all notifications as read
router.patch(
  "/read-all",
  markAllNotificationsAsRead
);

// Delete one notification
router.delete(
  "/:id",
  deleteMyNotification
);

export default router;