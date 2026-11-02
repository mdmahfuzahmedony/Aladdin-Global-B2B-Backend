import { Response } from "express";

import { prisma } from "../config/prisma";
import { supabaseAdmin } from "../config/supabase-admin";
import { AuthRequest } from "../middleware/auth-middleware";
import { createActivity } from "../services/activity-service";

const ALLOWED_MODULES = [
  "dashboard",
  "users",
  "vendors",
  "wholesalers",
  "affiliates",
  "orders",
  "products",
  "reports",
  "settings",
] as const;

export const createManager = async (
  req: AuthRequest,
  res: Response
) => {
  let authUserId: string | null = null;

  try {
    const {
      fullName,
      email,
      password,
      confirmPassword,
      permissions,
    } = req.body;

    // ==========================================
    // BASIC VALIDATION
    // ==========================================

    if (!fullName?.trim()) {
      return res.status(400).json({
        success: false,
        error: "Full name is required.",
      });
    }

    if (!email?.trim()) {
      return res.status(400).json({
        success: false,
        error: "Email is required.",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        error: "Password is required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 8 characters.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "Passwords do not match.",
      });
    }

    if (
      !Array.isArray(permissions) ||
      permissions.length === 0
    ) {
      return res.status(400).json({
        success: false,
        error: "At least one permission is required.",
      });
    }

    // ==========================================
    // DEBUG - RAW PERMISSIONS
    // ==========================================

    console.log(
      "========== RAW MANAGER PERMISSIONS =========="
    );

    console.log("Permissions:", permissions);

    console.log(
      "Permissions JSON:",
      JSON.stringify(permissions, null, 2)
    );

    console.log(
      "============================================="
    );

    // ==========================================
    // NORMALIZE PERMISSIONS
    // ==========================================

    const requestedPermissions = [
      ...new Set(
        permissions
          .map((permission: any) => {
            if (typeof permission === "string") {
              return permission.trim().toLowerCase();
            }

            if (
              permission &&
              typeof permission === "object"
            ) {
              return String(
                permission.moduleName || ""
              )
                .trim()
                .toLowerCase();
            }

            return "";
          })
          .filter(Boolean)
      ),
    ];

    console.log(
      "========== NORMALIZED PERMISSIONS =========="
    );

    console.log(
      "Requested Permissions:",
      requestedPermissions
    );

    console.log(
      "Requested Permissions JSON:",
      JSON.stringify(
        requestedPermissions,
        null,
        2
      )
    );

    console.log(
      "============================================"
    );

    // ==========================================
    // VALIDATE PERMISSIONS
    // ==========================================

    const invalidPermissions =
      requestedPermissions.filter(
        (moduleName) =>
          !ALLOWED_MODULES.includes(
            moduleName as (typeof ALLOWED_MODULES)[number]
          )
      );

    if (invalidPermissions.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Invalid permission module: ${invalidPermissions.join(
          ", "
        )}`,
        invalidPermissions,
      });
    }

    // ==========================================
    // NORMALIZE EMAIL
    // ==========================================

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    // ==========================================
    // CHECK EXISTING PRISMA USER
    // ==========================================

    const existingUser =
      await prisma.user.findFirst({
        where: {
          email: normalizedEmail,
        },
      });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error:
          "A user with this email already exists.",
      });
    }

    // ==========================================
    // CREATE SUPABASE AUTH USER
    // ==========================================

    console.log(
      "Creating Supabase Auth manager..."
    );

    const {
      data: authData,
      error: authError,
    } =
      await supabaseAdmin.auth.admin.createUser({
        email: normalizedEmail,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName.trim(),
          role: "MANAGER",
        },
      });

    if (authError || !authData?.user) {
      console.error(
        "Supabase Manager Creation Error:",
        authError
      );

      return res.status(400).json({
        success: false,
        error:
          authError?.message ||
          "Failed to create manager authentication account.",
      });
    }

    authUserId = authData.user.id;

    console.log(
      "✅ Supabase manager created:",
      authUserId
    );

    // ==========================================
    // CREATE USER + PERMISSIONS
    // ==========================================

    const manager = await prisma.$transaction(
      async (tx) => {
        // ----------------------------------------
        // CREATE USER
        // ----------------------------------------

        const user = await tx.user.create({
          data: {
            id: authUserId!,
            email: normalizedEmail,
            fullName: fullName.trim(),
            role: "MANAGER",
            status: "ACTIVE",
          },
        });

        // ----------------------------------------
        // CREATE MANAGER PERMISSIONS
        // ----------------------------------------

        await tx.managerPermission.createMany({
          data: requestedPermissions.map(
            (moduleName) => ({
              userId: user.id,
              moduleName,
              accessLevel: "full",
            })
          ),
        });

        // ----------------------------------------
        // RETURN MANAGER WITH PERMISSIONS
        // ----------------------------------------

        return tx.user.findUnique({
          where: {
            id: user.id,
          },
          include: {
            managerPermissions: {
              orderBy: {
                moduleName: "asc",
              },
            },
          },
        });
      }
    );

    // ==========================================
    // SUCCESS
    // ==========================================

    console.log(
      "========================================"
    );

    console.log(
      "✅ MANAGER CREATED SUCCESSFULLY"
    );

    console.log(
      "Manager ID:",
      manager?.id
    );

    console.log(
      "Manager Email:",
      manager?.email
    );

    console.log(
      "Manager Permissions:",
      manager?.managerPermissions
    );

    console.log(
      "========================================"
    );

    // ==========================================
    // ACTIVITY LOG
    // ==========================================

    await createActivity({
      userId: req.user?.id,
      action: "CREATE",
      title: "Added new manager",
      description: `Manager "${manager?.fullName}" was added`,
      entityId: manager?.id,
      entityType: "MANAGER",
    });

    return res.status(201).json({
      success: true,
      message:
        "Manager created successfully.",
      manager,
    });
  } catch (error: any) {
    console.error(
      "❌ Create Manager Error:",
      error
    );

    // ==========================================
    // ROLLBACK SUPABASE AUTH USER
    // ==========================================

    if (authUserId) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(
          authUserId
        );

        console.log(
          "🗑️ Supabase Auth user rolled back:",
          authUserId
        );
      } catch (deleteError) {
        console.error(
          "Failed to rollback Supabase Auth user:",
          deleteError
        );
      }
    }

    return res.status(500).json({
      success: false,
      error:
        error?.message ||
        "Failed to create manager.",
    });
  }
};