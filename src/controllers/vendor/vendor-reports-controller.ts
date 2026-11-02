
import { Response } from "express";
import { Prisma, CommissionStatus, CustomerOrderStatus } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AuthRequest } from "../../middleware/auth-middleware";

const money = (value: Prisma.Decimal | number | string | null | undefined) =>
  Number(value ?? 0);

const getDateRange = (period: string) => {
  const end = new Date();
  const start = new Date(end);

  switch (period) {
    case "7D":
      start.setDate(start.getDate() - 6);
      break;
    case "30D":
      start.setDate(start.getDate() - 29);
      break;
    case "90D":
      start.setDate(start.getDate() - 89);
      break;
    case "1Y":
      start.setFullYear(start.getFullYear() - 1);
      break;
    default:
      return null;
  }

  start.setHours(0, 0, 0, 0);

  return { start, end };
};

export const getVendorReports = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId },
      select: { id: true, status: true },
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor account not found",
      });
    }

    if (vendor.status !== "APPROVED") {
      return res.status(403).json({
        success: false,
        message: "Vendor account is not approved",
      });
    }

    const period =
      typeof req.query.period === "string" ? req.query.period : "30D";

    const range = getDateRange(period);

    if (!range) {
      return res.status(400).json({
        success: false,
        message: "Invalid period. Use 7D, 30D, 90D or 1Y.",
      });
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(500, Math.max(1, Number(req.query.limit) || 50));
    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : "";

    const deliveredStatus = CustomerOrderStatus.DELIVERED;

    const orderWhere: Prisma.VendorOrderWhereInput = {
      vendorId: vendor.id,
      status: deliveredStatus,
      createdAt: { gte: range.start, lte: range.end },
    };

    const [deliveredOrders, totalOrders, earnings, products] =
      await Promise.all([
        prisma.vendorOrder.findMany({
          where: orderWhere,
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            createdAt: true,
            items: {
              select: {
                productId: true,
                productName: true,
                quantity: true,
                unitPrice: true,
                totalPrice: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),

        prisma.vendorOrder.count({
          where: {
            vendorId: vendor.id,
            createdAt: { gte: range.start, lte: range.end },
          },
        }),

        prisma.vendorEarning.findMany({
          where: {
            vendorId: vendor.id,
            createdAt: { gte: range.start, lte: range.end },
          },
          select: {
            grossAmount: true,
            commissionAmount: true,
            netAmount: true,
            status: true,
            createdAt: true,
          },
        }),

        prisma.product.findMany({
          where: {
            vendorId: vendor.id,
            vendorOrderItems: {
              some: {
                order: orderWhere,
              },
            },
          },
          select: {
            id: true,
            title: true,
            vendorOrderItems: {
              where: {
                order: orderWhere,
              },
              select: {
                quantity: true,
                totalPrice: true,
              },
            },
          },
        }),
      ]);

    const grossSales = deliveredOrders.reduce(
      (sum, order) => sum + money(order.totalAmount),
      0
    );

    const productsSold = deliveredOrders.reduce(
      (sum, order) =>
        sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );

    const commission = earnings.reduce(
      (sum, earning) => sum + money(earning.commissionAmount),
      0
    );

    const netEarnings = earnings.reduce(
      (sum, earning) => sum + money(earning.netAmount),
      0
    );

    const availableEarnings = earnings
      .filter((earning) => earning.status === CommissionStatus.PAYABLE)
      .reduce((sum, earning) => sum + money(earning.netAmount), 0);

    const dailySales = new Map<string, number>();

    for (const order of deliveredOrders) {
      const date = order.createdAt.toISOString().slice(0, 10);
      dailySales.set(
        date,
        (dailySales.get(date) ?? 0) + money(order.totalAmount)
      );
    }

    const salesTrend = Array.from(dailySales.entries())
      .map(([date, sales]) => ({ date, sales }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const topProducts = products
      .map((product) => ({
        productId: product.id,
        name: product.title,
        quantity: product.vendorOrderItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        ),
        sales: product.vendorOrderItems.reduce(
          (sum, item) => sum + money(item.totalPrice),
          0
        ),
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    const salesDetails = deliveredOrders
      .map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        date: order.createdAt,
        grossSales: money(order.totalAmount),
        products: order.items.map((item) => item.productName).join(", "),
      }))
      .filter((order) =>
        search
          ? order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
            order.products.toLowerCase().includes(search.toLowerCase())
          : true
      );

    const filteredDetails = salesDetails.slice(
      (page - 1) * limit,
      page * limit
    );

    return res.status(200).json({
      success: true,
      data: {
        period,
        summary: {
          totalOrders,
          productsSold,
          grossSales,
          commission,
          netEarnings,
          availableEarnings,
          averageOrderValue:
            deliveredOrders.length > 0
              ? grossSales / deliveredOrders.length
              : 0,
        },
        salesTrend,
        topProducts,
        salesDetails: filteredDetails,
        pagination: {
          page,
          limit,
          total: salesDetails.length,
          totalPages: Math.ceil(salesDetails.length / limit),
        },
      },
    });
  } catch (error) {
    console.error("getVendorReports error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load vendor reports",
    });
  }
};
