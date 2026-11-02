import { Response } from "express";
import { Prisma } from "@prisma/client";
import { AuthRequest } from "../../middleware/auth-middleware";
import { prisma } from "../../config/prisma";
import { PaymentProvider } from "@prisma/client";

const allowedProviders = [
  PaymentProvider.BKASH,
  PaymentProvider.NAGAD,
  PaymentProvider.BANK,
  ...(process.env.NODE_ENV !== "production"
    ? [PaymentProvider.MOCK]
    : []),
] as const;



type AllowedProvider = (typeof allowedProviders)[number];

function isAllowedProvider(value: unknown): value is AllowedProvider {
  return (
    typeof value === "string" &&
    allowedProviders.includes(value as AllowedProvider)
  );
}

// Create delivery payment record for PendingCheckout
export const createDeliveryPayment = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const customerId = req.user?.id;
    const { checkoutId, provider } = req.body as {
      checkoutId?: unknown;
      provider?: unknown;
    };

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (
      typeof checkoutId !== "string" ||
      !checkoutId.trim() ||
      !isAllowedProvider(provider)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid checkoutId and payment provider are required",
        allowedProviders,
      });
    }

    const checkout = await prisma.pendingCheckout.findFirst({
      where: {
        id: checkoutId.trim(),
        customerId,
      },
    });

    if (!checkout) {
      return res.status(404).json({
        success: false,
        message: "Pending checkout not found",
      });
    }

    if (checkout.expiresAt <= new Date()) {
      return res.status(410).json({
        success: false,
        message: "Checkout expired. Please start checkout again.",
      });
    }

    if (
      checkout.status === "PAYMENT_PAID" ||
      checkout.status === "COMPLETED" ||
      checkout.status === "CANCELLED" ||
      checkout.status === "EXPIRED"
    ) {
      return res.status(409).json({
        success: false,
        message: "This checkout cannot accept a new payment",
      });
    }

    const amount = new Prisma.Decimal(checkout.deliveryCharge);

    if (amount.lessThanOrEqualTo(0)) {
      return res.status(400).json({
        success: false,
        message: "No delivery payment is required",
      });
    }

    const existingPaidPayment = await prisma.payment.findFirst({
      where: {
        pendingCheckoutId: checkout.id,
        customerId,
        purpose: "DELIVERY_CHARGE",
        status: "PAID",
      },
    });

    if (existingPaidPayment) {
      return res.status(409).json({
        success: false,
        message: "Delivery charge has already been paid",
      });
    }

    const existingPendingPayment = await prisma.payment.findFirst({
      where: {
        pendingCheckoutId: checkout.id,
        customerId,
        provider,
        purpose: "DELIVERY_CHARGE",
        status: "PENDING",
        amount,
      },
    });

    if (existingPendingPayment) {
      return res.status(200).json({
        success: true,
        message:
          "Pending payment record exists. Gateway payment is not yet verified.",
        payment: existingPendingPayment,
        gatewayIntegrated: false,
      });
    }

    const payment = await prisma.payment.create({
      data: {
        pendingCheckoutId: checkout.id,
        customerId,
        provider,
        purpose: "DELIVERY_CHARGE",
        amount,
        currency: "BDT",
        status: "PENDING",
      },
    });

    return res.status(201).json({
      success: true,
      message:
        "Payment record created. Complete gateway integration and server-side verification before treating this payment as successful.",
      payment,
      gatewayIntegrated: false,
    });
  } catch (error) {
    console.error("Create delivery payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not create payment",
    });
  }
};

// Get payments belonging to the logged-in customer
export const getMyPayments = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const payments = await prisma.payment.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      include: {
        customerOrder: {
          select: {
            id: true,
            orderNumber: true,
            deliveryCharge: true,
            deliveryPaymentStatus: true,
            status: true,
          },
        },
        pendingCheckout: {
          select: {
            id: true,
            subtotal: true,
            deliveryCharge: true,
            totalAmount: true,
            status: true,
            expiresAt: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error("Get payments error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not fetch payments",
    });
  }
};