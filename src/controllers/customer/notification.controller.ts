import { Response } from "express";
import { AuthRequest } from "../../middleware/auth-middleware";
import { prisma } from "../../config/prisma";



/* =========================================================
   GET NOTIFICATION SETTINGS
   GET /api/users/me/notifications/settings
========================================================= */

export const getNotificationSettings = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const settings =
      await prisma.userNotificationSettings.upsert({
        where: {
          userId: req.user.id,
        },

        update: {},

        create: {
          userId: req.user.id,
        },
      });

    return res.status(200).json({
      success: true,
      settings,
    });
  } catch (error: any) {
    console.error(
      "Get Notification Settings Error:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        error?.message ||
        "Failed to fetch notification settings",
    });
  }
};

/* =========================================================
   UPDATE NOTIFICATION SETTINGS
   PATCH /api/users/me/notifications/settings
========================================================= */

export const updateNotificationSettings = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const {
      emailNotifications,
      orderUpdates,
      promotionalOffers,
      wishlistAlerts,
      securityAlerts,
    } = req.body;

    const settings =
      await prisma.userNotificationSettings.upsert({
        where: {
          userId: req.user.id,
        },

        update: {
          ...(typeof emailNotifications === "boolean" && {
            emailNotifications,
          }),

          ...(typeof orderUpdates === "boolean" && {
            orderUpdates,
          }),

          ...(typeof promotionalOffers === "boolean" && {
            promotionalOffers,
          }),

          ...(typeof wishlistAlerts === "boolean" && {
            wishlistAlerts,
          }),

          ...(typeof securityAlerts === "boolean" && {
            securityAlerts,
          }),
        },

        create: {
          userId: req.user.id,

          emailNotifications:
            typeof emailNotifications === "boolean"
              ? emailNotifications
              : true,

          orderUpdates:
            typeof orderUpdates === "boolean"
              ? orderUpdates
              : true,

          promotionalOffers:
            typeof promotionalOffers === "boolean"
              ? promotionalOffers
              : false,

          wishlistAlerts:
            typeof wishlistAlerts === "boolean"
              ? wishlistAlerts
              : true,

          securityAlerts:
            typeof securityAlerts === "boolean"
              ? securityAlerts
              : true,
        },
      });

    return res.status(200).json({
      success: true,
      message: "Notification settings updated successfully",
      settings,
    });
  } catch (error: any) {
    console.error(
      "Update Notification Settings Error:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        error?.message ||
        "Failed to update notification settings",
    });
  }
};

/* =========================================================
   GET MY NOTIFICATIONS
   GET /api/users/me/notifications
========================================================= */

export const getMyNotifications = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const notifications =
      await prisma.notification.findMany({
        where: {
          userId: req.user.id,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    return res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error: any) {
    console.error(
      "Get My Notifications Error:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        error?.message ||
        "Failed to fetch notifications",
    });
  }
};

/* =========================================================
   GET UNREAD NOTIFICATION COUNT
   GET /api/users/me/notifications/unread-count
========================================================= */

export const getUnreadNotificationCount = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const count =
      await prisma.notification.count({
        where: {
          userId: req.user.id,
          isRead: false,
        },
      });

    return res.status(200).json({
      success: true,
      count,
    });
  } catch (error: any) {
    console.error(
      "Get Unread Notification Count Error:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        error?.message ||
        "Failed to fetch unread notification count",
    });
  }
};

/* =========================================================
   MARK ONE NOTIFICATION AS READ
   PATCH /api/users/me/notifications/:id/read
========================================================= */

export const markNotificationAsRead = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const id = String(req.params.id);

    const notification =
      await prisma.notification.findFirst({
        where: {
          id,
          userId: req.user.id,
        },
      });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: "Notification পাওয়া যায়নি",
      });
    }

    const updated =
      await prisma.notification.update({
        where: {
          id,
        },

        data: {
          isRead: true,
        },
      });

    return res.status(200).json({
      success: true,
      notification: updated,
    });
  } catch (error: any) {
    console.error(
      "Mark Notification Read Error:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        error?.message ||
        "Failed to mark notification as read",
    });
  }
};

/* =========================================================
   MARK ALL NOTIFICATIONS AS READ
   PATCH /api/users/me/notifications/read-all
========================================================= */

export const markAllNotificationsAsRead = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    await prisma.notification.updateMany({
      where: {
        userId: req.user.id,
        isRead: false,
      },

      data: {
        isRead: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error: any) {
    console.error(
      "Mark All Notifications Read Error:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        error?.message ||
        "Failed to mark all notifications as read",
    });
  }
};

/* =========================================================
   DELETE ONE NOTIFICATION
   DELETE /api/users/me/notifications/:id
========================================================= */

export const deleteMyNotification = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const id = String(req.params.id);

    const notification =
      await prisma.notification.findFirst({
        where: {
          id,
          userId: req.user.id,
        },
      });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: "Notification পাওয়া যায়নি",
      });
    }

    await prisma.notification.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error: any) {
    console.error(
      "Delete Notification Error:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        error?.message ||
        "Failed to delete notification",
    });
  }
};

// =========================================================
// GET CURRENT LOGGED-IN USER
// GET /api/users/me
// User + Customer data
// =========================================================

export const getCurrentUser = async (
  req: Request,
  res: Response
) => {
  try {
    const authUser = (req as any).user;

    if (!authUser?.id) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: authUser.id,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const customer = await prisma.customer.findUnique({
      where: {
        userId: authUser.id,
      },
    });

    return res.status(200).json({
      success: true,
      user: {
        ...user,
        customer,
      },
    });
  } catch (error: any) {
    console.error("Get Current User Error:", error);

    return res.status(500).json({
      success: false,
      error:
        error?.message || "Failed to fetch current user",
    });
  }
};