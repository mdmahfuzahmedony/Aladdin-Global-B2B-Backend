
import { Request, Response } from "express";

import { prisma } from "../../config/prisma";

import { AuthRequest } from "../../middleware/auth-middleware";

import { createActivity } from "../../services/activity-service";

// =====================================================
// GET ALL BANNERS
// =====================================================

export const getBanners = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const banners = await prisma.banner.findMany({
      include: {
        placement: true,
      },
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
    });

    return res.status(200).json({
      success: true,
      data: banners,
    });
  } catch (error: any) {
    console.error("GET BANNERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch banners",
      error: error?.message,
    });
  }
};

// =====================================================
// GET BANNER BY ID
// =====================================================

export const getBannerById = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = String(req.params.id);

    const banner = await prisma.banner.findUnique({
      where: {
        id,
      },
      include: {
        placement: true,
      },
    });

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: banner,
    });
  } catch (error: any) {
    console.error("GET BANNER BY ID ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch banner",
      error: error?.message,
    });
  }
};

// =====================================================
// CREATE BANNER
// =====================================================

export const createBanner = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const {
      name,
      image,
      link,
      placementKey,
      status,
      startDate,
      endDate,
      sortOrder,
    } = req.body;

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (!name || !image || !placementKey) {
      return res.status(400).json({
        success: false,
        message: "Name, image and placement are required",
      });
    }

    // -------------------------------------------------
    // CHECK PLACEMENT
    // -------------------------------------------------

   console.log("Received placementKey:", placementKey);

const placement =
  await prisma.bannerPlacementConfig.findUnique({
    where: {
      key: placementKey,
    },
  });

console.log("Found placement:", placement);

    if (!placement) {
      return res.status(400).json({
        success: false,
        message: "Invalid banner placement",
      });
    }

    // -------------------------------------------------
    // CREATE BANNER
    // -------------------------------------------------

    const banner = await prisma.banner.create({
      data: {
        name: String(name).trim(),

        image: String(image).trim(),

        link: link ? String(link).trim() : "",

        placementKey,

        status:
          status === "INACTIVE"
            ? "INACTIVE"
            : "ACTIVE",

        startDate: startDate
          ? new Date(startDate)
          : null,

        endDate: endDate
          ? new Date(endDate)
          : null,

        sortOrder:
          sortOrder !== undefined
            ? Number(sortOrder)
            : 0,
      },

      include: {
        placement: true,
      },
    });

    // -------------------------------------------------
    // ACTIVITY LOG
    // -------------------------------------------------

    await createActivity({
      userId: req.user?.id,

      action: "CREATE",

      title: "Added new banner",

      description: `Banner "${banner.name}" was added`,

      entityId: banner.id,

      entityType: "BANNER",
    });

    return res.status(201).json({
      success: true,

      message: "Banner created successfully",

      data: banner,
    });
  } catch (error: any) {
    console.error("CREATE BANNER ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to create banner",

      error: error?.message,
    });
  }
};

// =====================================================
// UPDATE BANNER
// =====================================================

export const updateBanner = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = String(req.params.id);

    const {
      name,
      image,
      link,
      placementKey,
      status,
      startDate,
      endDate,
      sortOrder,
    } = req.body;

    // -------------------------------------------------
    // CHECK EXISTING BANNER
    // -------------------------------------------------

    const existingBanner =
      await prisma.banner.findUnique({
        where: {
          id,
        },
      });

    if (!existingBanner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    // -------------------------------------------------
    // CHECK PLACEMENT IF PROVIDED
    // -------------------------------------------------

    if (placementKey) {
      const placement =
        await prisma.bannerPlacementConfig.findUnique({
          where: {
            key: placementKey,
          },
        });

      if (!placement) {
        return res.status(400).json({
          success: false,
          message: "Invalid banner placement",
        });
      }
    }

    // -------------------------------------------------
    // UPDATE DATA
    // -------------------------------------------------

    const updateData: any = {};

    if (name !== undefined) {
      updateData.name = String(name).trim();
    }

    if (image !== undefined) {
      updateData.image = String(image).trim();
    }

    if (link !== undefined) {
      updateData.link = String(link).trim();
    }

    if (placementKey !== undefined) {
      updateData.placementKey = placementKey;
    }

    if (status !== undefined) {
      updateData.status =
        status === "INACTIVE"
          ? "INACTIVE"
          : "ACTIVE";
    }

    if (startDate !== undefined) {
      updateData.startDate = startDate
        ? new Date(startDate)
        : null;
    }

    if (endDate !== undefined) {
      updateData.endDate = endDate
        ? new Date(endDate)
        : null;
    }

    if (sortOrder !== undefined) {
      updateData.sortOrder = Number(sortOrder);
    }

    // -------------------------------------------------
    // UPDATE BANNER
    // -------------------------------------------------

    const banner = await prisma.banner.update({
      where: {
        id,
      },

      data: updateData,

      include: {
        placement: true,
      },
    });

    // -------------------------------------------------
    // ACTIVITY LOG
    // -------------------------------------------------

    await createActivity({
      userId: req.user?.id,

      action: "UPDATE",

      title: "Updated banner",

      description: `Banner "${banner.name}" was updated`,

      entityId: banner.id,

      entityType: "BANNER",
    });

    return res.status(200).json({
      success: true,

      message: "Banner updated successfully",

      data: banner,
    });
  } catch (error: any) {
    console.error("UPDATE BANNER ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to update banner",

      error: error?.message,
    });
  }
};

// =====================================================
// DELETE BANNER
// =====================================================

export const deleteBanner = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = String(req.params.id);

    // -------------------------------------------------
    // CHECK EXISTING BANNER
    // -------------------------------------------------

    const banner = await prisma.banner.findUnique({
      where: {
        id,
      },
    });

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    // -------------------------------------------------
    // DELETE BANNER
    // -------------------------------------------------

    await prisma.banner.delete({
      where: {
        id,
      },
    });

    // -------------------------------------------------
    // ACTIVITY LOG
    // -------------------------------------------------

    await createActivity({
      userId: req.user?.id,

      action: "DELETE",

      title: "Deleted banner",

      description: `Banner "${banner.name}" was deleted`,

      entityId: banner.id,

      entityType: "BANNER",
    });

    return res.status(200).json({
      success: true,

      message: "Banner deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE BANNER ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to delete banner",

      error: error?.message,
    });
  }
};

// =====================================================
// GET PUBLIC TOP BANNERS
// =====================================================

export const getPublicTopBanner = async (
  req: Request,
  res: Response
) => {
  try {
    const now = new Date();

    const banners = await prisma.banner.findMany({
      where: {
        placementKey: "TOP_BANNER",

        status: "ACTIVE",

        AND: [
          {
            OR: [
              {
                startDate: null,
              },
              {
                startDate: {
                  lte: now,
                },
              },
            ],
          },

          {
            OR: [
              {
                endDate: null,
              },
              {
                endDate: {
                  gte: now,
                },
              },
            ],
          },
        ],
      },

      orderBy: {
        sortOrder: "asc",
      },
    });

    return res.status(200).json({
      success: true,
      banners,
    });
  } catch (error: any) {
    console.error(
      "GET PUBLIC TOP BANNERS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Top banner load করতে সমস্যা হয়েছে",

      error: error?.message,
    });
  }
}


// =====================================================
// GET PUBLIC HOMEPAGE HERO BANNERS
// =====================================================


export const getPublicHomepageHero = async (
  req: Request,
  res: Response
) => {
  try {
    const banners = await prisma.banner.findMany({
      where: {
        placementKey: "HOMEPAGE_HERO",
        status: "ACTIVE",
      },
      orderBy: [
        { sortOrder: "asc" },
        { createdAt: "desc" },
      ],
    });

    console.log(
      "HOMEPAGE HERO BANNERS:",
      banners.length,
      banners.map((banner) => ({
        id: banner.id,
        name: banner.name,
        placementKey: banner.placementKey,
        status: banner.status,
        image: banner.image,
      }))
    );

    return res.status(200).json({
      success: true,
      count: banners.length,
      banners,
    });
  } catch (error: any) {
    console.error(
      "GET PUBLIC HOMEPAGE HERO ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Homepage hero banner load করতে সমস্যা হয়েছে",
      error: error?.message,
    });
  }
};


export const getPublicBannersByPlacement = async (
  req: Request,
  res: Response
) => {
  try {
    const placement = String(req.params.placement ?? "")
      .trim()
      .toUpperCase()
      .replace(/-/g, "_")
      .replace(/\s+/g, "_");

    const allowedPlacements = [
      "FLASH_SALE",
      "NEW_ARRIVALS",
      "BEST_SELLERS",
      "FEATURED_PRODUCTS",
      "TOP_RATED_PRODUCTS",
    ];

    if (!allowedPlacements.includes(placement)) {
      return res.status(400).json({
        success: false,
        message: "Invalid banner placement",
        receivedPlacement: placement,
      });
    }

    // সব Banner রেকর্ড পরীক্ষা
    const allBanners = await prisma.banner.findMany({
      select: {
        id: true,
        name: true,
        placementKey: true,
        status: true,
        startDate: true,
        endDate: true,
      },
    });

    console.log("ALL BANNERS:", allBanners);
    console.log("REQUESTED PLACEMENT:", placement);

    // প্রথমে শুধু Placement Key দিয়ে খোঁজা
    const banners = await prisma.banner.findMany({
      where: {
        placementKey: placement,
      },
      orderBy: [
        { sortOrder: "asc" },
        { createdAt: "desc" },
      ],
      include: {
        placement: true,
      },
    });

    console.log("MATCHING BANNER COUNT:", banners.length);

    return res.status(200).json({
      success: true,
      requestedPlacement: placement,
      databaseBannerCount: allBanners.length,
      count: banners.length,
      banners,
    });
  } catch (error: any) {
    console.error("GET PUBLIC BANNERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch banners",
      error: error?.message,
    });
  }
};
