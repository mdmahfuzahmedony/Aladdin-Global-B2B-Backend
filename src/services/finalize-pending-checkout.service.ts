
import {
  CustomerOrderStatus,
  DeliveryPaymentStatus,
  OrderPaymentStatus,
  PaymentProvider,
  PaymentStatus,
  CheckoutStatus,
  Prisma,
} from "@prisma/client";
import { prisma } from "../config/prisma";

type FinalizePendingCheckoutInput = {
  checkoutId: string;
  paymentId: string;
};

type CheckoutItem = {
  productId: string;
  title: string;
  vendorId: string;
  quantity: number;
  unitPrice: number | string;
  totalPrice: number | string;
};

type CheckoutGroup = {
  vendorId: string;
  subtotal: number | string;
  deliveryCharge: number | string;
  items: CheckoutItem[];
};

type CheckoutData = {
  shipping: {
    fullName: string;
    phone: string;
    division: string;
    district: string;
    upazila: string;
    area?: string | null;
    address: string;
    note?: string | null;
  };
  groups: CheckoutGroup[];
  discount?: number | string | null;
  coupon?: {
    id: string;
    couponName: string;
    discount: number;
    productId: string;
    productTitle?: string;
  } | null;
};

function money(value: number | string | Prisma.Decimal): Prisma.Decimal {
  try {
    const result = new Prisma.Decimal(value);

    if (!result.isFinite() || result.isNegative()) {
      throw new Error();
    }

    return result.toDecimalPlaces(2);
  } catch {
    throw new Error("Checkout-এ অবৈধ টাকার পরিমাণ পাওয়া গেছে।");
  }
}

function requireText(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Checkout-এর ${field} সঠিক নয়।`);
  }

  return value.trim();
}

function parseCheckoutData(value: Prisma.JsonValue): CheckoutData {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Checkout data সঠিক নয়।");
  }

  const root = value as Record<string, Prisma.JsonValue>;
  const rawShipping = root.shipping;
  const rawGroups = root.groups;

  if (
    !rawShipping ||
    typeof rawShipping !== "object" ||
    Array.isArray(rawShipping) ||
    !Array.isArray(rawGroups) ||
    rawGroups.length === 0
  ) {
    throw new Error("Checkout-এর shipping অথবা product group সঠিক নয়।");
  }

  const shippingObject = rawShipping as Record<string, Prisma.JsonValue>;

  const shipping: CheckoutData["shipping"] = {
    fullName: requireText(shippingObject.fullName, "fullName"),
    phone: requireText(shippingObject.phone, "phone"),
    division: requireText(shippingObject.division, "division"),
    district: requireText(shippingObject.district, "district"),
    upazila: requireText(shippingObject.upazila, "upazila"),
    address: requireText(shippingObject.address, "address"),
    area:
      typeof shippingObject.area === "string"
        ? shippingObject.area
        : null,
    note:
      typeof shippingObject.note === "string"
        ? shippingObject.note
        : null,
  };

  const groups: CheckoutGroup[] = rawGroups.map((rawGroup) => {
    if (
      !rawGroup ||
      typeof rawGroup !== "object" ||
      Array.isArray(rawGroup)
    ) {
      throw new Error("Checkout-এর vendor group সঠিক নয়।");
    }

    const group = rawGroup as Record<string, Prisma.JsonValue>;

    if (!Array.isArray(group.items) || group.items.length === 0) {
      throw new Error("Vendor group-এ কোনো product নেই।");
    }

    const vendorId = requireText(group.vendorId, "vendorId");

    const items: CheckoutItem[] = group.items.map((rawItem) => {
      if (
        !rawItem ||
        typeof rawItem !== "object" ||
        Array.isArray(rawItem)
      ) {
        throw new Error("Checkout-এর product item সঠিক নয়।");
      }

      const item = rawItem as Record<string, Prisma.JsonValue>;

      if (
        typeof item.quantity !== "number" ||
        !Number.isSafeInteger(item.quantity) ||
        item.quantity < 1
      ) {
        throw new Error("Product quantity সঠিক নয়।");
      }

      const productId = requireText(item.productId, "productId");
      const itemVendorId = requireText(item.vendorId, "item.vendorId");

      if (itemVendorId !== vendorId) {
        throw new Error("Product ও vendor-এর তথ্য মিলছে না।");
      }

      if (
        typeof item.unitPrice !== "number" &&
        typeof item.unitPrice !== "string"
      ) {
        throw new Error("Product unit price সঠিক নয়।");
      }

      if (
        typeof item.totalPrice !== "number" &&
        typeof item.totalPrice !== "string"
      ) {
        throw new Error("Product total price সঠিক নয়।");
      }

      return {
        productId,
        vendorId: itemVendorId,
        title: requireText(item.title, "product title"),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      };
    });

    return {
      vendorId,
      subtotal: group.subtotal as number | string,
      deliveryCharge: group.deliveryCharge as number | string,
      items,
    };
  });

  const discount =
    typeof root.discount === "number" || typeof root.discount === "string"
      ? root.discount
      : 0;

  const coupon =
    root.coupon && typeof root.coupon === "object"
      ? (root.coupon as CheckoutData["coupon"])
      : null;

  return { shipping, groups, discount, coupon };
}

function assertMoneyEqual(
  actual: Prisma.Decimal,
  expected: Prisma.Decimal,
  message: string,
) {
  if (!actual.equals(expected)) {
    throw new Error(message);
  }
}

export async function finalizePendingCheckout({
  checkoutId,
  paymentId,
}: FinalizePendingCheckoutInput) {
  if (!checkoutId?.trim() || !paymentId?.trim()) {
    throw new Error("Checkout ID এবং Payment ID প্রয়োজন।");
  }

  const allowedProviders =
    process.env.NODE_ENV === "production"
      ? [PaymentProvider.BKASH]
      : [PaymentProvider.BKASH, PaymentProvider.MOCK];

  try {
    return await prisma.$transaction(
      async (tx) => {
        // Checkout ownership যাচাই না করে existing order ফেরত দেবে না।
        const checkout = await tx.pendingCheckout.findUnique({
          where: { id: checkoutId },
        });

        if (!checkout) {
          throw new Error("Checkout পাওয়া যায়নি।");
        }

        // এই payment-টি অবশ্যই এই Checkout-এর সফল delivery payment হতে হবে।
        const payment = await tx.payment.findFirst({
          where: {
            id: paymentId,
            customerId: checkout.customerId,
            pendingCheckoutId: checkout.id,
            provider: { in: allowedProviders },
            purpose: "DELIVERY_CHARGE",
            status: PaymentStatus.PAID,
          },
        });

        if (!payment) {
          throw new Error("যাচাইকৃত delivery payment পাওয়া যায়নি।");
        }

        const checkoutDeliveryCharge = money(checkout.deliveryCharge);

        assertMoneyEqual(
          money(payment.amount),
          checkoutDeliveryCharge,
          "Payment amount ও delivery charge মিলছে না।",
        );

        // Idempotency: একই Checkout-এর order থাকলে মালিকানা ও payment
        // যাচাই করার পরেই সেটি ফেরত দেওয়া হবে।
        const existingOrder = await tx.customerOrder.findUnique({
          where: { pendingCheckoutId: checkout.id },
          select: {
            id: true,
            orderNumber: true,
            customerId: true,
            status: true,
            paymentStatus: true,
            deliveryPaymentStatus: true,
          },
        });

        if (existingOrder) {
          if (existingOrder.customerId !== checkout.customerId) {
            throw new Error("Order ownership যাচাই করা যায়নি।");
          }

          if (
            existingOrder.deliveryPaymentStatus !==
            DeliveryPaymentStatus.PAID
          ) {
            throw new Error(
              "Order আছে, কিন্তু delivery payment status পুনরায় যাচাই করা প্রয়োজন।",
            );
          }

          return {
            created: false,
            order: existingOrder,
          };
        }

        if (checkout.expiresAt <= new Date()) {
          throw new Error("Checkout-এর মেয়াদ শেষ হয়েছে।");
        }

        if (checkout.status !== CheckoutStatus.PAYMENT_PAID) {
          throw new Error("Checkout payment-confirmed অবস্থায় নেই।");
        }

        const data = parseCheckoutData(checkout.checkoutData);

        let calculatedSubtotal = new Prisma.Decimal(0);
        let calculatedDelivery = new Prisma.Decimal(0);

        const productSnapshots = new Map<
          string,
          {
            title: string;
            vendorId: string;
            image: string | null;
            sku: string | null;
            unitPrice: Prisma.Decimal;
          }
        >();

        // একই product একাধিক line-এ থাকলেও মোট quantity একত্রে যাচাই।
        const requestedQuantity = new Map<string, number>();

        for (const group of data.groups) {
          const isCouponVendor = Boolean(
            data.coupon?.productId &&
            group.items.some((item) => item.productId === data.coupon?.productId)
          );
          const groupSubtotal = money(group.subtotal);
          const groupDelivery = money(group.deliveryCharge);
          let itemSubtotal = new Prisma.Decimal(0);

          calculatedDelivery = calculatedDelivery.plus(groupDelivery);

          for (const item of group.items) {
            const unitPrice = money(item.unitPrice);
            const totalPrice = money(item.totalPrice);
            const expectedTotal = unitPrice.mul(item.quantity);

            assertMoneyEqual(
              totalPrice,
              expectedTotal,
              `Product ${item.productId}-এর total price ভুল।`,
            );

            itemSubtotal = itemSubtotal.plus(totalPrice);

            requestedQuantity.set(
              item.productId,
              (requestedQuantity.get(item.productId) ?? 0) + item.quantity,
            );
          }

          assertMoneyEqual(
            groupSubtotal,
            itemSubtotal,
            `Vendor ${group.vendorId}-এর subtotal ভুল।`,
          );

          calculatedSubtotal = calculatedSubtotal.plus(groupSubtotal);
        }

        assertMoneyEqual(
          calculatedSubtotal,
          money(checkout.subtotal),
          "Checkout subtotal ও item subtotal মিলছে না।",
        );

        assertMoneyEqual(
          calculatedDelivery,
          checkoutDeliveryCharge,
          "Checkout delivery charge ও group delivery charge মিলছে না।",
        );

        const checkoutDiscount = money(data.discount ?? 0);
        assertMoneyEqual(
          money(checkout.totalAmount),
          calculatedSubtotal.plus(calculatedDelivery).minus(checkoutDiscount),
          "Checkout total amount ভুল।",
        );

        // Product, vendor, বর্তমান মূল্য ও মোট stock যাচাই।
        for (const group of data.groups) {
          const isCouponVendor = Boolean(
            data.coupon?.productId &&
            group.items.some((item) => item.productId === data.coupon?.productId)
          );
          for (const item of group.items) {
            const product = await tx.product.findFirst({
              where: {
                id: item.productId,
                vendorId: group.vendorId,
              },
              select: {
                id: true,
                title: true,
                vendorId: true,
                stockQuantity: true,
                images: true,
                pricing: {
                  select: {
                    customerRegularPrice: true,
                    customerSalePrice: true,
                  },
                },
              },
            });

            if (!product) {
              throw new Error(
                `Product ${item.productId} পাওয়া যায়নি অথবা vendor মিলছে না।`,
              );
            }

            const expectedQuantity =
              requestedQuantity.get(product.id) ?? 0;

            if (product.stockQuantity < expectedQuantity) {
              throw new Error(
                `${product.title}-এর পর্যাপ্ত stock নেই।`,
              );
            }

            if (!product.pricing) {
              throw new Error(
                `${product.title}-এর pricing পাওয়া যায়নি।`,
              );
            }

            const regularPrice = money(
              product.pricing.customerRegularPrice.toString(),
            );

            const salePrice =
              product.pricing.customerSalePrice !== null
                ? money(product.pricing.customerSalePrice.toString())
                : null;

            const currentPrice =
              salePrice && salePrice.greaterThan(0)
                ? salePrice
                : regularPrice;

            assertMoneyEqual(
              money(item.unitPrice),
              currentPrice,
              `${product.title}-এর দাম পরিবর্তিত হয়েছে। Checkout আবার করুন।`,
            );

            productSnapshots.set(product.id, {
              title: product.title,
              vendorId: product.vendorId,
              image: product.images?.[0] ?? null,
              sku: null,
              unitPrice: currentPrice,
            });
          }
        }

        // Stock কমানোর সময়ও conditional update করা হবে।
        for (const [productId, quantity] of requestedQuantity) {
          const result = await tx.product.updateMany({
            where: {
              id: productId,
              stockQuantity: { gte: quantity },
            },
            data: {
              stockQuantity: { decrement: quantity },
            },
          });

          if (result.count !== 1) {
            throw new Error(
              "Stock পরিবর্তিত হয়েছে। Checkout পুনরায় যাচাই করুন।",
            );
          }
        }

        const shipping = data.shipping;
        const subtotal = calculatedSubtotal;
        const deliveryCharge = calculatedDelivery;
        const totalAmount = subtotal.plus(deliveryCharge);

        const order = await tx.customerOrder.create({
          data: {
            pendingCheckoutId: checkout.id,
            customerId: checkout.customerId,
            status: CustomerOrderStatus.PENDING,
            paymentStatus: OrderPaymentStatus.PARTIAL,
            deliveryPaymentStatus: DeliveryPaymentStatus.PAID,
            subtotal,
            deliveryCharge,
            totalAmount,
            shippingName: shipping.fullName,
            shippingPhone: shipping.phone,
            shippingDivision: shipping.division,
            shippingDistrict: shipping.district,
            shippingUpazila: shipping.upazila,
            shippingArea: shipping.area ?? null,
            shippingAddress: shipping.address,
            items: {
              create: data.groups.flatMap((group) =>
                group.items.map((item) => ({
                  productId: item.productId,
                  vendorId: group.vendorId,
                  productTitle: productSnapshots.get(item.productId)!.title,
                  quantity: item.quantity,
                  unitPrice: money(item.unitPrice),
                  totalPrice: money(item.totalPrice),
                })),
              ),
            },
          },
        });

        for (const group of data.groups) {
          const isCouponVendor = Boolean(
            data.coupon?.productId &&
            group.items.some((item) => item.productId === data.coupon?.productId)
          );
          await tx.vendorOrder.create({
            data: {
              customerOrderId: order.id,
              vendorId: group.vendorId,
              customerId: checkout.customerId,
              status: CustomerOrderStatus.PENDING,
              paymentStatus: OrderPaymentStatus.PARTIAL,
              subtotal: money(group.subtotal),
              deliveryFee: money(group.deliveryCharge),
              discount: isCouponVendor ? money(data.discount ?? 0) : money(0),
              totalAmount: money(group.subtotal)
                .plus(money(group.deliveryCharge))
                .minus(isCouponVendor ? money(data.discount ?? 0) : money(0)),
              shippingName: shipping.fullName,
              shippingPhone: shipping.phone,
              shippingDivision: shipping.division,
              shippingDistrict: shipping.district,
              shippingUpazila: shipping.upazila,
              shippingAddress: shipping.address,
              note: [
                shipping.note ?? null,
                isCouponVendor && data.coupon?.couponName
                  ? `Coupon: ${data.coupon.couponName}`
                  : null,
              ]
                .filter(Boolean)
                .join(" | ") || null,
              items: {
                create: group.items.map((item) => {
                  const snapshot = productSnapshots.get(item.productId)!;

                  return {
                    productId: item.productId,
                    productName: snapshot.title,
                    productImage: snapshot.image,
                    sku: snapshot.sku,
                    unitPrice: money(item.unitPrice),
                    quantity: item.quantity,
                    totalPrice: money(item.totalPrice),
                  };
                }),
              },
            },
          });
        }

        await tx.payment.update({
          where: { id: payment.id },
          data: { customerOrderId: order.id },
        });

        await tx.pendingCheckout.update({
          where: { id: checkout.id },
          data: { status: CheckoutStatus.COMPLETED },
        });

        // Award reward points (1 point per 100 TK product value)
        const earnedPoints = Math.floor(calculatedSubtotal.toNumber() / 100);
        if (earnedPoints > 0) {
          await tx.customerReward.upsert({
            where: { customerId: checkout.customerId },
            create: {
              customerId: checkout.customerId,
              points: earnedPoints,
            },
            update: {
              points: { increment: earnedPoints },
            },
          });

          await tx.rewardPointTransaction.create({
            data: {
              customerId: checkout.customerId,
              customerOrderId: order.id,
              points: earnedPoints,
              amount: calculatedSubtotal,
            },
          });
        }

        return {
          created: true,
          order: {
            id: order.id,
            orderNumber: order.orderNumber,
            status: order.status,
            paymentStatus: order.paymentStatus,
            deliveryPaymentStatus: order.deliveryPaymentStatus,
          },
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  } catch (error) {
    // Concurrent checkout finalization-এ unique/serialization conflict হলে
    // committed order থাকলে ownership যাচাই করে সেটি ফেরত দাও।
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === "P2002" || error.code === "P2034")
    ) {
      const checkout = await prisma.pendingCheckout.findUnique({
        where: { id: checkoutId },
        select: { id: true, customerId: true },
      });

      const order = await prisma.customerOrder.findUnique({
        where: { pendingCheckoutId: checkoutId },
        select: {
          id: true,
          orderNumber: true,
          customerId: true,
          status: true,
          paymentStatus: true,
          deliveryPaymentStatus: true,
        },
      });

      if (
        checkout &&
        order &&
        order.customerId === checkout.customerId &&
        order.deliveryPaymentStatus === DeliveryPaymentStatus.PAID
      ) {
        return { created: false, order };
      }
    }

    throw error;
  }
}
