
import { Response } from "express";
import { CustomerOrderStatus, Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AuthRequest } from "../../middleware/auth-middleware";
import { createNotification } from "../../services/notification-service";

const validStatuses = Object.values(CustomerOrderStatus);

async function syncCustomerOrderStatus(
  tx: Prisma.TransactionClient,
  customerOrderId: string | null | undefined
) {
  if (!customerOrderId) return;
  const vendorOrders = await tx.vendorOrder.findMany({
    where: { customerOrderId },
    select: { status: true, paymentStatus: true },
  });
  if (!vendorOrders.length) return;

  const statuses = vendorOrders.map((o) => o.status);
  let newStatus: CustomerOrderStatus = CustomerOrderStatus.PENDING;

  if (statuses.every((s) => s === CustomerOrderStatus.DELIVERED)) {
    newStatus = CustomerOrderStatus.DELIVERED;
  } else if (statuses.every((s) => s === CustomerOrderStatus.CANCELLED)) {
    newStatus = CustomerOrderStatus.CANCELLED;
  } else if (statuses.some((s) => s === CustomerOrderStatus.SHIPPED)) {
    newStatus = CustomerOrderStatus.SHIPPED;
  } else if (
    statuses.some(
      (s) =>
        s === CustomerOrderStatus.PACKED || s === CustomerOrderStatus.PROCESSING
    )
  ) {
    newStatus = CustomerOrderStatus.PROCESSING;
  } else if (statuses.some((s) => s === CustomerOrderStatus.CONFIRMED)) {
    newStatus = CustomerOrderStatus.CONFIRMED;
  }

  const allPaid =
    newStatus === CustomerOrderStatus.DELIVERED ||
    vendorOrders.every((o) => o.paymentStatus === "PAID");

  await tx.customerOrder.update({
    where: { id: customerOrderId },
    data: {
      status: newStatus,
      ...(allPaid ? { paymentStatus: "PAID" } : {}),
    },
  });

  return newStatus;
}

type StatusTransitionResult =
  | { error: "NOT_FOUND" }
  | {
      error: "INVALID_TRANSITION";
      currentStatus: string;
      allowed: string[];
    }
  | { error: "CONFLICT" }
  | { order: unknown };

const transitions: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["PACKED"],
  PACKED: ["SHIPPED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

async function getVendorId(userId: string) {
  return prisma.vendor.findUnique({
    where: { userId },
    select: {
      id: true,
      status: true,
    },
  });
}

/**
 * Express params থেকে সবসময় একটি string ID নেওয়া।
 */
function getOrderId(req: AuthRequest): string {
  const param: unknown = req.params.orderId;

  if (typeof param !== "string") {
    return "";
  }

  return param.trim();
}

// 1. নিজের দোকানের সব অর্ডার দেখা
export const getVendorOrders = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "অনুগ্রহ করে লগইন করুন",
      });
    }

    const vendor = await getVendorId(userId);

    if (!vendor) {
      return res.status(403).json({
        success: false,
        message: "Vendor account পাওয়া যায়নি",
      });
    }

    if (vendor.status !== "APPROVED") {
      return res.status(403).json({
        success: false,
        message: "আপনার vendor account এখনো অনুমোদিত নয়",
      });
    }

    const status =
      typeof req.query.status === "string"
        ? req.query.status
        : undefined;

    if (
      status &&
      !validStatuses.includes(status as CustomerOrderStatus)
    ) {
      return res.status(400).json({
        success: false,
        message: "অবৈধ order status",
        validStatuses,
      });
    }

    const parsedPage = Number(req.query.page);
    const parsedLimit = Number(req.query.limit);

    const page =
      Number.isInteger(parsedPage) && parsedPage > 0
        ? parsedPage
        : 1;

    const limit =
      Number.isInteger(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, 100)
        : 10;

    const skip = (page - 1) * limit;

    const where: Prisma.VendorOrderWhereInput = {
      vendorId: vendor.id,
      ...(status
        ? { status: status as CustomerOrderStatus }
        : {}),
    };

    const [orders, total] = await prisma.$transaction([
      prisma.vendorOrder.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                images: true,
              },
            },
          },
        },
        courierShipment: true,
      },
      }),
      prisma.vendorOrder.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Vendor orders retrieved successfully",
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("getVendorOrders error:", error);

    return res.status(500).json({
      success: false,
      message: "অর্ডার লোড করা যায়নি",
    });
  }
};

// 2. নির্দিষ্ট অর্ডারের বিস্তারিত দেখা
export const getVendorOrderDetails = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const orderId = getOrderId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "অনুগ্রহ করে লগইন করুন",
      });
    }

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "সঠিক Order ID প্রয়োজন",
      });
    }

    const vendor = await getVendorId(userId);

    if (!vendor || vendor.status !== "APPROVED") {
      return res.status(403).json({
        success: false,
        message: "অনুমোদিত vendor account প্রয়োজন",
      });
    }

    const order = await prisma.vendorOrder.findFirst({
      where: {
        id: orderId,
        vendorId: vendor.id,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                images: true,
              },
            },
          },
        },
        courierShipment: true,
        customerOrder: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            paymentStatus: true,
            shippingName: true,
            shippingPhone: true,
            shippingAddress: true,
            createdAt: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "অর্ডার পাওয়া যায়নি",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("getVendorOrderDetails error:", error);

    return res.status(500).json({
      success: false,
      message: "অর্ডারের বিস্তারিত লোড করা যায়নি",
    });
  }
};

// 3. অর্ডারের স্ট্যাটাস পরিবর্তন
export const updateVendorOrderStatus = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const orderId = getOrderId(req);
    const { status } = req.body as { status?: string };

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "অনুগ্রহ করে লগইন করুন",
      });
    }

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "সঠিক Order ID প্রয়োজন",
      });
    }

    const vendor = await getVendorId(userId);

    if (!vendor || vendor.status !== "APPROVED") {
      return res.status(403).json({
        success: false,
        message: "অনুমোদিত vendor account প্রয়োজন",
      });
    }

    if (
      typeof status !== "string" ||
      !validStatuses.includes(status as CustomerOrderStatus)
    ) {
      return res.status(400).json({
        success: false,
        message: "অবৈধ order status",
        validStatuses,
      });
    }

    const result: StatusTransitionResult =
      await prisma.$transaction(async (tx) => {
        const order = await tx.vendorOrder.findFirst({
          where: {
            id: orderId,
            vendorId: vendor.id,
          },
          include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                images: true,
              },
            },
          },
        },
        courierShipment: true,
      },
        });

        if (!order) {
          return { error: "NOT_FOUND" };
        }

        const allowed = transitions[order.status] ?? [];

        if (!allowed.includes(status)) {
          return {
            error: "INVALID_TRANSITION",
            currentStatus: order.status,
            allowed,
          };
        }

        // বর্তমান status একই থাকলেই update হবে।
        const updated = await tx.vendorOrder.updateMany({
          where: {
            id: order.id,
            vendorId: vendor.id,
            status: order.status,
          },
          data: {
            status: status as CustomerOrderStatus,
            ...(status === "DELIVERED" ? { paymentStatus: "PAID" } : {}),
          },
        });

        if (updated.count === 0) {
          return { error: "CONFLICT" };
        }

        if (status === "CANCELLED") {
          // Vendor cancellation-এ stock ফেরত দেওয়া হচ্ছে।
          // Customer cancellation controller-এও stock ফেরত দেওয়া হলে
          // cancellation flow এক জায়গায় সমন্বয় করে নিও।
          for (const item of order.items) {
            if (!item.productId) continue;
            await tx.product.update({
              where: {
                id: item.productId,
              },
              data: {
                stockQuantity: {
                  increment: item.quantity,
                },
              },
            });
          }

          const remainingOrders = await tx.vendorOrder.count({
            where: {
              customerOrderId: order.customerOrderId,
              status: {
                not: "CANCELLED",
              },
            },
          });

          if (remainingOrders === 0) {
            await tx.customerOrder.updateMany({
              where: {
                id: order.customerOrderId ?? undefined,
                status: "PENDING",
              },
              data: {
                status: "CANCELLED",
              },
            });
          }
        }

        if (order.customerOrderId) {
          await syncCustomerOrderStatus(tx, order.customerOrderId);
        }

        const updatedOrder = await tx.vendorOrder.findUnique({
          where: {
            id: order.id,
          },
          include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                images: true,
              },
            },
          },
        },
        courierShipment: true,
      },
        });

        return {
          order: updatedOrder,
        };
      });

    if ("error" in result) {
      if (result.error === "NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "অর্ডার পাওয়া যায়নি",
        });
      }

      if (result.error === "INVALID_TRANSITION") {
        return res.status(400).json({
          success: false,
          message: `এই অর্ডারে ${result.currentStatus} থেকে ${status} করা যাবে না`,
          allowedNextStatuses: result.allowed,
        });
      }

      return res.status(409).json({
        success: false,
        message:
          "অর্ডারটি ইতিমধ্যে পরিবর্তন হয়েছে। আবার চেষ্টা করুন।",
      });
    }

    // Send notification to Customer about the status change
    try {
      const updated = result.order as any;
      if (updated?.customerId) {
        const statusBengali: Record<string, string> = {
          CONFIRMED: "কনফার্ম করা হয়েছে",
          PROCESSING: "প্রক্রিয়াধীন রয়েছে",
          PACKED: "প্যাক করা হয়েছে",
          SHIPPED: "ডেলিভারির জন্য পাঠানো হয়েছে",
          DELIVERED: "সফলভাবে ডেলিভারি করা হয়েছে",
          CANCELLED: "বাতিল করা হয়েছে",
        };
        const statusText = statusBengali[status] || status;
        await createNotification({
          userId: updated.customerId,
          type: "ORDER_STATUS_CHANGED",
          title: `অর্ডার আপডেট: #${updated.orderNumber}`,
          message: `আপনার অর্ডার #${updated.orderNumber} ${statusText}।`,
          entityId: updated.id,
          entityType: "ORDER",
        });
      }
    } catch (notifErr) {
      console.error("Customer status update notification error:", notifErr);
    }

    return res.status(200).json({
      success: true,
      message: "অর্ডারের স্ট্যাটাস আপডেট হয়েছে",
      data: result.order,
    });
  } catch (error) {
    console.error("updateVendorOrderStatus error:", error);

    return res.status(500).json({
      success: false,
      message: "অর্ডারের স্ট্যাটাস আপডেট করা যায়নি",
    });
  }
};


// একটি অর্ডার soft delete
export const deleteVendorOrder = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const orderId = getOrderId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "অনুগ্রহ করে লগইন করুন",
      });
    }

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "সঠিক Order ID প্রয়োজন",
      });
    }

    const vendor = await getVendorId(userId);

    if (!vendor || vendor.status !== "APPROVED") {
      return res.status(403).json({
        success: false,
        message: "অনুমোদিত vendor account প্রয়োজন",
      });
    }

    const result = await prisma.vendorOrder.updateMany({
      where: {
        id: orderId,
        vendorId: vendor.id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    if (result.count === 0) {
      return res.status(404).json({
        success: false,
        message: "অর্ডার পাওয়া যায়নি অথবা আগেই সরানো হয়েছে",
      });
    }

    return res.status(200).json({
      success: true,
      message: "অর্ডারটি তালিকা থেকে সরানো হয়েছে",
      data: { id: orderId },
    });
  } catch (error) {
    console.error("deleteVendorOrder error:", error);

    return res.status(500).json({
      success: false,
      message: "অর্ডার সরানো যায়নি",
    });
  }
};

// একাধিক অর্ডার soft delete
export const bulkDeleteVendorOrders = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const body = req.body as { orderIds?: unknown };
    const orderIds = body.orderIds;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "অনুগ্রহ করে লগইন করুন",
      });
    }

    if (
      !Array.isArray(orderIds) ||
      orderIds.length === 0 ||
      orderIds.length > 100 ||
      !orderIds.every(
        (id): id is string =>
          typeof id === "string" && id.trim().length > 0
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "১ থেকে ১০০টি বৈধ Order ID পাঠাতে হবে",
      });
    }

    const uniqueIds = [...new Set(orderIds.map((id) => id.trim()))];

    const vendor = await getVendorId(userId);

    if (!vendor || vendor.status !== "APPROVED") {
      return res.status(403).json({
        success: false,
        message: "অনুমোদিত vendor account প্রয়োজন",
      });
    }

    const result = await prisma.vendorOrder.updateMany({
      where: {
        id: { in: uniqueIds },
        vendorId: vendor.id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: `${result.count}টি অর্ডার তালিকা থেকে সরানো হয়েছে`,
      data: {
        requested: uniqueIds.length,
        deletedCount: result.count,
      },
    });
  } catch (error) {
    console.error("bulkDeleteVendorOrders error:", error);

    return res.status(500).json({
      success: false,
      message: "নির্বাচিত অর্ডারগুলো সরানো যায়নি",
    });
  }
};
