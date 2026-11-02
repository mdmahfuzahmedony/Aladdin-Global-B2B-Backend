
import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middleware/auth-middleware";


// GET: একটি প্রোডাক্টের রিভিউ ও রেটিং দেখানো
export async function getProductReviews(
  req: Request,
  res: Response
) {
  try {
    const productId = String(req.params.productId);

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "প্রোডাক্ট পাওয়া যায়নি",
      });
    }

    const reviews = await prisma.productReview.findMany({
      where: {
        productId,
        status: "PUBLISHED",
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        rating: true,
        comment: true,
        verified: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    const stats = await prisma.productReview.aggregate({
      where: {
        productId,
        status: "PUBLISHED",
      },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const starCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r: any) => {
      const star = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 0)));
      if (starCounts[star] !== undefined) {
        starCounts[star]++;
      }
    });

    let mostCommonStar: number | null = null;
    let maxStarCount = 0;
    ([5, 4, 3, 2, 1] as const).forEach((star) => {
      if (starCounts[star] > maxStarCount) {
        maxStarCount = starCounts[star];
        mostCommonStar = star;
      }
    });

    return res.status(200).json({
      success: true,
      data: reviews,
      stats: {
        averageRating: stats._avg?.rating ? Number(stats._avg.rating.toFixed(1)) : 0,
        totalReviews: (stats._count as any)?.rating ?? 0,
        starCounts,
        mostCommonStar: maxStarCount > 0 ? mostCommonStar : null,
        maxStarCount,
      },
    });
  } catch (error) {
    console.error("Get Product Reviews Error:", error);

    return res.status(500).json({
      success: false,
      message: "রিভিউ লোড করা যায়নি",
    });
  }
}

// POST: নতুন রিভিউ তৈরি
export async function createProductReview(
  req: AuthRequest,
  res: Response
) {
  try {
    const productId = String(req.params.productId);
    const { rating, comment } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "রিভিউ দিতে লগইন করুন",
      });
    }

    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "রেটিং অবশ্যই ১ থেকে ৫-এর মধ্যে হতে হবে",
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "প্রোডাক্ট পাওয়া যায়নি",
      });
    }

    const existingReview = await prisma.productReview.findFirst({
      where: {
        productId,
        userId,
      },
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "এই প্রোডাক্টে তুমি ইতিমধ্যে রিভিউ দিয়েছ",
      });
    }

    const review = await prisma.productReview.create({
      data: {
        productId,
        userId,
        rating: numericRating,
        comment:
          typeof comment === "string" ? comment.trim() || null : null,
        status: "PUBLISHED",
        verified: false,
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        status: true,
        verified: true,
        createdAt: true,
      },
    });

    // Update aggregate stats on topRatedAttribute
    try {
      const stats = await prisma.productReview.aggregate({
        where: {
          productId,
          status: "PUBLISHED",
        },
        _avg: { rating: true },
        _count: { rating: true },
      });

      const newAvg = stats._avg?.rating ? Number(stats._avg.rating.toFixed(1)) : numericRating;
      const newTotal = (stats._count as any)?.rating || 1;

      await prisma.topRatedAttribute.upsert({
        where: { productId },
        create: {
          productId,
          averageRating: newAvg,
          totalReviews: newTotal,
        },
        update: {
          averageRating: newAvg,
          totalReviews: newTotal,
        },
      });
    } catch (aggErr) {
      console.error("Failed to update topRatedAttribute stats:", aggErr);
    }

    return res.status(201).json({
      success: true,
      message: "তোমার রিভিউ সফলভাবে প্রকাশিত হয়েছে।",
      data: review,
    });
  } catch (error) {
    console.error("Create Product Review Error:", error);

    return res.status(500).json({
      success: false,
      message: "রিভিউ জমা দেওয়া যায়নি",
    });
  }
}
