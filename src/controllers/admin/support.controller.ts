import { Request, Response } from "express";

import { prisma } from "../../config/prisma";
import { AuthRequest } from "../../middleware/auth-middleware";
import { createActivity } from "../../services/activity-service";

// GET: /api/support
export const getSupportSettings = async (
  req: Request,
  res: Response
) => {
  try {
    const supportSettings = await prisma.supportSetting.findUnique({
      where: {
        id: "default-support-id",
      },
    });

    console.log("GET Support Settings:", supportSettings);

    if (!supportSettings) {
      return res.status(200).json({
        success: true,
        data: {
          supportEmail: "support@aladdin.com.bd",
          hotline: "+8801700000000",
          whatsappNumber: "+8801800000000",
          ticketPriorityDefault: "Medium",
          disputeWindowDays: 3,
          autoReplyMessage:
            "Thank you for contacting Aladdin B2B Support. Our agent will connect soon.",
          enableLiveChat: true,
          faqSectionEnabled: true,
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: supportSettings,
    });
  } catch (error) {
    console.error("GET Support Settings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get support settings",
    });
  }
};

// POST: /api/support/update
export const updateSupportSettings = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const body = req.body;

    console.log("=================================");
    console.log("POST Support Settings Received:");
    console.log(body);
    console.log("=================================");

    const {
      supportEmail,
      hotline,
      whatsappNumber,
      ticketPriorityDefault,
      disputeWindowDays,
      autoReplyMessage,
      enableLiveChat,
      faqSectionEnabled,
    } = body;

    // Basic validation
    if (!supportEmail) {
      return res.status(400).json({
        success: false,
        message: "Support email is required",
      });
    }

    if (!hotline) {
      return res.status(400).json({
        success: false,
        message: "Hotline is required",
      });
    }

    const allowedPriorities = [
      "Low",
      "Medium",
      "High",
      "Urgent",
    ];

    if (!allowedPriorities.includes(ticketPriorityDefault)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket priority",
      });
    }

    const disputeDays = Number(disputeWindowDays);

    if (isNaN(disputeDays) || disputeDays < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid dispute window",
      });
    }

    const savedSupport = await prisma.supportSetting.upsert({
      where: {
        id: "default-support-id",
      },

      update: {
        supportEmail,
        hotline,
        whatsappNumber: whatsappNumber || null,
        ticketPriorityDefault,
        disputeWindowDays: disputeDays,
        autoReplyMessage: autoReplyMessage || null,
        enableLiveChat: Boolean(enableLiveChat),
        faqSectionEnabled: Boolean(faqSectionEnabled),
      },

      create: {
        id: "default-support-id",
        supportEmail,
        hotline,
        whatsappNumber: whatsappNumber || null,
        ticketPriorityDefault,
        disputeWindowDays: disputeDays,
        autoReplyMessage: autoReplyMessage || null,
        enableLiveChat: Boolean(enableLiveChat),
        faqSectionEnabled: Boolean(faqSectionEnabled),
      },
    });

    console.log("Support Settings Saved:");
    console.log(savedSupport);

    // Activity Log
    await createActivity({
      userId: req.user?.id,
      action: "UPDATE",
      title: "Updated support settings",
      description: "Support settings were updated",
      entityType: "SUPPORT_SETTINGS",
    });

    return res.status(200).json({
      success: true,
      message: "Support settings updated successfully!",
      data: savedSupport,
    });
  } catch (error) {
    console.error("Support Update Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};