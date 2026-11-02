import { Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest } from "./auth-middleware";

export const requireManagerPermission = (
  moduleName: string
) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // User login করা আছে কিনা
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized",
        });
      }

      // Super Admin-এর সব permission আছে
      if (req.user.role === "SUPER_ADMIN") {
        return next();
      }

      // শুধু Manager-এর permission check হবে
      if (req.user.role !== "MANAGER") {
        return res.status(403).json({
          success: false,
          error: "Access denied",
        });
      }

      // Database থেকে Manager-এর permission খুঁজবে
      const permission =
        await prisma.managerPermission.findUnique({
          where: {
            userId_moduleName: {
              userId: req.user.id,
              moduleName,
            },
          },
        });

      // Permission না থাকলে block
      if (!permission) {
        return res.status(403).json({
          success: false,
          error: `You do not have permission to access ${moduleName}`,
        });
      }

      // Permission থাকলে সামনে যাবে
      next();
    } catch (error: any) {
      console.error(
        "Manager Permission Error:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          error?.message ||
          "Permission check failed",
      });
    }
  };
};