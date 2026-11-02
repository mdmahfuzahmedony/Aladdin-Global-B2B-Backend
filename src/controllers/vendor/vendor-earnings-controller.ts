
import type { Response } from "express";
import { Prisma, CommissionStatus, PayoutStatus, PayoutMethod } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AuthRequest } from "../../middleware/auth-middleware";


/* =====================================================
   HELPERS
===================================================== */

const money = (value: Prisma.Decimal | number | string) =>
  new Prisma.Decimal(value);

const sumAmounts = (
  items: { amount: Prisma.Decimal }[],
) =>
  items.reduce(
    (total, item) => total.plus(item.amount),
    new Prisma.Decimal(0),
  );

async function getApprovedVendor(userId: string) {
  const vendor = await prisma.vendor.findUnique({
    where: { userId },
    include: { payout: true },
  });

  if (!vendor) {
    throw new Error("VENDOR_NOT_FOUND");
  }

  if (vendor.status !== "APPROVED") {
    throw new Error("VENDOR_NOT_APPROVED");
  }

  return vendor;
}

function handleError(res: Response, error: unknown) {
  if (error instanceof Error && error.message === "VENDOR_NOT_FOUND") {
    return res.status(404).json({
      success: false,
      message: "Vendor account not found",
    });
  }

  if (error instanceof Error && error.message === "VENDOR_NOT_APPROVED") {
    return res.status(403).json({
      success: false,
      message: "Your vendor account is not approved",
    });
  }

  console.error("Vendor earnings error:", error);

  return res.status(500).json({
    success: false,
    message: "Something went wrong",
  });
}

/* =====================================================
   GET /api/vendors/earnings/summary
===================================================== */

export async function getVendorEarningsSummary(
  req: AuthRequest,
  res: Response,
) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const vendor = await getApprovedVendor(userId);

    const [earnings, payouts] = await Promise.all([
      prisma.vendorEarning.findMany({
        where: { vendorId: vendor.id },
      }),
      prisma.vendorPayoutTransaction.findMany({
        where: { vendorId: vendor.id },
      }),
    ]);

    const totalEarnings = earnings.reduce(
      (sum, item) => sum.plus(item.netAmount),
      new Prisma.Decimal(0),
    );

    const availableGross = earnings
      .filter((item) => item.status === CommissionStatus.PAYABLE)
      .reduce(
        (sum, item) => sum.plus(item.netAmount),
        new Prisma.Decimal(0),
      );

    const pendingEarnings = earnings
      .filter((item) => item.status === CommissionStatus.PENDING)
      .reduce(
        (sum, item) => sum.plus(item.netAmount),
        new Prisma.Decimal(0),
      );

    const withdrawnAmount = payouts
      .filter((item) => item.status === PayoutStatus.PAID)
      .reduce(
        (sum, item) => sum.plus(item.amount),
        new Prisma.Decimal(0),
      );

    // Reserve balance for payout requests that are not yet completed.
    const reservedAmount = payouts
      .filter(
        (item) =>
          item.status === PayoutStatus.PENDING ||
          item.status === PayoutStatus.PROCESSING,
      )
      .reduce(
        (sum, item) => sum.plus(item.amount),
        new Prisma.Decimal(0),
      );

    const availableBalance = Prisma.Decimal.max(
      availableGross.minus(reservedAmount),
      new Prisma.Decimal(0),
    );

    return res.json({
      success: true,
      data: {
        totalEarnings: totalEarnings.toNumber(),
        availableBalance: availableBalance.toNumber(),
        pendingEarnings: pendingEarnings.toNumber(),
        withdrawnAmount: withdrawnAmount.toNumber(),
        payoutAccount: vendor.payout
          ? {
              payoutMethod: vendor.payout?.payoutMethod || PayoutMethod.BANK,
              bankName: vendor.payout.bankName,
              bankAccountHolder: vendor.payout.bankAccountHolder,
              // Never send full account numbers to the page.
              hasPayoutAccount: true,
            }
          : null,
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
}

/* =====================================================
   GET /api/vendors/earnings/transactions
===================================================== */

export async function getVendorEarningTransactions(
  req: AuthRequest,
  res: Response,
) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const vendor = await getApprovedVendor(userId);

    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    const status =
      typeof req.query.status === "string"
        ? req.query.status.toUpperCase()
        : "ALL";

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));

    const allowedStatuses: Record<string, CommissionStatus> = {
      AVAILABLE: CommissionStatus.PAYABLE,
      PENDING: CommissionStatus.PENDING,
      PAID: CommissionStatus.PAID,
    };

    if (status !== "ALL" && !allowedStatuses[status]) {
      return res.status(400).json({
        success: false,
        message: "Invalid earning status",
      });
    }

    const where: Prisma.VendorEarningWhereInput = {
      vendorId: vendor.id,
      ...(status !== "ALL"
        ? { status: allowedStatuses[status] }
        : {}),
      ...(search
        ? {
            vendorOrder: {
              OR: [
                {
                  orderNumber: {
                    contains: search,
                    mode: "insensitive",
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
          }
        : {}),
    };

    const [total, earnings] = await Promise.all([
      prisma.vendorEarning.count({ where }),
      prisma.vendorEarning.findMany({
        where,
        include: {
          vendorOrder: {
            include: {
              items: true,
              customer: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const transactions = earnings.map((earning) => {
      const order = earning.vendorOrder;
      const firstItem = order.items[0];

      const customer = order.customer as unknown as {
        fullName?: string;
        name?: string;
      };

      return {
        id: earning.id,
        orderNumber: order.orderNumber,
        product:
          order.items.length > 1
            ? `${firstItem?.productName ?? "Product"} +${order.items.length - 1} more`
            : firstItem?.productName ?? "Product",
        customer: customer.fullName ?? customer.name ?? "Customer",
        grossAmount: earning.grossAmount.toNumber(),
        commission: earning.commissionAmount.toNumber(),
        earning: earning.netAmount.toNumber(),
        status:
          earning.status === CommissionStatus.PAYABLE
            ? "AVAILABLE"
            : earning.status,
        date: earning.createdAt,
      };
    });

    return res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
}

/* =====================================================
   POST /api/vendors/earnings/payouts
===================================================== */

export async function createVendorPayoutRequest(
  req: AuthRequest,
  res: Response,
) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const amountValue = Number(req.body.amount);

    if (
      !Number.isFinite(amountValue) ||
      amountValue <= 0 ||
      !Number.isSafeInteger(Math.round(amountValue * 100))
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid payout amount",
      });
    }

    const amount = new Prisma.Decimal(amountValue.toFixed(2));
    const vendor = await getApprovedVendor(userId);

    if (!vendor.payout) {
      return res.status(400).json({
        success: false,
        message: "Please add your payout account first",
      });
    }

    const payout = await prisma.$transaction(
      async (tx) => {
        const payable = await tx.vendorEarning.aggregate({
          where: {
            vendorId: vendor.id,
            status: CommissionStatus.PAYABLE,
          },
          _sum: { netAmount: true },
        });

        const reserved = await tx.vendorPayoutTransaction.aggregate({
          where: {
            vendorId: vendor.id,
            status: {
              in: [PayoutStatus.PENDING, PayoutStatus.PROCESSING],
            },
          },
          _sum: { amount: true },
        });

        const payableAmount =
          payable._sum.netAmount ?? new Prisma.Decimal(0);

        const reservedAmount =
          reserved._sum.amount ?? new Prisma.Decimal(0);

        const available = payableAmount.minus(reservedAmount);

        if (amount.greaterThan(available) || available.lessThanOrEqualTo(0)) {
          throw new Error("INSUFFICIENT_BALANCE");
        }

        return tx.vendorPayoutTransaction.create({
          data: {
            vendorId: vendor.id,
            amount,
            payoutMethod: vendor.payout?.payoutMethod || PayoutMethod.BANK,
            status: PayoutStatus.PENDING,
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );

    return res.status(201).json({
      success: true,
      message: "Payout request created. Payment is not yet processed.",
      data: {
        id: payout.id,
        amount: payout.amount.toNumber(),
        payoutMethod: payout.payoutMethod,
        status: payout.status,
        requestedAt: payout.requestedAt,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_BALANCE") {
      return res.status(400).json({
        success: false,
        message: "Insufficient available balance",
      });
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2034"
    ) {
      return res.status(409).json({
        success: false,
        message: "Balance changed. Please try again.",
      });
    }

    return handleError(res, error);
  }
}
