import type { Request, Response } from "express";
import { prisma } from "../../config/prisma";


type AuthenticatedRequest = Request & {
  user?: { id?: string; userId?: string };
};

async function findVendorId(userId: string) {
  const vendor = await prisma.vendor.findUnique({
    where: { userId },
    select: { id: true },
  });

  return vendor?.id ?? null;
}

export async function getVendorEarnings(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const userId = req.user?.id ?? req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const vendorId = await findVendorId(userId);

    if (!vendorId) {
      return res.status(403).json({
        success: false,
        message: "Vendor account not found.",
      });
    }

    const [earnings, totals] = await Promise.all([
      prisma.vendorEarning.findMany({
        where: { vendorId },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.vendorEarning.groupBy({
        by: ["status"],
        where: { vendorId },
        _sum: { netAmount: true },
      }),
    ]);

    const summary = {
      pending: "0.00",
      available: "0.00",
      paid: "0.00",
      reversed: "0.00",
    };

    for (const item of totals) {
      const amount = Number(item._sum.netAmount ?? 0).toFixed(2);

      if (item.status === "PENDING") summary.pending = amount;
      if ((item.status as any) === "APPROVED" || (item.status as any) === "PAYABLE") summary.available = amount;
      if (item.status === "PAID") summary.paid = amount;
      if ((item.status as any) === "REJECTED") summary.reversed = amount;
    }

    return res.json({
      success: true,
      data: { summary, earnings },
    });
  } catch (error) {
    console.error("getVendorEarnings:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve vendor earnings.",
    });
  }
}