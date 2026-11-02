import type { Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AuthRequest } from "../../middleware/auth-middleware";

// =====================================================
// HELPER: GET AUTHENTICATED VENDOR
// =====================================================

async function getAuthenticatedVendor(userId?: string) {
  if (!userId) return null;

  return prisma.vendor.findUnique({
    where: { userId },
    select: { id: true },
  });
}

// =====================================================
// HELPER: VALIDATE DISCOUNT
// =====================================================

function parseDiscount(value: unknown): Prisma.Decimal | null {
  if (
    value === undefined ||
    value === null ||
    (typeof value !== "number" && typeof value !== "string")
  ) {
    return null;
  }

  const textValue = String(value).trim();

  if (!/^\d+(\.\d{1,2})?$/.test(textValue)) {
    return null;
  }

  const amount = Number(textValue);

  if (
    !Number.isFinite(amount) ||
    amount < 0 ||
    amount > 9_999_999_999.99
  ) {
    return null;
  }

  return new Prisma.Decimal(textValue);
}

// =====================================================
// HELPER: FIND A COUPON BELONGING TO THIS VENDOR'S PRODUCT
// OR ANY PRODUCT IF USER IS ADMIN / MANAGER
// =====================================================

async function getOwnedProduct(
  productId: string,
  vendorId?: string,
  isAdmin = false
) {
  if (isAdmin) {
    return prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        title: true,
        coupon: true,
      },
    });
  }

  if (!vendorId) return null;

  return prisma.product.findFirst({
    where: {
      id: productId,
      vendorId,
    },
    select: {
      id: true,
      title: true,
      coupon: true,
    },
  });
}

// =====================================================
// 0. GET PRODUCT COUPON
// GET /api/vendors/me/products/:productId/coupon
// =====================================================

export async function getMyProductCoupon(
  req: AuthRequest,
  res: Response
) {
  try {
    const isAdmin =
      req.user?.role === "SUPER_ADMIN" || req.user?.role === "MANAGER";
    let vendorId: string | undefined;

    if (!isAdmin) {
      const vendor = await getAuthenticatedVendor(req.user?.id);
      if (!vendor) {
        return res.status(404).json({
          success: false,
          message: "Vendor profile not found.",
        });
      }
      vendorId = vendor.id;
    }

    const productId = req.params.productId as string;
    const product = await getOwnedProduct(productId, vendorId, isAdmin);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: { coupon: product.coupon },
    });
  } catch (error) {
    console.error("GET PRODUCT COUPON ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

// =====================================================
// 1. CREATE COUPON
// POST /api/vendors/me/products/:productId/coupon
// =====================================================

export async function createMyProductCoupon(
  req: AuthRequest,
  res: Response
) {
  try {
    const isAdmin =
      req.user?.role === "SUPER_ADMIN" || req.user?.role === "MANAGER";
    let vendorId: string | undefined;

    if (!isAdmin) {
      const vendor = await getAuthenticatedVendor(req.user?.id);
      if (!vendor) {
        return res.status(404).json({
          success: false,
          message: "Vendor profile not found.",
        });
      }
      vendorId = vendor.id;
    }

    const productId = req.params.productId as string;
    const { couponName, discount, isActive = true } = req.body ?? {};

    if (typeof couponName !== "string" || !couponName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Coupon name is required.",
      });
    }

    const parsedDiscount = parseDiscount(discount);

    if (parsedDiscount === null) {
      return res.status(400).json({
        success: false,
        message:
          "Discount must be a non-negative number with at most two decimal places.",
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false.",
      });
    }

    const product = await getOwnedProduct(productId, vendorId, isAdmin);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or does not belong to you.",
      });
    }

    if (product.coupon) {
      return res.status(409).json({
        success: false,
        message:
          "This product already has a coupon. Update the existing coupon instead.",
        data: { coupon: product.coupon },
      });
    }

    const coupon = await prisma.productCoupon.create({
      data: {
        productId,
        couponName: couponName.trim(),
        discount: parsedDiscount,
        isActive,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Coupon created successfully.",
      data: { coupon },
    });
  } catch (error) {
    console.error("CREATE PRODUCT COUPON ERROR:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.status(409).json({
        success: false,
        message: "A coupon already exists for this product.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create coupon.",
    });
  }
}

// =====================================================
// 2. UPDATE COUPON DETAILS
// PUT /api/vendors/me/products/:productId/coupon
// =====================================================

export async function updateMyCoupon(
  req: AuthRequest,
  res: Response
) {
  try {
    const isAdmin =
      req.user?.role === "SUPER_ADMIN" || req.user?.role === "MANAGER";
    let vendorId: string | undefined;

    if (!isAdmin) {
      const vendor = await getAuthenticatedVendor(req.user?.id);
      if (!vendor) {
        return res.status(404).json({
          success: false,
          message: "Vendor profile not found.",
        });
      }
      vendorId = vendor.id;
    }

    const productId = req.params.productId as string;
    const { couponName, discount } = req.body ?? {};

    if (couponName === undefined && discount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Provide couponName or discount to update.",
      });
    }

    if (
      couponName !== undefined &&
      (typeof couponName !== "string" || !couponName.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Coupon name cannot be empty.",
      });
    }

    let parsedDiscount: Prisma.Decimal | undefined;

    if (discount !== undefined) {
      const parsed = parseDiscount(discount);

      if (parsed === null) {
        return res.status(400).json({
          success: false,
          message:
            "Discount must be a non-negative number with at most two decimal places.",
        });
      }

      parsedDiscount = parsed;
    }

    const product = await getOwnedProduct(productId, vendorId, isAdmin);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or does not belong to you.",
      });
    }

    if (!product.coupon) {
      return res.status(404).json({
        success: false,
        message: "This product does not have a coupon.",
      });
    }

    const coupon = await prisma.productCoupon.update({
      where: { productId },
      data: {
        ...(couponName !== undefined
          ? { couponName: couponName.trim() }
          : {}),
        ...(parsedDiscount !== undefined
          ? { discount: parsedDiscount }
          : {}),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Coupon updated successfully.",
      data: { coupon },
    });
  } catch (error) {
    console.error("UPDATE COUPON ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update coupon.",
    });
  }
}

// =====================================================
// 3. CHANGE COUPON STATUS
// PATCH /api/vendors/me/products/:productId/coupon/status
// =====================================================

export async function updateMyCouponStatus(
  req: AuthRequest,
  res: Response
) {
  try {
    const isAdmin =
      req.user?.role === "SUPER_ADMIN" || req.user?.role === "MANAGER";
    let vendorId: string | undefined;

    if (!isAdmin) {
      const vendor = await getAuthenticatedVendor(req.user?.id);
      if (!vendor) {
        return res.status(404).json({
          success: false,
          message: "Vendor profile not found.",
        });
      }
      vendorId = vendor.id;
    }

    const productId = req.params.productId as string;
    const { isActive } = req.body ?? {};

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false.",
      });
    }

    const product = await getOwnedProduct(productId, vendorId, isAdmin);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or does not belong to you.",
      });
    }

    if (!product.coupon) {
      return res.status(404).json({
        success: false,
        message: "This product does not have a coupon.",
      });
    }

    const coupon = await prisma.productCoupon.update({
      where: { productId },
      data: { isActive },
    });

    return res.status(200).json({
      success: true,
      message: `Coupon ${
        isActive ? "activated" : "deactivated"
      } successfully.`,
      data: { coupon },
    });
  } catch (error) {
    console.error("UPDATE COUPON STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update coupon status.",
    });
  }
}

// =====================================================
// 4. DELETE COUPON
// DELETE /api/vendors/me/products/:productId/coupon
// =====================================================

export async function deleteMyCoupon(
  req: AuthRequest,
  res: Response
) {
  try {
    const isAdmin =
      req.user?.role === "SUPER_ADMIN" || req.user?.role === "MANAGER";
    let vendorId: string | undefined;

    if (!isAdmin) {
      const vendor = await getAuthenticatedVendor(req.user?.id);
      if (!vendor) {
        return res.status(404).json({
          success: false,
          message: "Vendor profile not found.",
        });
      }
      vendorId = vendor.id;
    }

    const productId = req.params.productId as string;
    const product = await getOwnedProduct(productId, vendorId, isAdmin);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or does not belong to you.",
      });
    }

    if (!product.coupon) {
      return res.status(404).json({
        success: false,
        message: "This product does not have a coupon.",
      });
    }

    await prisma.productCoupon.delete({
      where: { productId },
    });

    return res.status(200).json({
      success: true,
      message: "Coupon deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE COUPON ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete coupon.",
    });
  }
}
