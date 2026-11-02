
import { Response } from "express";
import {
  Prisma,
  CustomerOrderStatus,
  OrderPaymentStatus,
  DeliveryPaymentStatus,
} from "@prisma/client";
import { AuthRequest } from "../../middleware/auth-middleware";
import { prisma } from "../../config/prisma";
import { createNotification, notifyAdmins } from "../../services/notification-service";

// ======================================================
// CREATE CUSTOMER ORDER
// POST /api/customer/orders
//
// Direct order creation disabled.
// Orders must be created through the verified checkout
// and delivery-payment flow.
// ======================================================

export async function createCustomerOrder(
  req: AuthRequest,
  res: Response
) {
  return res.status(410).json({
    success: false,
    code: "LEGACY_ORDER_CREATION_DISABLED",
    error:
      "এই endpoint দিয়ে সরাসরি অর্ডার তৈরি করা বন্ধ। " +
      "Checkout এবং verified delivery payment flow ব্যবহার করুন।",
  });
}

// ======================================================
// GET CUSTOMER ORDERS
// GET /api/customer/orders
// ======================================================

export async function getMyCustomerOrders(
  req: AuthRequest,
  res: Response
) {
  try {
    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        error: "লগইন করতে হবে।",
      });
    }

    const orders = await prisma.customerOrder.findMany({
      where: { customerId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                images: true,
              },
            },
          },
        },
        vendorOrders: {
          include: {
            vendor: {
              select: {
                id: true,
                storeName: true,
              },
            },
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    title: true,
                    images: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error: unknown) {
    console.error("Get Customer Orders Error:", error);

    return res.status(500).json({
      success: false,
      error: "অর্ডারের তালিকা আনা যায়নি।",
    });
  }
}

// ======================================================
// GET CUSTOMER ORDER DETAILS
// GET /api/customer/orders/:orderId
// orderId = parent CustomerOrder ID
// ======================================================

export async function getMyCustomerOrderDetails(
  req: AuthRequest,
  res: Response
) {
  try {
    const customerId = req.user?.id;
    const orderId = String(req.params.orderId ?? "");

    if (!customerId) {
      return res.status(401).json({
        success: false,
        error: "লগইন করতে হবে।",
      });
    }

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: "Order ID দেওয়া হয়নি।",
      });
    }

    const order = await prisma.customerOrder.findFirst({
      where: {
        id: orderId,
        customerId,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                images: true,
              },
            },
          },
        },
        vendorOrders: {
          include: {
            vendor: {
              select: {
                id: true,
                storeName: true,
                location: true,
              },
            },
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    title: true,
                    images: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "অর্ডার পাওয়া যায়নি।",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error: unknown) {
    console.error(
      "Get Customer Order Details Error:",
      error
    );

    return res.status(500).json({
      success: false,
      error: "অর্ডারের বিস্তারিত আনা যায়নি।",
    });
  }
}

// ======================================================
// CANCEL VENDOR ORDER
// PATCH /api/customer/orders/:orderId/cancel
//
// orderId = VendorOrder ID
// Only PENDING orders can be cancelled.
// ======================================================

export async function cancelMyCustomerOrder(
  req: AuthRequest,
  res: Response
) {
  try {
    const customerId = req.user?.id;
    const orderId = String(req.params.orderId ?? "");

    if (!customerId) {
      return res.status(401).json({
        success: false,
        error: "লগইন করতে হবে।",
      });
    }

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: "Order ID দেওয়া হয়নি।",
      });
    }

    const result = await prisma.$transaction(
      async (tx) => {
        const order = await tx.vendorOrder.findFirst({
          where: {
            id: orderId,
            customerId,
          },
          include: {
            items: true,
          },
        });

        if (!order) {
          throw new Error("অর্ডার পাওয়া যায়নি।");
        }

        if (order.status !== "PENDING") {
          throw new Error(
            "শুধু Pending Vendor Order Cancel করা যাবে।"
          );
        }

        // Atomically transition PENDING -> CANCELLED.
        const updated = await tx.vendorOrder.updateMany({
          where: {
            id: orderId,
            customerId,
            status: "PENDING",
          },
          data: {
            status: "CANCELLED",
          },
        });

        if (updated.count !== 1) {
          throw new Error(
            "অর্ডারের Status পরিবর্তিত হয়েছে। আবার চেষ্টা করুন।"
          );
        }

        // Restore stock in the same transaction.
        for (const item of (order as any).items || []) {
          if (!item.productId) {
            continue;
          }

          await tx.product.update({
            where: {
              id: item.productId,
            },
            data: {
              stockQuantity: {
                increment: item.quantity,
              },
            },
          });
        }

        // Cancel the parent only when every child is cancelled.
        if (order.customerOrderId) {
          const remainingOrders =
            await tx.vendorOrder.count({
              where: {
                customerOrderId: order.customerOrderId,
                status: {
                  not: "CANCELLED",
                },
              },
            });

          if (remainingOrders === 0) {
            await tx.customerOrder.updateMany({
              where: {
                id: order.customerOrderId,
                status: "PENDING",
              },
              data: {
                status: "CANCELLED",
              },
            });
          }
        }

        return {
          id: order.id,
          customerOrderId: order.customerOrderId,
        };
      }
    );

    return res.status(200).json({
      success: true,
      message: "Vendor Order সফলভাবে Cancel হয়েছে।",
      data: {
        vendorOrderId: result.id,
        customerOrderId: result.customerOrderId,
        status: "CANCELLED",
      },
    });
  } catch (error: unknown) {
    console.error("Cancel Customer Order Error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "অর্ডার Cancel করা যায়নি।";

    const statusCode =
      message === "অর্ডার পাওয়া যায়নি।" ? 404 : 400;

    return res.status(statusCode).json({
      success: false,
      error: message,
    });
  }
}


// ======================================================
// VALIDATE CUSTOMER COUPON
// POST /api/customer/orders/validate-coupon
// ======================================================

export async function validateCustomerCoupon(
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

    const { couponCode } = req.body ?? {};

    if (typeof couponCode !== "string" || !couponCode.trim()) {
      return res.status(400).json({
        success: false,
        message: "কুপন কোড দিন।",
      });
    }

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
            vendorId: true,
          },
        },
      },
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "কুপন কোডটি সঠিক নয় অথবা বর্তমানে সক্রিয় নেই।",
      });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: customerId },
      include: {
        items: {
          select: {
            productId: true,
            quantity: true,
          },
        },
      },
    });

    const matchingItem = cart?.items.find(
      (item) => item.productId === coupon.productId
    );

    if (!matchingItem) {
      return res.status(400).json({
        success: false,
        message: `এই কুপনটি শুধু "${coupon.product.title}" প্রোডাক্টের জন্য প্রযোজ্য, যা আপনার কার্টে নেই।`,
      });
    }

    const discount = Number(coupon.discount);

    return res.status(200).json({
      success: true,
      message: `কুপন কোড "${coupon.couponName}" সফলভাবে যুক্ত হয়েছে! ৳${discount.toLocaleString("en-BD")} ছাড় দেওয়া হয়েছে।`,
      data: {
        id: coupon.id,
        couponName: coupon.couponName,
        discount,
        productId: coupon.productId,
        productTitle: coupon.product.title,
      },
    });
  } catch (error: unknown) {
    console.error("VALIDATE COUPON ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "কুপন যাচাই করতে সমস্যা হয়েছে।",
    });
  }
}


// ======================================================
// CREATE CASH ON DELIVERY (COD) ORDER
// POST /api/customer/orders/cod
// ======================================================

export async function createCodOrder(
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

    if (Array.isArray(deliverySelections)) {
      for (const selection of deliverySelections) {
        if (
          selection &&
          typeof selection.vendorId === "string" &&
          selection.selectedRateMinDistanceKm !== undefined
        ) {
          selections.set(
            selection.vendorId,
            Number(selection.selectedRateMinDistanceKm)
          );
        }
      }
    }

    const groups = new Map<
      string,
      {
        vendorId: string;
        subtotal: number;
        deliveryCharge: number;
        items: Array<{
          productId: string;
          title: string;
          image: string | null;
          sku: string | null;
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

      const salePrice = product.pricing.customerSalePrice;
      const regularPrice = Number(product.pricing.customerRegularPrice);
      const unitPrice =
        salePrice != null && Number(salePrice) > 0
          ? Number(salePrice)
          : regularPrice;

      const totalPrice = Number((unitPrice * quantity).toFixed(2));
      const vendorId = vendor.id;

      let group = groups.get(vendorId);

      if (!group) {
        group = { vendorId, subtotal: 0, deliveryCharge: 0, items: [] };
        groups.set(vendorId, group);
      }

      group.subtotal = Number((group.subtotal + totalPrice).toFixed(2));
      group.items.push({
        productId: product.id,
        title: product.title,
        image: product.images?.[0] ?? null,
        sku: null,
        vendorId,
        quantity,
        unitPrice,
        totalPrice,
      });
    }

    for (const [vendorId, group] of groups) {
      const vendorItems = group.items.map((item) =>
        cart.items.find((cartItem) => cartItem.product.id === item.productId)
      );

      const firstProduct = vendorItems[0]?.product;
      const settings = firstProduct?.vendor?.settings;

      for (const item of vendorItems) {
        if (!item) continue;
        const product = item.product;
        const delivery = product.deliverySettings;

        if (!delivery) {
          return res.status(400).json({
            success: false,
            message: `“${product.title}” এর delivery settings পাওয়া যায়নি।`,
          });
        }

        let fee = 0;

        if (delivery.scope === "NATIONWIDE") {
          const nationwideCharge = Number(delivery.nationwideCharge ?? 0);
          fee = nationwideCharge * item.quantity;
        } else if (delivery.scope === "UPAZILA_BASED") {
          const slab = selections.get(vendorId);
          const rate = delivery.rates.find(
            (r) => Number(r.minDistanceKm) === slab
          );

          if (!rate) {
            return res.status(400).json({
              success: false,
              message: `${firstProduct?.vendor?.storeName ?? "Vendor"}-এর delivery slab নির্বাচন করুন।`,
            });
          }

          const weight = Number(delivery.weightKg ?? 1) * item.quantity;
          const firstKg = Number(rate.firstKgCharge);
          const additionalKg = Math.max(0, Math.ceil(weight) - 1);

          fee = firstKg + additionalKg * Number(rate.additionalKgCharge);
        }

        group.deliveryCharge = Number((group.deliveryCharge + fee).toFixed(2));
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
    let couponProductId: string | null = null;

    if (typeof couponCode === "string" && couponCode.trim()) {
      const code = couponCode.trim();
      const coupon = await prisma.productCoupon.findFirst({
        where: {
          couponName: { equals: code, mode: "insensitive" },
          isActive: true,
        },
      });

      if (coupon && cart.items.some((item) => item.product.id === coupon.productId)) {
        discountAmount = Number(coupon.discount);
        couponProductId = coupon.productId;
      }
    }

    const totalAmount = Math.max(
      0,
      Number((subtotal + deliveryCharge - discountAmount).toFixed(2))
    );

    const createdOrder = await prisma.$transaction(async (tx) => {
      for (const cartItem of cart.items) {
        const updateResult = await tx.product.updateMany({
          where: {
            id: cartItem.product.id,
            stockQuantity: { gte: cartItem.quantity },
          },
          data: {
            stockQuantity: { decrement: cartItem.quantity },
          },
        });

        if (updateResult.count !== 1) {
          throw new Error(
            `“${cartItem.product.title}”-এর পর্যাপ্ত stock নেই।`
          );
        }
      }

      const order = await tx.customerOrder.create({
        data: {
          customerId,
          status: CustomerOrderStatus.PENDING,
          paymentStatus: OrderPaymentStatus.PENDING,
          deliveryPaymentStatus: DeliveryPaymentStatus.PENDING,
          subtotal: new Prisma.Decimal(subtotal.toFixed(2)),
          deliveryCharge: new Prisma.Decimal(deliveryCharge.toFixed(2)),
          totalAmount: new Prisma.Decimal(totalAmount.toFixed(2)),
          shippingName: shipping.fullName.trim(),
          shippingPhone: shipping.phone.trim(),
          shippingDivision: shipping.division.trim(),
          shippingDistrict: shipping.district.trim(),
          shippingUpazila: shipping.upazila.trim(),
          shippingArea: typeof shipping.area === "string" ? shipping.area.trim() : null,
          shippingAddress: shipping.address.trim(),
          items: {
            create: cart.items.map((cartItem) => {
              const product = cartItem.product;
              const salePrice = product.pricing?.customerSalePrice;
              const regularPrice = Number(product.pricing?.customerRegularPrice ?? 0);
              const unitPrice =
                salePrice != null && Number(salePrice) > 0
                  ? Number(salePrice)
                  : regularPrice;
              const itemTotal = unitPrice * cartItem.quantity;

              return {
                productId: product.id,
                vendorId: product.vendorId,
                productTitle: product.title,
                quantity: cartItem.quantity,
                unitPrice: new Prisma.Decimal(unitPrice.toFixed(2)),
                totalPrice: new Prisma.Decimal(itemTotal.toFixed(2)),
              };
            }),
          },
        },
      });

      for (const group of groups.values()) {
        const isCouponVendor = Boolean(
          couponProductId &&
          group.items.some((item) => item.productId === couponProductId)
        );
        const vendorDiscount = isCouponVendor ? discountAmount : 0;
        const vendorTotal = Math.max(
          0,
          Number((group.subtotal + group.deliveryCharge - vendorDiscount).toFixed(2))
        );

        await tx.vendorOrder.create({
          data: {
            customerOrderId: order.id,
            vendorId: group.vendorId,
            customerId,
            status: CustomerOrderStatus.PENDING,
            paymentStatus: OrderPaymentStatus.PENDING,
            subtotal: new Prisma.Decimal(group.subtotal.toFixed(2)),
            deliveryFee: new Prisma.Decimal(group.deliveryCharge.toFixed(2)),
            discount: new Prisma.Decimal(vendorDiscount.toFixed(2)),
            totalAmount: new Prisma.Decimal(vendorTotal.toFixed(2)),
            shippingName: shipping.fullName.trim(),
            shippingPhone: shipping.phone.trim(),
            shippingDivision: shipping.division.trim(),
            shippingDistrict: shipping.district.trim(),
            shippingUpazila: shipping.upazila.trim(),
            shippingAddress: shipping.address.trim(),
            note: [
              typeof shipping.note === "string" ? shipping.note.trim() : null,
              isCouponVendor && typeof couponCode === "string" && couponCode.trim()
                ? `Coupon: ${couponCode.trim()}`
                : null,
            ]
              .filter(Boolean)
              .join(" | ") || null,
            items: {
              create: group.items.map((item) => ({
                productId: item.productId,
                productName: item.title,
                productImage: item.image,
                sku: item.sku,
                unitPrice: new Prisma.Decimal(item.unitPrice.toFixed(2)),
                quantity: item.quantity,
                totalPrice: new Prisma.Decimal(item.totalPrice.toFixed(2)),
              })),
            },
          },
        });
      }

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      // Award reward points (1 point per 100 TK product value)
      const earnedPoints = Math.floor(Number(subtotal) / 100);
      if (earnedPoints > 0) {
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

        await tx.rewardPointTransaction.create({
          data: {
            customerId,
            customerOrderId: order.id,
            points: earnedPoints,
            amount: new Prisma.Decimal(Number(subtotal).toFixed(2)),
          },
        });
      }

      return order;
    });

    // Send notifications to Admin, Vendors, and Customer
    try {
      await notifyAdmins({
        type: "NEW_ORDER",
        title: "নতুন ক্যাশ অন ডেলিভারি অর্ডার",
        message: `গ্রাহক ${shipping.fullName.trim()} একটি নতুন অর্ডার #${createdOrder.orderNumber} (৳${totalAmount}) সম্পন্ন করেছেন।`,
        entityId: createdOrder.id,
        entityType: "ORDER",
      });

      const vendorIds = Array.from(groups.keys());
      const vendors = await prisma.vendor.findMany({
        where: { id: { in: vendorIds } },
        select: { id: true, userId: true, storeName: true },
      });

      for (const v of vendors) {
        if (v.userId) {
          await createNotification({
            userId: v.userId,
            type: "NEW_ORDER",
            title: "আপনার দোকানে নতুন অর্ডার এসেছে!",
            message: `আপনার স্টোর "${v.storeName}"-এ নতুন অর্ডার #${createdOrder.orderNumber} এসেছে। অনুগ্রহ করে অর্ডারটি চেক করুন।`,
            entityId: createdOrder.id,
            entityType: "VENDOR_ORDER",
          });
        }
      }

      await createNotification({
        userId: customerId,
        type: "ORDER_PLACED",
        title: "অর্ডার সফলভাবে সম্পন্ন হয়েছে",
        message: `আপনার অর্ডার #${createdOrder.orderNumber} (মোট ৳${totalAmount}) ক্যাশ অন ডেলিভারিতে সফলভাবে গ্রহণ করা হয়েছে।`,
        entityId: createdOrder.id,
        entityType: "CUSTOMER_ORDER",
      });
    } catch (notifError) {
      console.error("Order placement notification error (non-fatal):", notifError);
    }

    return res.status(201).json({
      success: true,
      message: "ক্যাশ অন ডেলিভারি অর্ডার সফলভাবে সম্পন্ন হয়েছে!",
      data: {
        orderId: createdOrder.id,
        orderNumber: createdOrder.orderNumber,
        totalAmount,
      },
    });
  } catch (error: unknown) {
    console.error("CREATE COD ORDER ERROR:", error);

    const message =
      error instanceof Error ? error.message : "অর্ডার সম্পন্ন করা যায়নি।";

    return res.status(500).json({
      success: false,
      message,
    });
  }
}
