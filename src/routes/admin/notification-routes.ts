import { Router } from "express";

import { requireAuth } from "../../middleware/auth-middleware";

import {
  deleteNotification,
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../../controllers/admin/notification-controller";

const router = Router();

router.get(
  "/",
  requireAuth,
  getNotifications
);

router.get(
  "/unread-count",
  requireAuth,
  getUnreadNotificationCount
);

router.patch(
  "/read-all",
  requireAuth,
  markAllNotificationsAsRead
);

router.patch(
  "/:id/read",
  requireAuth,
  markNotificationAsRead
);

router.delete(
  "/:id",
  requireAuth,
  deleteNotification
);

export default router;