import crypto from "crypto";
import { Request, Response } from "express";
import { Prisma, CustomerOrderStatus, OrderPaymentStatus } from "@prisma/client";
import { AuthRequest } from "../middleware/auth-middleware";
import { prisma } from "../config/prisma";
import { createNotification, notifyAdmins } from "../services/notification-service";

const STEADFAST_BASE_URL = "https://portal.packzy.com/api/v1";

function getSteadfastHeaders() {
  const apiKey = process.env.STEADFAST_API_KEY;
  const secretKey = process.env.STEADFAST_SECRET_KEY;

  if (!apiKey || !secretKey) {
    throw new Error("Steadfast API credentials are missing");
  }

  return {
    "Api-Key": apiKey,
    "Secret-Key": secretKey,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

function getUserId(req: AuthRequest): string | undefined {
  return req.user?.id;
}

// Seller নিজের VendorOrder-এর জন্য Steadfast বুক করবে
export const bookSteadfastCourier = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = getUserId(req);
    const vendorOrderId = req.params.vendorOrderId;

    if (
      typeof vendorOrderId !== "string" ||
      !vendorOrderId.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid Vendor Order ID is required",
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!vendor) {
      return res.status(403).json({
        success: false,
        message: "Only sellers can book courier",
      });
    }

    const order = await prisma.vendorOrder.findFirst({
      where: {
        id: vendorOrderId,
        vendorId: vendor.id,
      },
      include: {
        items: true,
        courierShipment: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or access denied",
      });
    }

    if (order.courierShipment?.bookingStatus === "SUCCESS") {
      return res.status(409).json({
        success: false,
        message: "Courier has already been booked for this order",
        shipment: order.courierShipment,
      });
    }

    if (
      !order.shippingName ||
      !order.shippingPhone ||
      !order.shippingAddress
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Customer shipping name, phone and address are required",
      });
    }

    // Clean and validate 11-digit phone number
    let recipientPhone = order.shippingPhone.replace(/\D/g, "");
    if (recipientPhone.startsWith("880") && recipientPhone.length === 13) {
      recipientPhone = recipientPhone.slice(2);
    }

    if (recipientPhone.length !== 11 || !recipientPhone.startsWith("01")) {
      return res.status(400).json({
        success: false,
        message:
          "Customer phone number must be a valid 11-digit Bangladeshi mobile number (যেমন: 01XXXXXXXXX).",
      });
    }

    // Combine full address components (address, upazila, district, division)
    const addressParts = [
      order.shippingAddress,
      order.shippingUpazila,
      order.shippingDistrict,
      order.shippingDivision,
    ].filter((part) => typeof part === "string" && part.trim().length > 0);

    const fullAddress = addressParts.join(", ").slice(0, 250);

    const codAmount = Number(order.totalAmount);

    if (!Number.isFinite(codAmount) || codAmount < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid COD amount",
      });
    }

    // According to Steadfast API:
    // Required fields: invoice, recipient_name, recipient_phone, recipient_address, cod_amount
    // Optional fields: note
    const payload: {
      invoice: string;
      recipient_name: string;
      recipient_phone: string;
      recipient_address: string;
      cod_amount: number;
      note?: string;
    } = {
      invoice: order.orderNumber,
      recipient_name: order.shippingName.slice(0, 100),
      recipient_phone: recipientPhone,
      recipient_address: fullAddress,
      cod_amount: Math.round(codAmount),
    };

    if (order.note && order.note.trim()) {
      payload.note = order.note.trim().slice(0, 480);
    }

    const response = await fetch(
      `${STEADFAST_BASE_URL}/create_order`,
      {
        method: "POST",
        headers: getSteadfastHeaders(),
        body: JSON.stringify(payload),
      }
    );

    const rawText = await response.text();
    let result: any = null;

    try {
      result = rawText ? JSON.parse(rawText) : null;
    } catch {
      result = null;
    }

    if (!response.ok || !result || result.status !== 200) {
      await prisma.courierShipment.upsert({
        where: { vendorOrderId: order.id },
        create: {
          vendorOrderId: order.id,
          bookingStatus: "FAILED",
          bookingResponse: (result ?? { raw: rawText, httpStatus: response.status }) as Prisma.InputJsonValue,
          codAmount,
        },
        update: {
          bookingStatus: "FAILED",
          bookingResponse: (result ?? { raw: rawText, httpStatus: response.status }) as Prisma.InputJsonValue,
          codAmount,
        },
      });

      let failMessage = "Steadfast courier booking failed";
      if (result?.message) {
        failMessage = result.message;
      } else if (result?.errors && typeof result.errors === "object") {
        failMessage = Object.values(result.errors).flat().join(", ");
      } else if (rawText) {
        failMessage = rawText.replace(/<[^>]+>/g, "").trim();
      }

      if (/account\s+is\s+not\s+active/i.test(failMessage)) {
        failMessage =
          "Steadfast মার্চেন্ট একাউন্টটি এখনও হেড অফিস থেকে সক্রিয় করা হয়নি (Account is not active)। দয়া করে Steadfast কুরিয়ার সাপোর্টের সাথে যোগাযোগ করে একাউন্ট অ্যাক্টিভ করে নিন।";
      } else if (
        response.status >= 500 ||
        /server\s+error/i.test(failMessage) ||
        /internal\s+server\s+error/i.test(failMessage)
      ) {
        failMessage =
          "Steadfast কুরিয়ারের নিজস্ব API সার্ভারে সাময়িক সমস্যা হচ্ছে (Steadfast Server Error 500)। আপনার ওয়েবসাইটের তথ্য সব ঠিক আছে, Steadfast-এর নিজস্ব সার্ভারে কারিগরি ত্রুটির কারণে রিকোয়েস্টটি সম্পন্ন হতে পারেনি। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন অথবা Steadfast সাপোর্টে (09678-045045) যোগাযোগ করুন।";
      }

      return res.status(response.status >= 400 && response.status < 500 ? 400 : 502).json({
        success: false,
        message: failMessage,
        details: result || rawText,
        steadfastStatus: response.status,
      });
    }

    const consignment = result.consignment;

    const shipment = await prisma.courierShipment.upsert({
      where: { vendorOrderId: order.id },
      create: {
        vendorOrderId: order.id,
        consignmentId: consignment?.consignment_id
          ? String(consignment.consignment_id)
          : null,
        trackingCode: consignment?.tracking_code ?? null,
        bookingStatus: "SUCCESS",
        deliveryStatus: consignment?.status
          ? String(consignment.status).toUpperCase()
          : "PENDING",
        codAmount,
        deliveryCharge:
          consignment?.delivery_charge != null
            ? new Prisma.Decimal(
                String(consignment.delivery_charge)
              )
            : null,
        bookingResponse: result as Prisma.InputJsonValue,
        bookedAt: new Date(),
      },
      update: {
        consignmentId: consignment?.consignment_id
          ? String(consignment.consignment_id)
          : null,
        trackingCode: consignment?.tracking_code ?? null,
        bookingStatus: "SUCCESS",
        deliveryStatus: consignment?.status
          ? String(consignment.status).toUpperCase()
          : "PENDING",
        codAmount,
        deliveryCharge:
          consignment?.delivery_charge != null
            ? new Prisma.Decimal(
                String(consignment.delivery_charge)
              )
            : null,
        bookingResponse: result as Prisma.InputJsonValue,
        bookedAt: new Date(),
      },
    });

    // Update VendorOrder status to PROCESSING
    await prisma.vendorOrder.update({
      where: { id: order.id },
      data: {
        status: "PROCESSING",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Steadfast courier-এ সফলভাবে অর্ডার বুক করা হয়েছে!",
      shipment,
    });
  } catch (error) {
    console.error("Steadfast booking error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unable to book courier";

    return res.status(500).json({
      success: false,
      message: errorMessage,
    });
  }
};


// Seller নিজের বুকিংয়ের tracking status দেখতে পারবে
export const getSteadfastTracking = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = getUserId(req);
    const vendorOrderId = req.params.vendorOrderId;

    if (
      typeof vendorOrderId !== "string" ||
      !vendorOrderId.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid Vendor Order ID is required",
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!vendor) {
      return res.status(403).json({
        success: false,
        message:
          "Only sellers can view this tracking information",
      });
    }

    const shipment = await prisma.courierShipment.findFirst({
      where: {
        vendorOrderId,
        vendorOrder: {
          vendorId: vendor.id,
        },
      },
      include: {
        vendorOrder: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
          },
        },
      },
    });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found",
      });
    }

    if (!shipment.trackingCode) {
      return res.status(400).json({
        success: false,
        message: "Tracking code is not available yet",
      });
    }

    const response = await fetch(
      `${STEADFAST_BASE_URL}/status_by_trackingcode/${encodeURIComponent(
        shipment.trackingCode
      )}`,
      {
        method: "GET",
        headers: getSteadfastHeaders(),
      }
    );

    const rawText = await response.text();
    let result: any = null;

    try {
      result = rawText ? JSON.parse(rawText) : null;
    } catch {
      result = null;
    }

    if (!response.ok || !result) {
      let failMessage = "Unable to fetch tracking status";
      if (result?.message) {
        failMessage = result.message;
      } else if (rawText) {
        failMessage = rawText.replace(/<[^>]+>/g, "").trim();
      }

      if (
        response.status >= 500 ||
        /server\s+error/i.test(failMessage) ||
        /internal\s+server\s+error/i.test(failMessage)
      ) {
        failMessage =
          "Steadfast কুরিয়ারের সার্ভারে সাময়িক সমস্যা হচ্ছে (Steadfast Server Error)। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।";
      }

      return res.status(502).json({
        success: false,
        message: failMessage,
        details: result || rawText,
      });
    }

    const remoteStatus =
      result.delivery_status ??
      result.consignment?.delivery_status;

    const updatedShipment = await prisma.courierShipment.update({
      where: { id: shipment.id },
      data: {
        ...(typeof remoteStatus === "string"
          ? { deliveryStatus: remoteStatus }
          : {}),
        bookingResponse: result as Prisma.InputJsonValue,
      },
    });

    return res.status(200).json({
      success: true,
      shipment: updatedShipment,
      tracking: result,
    });
  } catch (error) {
    console.error("Steadfast tracking error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to get tracking status",
    });
  }
};

// =====================================================
// STEADFAST WEBHOOK HANDLER
// Follows official Steadfast Webhook Specification
// =====================================================
export const handleSteadfastWebhook = async (req: Request, res: Response) => {
  try {
    const token =
      process.env.STEADFAST_TOKEN ||
      process.env.STEADFAST_SECRET_KEY ||
      "";

    const givenSignature = req.get("X-Signature") || "";

    // 1. Signature verification if token is configured
    if (token && givenSignature) {
      let rawBodyBuffer: Buffer;
      if (Buffer.isBuffer(req.body)) {
        rawBodyBuffer = req.body;
      } else if (typeof req.body === "string") {
        rawBodyBuffer = Buffer.from(req.body);
      } else {
        rawBodyBuffer = Buffer.from(JSON.stringify(req.body));
      }

      const expected = crypto
        .createHmac("sha256", token)
        .update(rawBodyBuffer)
        .digest("hex");

      if (
        givenSignature.length !== expected.length ||
        !crypto.timingSafeEqual(
          Buffer.from(givenSignature),
          Buffer.from(expected)
        )
      ) {
        console.warn("[STEADFAST WEBHOOK] Signature mismatch:", {
          given: givenSignature,
          expected,
        });
        return res.status(401).json({ error: "Invalid signature" });
      }
    }

    // 2. Parse event payload
    let event: any = req.body;
    if (Buffer.isBuffer(req.body)) {
      try {
        event = JSON.parse(req.body.toString("utf8"));
      } catch {
        return res.status(400).json({ error: "Invalid JSON body" });
      }
    } else if (typeof req.body === "string") {
      try {
        event = JSON.parse(req.body);
      } catch {
        return res.status(400).json({ error: "Invalid JSON body" });
      }
    }

    console.log("[STEADFAST WEBHOOK] Received event:", event);

    const notificationType = event?.notification_type;
    const invoice = event?.invoice;
    const consignmentId = event?.consignment_id
      ? String(event.consignment_id)
      : null;
    const status = String(event?.status || "").toLowerCase();

    // 3. Process delivery_status
    if (notificationType === "delivery_status") {
      const shipment = await prisma.courierShipment.findFirst({
        where: {
          OR: [
            ...(consignmentId ? [{ consignmentId }] : []),
            ...(invoice
              ? [{ vendorOrder: { orderNumber: invoice } }]
              : []),
          ],
        },
        include: {
          vendorOrder: {
            include: {
              vendor: true,
              customer: true,
            },
          },
        },
      });

      if (!shipment || !shipment.vendorOrder) {
        console.warn("[STEADFAST WEBHOOK] Shipment/VendorOrder not found:", {
          invoice,
          consignmentId,
        });
        return res.status(200).json({
          status: "success",
          message: "Order acknowledged (not found locally)",
        });
      }

      const vOrder = shipment.vendorOrder;

      if (status === "delivered" || status === "partial_delivered") {
        await prisma.courierShipment.update({
          where: { id: shipment.id },
          data: {
            deliveryStatus: "DELIVERED",
            ...(event.delivery_charge != null
              ? {
                  deliveryCharge: new Prisma.Decimal(
                    Number(event.delivery_charge).toFixed(2)
                  ),
                }
              : {}),
            bookingResponse: event,
          },
        });

        await prisma.vendorOrder.update({
          where: { id: vOrder.id },
          data: {
            status: CustomerOrderStatus.DELIVERED,
            paymentStatus: OrderPaymentStatus.PAID,
          },
        });

        // Sync parent CustomerOrder
        if (vOrder.customerOrderId) {
          const siblingOrders = await prisma.vendorOrder.findMany({
            where: { customerOrderId: vOrder.customerOrderId },
            select: { status: true },
          });

          if (
            siblingOrders.every(
              (o) => o.status === CustomerOrderStatus.DELIVERED
            )
          ) {
            await prisma.customerOrder.update({
              where: { id: vOrder.customerOrderId },
              data: {
                status: CustomerOrderStatus.DELIVERED,
                paymentStatus: OrderPaymentStatus.PAID,
              },
            });
          }
        }

        // Notify customer
        if (vOrder.customerId) {
          await createNotification({
            userId: vOrder.customerId,
            type: "ORDER_DELIVERED",
            title: `অর্ডার #${vOrder.orderNumber} ডেলিভারি সম্পন্ন হয়েছে!`,
            message:
              event.tracking_message ||
              `আপনার অর্ডার #${vOrder.orderNumber} সফলভাবে আপনার ঠিকানায় ডেলিভারি হয়েছে।`,
            entityId: vOrder.id,
            entityType: "ORDER",
          });
        }

        // Notify vendor
        if (vOrder.vendor?.userId) {
          await createNotification({
            userId: vOrder.vendor.userId,
            type: "ORDER_DELIVERED",
            title: `পার্সেল ডেলিভারি সম্পন্ন: #${vOrder.orderNumber}`,
            message: `আপনার স্টোর "${vOrder.vendor.storeName}"-এর পার্সেল #${vOrder.orderNumber} সফলভাবে গ্রাহকের কাছে পৌঁছেছে।`,
            entityId: vOrder.id,
            entityType: "VENDOR_ORDER",
          });
        }

        // Notify admins
        await notifyAdmins({
          type: "ORDER_DELIVERED",
          title: `পার্সেল ডেলিভারি সম্পন্ন: #${vOrder.orderNumber}`,
          message: `অর্ডার #${vOrder.orderNumber} Steadfast কুরিয়ার মারফত ডেলিভারি সম্পন্ন হয়েছে।`,
          entityId: vOrder.id,
          entityType: "ORDER",
        });
      } else if (status === "cancelled") {
        await prisma.courierShipment.update({
          where: { id: shipment.id },
          data: {
            deliveryStatus: "CANCELLED",
            bookingResponse: event,
          },
        });

        await prisma.vendorOrder.update({
          where: { id: vOrder.id },
          data: {
            status: CustomerOrderStatus.CANCELLED,
          },
        });

        if (vOrder.customerId) {
          await createNotification({
            userId: vOrder.customerId,
            type: "ORDER_CANCELLED",
            title: `অর্ডার ডেলিভারি বাতিল: #${vOrder.orderNumber}`,
            message: `আপনার অর্ডার #${vOrder.orderNumber} ডেলিভারি সম্পন্ন করা সম্ভব হয়নি বা বাতিল হয়েছে।`,
            entityId: vOrder.id,
            entityType: "ORDER",
          });
        }
      } else {
        // Any other status (pending, in_transit, etc.)
        await prisma.courierShipment.update({
          where: { id: shipment.id },
          data: {
            deliveryStatus: status.toUpperCase(),
            bookingResponse: event,
          },
        });
      }
    } else if (notificationType === "tracking_update") {
      if (consignmentId || invoice) {
        await prisma.courierShipment.updateMany({
          where: {
            OR: [
              ...(consignmentId ? [{ consignmentId }] : []),
              ...(invoice
                ? [{ vendorOrder: { orderNumber: invoice } }]
                : []),
            ],
          },
          data: {
            bookingResponse: event,
          },
        });
      }
    }

    return res.status(200).json({ status: "success" });
  } catch (error) {
    console.error("[STEADFAST WEBHOOK ERROR]:", error);
    return res.status(500).json({ error: "Webhook handling failed" });
  }
};
