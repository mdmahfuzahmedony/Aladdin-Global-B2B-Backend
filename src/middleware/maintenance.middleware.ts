// middleware/maintenance.middleware.ts

import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";

export const maintenanceMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const settings = await prisma.generalSetting.findUnique({
      where: {
        id: "default-settings-id",
      },
      select: {
        maintenance: true,
      },
    });

    if (settings?.maintenance) {
      return res.status(503).json({
        success: false,
        maintenance: true,
        message:
          "আমাদের ওয়েবসাইটে সাময়িক রক্ষণাবেক্ষণের কাজ চলছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন।",
      });
    }

    return next();
  } catch (error) {
    console.error("Maintenance check error:", error);
    return next();
  }
};