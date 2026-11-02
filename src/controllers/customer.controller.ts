import { Response } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middleware/auth-middleware";

// ============================================================
// GET CURRENT CUSTOMER LOCATION
// ============================================================

export async function getMyCustomerLocation(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const customer = await prisma.customer.findUnique({
      where: {
        userId: req.user.id,
      },
      select: {
        id: true,
        userId: true,
        division: true,
        district: true,
        upazila: true,
        area: true,
        address: true,
        latitude: true,
        longitude: true,
        locationReminderDismissed: true,
      },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: "Customer profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      customer,
    });
  } catch (error: any) {
    console.error("Get Customer Location Error:", error);

    return res.status(500).json({
      success: false,
      error:
        error?.message || "Failed to fetch customer location",
    });
  }
}

// ============================================================
// SAVE / UPDATE CUSTOMER LOCATION
// ============================================================

export async function updateMyCustomerLocation(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const {
      division,
      district,
      upazila,
      area,
      address,
      latitude,
      longitude,
    } = req.body;

    // Basic validation
    if (!division || !district || !upazila) {
      return res.status(400).json({
        success: false,
        error: "Division, district and upazila are required",
      });
    }

    // Validate coordinates if provided
    let parsedLatitude: number | null = null;
    let parsedLongitude: number | null = null;

    if (
      latitude !== undefined &&
      latitude !== null &&
      latitude !== ""
    ) {
      parsedLatitude = Number(latitude);

      if (
        Number.isNaN(parsedLatitude) ||
        parsedLatitude < -90 ||
        parsedLatitude > 90
      ) {
        return res.status(400).json({
          success: false,
          error: "Invalid latitude",
        });
      }
    }

    if (
      longitude !== undefined &&
      longitude !== null &&
      longitude !== ""
    ) {
      parsedLongitude = Number(longitude);

      if (
        Number.isNaN(parsedLongitude) ||
        parsedLongitude < -180 ||
        parsedLongitude > 180
      ) {
        return res.status(400).json({
          success: false,
          error: "Invalid longitude",
        });
      }
    }

    // Create customer if not exists,
    // otherwise update existing customer
    const customer = await prisma.customer.upsert({
      where: {
        userId: req.user.id,
      },

      update: {
        division: division.trim(),
        district: district.trim(),
        upazila: upazila.trim(),
        area: area?.trim() || null,
        address: address?.trim() || null,
        latitude: parsedLatitude,
        longitude: parsedLongitude,
      },

      create: {
        userId: req.user.id,
        fullName: req.user.fullName || null,
        phone: req.user.phone || null,
        division: division.trim(),
        district: district.trim(),
        upazila: upazila.trim(),
        area: area?.trim() || null,
        address: address?.trim() || null,
        latitude: parsedLatitude,
        longitude: parsedLongitude,
      },

      select: {
        id: true,
        userId: true,
        fullName: true,
        phone: true,
        division: true,
        district: true,
        upazila: true,
        area: true,
        address: true,
        latitude: true,
        longitude: true,
        locationReminderDismissed: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Customer location saved successfully",
      customer,
    });
  } catch (error: any) {
    console.error("Update Customer Location Error:", error);

    return res.status(500).json({
      success: false,
      error:
        error?.message || "Failed to save customer location",
    });
  }
}

// ============================================================
// DISMISS LOCATION REMINDER
// ============================================================

export async function dismissLocationReminder(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const customer = await prisma.customer.upsert({
      where: {
        userId: req.user.id,
      },

      update: {
        locationReminderDismissed: true,
      },

      create: {
        userId: req.user.id,
        fullName: req.user.fullName || null,
        phone: req.user.phone || null,
        locationReminderDismissed: true,
      },

      select: {
        id: true,
        userId: true,
        division: true,
        district: true,
        upazila: true,
        area: true,
        address: true,
        locationReminderDismissed: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Location reminder dismissed",
      customer,
    });
  } catch (error: any) {
    console.error(
      "Dismiss Location Reminder Error:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        error?.message ||
        "Failed to dismiss location reminder",
    });
  }
}