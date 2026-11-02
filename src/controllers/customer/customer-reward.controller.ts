import { Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AuthRequest } from "../../middleware/auth-middleware";

export const POINT_EARN_RATE_TK = 100; // 100 TK product purchase = 1 point
export const POINT_VALUE_TK = 1; // 1 point = 1 TK discount

/**
 * Award points for an order (1 point per 100 TK product value)
 */
export async function awardPointsForOrder(
  tx: Prisma.TransactionClient,
  params: {
    customerId: string;
    customerOrderId: string;
    subtotal: number | Prisma.Decimal;
  }
) {
  const { customerId, customerOrderId, subtotal } = params;
  const numSubtotal = Number(subtotal);
  const earnedPoints = Math.floor(numSubtotal / POINT_EARN_RATE_TK);

  if (earnedPoints <= 0) return 0;

  // Check if points were already awarded for this order
  const existingTx = await tx.rewardPointTransaction.findUnique({
    where: { customerOrderId },
  });

  if (existingTx) return existingTx.points;

  // Upsert CustomerReward
  await tx.customerReward.upsert({
    where: { customerId },
    create: {
      customerId,
      points: earnedPoints,
    },
    update: {
      points: { increment: earnedPoints },
    },
  });

  // Record transaction
  await tx.rewardPointTransaction.create({
    data: {
      customerId,
      customerOrderId,
      points: earnedPoints,
      amount: new Prisma.Decimal(numSubtotal.toFixed(2)),
    },
  });

  return earnedPoints;
}

/**
 * GET /api/customer/rewards/me
 * Fetch logged-in customer's reward points, store breakdown, and history
 */
export async function getMyRewardPoints(req: AuthRequest, res: Response) {
  try {
    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: "অনুগ্রহ করে লগইন করুন।",
      });
    }

    // Query all non-cancelled vendor orders for this customer to calculate store-wise points
    const vendorOrders = await prisma.vendorOrder.findMany({
      where: {
        customerId,
        status: { notIn: ["CANCELLED"] },
      },
      include: {
        vendor: {
          select: {
            id: true,
            storeName: true,
            settings: {
              select: {
                logoUrl: true,
              },
            },
          },
        },
        customerOrder: {
          select: {
            orderNumber: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const storeMap = new Map<
      string,
      {
        vendorId: string;
        storeName: string;
        logoUrl: string | null;
        totalPurchased: number;
        points: number;
        pointsWorthTk: number;
        ordersCount: number;
      }
    >();

    const transactions = [];

    for (const vo of vendorOrders) {
      const vId = vo.vendorId;
      const subtotal = Number(vo.subtotal || 0);
      const earned = Math.floor(subtotal / POINT_EARN_RATE_TK);
      const storeName = vo.vendor?.storeName || "Vendor Store";
      const logoUrl = vo.vendor?.settings?.logoUrl || null;

      const existing = storeMap.get(vId) || {
        vendorId: vId,
        storeName,
        logoUrl,
        totalPurchased: 0,
        points: 0,
        pointsWorthTk: 0,
        ordersCount: 0,
      };

      existing.totalPurchased += subtotal;
      existing.points += earned;
      existing.pointsWorthTk = existing.points * POINT_VALUE_TK;
      existing.ordersCount += 1;
      storeMap.set(vId, existing);

      if (earned > 0) {
        transactions.push({
          id: vo.id,
          vendorId: vId,
          storeName,
          orderNumber: vo.customerOrder?.orderNumber || vo.orderNumber,
          amount: subtotal,
          points: earned,
          createdAt: vo.createdAt,
          status: vo.status,
        });
      }
    }

    const stores = Array.from(storeMap.values()).filter((s) => s.points > 0);
    const totalPoints = stores.reduce((sum, s) => sum + s.points, 0);

    // Sync total points with customerReward
    await prisma.customerReward.upsert({
      where: { customerId },
      create: { customerId, points: totalPoints },
      update: { points: totalPoints },
    });

    return res.status(200).json({
      success: true,
      data: {
        points: totalPoints,
        pointRate: POINT_EARN_RATE_TK,
        pointValueInTk: POINT_VALUE_TK,
        pointsWorthTk: totalPoints * POINT_VALUE_TK,
        stores,
        transactions,
      },
    });
  } catch (error) {
    console.error("GET MY REWARD POINTS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "রিওয়ার্ড পয়েন্ট লোড করা যায়নি।",
    });
  }
}
