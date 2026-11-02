import { Request, Response } from "express";

import { prisma } from "../config/prisma";
import { createActivity } from "../services/activity-service";
import { createNotification, notifyAdmins } from "../services/notification-service";
import { AuthRequest } from "../middleware/auth-middleware";
import { supabaseAdmin } from "../config/supabase-admin";

/* =========================================================
   PROFILE SYNC CONTROLLER
========================================================= */

export async function syncUserProfile(
  req: Request,
  res: Response
) {
  try {
    /* =====================================================
       CHECK AUTHORIZATION HEADER
    ===================================================== */

    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Unauthorized: No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    /* =====================================================
       VERIFY SUPABASE TOKEN
    ===================================================== */

    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: "Unauthorized: Invalid Supabase token",
      });
    }

    /* =====================================================
       GET PROFILE DATA
    ===================================================== */

    const {
      email,
      fullName,
      role,
    } = req.body;

    /* =====================================================
       NORMALIZE EMAIL
    ===================================================== */

    const incomingEmail =
      typeof (email ?? user.email) === "string"
        ? (email ?? user.email)?.trim().toLowerCase() || null
        : null;

    /* =====================================================
       NORMALIZE FULL NAME
    ===================================================== */

    const incomingFullName =
      typeof fullName === "string"
        ? fullName.trim() || null
        : null;

    /* =====================================================
       CHECK DUPLICATE EMAIL
    ===================================================== */

    if (incomingEmail) {
      const existingEmailUser =
        await prisma.user.findFirst({
          where: {
            email: incomingEmail,
            NOT: {
              id: user.id,
            },
          },
          select: {
            id: true,
          },
        });

      if (existingEmailUser) {
        return res.status(409).json({
          success: false,
          error:
            "এই email অন্য একটি account-এর সাথে already ব্যবহার করা হয়েছে।",
        });
      }
    }

    /* =====================================================
       SAVE / UPDATE USER PROFILE
    ===================================================== */

    const dbUser = await prisma.user.upsert({
      where: {
        id: user.id,
      },

      /* ===================================================
         EXISTING USER
      =================================================== */

      update: {
        email: incomingEmail,
        fullName: incomingFullName,
      },

      /* ===================================================
         NEW USER
      =================================================== */

      create: {
        id: user.id,
        email: incomingEmail,

        // Phone আপাতত null থাকবে
        phone: null,

        fullName: incomingFullName,
        role: role || "CUSTOMER",
        status: "ACTIVE",
      },
    });

    /* =====================================================
       SUCCESS RESPONSE
    ===================================================== */

    return res.status(200).json({
      success: true,
      user: dbUser,
    });
  } catch (err: any) {
    /* =====================================================
       ERROR
    ===================================================== */

    console.error(
      "Backend Sync Profile Error:",
      err
    );

    return res.status(500).json({
      success: false,
      error:
        err?.message ||
        "Failed to sync user profile",
    });
  }
}

/* =========================================================
   GET CURRENT LOGGED-IN USER
   User + Customer data
========================================================= */



/* =========================================================
   UPDATE CURRENT USER
   User + Customer location
========================================================= */

export const updateCurrentUser = async (
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

    /* =====================================================
       GET REQUEST BODY
    ===================================================== */

    const {
      fullName,
      email,
      phone,

      address,
      area,
      district,
      division,
      upazila,
      latitude,
      longitude,
    } = req.body;

    /* =====================================================
       NORMALIZE USER DATA
    ===================================================== */

    const normalizedFullName =
      typeof fullName === "string"
        ? fullName.trim() || null
        : undefined;

    const normalizedEmail =
      typeof email === "string"
        ? email.trim().toLowerCase() || null
        : undefined;

    const normalizedPhone =
      typeof phone === "string"
        ? phone.trim() || null
        : undefined;

    /* =====================================================
       CHECK DUPLICATE EMAIL
    ===================================================== */

    if (normalizedEmail) {
      const existingEmailUser =
        await prisma.user.findFirst({
          where: {
            email: normalizedEmail,

            NOT: {
              id: authUser.id,
            },
          },

          select: {
            id: true,
          },
        });

      if (existingEmailUser) {
        return res.status(409).json({
          success: false,
          error:
            "এই email অন্য একটি account-এর সাথে already ব্যবহার করা হয়েছে।",
        });
      }
    }

    /* =====================================================
       CHECK DUPLICATE PHONE
    ===================================================== */

    if (normalizedPhone) {
      const existingPhoneUser =
        await prisma.user.findFirst({
          where: {
            phone: normalizedPhone,

            NOT: {
              id: authUser.id,
            },
          },

          select: {
            id: true,
          },
        });

      if (existingPhoneUser) {
        return res.status(409).json({
          success: false,
          error:
            "এই phone number অন্য একটি account-এর সাথে already ব্যবহার করা হয়েছে।",
        });
      }
    }

    /* =====================================================
       UPDATE USER + CUSTOMER
    ===================================================== */

    const updatedUser =
      await prisma.$transaction(async (tx) => {
        /* ===============================================
           UPDATE USER
        =============================================== */

        const user = await tx.user.update({
          where: {
            id: authUser.id,
          },

          data: {
            ...(normalizedFullName !== undefined && {
              fullName: normalizedFullName,
            }),

            ...(normalizedEmail !== undefined && {
              email: normalizedEmail,
            }),

            ...(normalizedPhone !== undefined && {
              phone: normalizedPhone,
            }),
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

        /* ===============================================
           CUSTOMER LOCATION DATA
        =============================================== */

        const hasCustomerData =
          address !== undefined ||
          area !== undefined ||
          district !== undefined ||
          division !== undefined ||
          upazila !== undefined ||
          latitude !== undefined ||
          longitude !== undefined;

        if (hasCustomerData) {
          await tx.customer.upsert({
            where: {
              userId: authUser.id,
            },

            update: {
              ...(address !== undefined && {
                address:
                  typeof address === "string"
                    ? address.trim() || null
                    : null,
              }),

              ...(area !== undefined && {
                area:
                  typeof area === "string"
                    ? area.trim() || null
                    : null,
              }),

              ...(district !== undefined && {
                district:
                  typeof district === "string"
                    ? district.trim() || null
                    : null,
              }),

              ...(division !== undefined && {
                division:
                  typeof division === "string"
                    ? division.trim() || null
                    : null,
              }),

              ...(upazila !== undefined && {
                upazila:
                  typeof upazila === "string"
                    ? upazila.trim() || null
                    : null,
              }),

              ...(latitude !== undefined && {
                latitude:
                  latitude === null ||
                  latitude === ""
                    ? null
                    : Number(latitude),
              }),

              ...(longitude !== undefined && {
                longitude:
                  longitude === null ||
                  longitude === ""
                    ? null
                    : Number(longitude),
              }),
            },

            create: {
              userId: authUser.id,

              address:
                typeof address === "string"
                  ? address.trim() || null
                  : null,

              area:
                typeof area === "string"
                  ? area.trim() || null
                  : null,

              district:
                typeof district === "string"
                  ? district.trim() || null
                  : null,

              division:
                typeof division === "string"
                  ? division.trim() || null
                  : null,

              upazila:
                typeof upazila === "string"
                  ? upazila.trim() || null
                  : null,

              latitude:
                latitude === null ||
                latitude === undefined ||
                latitude === ""
                  ? null
                  : Number(latitude),

              longitude:
                longitude === null ||
                longitude === undefined ||
                longitude === ""
                  ? null
                  : Number(longitude),
            },
          });
        }

        /* ===============================================
           RETURN USER
        =============================================== */

        return user;
      });

    /* =====================================================
       GET UPDATED CUSTOMER
    ===================================================== */

    const customer =
      await prisma.customer.findUnique({
        where: {
          userId: authUser.id,
        },
      });

    /* =====================================================
       SUCCESS RESPONSE
    ===================================================== */

    return res.status(200).json({
      success: true,

      message: "Profile successfully updated",

      user: {
        ...updatedUser,
        customer,
      },
    });
  } catch (error: any) {
    console.error(
      "Update Current User Error:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        error?.message ||
        "Failed to update user profile",
    });
  }
};

/* =========================================================
   GET ALL USERS
========================================================= */

export const getAllUsers = async (
  req: Request,
  res: Response
) => {
  try {
    /* =====================================================
       GET USERS
    ===================================================== */

    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },

      /* ===================================================
         ROLE-SPECIFIC RELATED DATA
      =================================================== */

      include: {
        vendor: true,
        affiliate: true,
        wholesaler: true,
        managerPermissions: true,
      },
    });

    /* =====================================================
       SUCCESS RESPONSE
    ===================================================== */

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error: any) {
    /* =====================================================
       ERROR
    ===================================================== */

    console.error(
      "Fetch Users Error:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        error?.message ||
        "Failed to fetch users",
    });
  }
};

// =========================================================
// DELETE CURRENT LOGGED-IN USER
// =========================================================

export const deleteCurrentUser = async (
  req: Request,
  res: Response
) => {
  try {
    // 1. Authorization header থেকে token নেওয়া
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    // 2. Supabase token verify করা
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Invalid Supabase token",
      });
    }

    // 3. Prisma database-এ user আছে কি না দেখা
    const dbUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        id: true,
      },
    });

    if (!dbUser) {
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    // 4. Supabase Auth account delete করা
    const { error: deleteAuthError } =
      await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (deleteAuthError) {
      console.error(
        "Supabase Account Delete Error:",
        deleteAuthError
      );

      return res.status(500).json({
        success: false,
        message: "Failed to delete authentication account",
      });
    }

    // 5. Prisma database থেকে user delete করা
    await prisma.user.delete({
      where: {
        id: user.id,
      },
    });

    // 6. Success response
    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete Current User Error:", error);

    return res.status(500).json({
      success: false,
      message:
        error?.message || "Failed to delete account",
    });
  }
};

// =========================================================
// GET CURRENT LOGGED-IN USER
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

    const reward = await prisma.customerReward.findUnique({
      where: {
        customerId: authUser.id,
      },
      select: {
        points: true,
      },
    });

    return res.status(200).json({
      success: true,
      user: {
        ...user,
        customer,
        points: reward?.points ?? 0,
      },
    });
  } catch (error: any) {
    console.error("Get Current User Error:", error);

    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to fetch user profile",
    });
  }
};



/* =========================================================
   ADMIN: UPDATE USER STATUS
========================================================= */
export async function updateAdminUserStatus(req: AuthRequest, res: Response) {
  try {
    const userId = String(req.params.userId || "");
    const { status } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: "User ID is required" });
    }

    if (!["ACTIVE", "PENDING", "SUSPENDED", "BANNED"].includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid user status" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
      },
    });

    await createActivity({
      userId: req.user?.id,
      action: "UPDATE",
      title: `ইউজার স্ট্যাটাস পরিবর্তন: ${updatedUser.fullName || updatedUser.email}`,
      description: `ইউজার স্ট্যাটাস পরিবর্তিত হয়ে "${status}" হয়েছে।`,
      entityId: updatedUser.id,
      entityType: "USER",
    });

    await createNotification({
      userId: updatedUser.id,
      type: "ACCOUNT_STATUS_UPDATED",
      title: "আপনার একাউন্ট স্ট্যাটাস পরিবর্তন করা হয়েছে",
      message: `আপনার একাউন্টের বর্তমান স্ট্যাটাস: ${status}।`,
      entityId: updatedUser.id,
      entityType: "USER",
    });

    return res.status(200).json({
      success: true,
      message: "User status updated successfully",
      data: updatedUser,
    });
  } catch (error: any) {
    console.error("UPDATE USER STATUS ERROR:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to update user status",
    });
  }
}

/* =========================================================
   ADMIN: UPDATE USER ROLE
========================================================= */
export async function updateAdminUserRole(req: AuthRequest, res: Response) {
  try {
    const userId = String(req.params.userId || "");
    const { role } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: "User ID is required" });
    }

    if (!["SUPER_ADMIN", "MANAGER", "VENDOR", "AFFILIATE", "WHOLESALER", "CUSTOMER"].includes(role)) {
      return res.status(400).json({ success: false, error: "Invalid user role" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
      },
    });

    await createActivity({
      userId: req.user?.id,
      action: "UPDATE",
      title: `ইউজার রোল পরিবর্তন: ${updatedUser.fullName || updatedUser.email}`,
      description: `ইউজার রোল পরিবর্তিত হয়ে "${role}" হয়েছে।`,
      entityId: updatedUser.id,
      entityType: "USER",
    });

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: updatedUser,
    });
  } catch (error: any) {
    console.error("UPDATE USER ROLE ERROR:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to update user role",
    });
  }
}

/**
 * Helper to safely and completely delete users and all their dependencies
 * without violating any Foreign Key constraints (e.g. VendorOrder_customerId_fkey, CustomerOrder, etc.)
 */
export async function cleanupAndCascadeDeleteUsers(tx: any, userIds: string[]) {
  if (!userIds || userIds.length === 0) return;

  // 1. If any of the users are vendors, find vendor IDs
  const vendors = await tx.vendor.findMany({
    where: { userId: { in: userIds } },
    select: { id: true },
  });
  const vendorIds = vendors.map((v: any) => v.id);

  if (vendorIds.length > 0) {
    const products = await tx.product.findMany({
      where: { vendorId: { in: vendorIds } },
      select: { id: true },
    });
    const pIds = products.map((p: any) => p.id);

    if (pIds.length > 0) {
      await Promise.all([
        tx.cartItem.deleteMany({ where: { productId: { in: pIds } } }),
        tx.wishlistItem.deleteMany({ where: { productId: { in: pIds } } }),
        tx.productDeliveryRate.deleteMany({
          where: { productDelivery: { productId: { in: pIds } } },
        }),
        tx.productCoupon.deleteMany({ where: { productId: { in: pIds } } }),
        tx.productPricing.deleteMany({ where: { productId: { in: pIds } } }),
        tx.newArrivalAttribute.deleteMany({ where: { productId: { in: pIds } } }),
        tx.flashSaleAttribute.deleteMany({ where: { productId: { in: pIds } } }),
        tx.featuredAttribute.deleteMany({ where: { productId: { in: pIds } } }),
        tx.topSellerAttribute.deleteMany({ where: { productId: { in: pIds } } }),
        tx.topRatedAttribute.deleteMany({ where: { productId: { in: pIds } } }),
        tx.trustedAttribute.deleteMany({ where: { productId: { in: pIds } } }),
        tx.customerOrderItem.deleteMany({ where: { productId: { in: pIds } } }),
        tx.vendorOrderItem.deleteMany({ where: { productId: { in: pIds } } }),
        tx.productReview.deleteMany({ where: { productId: { in: pIds } } }),
      ]);
      await tx.productDelivery.deleteMany({ where: { productId: { in: pIds } } });
      await tx.product.deleteMany({ where: { id: { in: pIds } } });
    }

    // Vendor orders belonging to these vendors
    const vendorStoreOrders = await tx.vendorOrder.findMany({
      where: { vendorId: { in: vendorIds } },
      select: { id: true },
    });
    const vendorStoreOrderIds = vendorStoreOrders.map((vo: any) => vo.id);

    if (vendorStoreOrderIds.length > 0) {
      await Promise.all([
        tx.courierShipment.deleteMany({ where: { vendorOrderId: { in: vendorStoreOrderIds } } }),
        tx.vendorEarning.deleteMany({ where: { vendorOrderId: { in: vendorStoreOrderIds } } }),
        tx.payment.deleteMany({ where: { vendorOrderId: { in: vendorStoreOrderIds } } }),
        tx.vendorOrderItem.deleteMany({ where: { vendorOrderId: { in: vendorStoreOrderIds } } }),
      ]);
      await tx.vendorOrder.deleteMany({ where: { id: { in: vendorStoreOrderIds } } });
    }

    await Promise.all([
      tx.vendorOpeningHour.deleteMany({ where: { vendorId: { in: vendorIds } } }),
      tx.vendorLocation.deleteMany({ where: { vendorId: { in: vendorIds } } }),
      tx.vendorPayout.deleteMany({ where: { vendorId: { in: vendorIds } } }),
      tx.vendorSettings.deleteMany({ where: { vendorId: { in: vendorIds } } }),
      tx.vendorEarning.deleteMany({ where: { vendorId: { in: vendorIds } } }),
      tx.vendorPayoutTransaction.deleteMany({ where: { vendorId: { in: vendorIds } } }),
      tx.customerOrderItem.deleteMany({ where: { vendorId: { in: vendorIds } } }),
    ]);
    await tx.vendor.deleteMany({ where: { id: { in: vendorIds } } });
  }

  // 2. Customer orders placed by these users
  const custOrders = await tx.customerOrder.findMany({
    where: { customerId: { in: userIds } },
    select: { id: true, pendingCheckoutId: true },
  });
  const custOrderIds = custOrders.map((o: any) => o.id);
  const linkedPendingCheckoutIds = custOrders
    .map((o: any) => o.pendingCheckoutId)
    .filter(Boolean) as string[];

  // 3. Vendor orders where customerId is in userIds OR customerOrderId is in custOrderIds
  const vendorOrdersAsCustomer = await tx.vendorOrder.findMany({
    where: {
      OR: [
        { customerId: { in: userIds } },
        ...(custOrderIds.length > 0 ? [{ customerOrderId: { in: custOrderIds } }] : []),
      ],
    },
    select: { id: true },
  });
  const vOrderCustIds = vendorOrdersAsCustomer.map((vo: any) => vo.id);

  if (vOrderCustIds.length > 0) {
    await Promise.all([
      tx.courierShipment.deleteMany({ where: { vendorOrderId: { in: vOrderCustIds } } }),
      tx.vendorEarning.deleteMany({ where: { vendorOrderId: { in: vOrderCustIds } } }),
      tx.payment.deleteMany({ where: { vendorOrderId: { in: vOrderCustIds } } }),
      tx.vendorOrderItem.deleteMany({ where: { vendorOrderId: { in: vOrderCustIds } } }),
    ]);
    await tx.vendorOrder.deleteMany({ where: { id: { in: vOrderCustIds } } });
  }

  if (custOrderIds.length > 0) {
    await Promise.all([
      tx.rewardPointTransaction.deleteMany({ where: { customerOrderId: { in: custOrderIds } } }),
      tx.payment.deleteMany({ where: { customerOrderId: { in: custOrderIds } } }),
      tx.customerOrderItem.deleteMany({ where: { customerOrderId: { in: custOrderIds } } }),
    ]);
    await tx.customerOrder.deleteMany({ where: { id: { in: custOrderIds } } });
  }

  // 4. Pending checkouts & leftover payments
  const pendingCheckouts = await tx.pendingCheckout.findMany({
    where: {
      OR: [
        { customerId: { in: userIds } },
        ...(linkedPendingCheckoutIds.length > 0 ? [{ id: { in: linkedPendingCheckoutIds } }] : []),
      ],
    },
    select: { id: true },
  });
  const pCheckoutIds = pendingCheckouts.map((p: any) => p.id);

  if (pCheckoutIds.length > 0) {
    await tx.payment.deleteMany({ where: { pendingCheckoutId: { in: pCheckoutIds } } });
    await tx.pendingCheckout.deleteMany({ where: { id: { in: pCheckoutIds } } });
  }

  // Any leftover payments where customerId is in userIds
  await tx.payment.deleteMany({ where: { customerId: { in: userIds } } });

  // 5. Carts and Wishlists
  await Promise.all([
    tx.cartItem.deleteMany({ where: { cart: { userId: { in: userIds } } } }),
    tx.wishlistItem.deleteMany({ where: { wishlist: { userId: { in: userIds } } } }),
  ]);
  await Promise.all([
    tx.cart.deleteMany({ where: { userId: { in: userIds } } }),
    tx.wishlist.deleteMany({ where: { userId: { in: userIds } } }),
  ]);

  // 6. User profiles, rewards, logs, notifications, settings
  await Promise.all([
    tx.activityLog.deleteMany({ where: { userId: { in: userIds } } }),
    tx.notification.deleteMany({ where: { userId: { in: userIds } } }),
    tx.managerPermission.deleteMany({ where: { userId: { in: userIds } } }),
    tx.productReview.deleteMany({ where: { userId: { in: userIds } } }),
    tx.userNotificationSettings.deleteMany({ where: { userId: { in: userIds } } }),
    tx.rewardPointTransaction.deleteMany({ where: { customerId: { in: userIds } } }),
    tx.customerReward.deleteMany({ where: { customerId: { in: userIds } } }),
    tx.customer.deleteMany({ where: { userId: { in: userIds } } }),
    tx.affiliate.deleteMany({ where: { userId: { in: userIds } } }),
    tx.wholesaler.deleteMany({ where: { userId: { in: userIds } } }),
  ]);

  // 7. Finally delete the users
  await tx.user.deleteMany({ where: { id: { in: userIds } } });
}

/* =========================================================
   ADMIN: DELETE USER
========================================================= */
export async function deleteAdminUser(req: AuthRequest, res: Response) {
  try {
    const userId = String(req.params.userId || "");
    if (!userId) {
      return res.status(400).json({ success: false, error: "User ID is required" });
    }

    if (userId === req.user?.id) {
      return res.status(400).json({ success: false, error: "You cannot delete your own account" });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { vendor: true },
    });

    if (!targetUser) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    await prisma.$transaction(
      async (tx) => {
        await cleanupAndCascadeDeleteUsers(tx, [userId]);
      },
      {
        maxWait: 15000,
        timeout: 45000,
      }
    );

    try {
      await supabaseAdmin.auth.admin.deleteUser(userId);
    } catch (authErr) {
      console.warn("Could not delete from Supabase Auth:", authErr);
    }

    await createActivity({
      userId: req.user?.id,
      action: "DELETE",
      title: `ইউজার মুছে ফেলা হয়েছে: ${targetUser.fullName || targetUser.email}`,
      description: `অ্যাডমিন (${req.user?.fullName || req.user?.email || "Admin"}) ইউজার "${targetUser.fullName || targetUser.email}" এর অ্যাকাউন্ট মুছে ফেলেছে।`,
      entityType: "USER",
    });

    await notifyAdmins({
      type: "USER_DELETED",
      title: `ইউজার মুছে ফেলা হয়েছে: ${targetUser.fullName || targetUser.email}`,
      message: `অ্যাডমিন (${req.user?.fullName || req.user?.email || "Admin"}) ইউজার "${targetUser.fullName || targetUser.email}" এর অ্যাকাউন্ট ডাটাবেজ থেকে মুছে ফেলেছে।`,
      entityType: "USER",
    });

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE USER ERROR:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to delete user",
    });
  }
}

/* =========================================================
   ADMIN: BULK DELETE USERS
========================================================= */
export async function bulkDeleteAdminUsers(req: AuthRequest, res: Response) {
  try {
    const ids = req.body.ids || req.body.userIds;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, error: "User IDs array is required" });
    }

    const filteredIds = ids.filter((id) => id !== req.user?.id);
    if (filteredIds.length === 0) {
      return res.status(400).json({ success: false, error: "Cannot delete your own account" });
    }

    await prisma.$transaction(
      async (tx) => {
        await cleanupAndCascadeDeleteUsers(tx, filteredIds);
      },
      {
        maxWait: 15000,
        timeout: 45000,
      }
    );

    for (const uid of filteredIds) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(uid);
      } catch (e) {}
    }

    await createActivity({
      userId: req.user?.id,
      action: "DELETE",
      title: `${filteredIds.length} জন ইউজার মুছে ফেলা হয়েছে`,
      description: `অ্যাডমিন একযোগে ${filteredIds.length} জন ইউজারের অ্যাকাউন্ট ডিলিট করেছে।`,
      entityType: "USER",
    });

    await notifyAdmins({
      type: "USER_BULK_DELETED",
      title: `${filteredIds.length} জন ইউজার মুছে ফেলা হয়েছে`,
      message: `অ্যাডমিন (${req.user?.fullName || req.user?.email || "Admin"}) একযোগে ${filteredIds.length} জন ইউজারের অ্যাকাউন্ট ডিলিট করেছে।`,
      entityType: "USER",
    });

    return res.status(200).json({
      success: true,
      message: `${filteredIds.length} users deleted successfully`,
    });
  } catch (error: any) {
    console.error("BULK DELETE USERS ERROR:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to delete users",
    });
  }
}





/* =========================================================
   ADMIN: GET SINGLE USER DETAILS (RICH DETAILS)
========================================================= */
export const getAdminUserDetails = async (req: AuthRequest, res: Response) => {
  try {
    const userId = String(req.params.userId || "");
    if (!userId) {
      return res.status(400).json({ success: false, error: "User ID is required" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        customer: true,
        customerReward: true,
        cart: {
          include: {
            items: {
              include: {
                product: {
                  select: { id: true, title: true, images: true, pricing: true },
                },
              },
            },
          },
        },
        wishlist: {
          include: {
            items: {
              include: {
                product: {
                  select: { id: true, title: true, images: true, pricing: true },
                },
              },
            },
          },
        },
        customerOrders: {
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            status: true,
            paymentStatus: true,
            createdAt: true,
            items: {
              select: {
                id: true,
                productTitle: true,
                quantity: true,
                totalPrice: true,
              },
            },
          },
        },
        vendor: {
          include: {
            location: true,
            payout: true,
            settings: true,
            openingHours: true,
            _count: {
              select: {
                products: true,
                orders: true,
              },
            },
          },
        },
        affiliate: true,
        wholesaler: true,
        managerPermissions: true,
        _count: {
          select: {
            customerOrders: true,
            activityLogs: true,
            notifications: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    console.error("Get Admin User Details Error:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to load user details",
    });
  }
};
