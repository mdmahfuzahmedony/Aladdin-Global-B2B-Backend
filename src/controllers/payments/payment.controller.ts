
import type { Response } from "express";
import {
  PaymentProvider,
  PaymentStatus,
  Prisma,
} from "@prisma/client";

import { prisma } from "../../config/prisma";
import { createDeliveryPayment } from "../../services/payment.service";
import {
  createBkashPayment,
  executeBkashPayment,
  queryBkashPayment,
  verifyBkashTransaction,
} from "../../services/bkash.service";
import { finalizePendingCheckout } from "../../services/finalize-pending-checkout.service";
import type { AuthRequest } from "../../middleware/auth-middleware";

// ======================================================
// INITIATE DELIVERY PAYMENT
// POST /api/payments/delivery/initiate
// ======================================================

// ======================================================
// INITIATE DELIVERY PAYMENT
// POST /api/payments/delivery/initiate
// Supports: MOCK (development only), BKASH
// ======================================================

export async function initiateDeliveryPayment(
  req: AuthRequest,
  res: Response
) {
  try {
    const customerId = req.user?.id;

    const { checkoutId, provider } = req.body as {
      checkoutId?: string;
      provider?: string;
    };

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: "লগইন করতে হবে।",
      });
    }

    if (
      typeof checkoutId !== "string" ||
      !checkoutId.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "checkoutId প্রয়োজন।",
      });
    }

    const normalizedCheckoutId = checkoutId.trim();

    // Only these two providers are supported by this endpoint.
    if (
      provider !== PaymentProvider.MOCK &&
      provider !== PaymentProvider.BKASH &&
      provider !== PaymentProvider.NAGAD
    ) {
      return res.status(400).json({
        success: false,
        message: "সঠিক payment provider নির্বাচন করুন।",
      });
    }

    if (provider === PaymentProvider.NAGAD) {
      return res.status(501).json({
        success: false,
        message: "Nagad integration এখনো প্রস্তুত নয়।",
      });
    }

    // ==================================================
    // MOCK PAYMENT — DEVELOPMENT ONLY
    // Does not call bKash and does not need BKASH_APP_KEY.
    // ==================================================

    if (provider === PaymentProvider.MOCK) {
      if (process.env.NODE_ENV === "production") {
        return res.status(403).json({
          success: false,
          message: "Production-এ Mock Payment অনুমোদিত নয়।",
        });
      }

      const paymentData = await createDeliveryPayment({
        checkoutId: normalizedCheckoutId,
        customerId,
        provider: PaymentProvider.MOCK,
      });

      const payment = paymentData.payment;

      if (payment.provider !== PaymentProvider.MOCK) {
        return res.status(409).json({
          success: false,
          message: "Payment provider মেলেনি।",
        });
      }

      if (payment.status === PaymentStatus.PAID) {
        return res.status(409).json({
          success: false,
          message: "এই delivery charge ইতিমধ্যে পরিশোধিত।",
          data: {
            paymentId: payment.id,
            status: payment.status,
          },
        });
      }

      if (
        payment.status !== PaymentStatus.PENDING &&
        payment.status !== PaymentStatus.PROCESSING
      ) {
        return res.status(409).json({
          success: false,
          message: "এই Mock Payment শুরু করা যাবে না।",
          data: {
            paymentId: payment.id,
            status: payment.status,
          },
        });
      }

      // MOCK must never reuse a real gateway session.
      if (payment.gatewayPaymentId) {
        return res.status(409).json({
          success: false,
          message:
            "এই payment-এ gateway session আছে। নতুন Mock Payment তৈরি করুন।",
          data: {
            paymentId: payment.id,
          },
        });
      }

      const amount = Number(paymentData.amount);

      if (!Number.isFinite(amount) || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Delivery charge সঠিক নয়।",
        });
      }

      // IMPORTANT:
      // এখানে createBkashPayment() বা BKASH_CALLBACK_URL ব্যবহার হবে না।
      // Order তৈরি ও payment PAID করার কাজ করবে mock/complete endpoint।

      return res.status(201).json({
        success: true,
        message: "Development Mock Payment তৈরি হয়েছে।",
        data: {
          paymentId: payment.id,
          amount: paymentData.amount,
          currency: "BDT",
          purpose: "DELIVERY_CHARGE",
          provider: PaymentProvider.MOCK,
          mock: true,
        },
      });
    }

    // ==================================================
    // REAL bKASH PAYMENT
    // ==================================================

    const callbackURL = process.env.BKASH_CALLBACK_URL;

    if (!callbackURL) {
      console.error("BKASH_CALLBACK_URL is missing.");

      return res.status(500).json({
        success: false,
        message:
          "bKash gateway configuration প্রস্তুত নয়।",
      });
    }

    const paymentData = await createDeliveryPayment({
      checkoutId: normalizedCheckoutId,
      customerId,
      provider: PaymentProvider.BKASH,
    });

    const payment = paymentData.payment;

    if (payment.status === PaymentStatus.PAID) {
      return res.status(409).json({
        success: false,
        message: "এই delivery charge ইতিমধ্যে পরিশোধিত।",
        data: {
          paymentId: payment.id,
        },
      });
    }

    // Do not create another gateway session.
    if (payment.gatewayPaymentId) {
      return res.status(409).json({
        success: false,
        message:
          "এই payment আগে শুরু হয়েছে। Payment status যাচাই করুন।",
        data: {
          paymentId: payment.id,
        },
      });
    }

    if (payment.status !== PaymentStatus.PENDING) {
      return res.status(409).json({
        success: false,
        message: "এই payment বর্তমানে শুরু করা যাবে না।",
        data: {
          paymentId: payment.id,
          status: payment.status,
        },
      });
    }

    const amount = Number(paymentData.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Payment amount সঠিক নয়।",
      });
    }

    // This is the only branch that calls bKash.
    const gateway = await createBkashPayment({
      amount: paymentData.amount,
      invoiceNumber: payment.id,
      callbackURL,
    });

    if (!gateway.paymentId || !gateway.checkoutUrl) {
      console.error(
        "Invalid bKash create-payment response.",
        {
          paymentId: payment.id,
        }
      );

      return res.status(502).json({
        success: false,
        message:
          "bKash payment session তৈরি হয়েছে কি না যাচাই প্রয়োজন।",
        data: {
          paymentId: payment.id,
        },
      });
    }

    const updated = await prisma.payment.updateMany({
      where: {
        id: payment.id,
        customerId,
        provider: PaymentProvider.BKASH,
        status: PaymentStatus.PENDING,
        gatewayPaymentId: null,
      },
      data: {
        gatewayPaymentId: gateway.paymentId,
        status: PaymentStatus.PROCESSING,
      },
    });

    if (updated.count !== 1) {
      console.error(
        "bKash session reconciliation required:",
        payment.id,
        gateway.paymentId
      );

      return res.status(409).json({
        success: false,
        message:
          "Payment state পরিবর্তিত হয়েছে। Gateway session যাচাই প্রয়োজন।",
        data: {
          paymentId: payment.id,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "bKash payment শুরু হয়েছে।",
      data: {
        paymentId: payment.id,
        checkoutUrl: gateway.checkoutUrl,
        amount: paymentData.amount,
        currency: "BDT",
        purpose: "DELIVERY_CHARGE",
        provider: PaymentProvider.BKASH,
      },
    });
  } catch (error: unknown) {
    console.error("initiateDeliveryPayment error:", error);

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Payment শুরু করা যায়নি।",
    });
  }
}


// ======================================================
// FINALIZE ORDER AFTER VERIFIED PAYMENT
// ======================================================

async function finalizeVerifiedPayment(
  paymentId: string,
  checkoutId: string,
  customerId: string
) {
  return finalizePendingCheckout({
    checkoutId,
    paymentId,
  });
}

// ======================================================
// bKash CALLBACK
// GET /api/payments/delivery/bkash/callback
//
// Callback query parameters are untrusted.
// Always verify with bKash.
// ======================================================

export async function bkashCallback(
  req: AuthRequest,
  res: Response
) {
  try {
    const paymentID =
      typeof req.query.paymentID === "string"
        ? req.query.paymentID.trim()
        : "";

    const callbackStatus =
      typeof req.query.status === "string"
        ? req.query.status.trim().toLowerCase()
        : "";

    if (!paymentID) {
      return res.status(400).json({
        success: false,
        message: "bKash paymentID পাওয়া যায়নি।",
      });
    }

    const payment = await prisma.payment.findFirst({
      where: {
        provider: PaymentProvider.BKASH,
        gatewayPaymentId: paymentID,
        purpose: "DELIVERY_CHARGE",
      },
      include: {
        pendingCheckout: true,
      },
    });

    if (!payment || !payment.pendingCheckoutId) {
      return res.status(404).json({
        success: false,
        message: "এই bKash payment-এর record পাওয়া যায়নি।",
      });
    }

    const checkout = payment.pendingCheckout;

    if (!checkout) {
      return res.status(409).json({
        success: false,
        message: "এই payment-এর checkout record নেই।",
      });
    }

    // A paid payment must still be allowed to resume order finalization.
    if (payment.status === PaymentStatus.PAID) {
      try {
        const result = await finalizeVerifiedPayment(
          payment.id,
          checkout.id,
          payment.customerId
        );

        return res.status(200).json({
          success: true,
          message: result.created
            ? "Payment verified এবং order তৈরি হয়েছে।"
            : "Payment verified; order আগেই তৈরি হয়েছিল।",
          data: {
            paymentId: payment.id,
            paymentStatus: PaymentStatus.PAID,
            deliveryPaymentVerified: true,
            orderCreated: true,
            order: result.order,
          },
        });
      } catch (error: unknown) {
        console.error(
          "Order finalization retry required:",
          payment.id,
          error
        );

        return res.status(202).json({
          success: false,
          message:
            "পেমেন্ট সফল হয়েছে, কিন্তু order তৈরি সম্পন্ন হয়নি। আবার payment করবেন না।",
          data: {
            paymentId: payment.id,
            paymentStatus: PaymentStatus.PAID,
            orderCreated: false,
            reconciliationRequired: true,
          },
        });
      }
    }

    if (
      payment.status === PaymentStatus.FAILED ||
      payment.status === PaymentStatus.CANCELLED ||
      payment.status === PaymentStatus.REFUNDED
    ) {
      return res.status(409).json({
        success: false,
        message: "এই payment আর সম্পন্ন করা যাবে না।",
      });
    }

    if (
      payment.status !== PaymentStatus.PENDING &&
      payment.status !== PaymentStatus.PROCESSING
    ) {
      return res.status(409).json({
        success: false,
        message: "Payment status যাচাই প্রয়োজন।",
      });
    }

    // Execute first; query if execute fails or is not completed.
    let transaction: Awaited<
      ReturnType<typeof executeBkashPayment>
    >;

    try {
      transaction = await executeBkashPayment(paymentID);
    } catch (executeError: unknown) {
      console.error(
        "bKash execute request failed:",
        executeError
      );

      transaction = await queryBkashPayment(paymentID);
    }

    if (transaction.transactionStatus !== "Completed") {
      const queried = await queryBkashPayment(paymentID);

      if (queried.transactionStatus === "Completed") {
        transaction = queried;
      } else {
        return res.status(202).json({
          success: false,
          message:
            "bKash payment এখনো Completed হিসেবে যাচাই হয়নি।",
          data: {
            paymentId: payment.id,
            callbackStatus,
            gatewayStatus:
              queried.transactionStatus ??
              transaction.transactionStatus ??
              "UNKNOWN",
          },
        });
      }
    }

    const valid = verifyBkashTransaction({
      result: transaction,
      expectedPaymentId: paymentID,
      expectedAmount: payment.amount.toString(),
      expectedInvoiceNumber: payment.id,
    });

    if (!valid) {
      console.error("bKash transaction verification failed.", {
        paymentId: payment.id,
        gatewayPaymentId: paymentID,
      });

      return res.status(400).json({
        success: false,
        message:
          "bKash transaction যাচাই করা যায়নি। Payment record পরিবর্তন করা হয়নি।",
      });
    }

    // A completed gateway transaction can still require reconciliation
    // if checkout expired/cancelled. Do not silently lose the paid amount.
    if (
      checkout.status === "EXPIRED" ||
      checkout.status === "CANCELLED"
    ) {
      console.error("Paid transaction for expired/cancelled checkout.", {
        paymentId: payment.id,
        checkoutId: checkout.id,
      });

      return res.status(202).json({
        success: false,
        message:
          "bKash payment সফল, কিন্তু checkout expired/cancelled। Reconciliation প্রয়োজন।",
        data: {
          paymentId: payment.id,
          gatewayPaymentId: paymentID,
          reconciliationRequired: true,
        },
      });
    }

    // Atomically mark the payment paid and checkout payment-paid.
    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.payment.updateMany({
        where: {
          id: payment.id,
          provider: PaymentProvider.BKASH,
          gatewayPaymentId: paymentID,
          status: {
            in: [
              PaymentStatus.PENDING,
              PaymentStatus.PROCESSING,
            ],
          },
        },
        data: {
          status: PaymentStatus.PAID,
          transactionId: transaction.trxID,
          verifiedAt: new Date(),
          gatewayResponse: JSON.parse(
            JSON.stringify(transaction)
          ),
        },
      });

      if (result.count === 1) {
        const checkoutUpdate =
          await tx.pendingCheckout.updateMany({
            where: {
              id: checkout.id,
              customerId: payment.customerId,
              status: {
                in: ["PENDING", "PAYMENT_PENDING"],
              },
            },
            data: {
              status: "PAYMENT_PAID",
            },
          });

        if (checkoutUpdate.count !== 1) {
          throw new Error(
            "Checkout status পরিবর্তিত হয়েছে; reconciliation প্রয়োজন।"
          );
        }
      }

      return result.count;
    });

    if (updated !== 1) {
      // Another callback may have updated the payment concurrently.
      const current = await prisma.payment.findUnique({
        where: { id: payment.id },
        select: { status: true },
      });

      if (current?.status !== PaymentStatus.PAID) {
        return res.status(409).json({
          success: false,
          message:
            "Payment state পরিবর্তিত হয়েছে। Status যাচাই প্রয়োজন।",
        });
      }
    }

    // Payment is verified. Create order idempotently.
    try {
      const result = await finalizeVerifiedPayment(
        payment.id,
        checkout.id,
        payment.customerId
      );

      return res.status(200).json({
        success: true,
        message: result.created
          ? "Delivery payment verified এবং order তৈরি হয়েছে।"
          : "Payment verified; order আগেই তৈরি হয়েছিল।",
        data: {
          paymentId: payment.id,
          paymentStatus: PaymentStatus.PAID,
          transactionId: transaction.trxID,
          deliveryPaymentVerified: true,
          orderCreated: true,
          order: result.order,
        },
      });
    } catch (error: unknown) {
      console.error(
        "Order finalization failed after verified payment:",
        {
          paymentId: payment.id,
          checkoutId: checkout.id,
          error:
            error instanceof Error
              ? error.message
              : error,
        }
      );

      return res.status(202).json({
        success: false,
        message:
          "পেমেন্ট সফল হয়েছে, কিন্তু order তৈরি সম্পন্ন হয়নি। আবার payment করবেন না।",
        data: {
          paymentId: payment.id,
          paymentStatus: PaymentStatus.PAID,
          deliveryPaymentVerified: true,
          orderCreated: false,
          reconciliationRequired: true,
        },
      });
    }
  } catch (error: unknown) {
    console.error("bkashCallback error:", error);

    return res.status(500).json({
      success: false,
      message:
        "bKash callback process করা যায়নি। Server-side status যাচাই প্রয়োজন।",
    });
  }
}


/**
 * DEVELOPMENT ONLY — MOCK DELIVERY PAYMENT
 * POST /api/payments/delivery/mock/complete
 *
 * Mock payment কোনো বাস্তব টাকা গ্রহণ করে না।
 * Production environment-এ এটি নিষ্ক্রিয় থাকবে।
 */
export async function completeMockDeliveryPayment(
  req: AuthRequest,
  res: Response
) {
  if (process.env.NODE_ENV === "production") {
    return res.status(404).json({
      success: false,
      message: "এই endpoint পাওয়া যায়নি।",
    });
  }

  try {
    const customerId = req.user?.id;
    const { checkoutId, paymentId } = req.body as {
      checkoutId?: string;
      paymentId?: string;
    };

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: "লগইন করতে হবে।",
      });
    }

    if (
      typeof checkoutId !== "string" ||
      !checkoutId.trim() ||
      typeof paymentId !== "string" ||
      !paymentId.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "checkoutId এবং paymentId প্রয়োজন।",
      });
    }

    const normalizedCheckoutId = checkoutId.trim();
    const normalizedPaymentId = paymentId.trim();

    // Checkout এবং payment অবশ্যই একই customer-এর হতে হবে।
    const payment = await prisma.payment.findFirst({
      where: {
        id: normalizedPaymentId,
        customerId,
        pendingCheckoutId: normalizedCheckoutId,
        provider: PaymentProvider.MOCK,
        purpose: "DELIVERY_CHARGE",
      },
      include: {
        pendingCheckout: true,
      },
    });

    if (!payment || !payment.pendingCheckout) {
      return res.status(404).json({
        success: false,
        message: "Mock payment বা checkout পাওয়া যায়নি।",
      });
    }

    const checkout = payment.pendingCheckout;

    if (checkout.customerId !== customerId) {
      return res.status(403).json({
        success: false,
        message: "এই checkout ব্যবহারের অনুমতি নেই।",
      });
    }

    // আগে থেকেই paid হলে দ্বিতীয়বার order তৈরির চেষ্টা নিরাপদে সামলাও।
    if (payment.status === PaymentStatus.PAID) {
      try {
        const result = await finalizePendingCheckout({
          checkoutId: checkout.id,
          paymentId: payment.id,
        });

        return res.status(200).json({
          success: true,
          message: result.created
            ? "Mock payment আগে সফল হয়েছিল; order তৈরি হয়েছে।"
            : "Mock payment আগে সফল হয়েছিল; order আগেই তৈরি হয়েছে।",
          data: {
            paymentId: payment.id,
            paymentStatus: PaymentStatus.PAID,
            deliveryPaymentVerified: true,
            orderCreated: true,
            order: result.order,
            mock: true,
          },
        });
      } catch (error: unknown) {
        console.error("Mock payment finalization retry:", error);

        return res.status(202).json({
          success: false,
          message:
            "Mock payment ইতিমধ্যে সম্পন্ন; order finalization আবার চেষ্টা করতে হবে।",
          data: {
            paymentId: payment.id,
            paymentStatus: PaymentStatus.PAID,
            orderCreated: false,
            reconciliationRequired: true,
            mock: true,
          },
        });
      }
    }

    if (
      payment.status !== PaymentStatus.PENDING &&
      payment.status !== PaymentStatus.PROCESSING
    ) {
      return res.status(409).json({
        success: false,
        message: "এই payment আর সম্পন্ন করা যাবে না।",
        data: {
          paymentStatus: payment.status,
        },
      });
    }

    if (
      checkout.status === "COMPLETED" ||
      checkout.status === "CANCELLED" ||
      checkout.status === "EXPIRED" ||
      checkout.expiresAt <= new Date()
    ) {
      return res.status(409).json({
        success: false,
        message: "Checkout-এর মেয়াদ শেষ হয়েছে বা checkout বন্ধ।",
      });
    }

  const expectedAmount = new Prisma.Decimal(
  checkout.deliveryCharge
);

    if (
      expectedAmount.lessThanOrEqualTo(0) ||
      !payment.amount.equals(expectedAmount)
    ) {
      return res.status(409).json({
        success: false,
        message: "Payment amount এবং delivery charge মিলছে না।",
      });
    }

    // Atomic conditional update: একই payment একবারই PENDING থেকে PAID হবে।
    const result = await prisma.$transaction(async (tx) => {
      const currentCheckout = await tx.pendingCheckout.findFirst({
        where: {
          id: checkout.id,
          customerId,
        },
      });

      if (
        !currentCheckout ||
        currentCheckout.status === "COMPLETED" ||
        currentCheckout.status === "CANCELLED" ||
        currentCheckout.status === "EXPIRED" ||
        currentCheckout.expiresAt <= new Date()
      ) {
        throw new Error("Checkout আর ব্যবহারযোগ্য নেই।");
      }

      const updatedPayment = await tx.payment.updateMany({
        where: {
          id: payment.id,
          customerId,
          pendingCheckoutId: checkout.id,
          provider: PaymentProvider.MOCK,
          purpose: "DELIVERY_CHARGE",
          status: {
            in: [
              PaymentStatus.PENDING,
              PaymentStatus.PROCESSING,
            ],
          },
        },
        data: {
          status: PaymentStatus.PAID,
          verifiedAt: new Date(),
          gatewayResponse: {
            mode: "MOCK",
            environment: process.env.NODE_ENV ?? "development",
            note: "Development-only simulated payment; no real money received.",
          },
        },
      });

      if (updatedPayment.count !== 1) {
        throw new Error(
          "Payment state পরিবর্তিত হয়েছে। বর্তমান status যাচাই করুন।"
        );
      }

      const updatedCheckout = await tx.pendingCheckout.updateMany({
        where: {
          id: checkout.id,
          customerId,
          status: {
            in: ["PENDING", "PAYMENT_PENDING"],
          },
        },
        data: {
          status: "PAYMENT_PAID",
        },
      });

      if (updatedCheckout.count !== 1) {
        // Transaction rollback হবে; paid payment-এর সঙ্গে
        // checkout status-ও consistent থাকবে।
        throw new Error(
          "Checkout status পরিবর্তিত হয়েছে; payment পুনরায় যাচাই প্রয়োজন।"
        );
      }

      return { paid: true };
    });

    if (!result.paid) {
      return res.status(409).json({
        success: false,
        message: "Mock payment সম্পন্ন করা যায়নি।",
      });
    }

    // Payment paid হওয়ার পরে order তৈরি করো।
    try {
      const finalized = await finalizePendingCheckout({
        checkoutId: checkout.id,
        paymentId: payment.id,
      });

      return res.status(200).json({
        success: true,
        message: finalized.created
          ? "Mock delivery payment সফল এবং order তৈরি হয়েছে।"
          : "Mock delivery payment সফল; order আগেই তৈরি হয়েছিল।",
        data: {
          paymentId: payment.id,
          paymentStatus: PaymentStatus.PAID,
          deliveryPaymentVerified: true,
          orderCreated: true,
          order: finalized.order,
          mock: true,
        },
      });
    } catch (error: unknown) {
      console.error("Mock order finalization failed:", {
        paymentId: payment.id,
        checkoutId: checkout.id,
        error:
          error instanceof Error ? error.message : error,
      });

      return res.status(202).json({
        success: false,
        message:
          "Mock payment সম্পন্ন হয়েছে, কিন্তু order তৈরি হয়নি। আবার payment করবেন না।",
        data: {
          paymentId: payment.id,
          paymentStatus: PaymentStatus.PAID,
          orderCreated: false,
          reconciliationRequired: true,
          mock: true,
        },
      });
    }
  } catch (error: unknown) {
    console.error("completeMockDeliveryPayment error:", error);

    return res.status(409).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Mock payment সম্পন্ন করা যায়নি।",
    });
  }
}

