
import { Response } from "express";
import { AuthRequest } from "../../middleware/auth-middleware";
import { prisma } from "../../config/prisma";


const VALID_STATUSES = ["PUBLISHED", "PENDING", "HIDDEN"] as const;

type ReviewStatus = (typeof VALID_STATUSES)[number];

function getUserId(req: AuthRequest): string | null {
  // তোমার AuthRequest-এ user.id না থাকলে
  // middleware অনুযায়ী এই অংশ পরিবর্তন করতে হবে।
  return (req as any).user?.id ?? null;
}

function isReviewStatus(value: unknown): value is ReviewStatus {
  return (
    typeof value === "string" &&
    VALID_STATUSES.includes(value as ReviewStatus)
  );
}

// GET /api/vendors/reviews
export const getVendorReviews = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!vendor) {
      return res.status(403).json({
        success: false,
        message: "Vendor account not found",
      });
    }

    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    const rating =
      typeof req.query.rating === "string"
        ? Number(req.query.rating)
        : undefined;

    const status = req.query.status;

    if (
      rating !== undefined &&
      (!Number.isInteger(rating) || rating < 1 || rating > 5)
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    if (
      status !== undefined &&
      status !== "ALL" &&
      !isReviewStatus(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid review status",
      });
    }

    const where: any = {
      product: {
        vendorId: vendor.id,
      },
    };

    if (search) {
      where.OR = [
        {
          user: {
            fullName: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          user: {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          product: {
            title: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          comment: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (rating !== undefined) {
      where.rating = rating;
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    const [reviews, total, published, pending, hidden, average] =
      await Promise.all([
        prisma.productReview.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
            product: {
              select: {
                id: true,
                title: true,
                images: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        }),

        prisma.productReview.count({
          where: { product: { vendorId: vendor.id } },
        }),

        prisma.productReview.count({
          where: {
            product: { vendorId: vendor.id },
            status: "PUBLISHED",
          },
        }),

        prisma.productReview.count({
          where: {
            product: { vendorId: vendor.id },
            status: "PENDING",
          },
        }),

        prisma.productReview.count({
          where: {
            product: { vendorId: vendor.id },
            status: "HIDDEN",
          },
        }),

        prisma.productReview.aggregate({
          where: {
            product: { vendorId: vendor.id },
            status: "PUBLISHED",
          },
          _avg: { rating: true },
        }),
      ]);

    const ratingCounts = await prisma.productReview.groupBy({
      by: ["rating"],
      where: {
        product: { vendorId: vendor.id },
        status: "PUBLISHED",
      },
      _count: { _all: true },
    });

    const ratingSummary = [5, 4, 3, 2, 1].map((star) => {
      const item = ratingCounts.find((r) => r.rating === star);
      const count = item?._count._all ?? 0;

      return {
        rating: star,
        count,
        percentage: published
          ? Math.round((count / published) * 100)
          : 0,
      };
    });

    return res.status(200).json({
      success: true,
      data: reviews.map((review) => ({
        id: review.id,
        customer: review.user.fullName || "Customer",
        email: review.user.email || "",
        product: review.product.title,
        productId: review.product.id,
        productImage: review.product.images[0] || null,
        rating: review.rating,
        comment: review.comment || "",
        status: review.status,
        date: review.createdAt,
        verified: review.verified,
      })),
      stats: {
        total,
        published,
        pending,
        hidden,
        averageRating: Number(
          (average._avg.rating ?? 0).toFixed(1)
        ),
      },
      ratingSummary,
    });
  } catch (error) {
    console.error("getVendorReviews error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load reviews",
    });
  }
};

// GET /api/vendors/reviews/:id
export const getVendorReviewById = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const review = await prisma.productReview.findFirst({
      where: {
        id: String(req.params.id),
        product: {
          vendor: { userId },
        },
      },
      include: {
        user: {
          select: { id: true, fullName: true, email: true },
        },
        product: {
          select: { id: true, title: true, images: true },
        },
      },
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    return res.json({
      success: true,
      data: {
        id: review.id,
        customer: review.user.fullName || "Customer",
        email: review.user.email || "",
        product: review.product.title,
        productId: review.product.id,
        productImage: review.product.images[0] || null,
        rating: review.rating,
        comment: review.comment || "",
        status: review.status,
        date: review.createdAt,
        verified: review.verified,
      },
    });
  } catch (error) {
    console.error("getVendorReviewById error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load review",
    });
  }
};

// PATCH /api/vendors/reviews/:id/status
export const updateVendorReviewStatus = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = getUserId(req);
    const { status } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!isReviewStatus(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be PUBLISHED, PENDING, or HIDDEN",
      });
    }

    const review = await prisma.productReview.findFirst({
      where: {
        id: String(req.params.id),
        product: {
          vendor: { userId },
        },
      },
      select: { id: true },
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    const updated = await prisma.productReview.update({
      where: { id: review.id },
      data: { status },
    });

    return res.json({
      success: true,
      message: "Review status updated",
      data: updated,
    });
  } catch (error) {
    console.error("updateVendorReviewStatus error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update review status",
    });
  }
};

// PATCH /api/vendors/reviews/bulk-status
export const bulkUpdateVendorReviewStatus = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = getUserId(req);
    const { ids, status } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (
      !Array.isArray(ids) ||
      ids.length === 0 ||
      ids.length > 500 ||
      !ids.every(
        (id: unknown) => typeof id === "string" && id.length > 0
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide between 1 and 500 valid review IDs",
      });
    }

    if (!isReviewStatus(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review status",
      });
    }

    const result = await prisma.productReview.updateMany({
      where: {
        id: { in: [...new Set(ids)] },
        product: {
          vendor: { userId },
        },
      },
      data: { status },
    });

    return res.json({
      success: true,
      message: "Review statuses updated",
      updatedCount: result.count,
    });
  } catch (error) {
    console.error("bulkUpdateVendorReviewStatus error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update review statuses",
    });
  }
};
