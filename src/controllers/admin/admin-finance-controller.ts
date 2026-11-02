import { Response } from "express";
import { prisma } from "../../config/prisma";
import { AuthRequest } from "../../middleware/auth-middleware";

export const getFinanceOverview = async (req: AuthRequest, res: Response) => {
  try {
    const [
      orders,
      commissionSum,
      paidPayoutsSum,
      pendingPayoutsSum,
      pendingPayoutsCount,
      activeVendorsCount,
      recentPayouts,
    ] = await Promise.all([
      prisma.vendorOrder.findMany({
        where: {
          status: {
            notIn: ["CANCELLED", "RETURNED", "REFUNDED"],
          },
        },
        select: {
          totalAmount: true,
          status: true,
          createdAt: true,
        },
      }),

      prisma.vendorEarning.aggregate({
        _sum: { commissionAmount: true },
      }),

      prisma.vendorPayoutTransaction.aggregate({
        where: { status: "PAID" },
        _sum: { amount: true },
      }),

      prisma.vendorPayoutTransaction.aggregate({
        where: { status: "PENDING" },
        _sum: { amount: true },
      }),

      prisma.vendorPayoutTransaction.count({
        where: { status: "PENDING" },
      }),

      prisma.vendor.count({
        where: { status: "APPROVED" },
      }),

      prisma.vendorPayoutTransaction.findMany({
        orderBy: { requestedAt: "desc" },
        take: 5,
        include: {
          vendor: { select: { storeName: true } },
        },
      }),
    ]);

    const totalGMV = orders.reduce(
      (sum, o) => sum + Number(o.totalAmount || 0),
      0
    );

    const totalCommission = Number(
      commissionSum._sum.commissionAmount || Math.round(totalGMV * 0.05)
    );

    const totalPaidOut = Number(paidPayoutsSum._sum.amount || 0);
    const pendingPayouts = Number(pendingPayoutsSum._sum.amount || 0);

    // Monthly revenue trend (last 7 months)
    const now = new Date();
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const revenueTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const mEnd = new Date(
        d.getFullYear(),
        d.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );

      const monthOrders = orders.filter((o) => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= mStart && orderDate <= mEnd;
      });

      const monthTotal = monthOrders.reduce(
        (sum, o) => sum + Number(o.totalAmount || 0),
        0
      );

      revenueTrend.push({
        month: monthNames[d.getMonth()],
        year: d.getFullYear(),
        revenue: monthTotal,
        commission: Math.round(monthTotal * 0.05),
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalRevenue: totalGMV,
          totalCommission,
          totalPaidOut,
          pendingPayouts,
          pendingPayoutsCount,
          activeVendorsCount,
          totalTransactions: orders.length,
        },
        revenueTrend,
        recentPayouts: recentPayouts.map((p) => ({
          id: p.id,
          vendor: p.vendor?.storeName || "Unknown",
          amount: Number(p.amount || 0),
          method: p.payoutMethod,
          status: p.status,
          date: p.requestedAt,
        })),
      },
    });
  } catch (err: any) {
    console.error("GET FINANCE OVERVIEW ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err?.message || "Failed to load finance overview",
    });
  }
};

export const getFinanceTransactions = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const search = String(req.query.search || "").trim();
    const paymentMethod = String(req.query.paymentMethod || "ALL");
    const status = String(req.query.status || "ALL");
    const limit = Math.min(500, Math.max(1, Number(req.query.limit) || 100));

    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { id: { contains: search, mode: "insensitive" } },
        { vendor: { storeName: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (status !== "ALL") {
      whereClause.status = status;
    }

    const orders = await prisma.vendorOrder.findMany({
      where: whereClause,
      include: {
        vendor: { select: { storeName: true } },
        earning: true,
        payments: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const transactions = orders.map((o) => {
      const orderAmount = Number(o.totalAmount || 0);
      const commission = o.earning
        ? Number(o.earning.commissionAmount || 0)
        : Math.round(orderAmount * 0.05);
      const vendorEarnings = o.earning
        ? Number(o.earning.netAmount || 0)
        : orderAmount - commission;

      const provider = o.payments?.[0]?.provider || "BANK";

      return {
        id: `TXN-${o.orderNumber || o.id.slice(0, 8)}`,
        vendor: o.vendor?.storeName || "Store",
        shop: o.vendor?.storeName || "Store",
        orderId: o.orderNumber || o.id.slice(0, 8),
        paymentMethod: provider,
        orderAmount,
        vendorEarnings,
        adminProfit: commission,
        status: o.status === "DELIVERED" ? "COMPLETED" : o.status,
        date: new Intl.DateTimeFormat("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).format(new Date(o.createdAt)),
        createdAt: o.createdAt,
      };
    });

    const filtered =
      paymentMethod === "ALL"
        ? transactions
        : transactions.filter((t) => t.paymentMethod === paymentMethod);

    return res.status(200).json({
      success: true,
      data: filtered,
    });
  } catch (err: any) {
    console.error("GET FINANCE TRANSACTIONS ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err?.message || "Failed to load transactions",
    });
  }
};

export const getFinancePayouts = async (req: AuthRequest, res: Response) => {
  try {
    const search = String(req.query.search || "").trim();
    const status = String(req.query.status || "ALL");
    const method = String(req.query.method || "ALL");

    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { id: { contains: search, mode: "insensitive" } },
        { transactionReference: { contains: search, mode: "insensitive" } },
        { vendor: { storeName: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (status !== "ALL") {
      whereClause.status = status;
    }

    if (method !== "ALL") {
      whereClause.payoutMethod = method;
    }

    const payouts = await prisma.vendorPayoutTransaction.findMany({
      where: whereClause,
      include: {
        vendor: {
          select: {
            id: true,
            storeName: true,
            earnings: {
              where: { status: "PAYABLE" },
              select: { netAmount: true },
            },
          },
        },
      },
      orderBy: { requestedAt: "desc" },
      take: 100,
    });

    const mapped = payouts.map((p) => {
      const payableSum =
        p.vendor?.earnings?.reduce(
          (sum, e) => sum + Number(e.netAmount || 0),
          0
        ) || 0;

      return {
        id: p.transactionReference || `PAY-${p.id.slice(0, 8)}`,
        realId: p.id,
        vendor: p.vendor?.storeName || "Unknown Vendor",
        shop: p.vendor?.storeName || "Vendor Store",
        walletBalance: payableSum,
        requestedAmount: Number(p.amount || 0),
        method: p.payoutMethod,
        date: new Intl.DateTimeFormat("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).format(new Date(p.requestedAt)),
        status: p.status,
      };
    });

    return res.status(200).json({
      success: true,
      data: mapped,
    });
  } catch (err: any) {
    console.error("GET FINANCE PAYOUTS ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err?.message || "Failed to load payouts",
    });
  }
};

export const updatePayoutStatus = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status } = req.body;

    const validStatuses = ["PENDING", "PROCESSING", "PAID", "FAILED"];
    const targetStatus =
      status === "APPROVED" ? "PAID" : status === "REJECTED" ? "FAILED" : status;

    if (!validStatuses.includes(targetStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payout status",
      });
    }

    // Try finding by id or transactionReference
    let record = await prisma.vendorPayoutTransaction.findUnique({
      where: { id },
    });

    if (!record) {
      record = await prisma.vendorPayoutTransaction.findFirst({
        where: { transactionReference: id },
      });
    }

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Payout transaction not found",
      });
    }

    const updated = await prisma.vendorPayoutTransaction.update({
      where: { id: record.id },
      data: {
        status: targetStatus as any,
        processedAt: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: `Payout marked as ${targetStatus}`,
      data: updated,
    });
  } catch (err: any) {
    console.error("UPDATE PAYOUT STATUS ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err?.message || "Failed to update payout status",
    });
  }
};
