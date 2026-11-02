import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";

const getDateRange = (period: string) => {
  const endDate = new Date();
  const startDate = new Date();

  const days = [7, 30, 90, 365].includes(Number(period))
    ? Number(period)
    : 30;

  startDate.setDate(startDate.getDate() - (days - 1));
  startDate.setHours(0, 0, 0, 0);

  return { startDate, endDate, days };
};

export const getAdminReports = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const period = String(req.query.period || "30");
    const { startDate, endDate, days } = getDateRange(period);

    const category = String(req.query.category || "Overview");
    const status = String(req.query.status || "ALL");
    const search = String(req.query.search || "").trim();

    const orderWhere: Prisma.VendorOrderWhereInput = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (
      status !== "ALL" &&
      [
        "PENDING",
        "CONFIRMED",
        "PROCESSING",
        "PACKED",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
        "RETURN_REQUESTED",
        "RETURNED",
        "REFUNDED",
      ].includes(status)
    ) {
      orderWhere.status =
        status as Prisma.EnumCustomerOrderStatusFilter["equals"];
    }

    if (search) {
      orderWhere.OR = [
        { id: { contains: search, mode: "insensitive" } },
        { orderNumber: { contains: search, mode: "insensitive" } },
        { shippingName: { contains: search, mode: "insensitive" } },
        { vendor: { storeName: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [
      orders,
      orderCount,
      completedOrders,
      pendingOrders,
      processingOrders,
      cancelledOrders,
      paidOrders,
      activeVendors,
      activeAffiliates,
      statusGroups,
    ] = await Promise.all([
      prisma.vendorOrder.findMany({
        where: orderWhere,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          paymentStatus: true,
          subtotal: true,
          deliveryFee: true,
          discount: true,
          totalAmount: true,
          createdAt: true,
          shippingName: true,
          vendor: {
            select: {
              storeName: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 500,
      }),

      prisma.vendorOrder.count({
        where: { createdAt: { gte: startDate, lte: endDate } },
      }),

      prisma.vendorOrder.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: "DELIVERED",
        },
      }),

      prisma.vendorOrder.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: "PENDING",
        },
      }),

      prisma.vendorOrder.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: {
            in: ["CONFIRMED", "PROCESSING", "PACKED", "SHIPPED"],
          },
        },
      }),

      prisma.vendorOrder.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: "CANCELLED",
        },
      }),

      prisma.vendorOrder.aggregate({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: {
            notIn: ["CANCELLED", "RETURNED", "REFUNDED"],
          },
        },
        _sum: { totalAmount: true },
      }),

      prisma.vendor.count({
        where: { status: "APPROVED" },
      }),

      prisma.affiliate.count({
        where: { status: "ACTIVE" },
      }),

      prisma.vendorOrder.groupBy({
        by: ["status"],
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
        _count: { _all: true },
      }),
    ]);

    const totalSales = Number(paidOrders._sum.totalAmount ?? 0);

    const orderSummary = {
      completed: completedOrders,
      processing: processingOrders,
      pending: pendingOrders,
      cancelled: cancelledOrders,
    };

    const detailedReports = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      date: order.createdAt,
      vendor: order.vendor?.storeName ?? "Unknown Vendor",
      customer: order.shippingName || "Customer",
      status: order.status,
      paymentStatus: order.paymentStatus,
      subtotal: Number(order.subtotal || 0),
      deliveryFee: Number(order.deliveryFee || 0),
      discount: Number(order.discount || 0),
      totalAmount: Number(order.totalAmount || 0),
    }));

    // Group sales by day
    const dailyMap = new Map<string, number>();
    for (const order of orders) {
      if (order.status !== "CANCELLED" && order.status !== "REFUNDED") {
        const d = order.createdAt.toISOString().slice(0, 10);
        dailyMap.set(
          d,
          (dailyMap.get(d) ?? 0) + Number(order.totalAmount || 0)
        );
      }
    }

    const salesByDate = Array.from(dailyMap.entries())
      .map(([date, sales]) => ({ date, sales }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.status(200).json({
      success: true,
      data: {
        filters: {
          category,
          period: days,
          status,
          startDate,
          endDate,
        },
        stats: {
          totalSales,
          totalOrders: orderCount,
          activeVendors,
          activeAffiliates,
        },
        orderSummary,
        statusGroups: statusGroups.map((item) => ({
          status: item.status,
          count: item._count._all,
        })),
        salesByDate,
        reports: detailedReports,
      },
    });
  } catch (error) {
    console.error("Admin reports error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load admin reports",
      error:
        error instanceof Error ? error.message : "Internal server error",
    });
  }
};
