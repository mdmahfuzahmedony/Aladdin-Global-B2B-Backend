             import { Response } from "express";

import { prisma } from "../../config/prisma";
import { AuthRequest } from "../../middleware/auth-middleware";

export const getWishlist = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const wishlist = await prisma.wishlist.findUnique({
      where: {
        userId,
      },
      include: {
        items: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            product: {
              include: {
                pricing: true,
                vendor: true,
                brand: true,
              },
            },
          },
        },
      },
    });

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        wishlist: null,
        items: [],
        totalItems: 0,
      });
    }

    return res.status(200).json({
      success: true,
      wishlist,
      items: wishlist.items,
      totalItems: wishlist.items.length,
    });
  } catch (error) {
    console.error("Get Wishlist Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load wishlist",
    });
  }
};

export const addToWishlist = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.id;
    const { productId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      select: {
        id: true,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const wishlist = await prisma.wishlist.upsert({
      where: {
        userId,
      },
      create: {
        userId,
      },
      update: {},
    });

    const existingItem =
      await prisma.wishlistItem.findUnique({
        where: {
          wishlistId_productId: {
            wishlistId: wishlist.id,
            productId,
          },
        },
      });

    if (existingItem) {
      return res.status(200).json({
        success: true,
        message: "Product is already in wishlist",
        item: existingItem,
      });
    }

    const item = await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId,
      },
      include: {
        product: {
          include: {
            pricing: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Product added to wishlist",
      item,
    });
  } catch (error) {
    console.error("Add To Wishlist Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add product to wishlist",
    });
  }
};

export const removeFromWishlist = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.id;
    const itemId = String(req.params.itemId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const wishlistItem =
      await prisma.wishlistItem.findFirst({
        where: {
          id: itemId,
          wishlist: {
            userId,
          },
        },
      });

    if (!wishlistItem) {
      return res.status(404).json({
        success: false,
        message: "Wishlist item not found",
      });
    }

    await prisma.wishlistItem.delete({
      where: {
        id: itemId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (error) {
    console.error("Remove From Wishlist Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove product from wishlist",
    });
  }
};

export const clearWishlist = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const wishlist = await prisma.wishlist.findUnique({
      where: {
        userId,
      },
    });

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        message: "Wishlist is already empty",
      });
    }

    await prisma.wishlistItem.deleteMany({
      where: {
        wishlistId: wishlist.id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Wishlist cleared successfully",
    });
  } catch (error) {
    console.error("Clear Wishlist Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to clear wishlist",
    });
  }
};