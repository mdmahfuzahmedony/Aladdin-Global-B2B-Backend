import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { inspectAndSanitizeMessage } from "../utils/chatSecurity";

// 1. Start or Get an Existing Conversation
export const startOrGetConversation = async (req: Request, res: Response) => {
  try {
    const {
      type = "CUSTOMER_VENDOR",
      customerId,
      customerName,
      vendorId,
      vendorName,
      productId,
      productTitle,
      productSku,
      productPrice,
      productImage,
    } = req.body;

    if (!customerName || !vendorName) {
      return res.status(400).json({
        success: false,
        message: "Customer name and Vendor name are required",
      });
    }

    // Try to find an existing conversation
    let conversation = await prisma.chatConversation.findFirst({
      where: {
        type: type as any,
        ...(customerId ? { customerId } : { customerName }),
        ...(type === "CUSTOMER_VENDOR"
          ? vendorId
            ? { vendorId }
            : { vendorName }
          : {}),
        ...(productSku ? { productSku } : {}),
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    // If none exists, create a new one
    if (!conversation) {
      conversation = await prisma.chatConversation.create({
        data: {
          type: type as any,
          customerId: customerId || null,
          customerName,
          vendorId: vendorId || null,
          vendorName,
          productId: productId || null,
          productTitle: productTitle || null,
          productSku: productSku || null,
          productPrice: productPrice ? String(productPrice) : null,
          productImage: productImage || null,
        },
        include: {
          messages: true,
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error: any) {
    console.error("Error in startOrGetConversation:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to initialize conversation",
      error: error.message,
    });
  }
};

// 2. Fetch Conversations based on User Role (Customer / Vendor / Admin)
export const getConversations = async (req: Request, res: Response) => {
  try {
    const { role, userId, storeName, customerName, filter } = req.query;

    const whereClause: any = {};

    if (role === "VENDOR") {
      const orConditions: any[] = [];
      if (userId) orConditions.push({ vendorId: String(userId) });
      if (storeName) orConditions.push({ vendorName: String(storeName) });
      if (orConditions.length > 0) {
        whereClause.OR = orConditions;
      }
    } else if (role === "CUSTOMER") {
      const orConditions: any[] = [];
      if (userId) orConditions.push({ customerId: String(userId) });
      if (customerName) orConditions.push({ customerName: String(customerName) });
      if (orConditions.length > 0) {
        whereClause.OR = orConditions;
      }
    } else if (role === "ADMIN") {
      if (filter === "SUSPICIOUS") {
        whereClause.hasSuspiciousActivity = true;
      } else if (filter === "COMPLAINT") {
        whereClause.type = "CUSTOMER_ADMIN_COMPLAINT";
      }
    }

    const conversations = await prisma.chatConversation.findMany({
      where: whereClause,
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: {
        lastMessageAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error: any) {
    console.error("Error in getConversations:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
      error: error.message,
    });
  }
};

// 3. Send a Message with Security Inspection
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const {
      conversationId,
      senderId,
      senderRole = "CUSTOMER",
      senderName,
      text,
      isComplaint = false,
    } = req.body;

    if (!conversationId || !text || !senderName) {
      return res.status(400).json({
        success: false,
        message: "conversationId, text, and senderName are required",
      });
    }

    // Inspect and sanitize the message content
    const inspection = inspectAndSanitizeMessage(text);

    // Create the message in DB
    const message = await prisma.chatMessage.create({
      data: {
        conversationId,
        senderId: senderId || null,
        senderRole: senderRole as any,
        senderName,
        text: inspection.cleanText,
        rawText: inspection.rawText || null,
        hasSensitiveData: inspection.hasSensitiveData,
        isSuspicious: inspection.isSuspicious,
        suspiciousReasons: inspection.suspiciousReasons,
        isComplaint,
      },
    });

    // Update conversation lastMessageAt & suspicious activity flag
    const updatedConv = await prisma.chatConversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
        ...(inspection.isSuspicious ? { hasSuspiciousActivity: true } : {}),
      },
    });

    // If vendor replied, create a notification for the customer
    if (senderRole === "VENDOR" && updatedConv?.customerId) {
      try {
        await prisma.notification.create({
          data: {
            userId: updatedConv.customerId,
            type: "CHAT_MESSAGE",
            title: `${senderName || "ভেন্ডর"} থেকে নতুন মেসেজ`,
            message: inspection.cleanText.slice(0, 150),
            entityId: conversationId,
            entityType: "CHAT_CONVERSATION",
            isRead: false,
          },
        });
      } catch (notifError) {
        console.warn("Could not create notification for customer:", notifError);
      }
    }

    return res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error: any) {
    console.error("Error in sendMessage:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
};

// 4. Get Messages for a specific conversation
export const getMessagesByConversation = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;

    const messages = await prisma.chatMessage.findMany({
      where: { conversationId: String(conversationId) },
      orderBy: { createdAt: "asc" },
    });

    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error: any) {
    console.error("Error in getMessagesByConversation:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
};

// 5. Send Admin Official Warning
export const sendAdminWarning = async (req: Request, res: Response) => {
  try {
    const { conversationId, warningText } = req.body;

    if (!conversationId || !warningText) {
      return res.status(400).json({
        success: false,
        message: "conversationId and warningText are required",
      });
    }

    const message = await prisma.chatMessage.create({
      data: {
        conversationId,
        senderRole: "ADMIN",
        senderName: "Aladdin Security Team",
        text: `⚠️ [অফিসিয়াল সতর্কবার্তা]: ${warningText}`,
        hasSensitiveData: false,
        isSuspicious: false,
      },
    });

    await prisma.chatConversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
        hasSuspiciousActivity: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error: any) {
    console.error("Error in sendAdminWarning:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to issue warning",
      error: error.message,
    });
  }
};
