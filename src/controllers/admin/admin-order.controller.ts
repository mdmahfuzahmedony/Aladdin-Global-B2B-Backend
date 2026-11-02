
import { Response } from "express";
import {
  CustomerOrderStatus,
  OrderPaymentStatus,
  Prisma,
} from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AuthRequest } from "../../middleware/auth-middleware";
import { createNotification } from "../../services/notification-service";

// Super Admin / Manager access check
const isSuperAdmin = (req: AuthRequest): boolean => {
  return req.user?.role === "SUPER_ADMIN" || req.user?.role === "MANAGER";
};

async function syncCustomerOrderStatus(
  customerOrderId: string | null | undefined
) {
  if (!customerOrderId) return;
  const vendorOrders = await prisma.vendorOrder.findMany({
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
    vendorOrders.every((o) => o.paymentStatus === OrderPaymentStatus.PAID);

  await prisma.customerOrder.update({
    where: { id: customerOrderId },
    data: {
      status: newStatus,
      ...(allPaid ? { paymentStatus: OrderPaymentStatus.PAID } : {}),
    },
  });

  return newStatus;
}

// সব CustomerOrder দেখা
export const getAllAdminOrders = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!isSuperAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Super Admin access required",
      });
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number(req.query.limit) || 10)
    );
    const skip = (page - 1) * limit;

    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    const status =
      typeof req.query.status === "string"
        ? req.query.status
        : "";

    const paymentStatus =
      typeof req.query.paymentStatus === "string"
        ? req.query.paymentStatus
        : "";

    if (
      status &&
      !Object.values(CustomerOrderStatus).includes(
        status as CustomerOrderStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    if (
      paymentStatus &&
      !Object.values(OrderPaymentStatus).includes(
        paymentStatus as OrderPaymentStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
      });
    }

    const where: Prisma.CustomerOrderWhereInput = {
      ...(status && {
        status: status as CustomerOrderStatus,
      }),

      ...(paymentStatus && {
        paymentStatus: paymentStatus as OrderPaymentStatus,
      }),

      ...(search && {
        OR: [
          {
            orderNumber: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            shippingName: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            shippingPhone: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            customer: {
              email: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
          {
            vendorOrders: {
              some: {
                OR: [
                  {
                    orderNumber: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                  {
                    vendor: {
                      storeName: {
                        contains: search,
                        mode: "insensitive",
                      },
                    },
                  },
                  {
                    items: {
                      some: {
                        productName: {
                          contains: search,
                          mode: "insensitive",
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      }),
    };

    const [orders, total, stats] = await Promise.all([
      prisma.customerOrder.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
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
          vendorOrders: {
            include: {
              vendor: {
                select: {
                  id: true,
                  storeName: true,
                },
              },
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
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),

      prisma.customerOrder.count({ where }),

      prisma.customerOrder.groupBy({
        by: ["status"],
        _count: {
          _all: true,
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      // Stats এখানে সব অর্ডারের; সার্চ ও ফিল্টার অনুযায়ী নয়।
      stats: stats.map((item) => ({
        status: item.status,
        count: item._count._all,
      })),
    });
  } catch (error) {
    console.error("getAllAdminOrders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

// একটি CustomerOrder-এর বিস্তারিত দেখা
export const getAdminOrderDetails = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!isSuperAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Super Admin access required",
      });
    }

    const orderId = req.params.orderId;

    if (typeof orderId !== "string" || !orderId.trim()) {
      return res.status(400).json({
        success: false,
        message: "Valid order ID is required",
      });
    }

    const order = await prisma.customerOrder.findUnique({
      where: {
        id: orderId,
      },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
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
        vendorOrders: {
          include: {
            vendor: {
              select: {
                id: true,
                storeName: true,
                user: {
                  select: {
                    id: true,
                    email: true,
                  },
                },
              },
            },
            customer: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
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
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("getAdminOrderDetails error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order details",
    });
  }
};

// নির্দিষ্ট VendorOrder-এর status আপডেট
export const updateAdminVendorOrderStatus = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!isSuperAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Super Admin access required",
      });
    }

    const vendorOrderId = req.params.vendorOrderId;
    const { status } = req.body;

    if (
      typeof vendorOrderId !== "string" ||
      !vendorOrderId.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid vendor order ID is required",
      });
    }

    if (
      typeof status !== "string" ||
      !Object.values(CustomerOrderStatus).includes(
        status as CustomerOrderStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await prisma.vendorOrder.findUnique({
      where: {
        id: vendorOrderId,
      },
      include: {
        items: true,
        customerOrder: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Vendor order not found",
      });
    }

    const transitions: Record<
      string,
      CustomerOrderStatus[]
    > = {
      PENDING: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["PROCESSING", "CANCELLED"],
      PROCESSING: ["PACKED"],
      PACKED: ["SHIPPED"],
      SHIPPED: ["DELIVERED"],
      DELIVERED: [],
      CANCELLED: [],
    };

    if (order.status === status) {
      return res.status(400).json({
        success: false,
        message: "Order already has this status",
      });
    }

    if (
      !transitions[order.status]?.includes(
        status as CustomerOrderStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${order.status} to ${status}`,
      });
    }

    const updatedOrder = await prisma.vendorOrder.update({
      where: {
        id: vendorOrderId,
      },
      data: {
        status: status as CustomerOrderStatus,
        ...(status === "DELIVERED"
          ? { paymentStatus: OrderPaymentStatus.PAID }
          : {}),
      },
      include: {
        vendor: {
          select: {
            id: true,
            storeName: true,
          },
        },
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        items: true,
      },
    });

    // Synchronize parent CustomerOrder status
    if (order.customerOrderId) {
      await syncCustomerOrderStatus(order.customerOrderId);
    }

    // Send notification to Customer
    try {
      if (updatedOrder.customerId) {
        const statusBengali: Record<string, string> = {
          CONFIRMED: "অনুমোদন করা হয়েছে",
          PROCESSING: "প্রক্রিয়াধীন রয়েছে",
          PACKED: "প্যাক করা হয়েছে",
          SHIPPED: "ডেলিভারির জন্য পাঠানো হয়েছে",
          DELIVERED: "সফলভাবে ডেলিভারি হয়েছে",
          CANCELLED: "বাতিল করা হয়েছে",
        };
        const statusText = statusBengali[status] || status;
        await createNotification({
          userId: updatedOrder.customerId,
          type: "ORDER_STATUS_CHANGED",
          title: `অর্ডার আপডেট: #${updatedOrder.orderNumber}`,
          message: `আপনার অর্ডার #${updatedOrder.orderNumber} ${statusText}।`,
          entityId: updatedOrder.id,
          entityType: "ORDER",
        });
      }
    } catch (notifErr) {
      console.error("Admin order status notification error:", notifErr);
    }

    return res.status(200).json({
      success: true,
      message: "Vendor order status updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("updateAdminVendorOrderStatus error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
};
