
import {
  PaymentProvider,
  PaymentStatus,
  Prisma,
} from "@prisma/client";
import { prisma } from "../config/prisma";

type CreateDeliveryPaymentInput = {
  checkoutId: string;
  customerId: string;
  provider: PaymentProvider;
};

export async function createDeliveryPayment(
  input: CreateDeliveryPaymentInput
) {
  const { checkoutId, customerId, provider } = input;

  const isMockProvider = provider === PaymentProvider.MOCK;
  const isGatewayProvider =
    provider === PaymentProvider.BKASH ||
    provider === PaymentProvider.NAGAD;

  if (isMockProvider && process.env.NODE_ENV === "production") {
    throw new Error("Production পরিবেশে Mock Payment অনুমোদিত নয়।");
  }

  if (!isMockProvider && !isGatewayProvider) {
    throw new Error("শুধু bKash, Nagad অথবা development Mock Payment ব্যবহার করুন।");
  }

  // Expired checkout-এর status আলাদাভাবে update করা হচ্ছে,
  // যাতে error throw করলেও update rollback না হয়।
  const checkoutSnapshot = await prisma.pendingCheckout.findFirst({
    where: {
      id: checkoutId,
      customerId,
    },
    select: {
      id: true,
      expiresAt: true,
    },
  });

  if (!checkoutSnapshot) {
    throw new Error("Checkout পাওয়া যায়নি।");
  }

  if (checkoutSnapshot.expiresAt <= new Date()) {
    await prisma.pendingCheckout.updateMany({
      where: {
        id: checkoutSnapshot.id,
        customerId,
        expiresAt: { lte: new Date() },
        status: {
          notIn: ["COMPLETED", "CANCELLED", "EXPIRED"],
        },
      },
      data: { status: "EXPIRED" },
    });

    throw new Error("Checkout-এর মেয়াদ শেষ হয়েছে।");
  }

  return prisma.$transaction(async (tx) => {
    const checkout = await tx.pendingCheckout.findFirst({
      where: {
        id: checkoutId,
        customerId,
      },
    });

    if (!checkout) {
      throw new Error("Checkout পাওয়া যায়নি।");
    }

    if (checkout.expiresAt <= new Date()) {
      throw new Error("Checkout-এর মেয়াদ শেষ হয়েছে।");
    }

    if (
      checkout.status === "COMPLETED" ||
      checkout.status === "CANCELLED" ||
      checkout.status === "EXPIRED" ||
      checkout.status === "PAYMENT_PAID"
    ) {
      throw new Error("এই Checkout-এ আর পেমেন্ট শুরু করা যাবে না।");
    }

    const amount = new Prisma.Decimal(checkout.deliveryCharge);

    if (amount.lessThanOrEqualTo(0)) {
      throw new Error(
        "Delivery charge শূন্য। Gateway payment প্রয়োজন নেই।"
      );
    }

    const existingPayment = await tx.payment.findFirst({
      where: {
        pendingCheckoutId: checkout.id,
        customerId,
        purpose: "DELIVERY_CHARGE",
        status: {
          in: [
            PaymentStatus.PENDING,
            PaymentStatus.PROCESSING,
            PaymentStatus.PAID,
          ],
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (existingPayment) {
      if (existingPayment.status === PaymentStatus.PAID) {
        throw new Error(
          "এই Checkout-এর delivery charge ইতিমধ্যে পরিশোধিত।"
        );
      }

      if (existingPayment.provider === provider) {
        return {
          payment: existingPayment,
          amount: amount.toFixed(2),
          reused: true,
        };
      }

      throw new Error(
        "আগের payment pending আছে। সেটির ফলাফল যাচাই না করে provider পরিবর্তন করবেন না।"
      );
    }

    const payment = await tx.payment.create({
      data: {
        customerId,
        pendingCheckoutId: checkout.id,
        provider,
        purpose: "DELIVERY_CHARGE",
        amount,
        currency: "BDT",
        status: PaymentStatus.PENDING,
      },
    });

    await tx.pendingCheckout.update({
      where: { id: checkout.id },
      data: { status: "PAYMENT_PENDING" },
    });

    return {
      payment,
      amount: amount.toFixed(2),
      reused: false,
    };
  });
}
