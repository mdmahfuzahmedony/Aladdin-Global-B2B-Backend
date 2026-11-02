import { Response } from "express";

import { prisma } from "../config/prisma";
import { createActivity } from "../services/activity-service";

// =====================================================
// CREATE BRAND
// =====================================================

export async function createBrand(req: any, res: Response) {
  try {
    const { name, slug, status, mediaId } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        error: "Brand name is required",
      });
    }

    if (!mediaId?.trim()) {
      return res.status(400).json({
        success: false,
        error: "Brand image is required",
      });
    }

    const brandName = name.trim();

    const generatedSlug =
      slug?.trim() ||
      brandName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const existingBrand = await prisma.brand.findUnique({
      where: {
        slug: generatedSlug,
      },
    });

    if (existingBrand) {
      return res.status(409).json({
        success: false,
        error: "Brand with this slug already exists",
      });
    }

    // Selected image from Media Library
    const selectedMedia = await prisma.media.findUnique({
      where: {
        id: mediaId,
      },
    });

    if (!selectedMedia) {
      return res.status(404).json({
        success: false,
        error: "Selected Media Library image not found",
      });
    }

    if (selectedMedia.type !== "IMAGE") {
      return res.status(400).json({
        success: false,
        error: "Selected media must be an image",
      });
    }

    console.log("=================================");
    console.log("🖼️ SELECTED BRAND MEDIA");
    console.log("Media ID:", selectedMedia.id);
    console.log("Original Name:", selectedMedia.originalName);
    console.log("Category:", selectedMedia.category);
    console.log("Media URL:", selectedMedia.url);
    console.log("=================================");

    const brand = await prisma.brand.create({
      data: {
        name: brandName,
        slug: generatedSlug,

        // এখানে Media Library-এর selected image-এর URL যাবে
        logo: selectedMedia.url,

        status: status?.trim() || "Active",
      },
    });

    // =====================================================
    // CREATE ACTIVITY LOG
    // =====================================================

    await createActivity({
      userId: req.user?.id,
      action: "CREATE",
      title: "Added new brand",
      description: `Brand "${brand.name}" was added`,
      entityId: brand.id,
      entityType: "BRAND",
    });

    return res.status(201).json({
      success: true,
     
      data: brand,
    });
  } catch (error: any) {
    console.error("CREATE BRAND ERROR:", error);

    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to create brand",
    });
  }
}

// =====================================================
// GET ALL BRANDS
// =====================================================

export async function getBrands(req: any, res: Response) {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: brands,
    });
  } catch (error: any) {
    console.error("GET BRANDS ERROR:", error);

    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to fetch brands",
    });
  }
}

// =====================================================
// GET BRAND BY ID
// =====================================================

export async function getBrandById(
  req: any,
  res: Response
) {
  try {
    const { id } = req.params;

    const brand = await prisma.brand.findUnique({
      where: {
        id,
      },
    });

    if (!brand) {
      return res.status(404).json({
        success: false,
        error: "Brand not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: brand,
    });
  } catch (error: any) {
    console.error("GET BRAND BY ID ERROR:", error);

    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to fetch brand",
    });
  }
}

// =====================================================
// UPDATE BRAND
// =====================================================

export async function updateBrand(
  req: any,
  res: Response
) {
  try {
    const { id } = req.params;

    const {
      name,
      slug,
      logo,
      status,
    } = req.body;

    // ---------------------------
    // Check brand
    // ---------------------------

    const existingBrand = await prisma.brand.findUnique({
      where: {
        id,
      },
    });

    if (!existingBrand) {
      return res.status(404).json({
        success: false,
        error: "Brand not found",
      });
    }

    // ---------------------------
    // Generate new values
    // ---------------------------

    const updatedName =
      name?.trim() || existingBrand.name;

    const updatedSlug =
      slug?.trim() ||
      updatedName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    // ---------------------------
    // Check duplicate slug
    // ---------------------------

    const duplicateBrand = await prisma.brand.findFirst({
      where: {
        slug: updatedSlug,
        NOT: {
          id,
        },
      },
    });

    if (duplicateBrand) {
      return res.status(409).json({
        success: false,
        error: "Brand with this slug already exists",
      });
    }

    // ---------------------------
    // Update brand
    // ---------------------------

    const brand = await prisma.brand.update({
      where: {
        id,
      },
      data: {
        name: updatedName,
        slug: updatedSlug,

        ...(logo !== undefined && {
          logo: logo?.trim() || null,
        }),

        ...(status !== undefined && {
          status: status?.trim() || "Active",
        }),
      },
    });

    // =====================================================
    // UPDATE ACTIVITY LOG
    // =====================================================

    await createActivity({
      userId: req.user?.id,
      action: "UPDATE",
      title: "Updated brand",
      description: `Brand "${brand.name}" was updated`,
      entityId: brand.id,
      entityType: "BRAND",
    });

    return res.status(200).json({
      success: true,
      message: "Brand updated successfully",
      data: brand,
    });
  } catch (error: any) {
    console.error("UPDATE BRAND ERROR:", error);

    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to update brand",
    });
  }
}

// =====================================================
// DELETE BRAND
// =====================================================

export async function deleteBrand(
  req: any,
  res: Response
) {
  try {
    const { id } = req.params;

    // ---------------------------
    // Check brand
    // ---------------------------

    const brand = await prisma.brand.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!brand) {
      return res.status(404).json({
        success: false,
        error: "Brand not found",
      });
    }

    // ---------------------------
    // Check products
    // ---------------------------

    if (brand._count.products > 0) {
      return res.status(400).json({
        success: false,
        error:
          "Cannot delete brand because products are associated with it",
      });
    }

    // ---------------------------
    // Delete brand
    // ---------------------------

    await prisma.brand.delete({
      where: {
        id,
      },
    });

    // =====================================================
    // DELETE ACTIVITY LOG
    // =====================================================

    await createActivity({
      userId: req.user?.id,
      action: "DELETE",
      title: "Deleted brand",
      description: `Brand "${brand.name}" was deleted`,
      entityId: brand.id,
      entityType: "BRAND",
    });

    return res.status(200).json({
      success: true,
      message: "Brand deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE BRAND ERROR:", error);

    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to delete brand",
    });
  }
}