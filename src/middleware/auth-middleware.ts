
import { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../config/supabase-admin";
import { prisma } from "../config/prisma";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string | null;
    phone: string | null;
    fullName: string | null;
    status: string;
  };
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "লগইন করা নেই",
      });
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Authentication token পাওয়া যায়নি",
      });
    }

    const { data, error } =
      await supabaseAdmin.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({
        success: false,
        error: "Session সঠিক নয়, আবার লগইন করুন",
      });
    }

    const authUserId = data.user.id;

    const profile = await prisma.user.findUnique({
      where: {
        id: authUserId,
      },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: "Profile পাওয়া যায়নি",
      });
    }

    if (profile.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        error: "অ্যাকাউন্ট সাসপেন্ড/ব্যান করা হয়েছে",
      });
    }

    const vendorProfile = await prisma.vendor.findUnique({
      where: {
        userId: authUserId,
      },
      select: {
        id: true,
        userId: true,
      },
    });

    const userRoleStr = String(profile.role);
    const finalRole =
      userRoleStr === "SUPER_ADMIN" || userRoleStr === "MANAGER"
        ? userRoleStr
        : vendorProfile
      ? "VENDOR"
      : String(profile.role);

    req.user = {
      id: profile.id,
      role: finalRole,
      email: profile.email,
      phone: profile.phone,
      fullName: profile.fullName ?? "Unnamed User",
      status: profile.status,
    };

    console.log("AUTH DEBUG:", {
      userId: req.user.id,
      profileRole: profile.role,
      vendorFound: Boolean(vendorProfile),
      vendorId: vendorProfile?.id ?? null,
      finalRole: req.user.role,
      status: req.user.status,
      path: req.originalUrl,
    });

    return next();
  } catch (error: unknown) {
    console.error("Require Auth Error:", error);

    return res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Authentication failed",
    });
  }
}

export function requireRole(...allowedRoles: string[]) {
  return (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    console.log("ROLE DEBUG:", {
      userId: req.user?.id ?? null,
      actualRole: req.user?.role ?? null,
      allowedRoles,
      path: req.originalUrl,
    });

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication প্রয়োজন",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: "এই কাজের অনুমতি নেই",
        details: {
          actualRole: req.user.role,
          requiredRoles: allowedRoles,
        },
      });
    }

    return next();
  };
}
