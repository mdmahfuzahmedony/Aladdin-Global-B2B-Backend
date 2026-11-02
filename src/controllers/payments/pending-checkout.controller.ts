import { Response } from "express";
import { Prisma } from "@prisma/client";
import { AuthRequest } from "../../middleware/auth-middleware";
import { prisma } from "../../config/prisma";

export async function createPendingCheckout(
  req: AuthRequest,
  res: Response
) {
  try {
    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: "লগইন করতে হবে।",
      });
    }

    const { shipping, deliverySelections = [], couponCode } = req.body ?? {};

    if (
      !shipping ||
      ![
        shipping.fullName,
        shipping.phone,
        shipping.division,
        shipping.district,
        shipping.upazila,
        shipping.address,
      ].every((value) => typeof value === "string" && value.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "সম্পূর্ণ Shipping Address দিন।",
      });
    }

    if (!Array.isArray(deliverySelections)) {
      return res.status(400).json({
        success: false,
        message: "Delivery selection সঠিক নয়।",
      });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: customerId },
      include: {
        items: {
          include: {
            product: {
              include: {
                pricing: true,
                deliverySettings: {
                  include: {
                    rates: {
                      orderBy: { minDistanceKm: "asc" },
                    },
                  },
                },
                vendor: {
                  include: {
                    settings: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "কার্ট খালি।",
      });
    }

    const selections = new Map<string, number>();

    for (const selection of deliverySelections) {
      if (
        !selection ||
        typeof selection.vendorId !== "string" ||
        selection.selectedRateMinDistanceKm === undefined
      ) {
        continue;
      }

      const slab = Number(selection.selectedRateMinDistanceKm);

      if (!Number.isFinite(slab) || slab < 0) {
        return res.status(400).json({
          success: false,
          message: "Delivery slab সঠিক নয়।",
        });
      }

      selections.set(selection.vendorId, slab);
    }

    const groups = new Map<
      string,
      {
        subtotal: number;
        deliveryCharge: number;
        items: Array<{
          productId: string;
          title: string;
          vendorId: string;
          quantity: number;
          unitPrice: number;
          totalPrice: number;
        }>;
      }
    >();

    for (const cartItem of cart.items) {
      const product = cartItem.product;
      const vendor = product.vendor;
      const quantity = Number(cartItem.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: `“${product.title}” এর quantity সঠিক নয়।`,
        });
      }

      if (product.stockQuantity < quantity) {
        return res.status(400).json({
          success: false,
          message: `“${product.title}” এর পর্যাপ্ত stock নেই।`,
        });
      }

      if (!product.pricing || vendor.status !== "APPROVED") {
        return res.status(400).json({
          success: false,
          message: `“${product.title}” এখন অর্ডার করা যাবে না।`,
        });
      }

      if (
        vendor.settings &&
        (!vendor.settings.storeActive ||
          !vendor.settings.acceptOrders ||
          vendor.settings.vacationMode)
      ) {
        return res.status(400).json({
          success: false,
          message: `“${vendor.storeName}” এখন অর্ডার নিচ্ছে না।`,
        });
      }

      const salePrice = product.pricing.customerSalePrice;
      const regularPrice = Number(
        product.pricing.customerRegularPrice
      );
      const unitPrice =
        salePrice != null && Number(salePrice) > 0
          ? Number(salePrice)
          : regularPrice;

      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        return res.status(400).json({
          success: false,
          message: `“${product.title}” এর price সঠিক নয়।`,
        });
      }

      const totalPrice = Number((unitPrice * quantity).toFixed(2));
      const vendorId = vendor.id;

      let group = groups.get(vendorId);

      if (!group) {
        group = { subtotal: 0, deliveryCharge: 0, items: [] };
        groups.set(vendorId, group);
      }

      group.subtotal = Number(
        (group.subtotal + totalPrice).toFixed(2)
      );

      group.items.push({
        productId: product.id,
        title: product.title,
        vendorId,
        quantity,
        unitPrice,
        totalPrice,
      });
    }

    for (const [vendorId, group] of groups) {
      const vendorItems = group.items.map((item) =>
        cart.items.find(
          (cartItem) => cartItem.product.id === item.productId
        )!.product
      );

      const firstProduct = vendorItems[0];
      const settings = firstProduct.vendor.settings;
      const minimumOrder = Number(settings?.minimumOrder ?? 0);

      if (minimumOrder > 0 && group.subtotal < minimumOrder) {
        return res.status(400).json({
          success: false,
          message: `${firstProduct.vendor.storeName}-এর minimum order ${minimumOrder} টাকা।`,
        });
      }

      if (settings?.deliveryAvailable === false) {
        return res.status(400).json({
          success: false,
          message: `${firstProduct.vendor.storeName} delivery দিতে পারছে না।`,
        });
      }

      for (const item of group.items) {
        const product = vendorItems.find(
          (p) => p.id === item.productId
        )!;
        const delivery = product.deliverySettings;

        if (!delivery) {
          return res.status(400).json({
            success: false,
            message: `“${product.title}” এর delivery settings নেই।`,
          });
        }

        let fee = 0;

        if (delivery.scope === "NATIONWIDE") {
          fee = Number(delivery.nationwideCharge) * item.quantity;
        } else if (delivery.scope === "UPAZILA_BASED") {
          const slab = selections.get(vendorId);
          const rate = delivery.rates.find(
            (r) => Number(r.minDistanceKm) === slab
          );

          if (!rate) {
            return res.status(400).json({
              success: false,
              message: `${firstProduct.vendor.storeName}-এর delivery slab নির্বাচন করুন।`,
            });
          }

          const weight = Number(delivery.weightKg ?? 1) * item.quantity;
          const firstKg = Number(rate.firstKgCharge);
          const additionalKg = Math.max(0, Math.ceil(weight) - 1);

          fee = firstKg + additionalKg * Number(rate.additionalKgCharge);
        } else {
          return res.status(400).json({
            success: false,
            message: `“${product.title}” এর delivery scope সঠিক নয়।`,
          });
        }

        if (!Number.isFinite(fee) || fee < 0) {
          return res.status(400).json({
            success: false,
            message: `“${product.title}” এর delivery charge সঠিক নয়।`,
          });
        }

        group.deliveryCharge = Number(
          (group.deliveryCharge + fee).toFixed(2)
        );
      }

      const threshold = Number(settings?.freeDeliveryThreshold ?? 0);

      if (threshold > 0 && group.subtotal >= threshold) {
        group.deliveryCharge = 0;
      }
    }

    const subtotal = Number(
      [...groups.values()]
        .reduce((sum, group) => sum + group.subtotal, 0)
        .toFixed(2)
    );

    const deliveryCharge = Number(
      [...groups.values()]
        .reduce((sum, group) => sum + group.deliveryCharge, 0)
        .toFixed(2)
    );

    let discountAmount = 0;
    let appliedCouponInfo: {
      id: string;
      couponName: string;
      discount: number;
      productId: string;
      productTitle: string;
    } | null = null;

    if (typeof couponCode === "string" && couponCode.trim()) {
      const code = couponCode.trim();

      const coupon = await prisma.productCoupon.findFirst({
        where: {
          couponName: {
            equals: code,
            mode: "insensitive",
          },
          isActive: true,
        },
        include: {
          product: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

      if (coupon) {
        const hasMatchingProduct = cart.items.some(
          (item) => item.product.id === coupon.productId
        );

        if (hasMatchingProduct) {
          discountAmount = Number(coupon.discount);
          appliedCouponInfo = {
            id: coupon.id,
            couponName: coupon.couponName,
            discount: discountAmount,
            productId: coupon.productId,
            productTitle: coupon.product.title,
          };
        }
      }
    }

    const totalAmount = Math.max(
      0,
      Number((subtotal + deliveryCharge - discountAmount).toFixed(2))
    );

    const checkoutData = {
      shipping: {
        fullName: shipping.fullName.trim(),
        phone: shipping.phone.trim(),
        division: shipping.division.trim(),
        district: shipping.district.trim(),
        upazila: shipping.upazila.trim(),
        area: typeof shipping.area === "string" ? shipping.area.trim() : "",
        address: shipping.address.trim(),
        note: typeof shipping.note === "string" ? shipping.note.trim() : "",
      },
      deliverySelections,
      coupon: appliedCouponInfo,
      discount: discountAmount,
      groups: [...groups.entries()].map(([vendorId, group]) => ({
        vendorId,
        ...group,
      })),
    };

    const pendingCheckout = await prisma.pendingCheckout.create({
      data: {
        customerId,
        status: "PENDING",
        subtotal: new Prisma.Decimal(subtotal.toFixed(2)),
        deliveryCharge: new Prisma.Decimal(deliveryCharge.toFixed(2)),
        totalAmount: new Prisma.Decimal(totalAmount.toFixed(2)),
        checkoutData,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Checkout তৈরি হয়েছে। এখন delivery payment শুরু করা যাবে।",
      data: {
        checkoutId: pendingCheckout.id,
        subtotal,
        deliveryCharge,
        discount: discountAmount,
        totalAmount,
        deliveryPaymentRequired: deliveryCharge > 0,
        expiresAt: pendingCheckout.expiresAt,
      },
    });
  } catch (error) {
    console.error("Create Pending Checkout Error:", error);

    return res.status(500).json({
      success: false,
      message: "Checkout তৈরি করা যায়নি।",
    });
  }
}