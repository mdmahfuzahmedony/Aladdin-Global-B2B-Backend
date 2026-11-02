import { Response } from "express";
import { CustomerOrderStatus } from "@prisma/client";
import { AuthRequest } from "../../middleware/auth-middleware";
import { prisma } from "../../config/prisma";

const LOW_STOCK_LIMIT = 5;

const money = (value: unknown): number => {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
};

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const startOfCurrentMonth = () => {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
};

const startOfPreviousMonth = () => {
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() - 1);
  date.setHours(0, 0, 0, 0);
  return date;
};

const startOfSixMonthsAgo = () => {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  date.setMonth(date.getMonth() - 5);
  return date;
};

const formatMonth = (date: Date) =>
  date.toLocaleString("en-US", { month: "short" });

const formatCustomerName = (customer: any): string => {
  if (!customer) return "Customer";

  return (
    customer.fullName ??
    customer.name ??
    customer.email ??
    "Customer"
  );
};

export const getVendorDashboardOverview = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login first.",
      });
    }

    // 1. Logged-in user-এর vendor বের করা
    const vendor = await prisma.vendor.findUnique({
      where: { userId },
      select: {
        id: true,
        status: true,
      },
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor account not found.",
      });
    }

    if (vendor.status !== "APPROVED") {
      return res.status(403).json({
        success: false,
        message: "Your vendor account is not approved yet.",
      });
    }

    const vendorId = vendor.id;

    const today = startOfToday();
    const monthStart = startOfCurrentMonth();
    const previousMonthStart = startOfPreviousMonth();
    const sixMonthsAgo = startOfSixMonthsAgo();

    const revenueStatuses: CustomerOrderStatus[] = [
      CustomerOrderStatus.DELIVERED,
    ];

    const [
      totalProducts,
      activeProducts,
      lowStockCount,
      lowStockProducts,
      reviewStats,
      todayOrders,
      pendingOrders,
      processingOrders,
      cancelledOrders,
      activeOrders,
      todayRevenueOrders,
      monthRevenueOrders,
      previousMonthRevenueOrders,
      recentOrders,
      trendOrders,
      allVendorOrders,
    ] = await Promise.all([
      prisma.product.count({
        where: { vendorId },
      }),

      prisma.product.count({
        where: {
          vendorId,
          stockQuantity: { gt: 0 },
        },
      }),

      prisma.product.count({
        where: {
          vendorId,
          stockQuantity: { lte: LOW_STOCK_LIMIT },
        },
      }),

      prisma.product.findMany({
        where: {
          vendorId,
          stockQuantity: { lte: LOW_STOCK_LIMIT },
        },
        select: {
          id: true,
          title: true,
          stockQuantity: true,
        },
        orderBy: { stockQuantity: "asc" },
        take: 10,
      }),

      prisma.productReview.aggregate({
        where: {
          product: { vendorId },
          status: "PUBLISHED",
        },
        _avg: { rating: true },
        _count: { rating: true },
      }),

      prisma.vendorOrder.count({
        where: {
          vendorId,
          createdAt: { gte: today },
        },
      }),

      prisma.vendorOrder.count({
        where: {
          vendorId,
          status: CustomerOrderStatus.PENDING,
        },
      }),

      prisma.vendorOrder.count({
        where: {
          vendorId,
          status: CustomerOrderStatus.PROCESSING,
        },
      }),

      prisma.vendorOrder.count({
        where: {
          vendorId,
          status: CustomerOrderStatus.CANCELLED,
        },
      }),

      prisma.vendorOrder.count({
        where: { vendorId },
      }),

      prisma.vendorOrder.findMany({
        where: {
          vendorId,
          status: { in: revenueStatuses },
          createdAt: { gte: today },
        },
        select: { totalAmount: true },
      }),

      prisma.vendorOrder.findMany({
        where: {
          vendorId,
          status: { in: revenueStatuses },
          createdAt: { gte: monthStart },
        },
        select: { totalAmount: true },
      }),

      prisma.vendorOrder.findMany({
        where: {
          vendorId,
          status: { in: revenueStatuses },
          createdAt: {
            gte: previousMonthStart,
            lt: monthStart,
          },
        },
        select: { totalAmount: true },
      }),

      prisma.vendorOrder.findMany({
        where: { vendorId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          customer: true,
          items: true,
        },
      }),

      prisma.vendorOrder.findMany({
        where: {
          vendorId,
          status: { in: revenueStatuses },
          createdAt: { gte: sixMonthsAgo },
        },
        select: {
          createdAt: true,
          totalAmount: true,
        },
      }),

      prisma.vendorOrder.findMany({
        where: { vendorId },
        select: {
          status: true,
          totalAmount: true,
          items: {
            select: {
              productName: true,
              productId: true,
              quantity: true,
              totalPrice: true,
              product: {
                select: {
                  title: true,
                  category: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    // 2. Revenue totals
    const todaySales = todayRevenueOrders.reduce(
      (sum, order) => sum + money(order.totalAmount),
      0
    );

    const monthlySales = monthRevenueOrders.reduce(
      (sum, order) => sum + money(order.totalAmount),
      0
    );

    const previousMonthSales = previousMonthRevenueOrders.reduce(
      (sum, order) => sum + money(order.totalAmount),
      0
    );

    const salesGrowth =
      previousMonthSales > 0
        ? ((monthlySales - previousMonthSales) / previousMonthSales) * 100
        : null;

    // 3. Store Rating & Reviews
    const storeRating =
      reviewStats._count.rating > 0 && reviewStats._avg.rating != null
        ? Number(reviewStats._avg.rating.toFixed(1))
        : 0;

    const totalReviews = reviewStats._count.rating;

    // 4. Order status breakdown
    const statusCounts = new Map<string, number>();

    for (const order of allVendorOrders) {
      const status = String(order.status);
      statusCounts.set(status, (statusCounts.get(status) ?? 0) + 1);
    }

    const statusConfig = [
      {
        label: "Completed",
        status: "DELIVERED",
        color: "bg-emerald-500",
      },
      {
        label: "Processing",
        status: "PROCESSING",
        color: "bg-blue-500",
      },
      {
        label: "Pending",
        status: "PENDING",
        color: "bg-orange-400",
      },
      {
        label: "Cancelled",
        status: "CANCELLED",
        color: "bg-red-400",
      },
    ];

    const orderStatus = statusConfig.map((item) => {
      const count = statusCounts.get(item.status) ?? 0;

      return {
        label: item.label,
        value:
          activeOrders > 0
            ? Math.round((count / activeOrders) * 100)
            : 0,
        count,
        color: item.color,
      };
    });

    // 5. Top-selling products and category sales
    const productSales = new Map<
      string,
      {
        name: string;
        category: string;
        sold: number;
        revenue: number;
      }
    >();

    const categorySales = new Map<string, number>();

    for (const order of allVendorOrders) {
      if (String(order.status) !== "DELIVERED") continue;

      for (const item of order.items) {
        const productName =
          item.product?.title ?? item.productName;

        const categoryName =
          item.product?.category?.name ?? "Uncategorized";

        const productKey = item.productId ?? item.productName;
        const existing = productSales.get(productKey);

        if (existing) {
          existing.sold += item.quantity;
          existing.revenue += money(item.totalPrice);
        } else {
          productSales.set(productKey, {
            name: productName,
            category: categoryName,
            sold: item.quantity,
            revenue: money(item.totalPrice),
          });
        }

        categorySales.set(
          categoryName,
          (categorySales.get(categoryName) ?? 0) +
            money(item.totalPrice)
        );
      }
    }

    const topProducts = Array.from(productSales.values())
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 4);

    const totalCategorySales = Array.from(categorySales.values()).reduce(
      (sum, value) => sum + value,
      0
    );

    const salesByCategory = Array.from(categorySales.entries())
      .map(([name, sales]) => ({
        name,
        sales,
        percentage:
          totalCategorySales > 0
            ? Math.round((sales / totalCategorySales) * 100)
            : 0,
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 4);

    // 6. Six-month revenue trend
    const trendMap = new Map<string, number>();

    for (let i = 0; i < 6; i++) {
      const date = new Date(sixMonthsAgo);
      date.setMonth(sixMonthsAgo.getMonth() + i);

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      trendMap.set(key, 0);
    }

    for (const order of trendOrders) {
      const key = `${order.createdAt.getFullYear()}-${String(
        order.createdAt.getMonth() + 1
      ).padStart(2, "0")}`;

      if (trendMap.has(key)) {
        trendMap.set(
          key,
          (trendMap.get(key) ?? 0) + money(order.totalAmount)
        );
      }
    }

    const revenueTrend = Array.from(trendMap.entries()).map(
      ([key, value]) => {
        const [year, month] = key.split("-").map(Number);

        return {
          month: formatMonth(new Date(year, month - 1, 1)),
          value,
        };
      }
    );

    // 7. Recent orders
    const formattedRecentOrders = recentOrders.map((order: any) => ({
      id: order.orderNumber,
      customer: formatCustomerName(order.customer),
      item:
        order.items.length > 1
          ? `${order.items[0]?.productName ?? "Product"} +${order.items.length - 1} more`
          : order.items[0]?.productName ?? "—",
      amount: money(order.totalAmount),
      status: String(order.status),
    }));

    // 8. Action-needed cards
    const actionItems = [
      {
        label: "Pending Orders",
        count: pendingOrders,
        variant: "orange",
      },
      {
        label: "Low Stock Products",
        count: lowStockCount,
        variant: "yellow",
      },
      {
        label: "Processing Orders",
        count: processingOrders,
        variant: "blue",
      },
      {
        label: "Cancelled Orders",
        count: cancelledOrders,
        variant: "pink",
      },
    ];

    return res.status(200).json({
      success: true,
      message: "Vendor dashboard overview fetched successfully",
      data: {
        todaySales,
        monthlySales,
        todayOrders,
        pendingOrders,

        totalProducts,
        activeProducts,
        lowStockProducts: lowStockCount,

        storeRating,
        totalReviews,

        salesGrowth,

        actionItems,

        topProducts,
        revenueTrend,
        orderStatus,
        salesByCategory,
        recentOrders: formattedRecentOrders,

        lowStock: lowStockProducts.map((product) => ({
          name: product.title,
          stock: product.stockQuantity,
        })),
      },
    });
  } catch (error) {
    console.error("getVendorDashboardOverview error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load vendor dashboard overview.",
    });
  }
};
