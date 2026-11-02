import { Response } from "express";

import { prisma } from "../../config/prisma";
import { AuthRequest } from "../../middleware/auth-middleware";
import { createActivity } from "../../services/activity-service";

// ============================================================
// GET SETTINGS
// GET /api/settings
// ============================================================

export const getSettings = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const [
      general,
      payment,
      shipping,
      commission,
      tax,
      security,
    ] = await prisma.$transaction([
      prisma.generalSetting.findUnique({
        where: {
          id: "default-settings-id",
        },
      }),

      prisma.paymentSetting.findUnique({
        where: {
          id: "default-payment-settings-id",
        },
      }),

      prisma.shippingSetting.findUnique({
        where: {
          id: "default-shipping-settings-id",
        },
      }),

      prisma.commissionSetting.findUnique({
        where: {
          id: "default-commission-settings-id",
        },
      }),

      prisma.taxSetting.findUnique({
        where: {
          id: "default-tax-settings-id",
        },
      }),

      prisma.securitySetting.findUnique({
        where: {
          id: "default-security-settings-id",
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        // =========================
        // General
        // =========================

        siteName:
          general?.siteName ??
          "Aladdin B2B",

        logoUrl:
          (general as any)?.logoUrl ??
          null,

        supportEmail:
          general?.supportEmail ??
          "support@aladdin.com.bd",

        contactNumber:
          general?.contactNumber ??
          "+8801700000000",

        address:
          (general as any)?.address ??
          "Holding No: Gohata, Road Jashore, Jashore, Bangladesh — 7400",

        currency:
          general?.currency ??
          "BDT",

        timezone:
          general?.timezone ??
          "Asia/Dhaka",

        // Maintenance Mode
        maintenance:
          general?.maintenance ??
          false,

        // =========================
        // Payment
        // =========================

        bkashEnabled:
          payment?.bkashEnabled ??
          true,

        nagadEnabled:
          payment?.nagadEnabled ??
          true,

        sslCommerzEnabled:
          payment?.sslCommerzEnabled ??
          true,

        codEnabled:
          payment?.codEnabled ??
          true,

        // =========================
        // Shipping
        // =========================

        hyperlocalRadius:
          shipping?.radiusKm ??
          3,

        standardDeliveryFee:
          shipping?.standardDeliveryFee ??
          60,

        expressDeliveryFee:
          shipping?.expressDeliveryFee ??
          120,

        // =========================
        // Commission
        // =========================

        commissionRate:
          commission?.defaultPercentage ??
          5,

        minPayoutLimit:
          commission?.minPayoutLimit ??
          1000,

        // =========================
        // Tax
        // =========================

        vatNumber:
          tax?.taxIdNumber ??
          "",

        vatPercentage:
          tax?.vatPercentage ??
          7.5,

        // =========================
        // Security
        // =========================

        twoFactorAuth:
          security?.twoFactorAuth ??
          false,

        sessionTimeoutMins:
          security?.sessionTimeoutMins ??
          30,

        maxLoginAttempts:
          security?.maxLoginAttempts ??
          5,
      },
    });
  } catch (error) {
    console.error(
      "GET Settings Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Settings load করা যায়নি",
      error:
        error instanceof Error
          ? error.message
          : "Internal Server Error",
    });
  }
};

// ============================================================
// POST / UPDATE SETTINGS
// POST /api/settings/update
// ============================================================

export const updateSettings = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const body = req.body || {};

    console.log(
      "Backend received Settings Data:",
      body
    );

    // ========================================================
    // GENERAL SETTINGS (preserve existing if not provided)
    // ========================================================

    const existingGeneral = await prisma.generalSetting.findUnique({
      where: { id: "default-settings-id" },
    });

    let logoUrl = (existingGeneral as any)?.logoUrl ?? null;
    if (body.logoUrl !== undefined) {
      if (typeof body.logoUrl === "string" && body.logoUrl.trim().length > 0) {
        logoUrl = body.logoUrl.trim();
      } else if (body.logoUrl === null || body.logoUrl === "") {
        logoUrl = null;
      }
    }

    const generalData: any = {
      siteName:
        typeof body.siteName === "string" &&
        body.siteName.trim()
          ? body.siteName.trim()
          : (existingGeneral?.siteName ?? "Aladdin B2B"),

      logoUrl,

      supportEmail:
        typeof body.supportEmail === "string" &&
        body.supportEmail.trim()
          ? body.supportEmail.trim()
          : (existingGeneral?.supportEmail ?? "support@aladdin.com.bd"),

      contactNumber:
        typeof body.contactNumber === "string" &&
        body.contactNumber.trim()
          ? body.contactNumber.trim()
          : (existingGeneral?.contactNumber ?? "+8801700000000"),

      address:
        typeof body.address === "string" &&
        body.address.trim()
          ? body.address.trim()
          : ((existingGeneral as any)?.address ?? "Holding No: Gohata, Road Jashore, Jashore, Bangladesh — 7400"),

      currency:
        typeof body.currency === "string" &&
        body.currency.trim()
          ? body.currency.trim()
          : (existingGeneral?.currency ?? "BDT"),

      timezone:
        typeof body.timezone === "string" &&
        body.timezone.trim()
          ? body.timezone.trim()
          : (existingGeneral?.timezone ?? "Asia/Dhaka"),

      // ======================================================
      // MAINTENANCE MODE
      // ======================================================

      maintenance:
        typeof body.maintenance === "boolean"
          ? body.maintenance
          : (existingGeneral?.maintenance ?? false),
    };

    // ========================================================
    // PAYMENT SETTINGS
    // ========================================================

    const paymentData = {
      bkashEnabled:
        typeof body.bkashEnabled === "boolean"
          ? body.bkashEnabled
          : true,

      nagadEnabled:
        typeof body.nagadEnabled === "boolean"
          ? body.nagadEnabled
          : true,

      sslCommerzEnabled:
        typeof body.sslCommerzEnabled === "boolean"
          ? body.sslCommerzEnabled
          : true,

      codEnabled:
        typeof body.codEnabled === "boolean"
          ? body.codEnabled
          : true,
    };

    // ========================================================
    // SHIPPING SETTINGS
    // ========================================================

    const radiusKm = Number(
      body.hyperlocalRadius
    );

    const standardDeliveryFee = Number(
      body.standardDeliveryFee
    );

    const expressDeliveryFee = Number(
      body.expressDeliveryFee
    );

    const shippingData = {
      radiusKm:
        Number.isFinite(radiusKm) &&
        radiusKm >= 0
          ? Math.round(radiusKm)
          : 3,

      standardDeliveryFee:
        Number.isFinite(
          standardDeliveryFee
        ) &&
        standardDeliveryFee >= 0
          ? standardDeliveryFee
          : 60,

      expressDeliveryFee:
        Number.isFinite(
          expressDeliveryFee
        ) &&
        expressDeliveryFee >= 0
          ? expressDeliveryFee
          : 120,
    };

    // ========================================================
    // COMMISSION SETTINGS
    // ========================================================

    const commissionRate = Number(
      body.commissionRate
    );

    const minPayoutLimit = Number(
      body.minPayoutLimit
    );

    const commissionData = {
      defaultPercentage:
        Number.isFinite(
          commissionRate
        ) &&
        commissionRate >= 0 &&
        commissionRate <= 100
          ? commissionRate
          : 5,

      minPayoutLimit:
        Number.isFinite(
          minPayoutLimit
        ) &&
        minPayoutLimit >= 0
          ? minPayoutLimit
          : 1000,
    };

    // ========================================================
    // TAX SETTINGS
    // ========================================================

    const vatPercentage = Number(
      body.vatPercentage
    );

    const taxData = {
      vatPercentage:
        Number.isFinite(
          vatPercentage
        ) &&
        vatPercentage >= 0 &&
        vatPercentage <= 100
          ? vatPercentage
          : 7.5,

      taxIdNumber:
        typeof body.vatNumber === "string" &&
        body.vatNumber.trim()
          ? body.vatNumber.trim()
          : null,
    };

    // ========================================================
    // SECURITY SETTINGS
    // ========================================================

    const sessionTimeoutMins = Number(
      body.sessionTimeoutMins
    );

    const maxLoginAttempts = Number(
      body.maxLoginAttempts
    );

    const securityData = {
      twoFactorAuth:
        typeof body.twoFactorAuth === "boolean"
          ? body.twoFactorAuth
          : false,

      sessionTimeoutMins:
        Number.isFinite(
          sessionTimeoutMins
        ) &&
        sessionTimeoutMins > 0
          ? Math.round(
              sessionTimeoutMins
            )
          : 30,

      maxLoginAttempts:
        Number.isFinite(
          maxLoginAttempts
        ) &&
        maxLoginAttempts > 0
          ? Math.round(
              maxLoginAttempts
            )
          : 5,
    };

    // ========================================================
    // SAVE ALL SETTINGS IN ONE TRANSACTION
    // ========================================================

    const result =
      await prisma.$transaction(
        async (tx) => {
          // =========================
          // General
          // =========================

          const general =
            await tx.generalSetting.upsert({
              where: {
                id: "default-settings-id",
              },

              update: generalData,

              create: {
                id: "default-settings-id",
                ...generalData,
              },
            });

          // =========================
          // Payment
          // =========================

          const payment =
            await tx.paymentSetting.upsert({
              where: {
                id:
                  "default-payment-settings-id",
              },

              update: paymentData,

              create: {
                id:
                  "default-payment-settings-id",
                ...paymentData,
              },
            });

          // =========================
          // Shipping
          // =========================

          const shipping =
            await tx.shippingSetting.upsert({
              where: {
                id:
                  "default-shipping-settings-id",
              },

              update: shippingData,

              create: {
                id:
                  "default-shipping-settings-id",
                ...shippingData,
              },
            });

          // =========================
          // Commission
          // =========================

          const commission =
            await tx.commissionSetting.upsert({
              where: {
                id:
                  "default-commission-settings-id",
              },

              update: commissionData,

              create: {
                id:
                  "default-commission-settings-id",
                ...commissionData,
              },
            });

          // =========================
          // Tax
          // =========================

          const tax =
            await tx.taxSetting.upsert({
              where: {
                id:
                  "default-tax-settings-id",
              },

              update: taxData,

              create: {
                id:
                  "default-tax-settings-id",
                ...taxData,
              },
            });

          // =========================
          // Security
          // =========================

          const security =
            await tx.securitySetting.upsert({
              where: {
                id:
                  "default-security-settings-id",
              },

              update: securityData,

              create: {
                id:
                  "default-security-settings-id",
                ...securityData,
              },
            });

          return {
            general,
            payment,
            shipping,
            commission,
            tax,
            security,
          };
        }
      );

    // ========================================================
    // CREATE ACTIVITY LOG
    // ========================================================

    await createActivity({
      userId: req.user?.id,
      action: "UPDATE",
      title: "Updated settings",
      description:
        "Platform settings were updated",
      entityType: "SETTINGS",
    });

    // ========================================================
    // RETURN DATA IN FRONTEND FORMAT
    // ========================================================

    return res.status(200).json({
      success: true,

      message:
        "Settings successfully updated!",

      data: {
        // =========================
        // General
        // =========================

        siteName:
          result.general.siteName,

        logoUrl:
          (result.general as any).logoUrl,

        supportEmail:
          result.general.supportEmail,

        contactNumber:
          result.general.contactNumber,

        address:
          (result.general as any).address,

        currency:
          result.general.currency,

        timezone:
          result.general.timezone,

        maintenance:
          result.general.maintenance,

        // =========================
        // Payment
        // =========================

        bkashEnabled:
          result.payment.bkashEnabled,

        nagadEnabled:
          result.payment.nagadEnabled,

        sslCommerzEnabled:
          result.payment
            .sslCommerzEnabled,

        codEnabled:
          result.payment.codEnabled,

        // =========================
        // Shipping
        // =========================

        hyperlocalRadius:
          result.shipping.radiusKm,

        standardDeliveryFee:
          result.shipping
            .standardDeliveryFee,

        expressDeliveryFee:
          result.shipping
            .expressDeliveryFee,

        // =========================
        // Commission
        // =========================

        commissionRate:
          result.commission
            .defaultPercentage,

        minPayoutLimit:
          result.commission
            .minPayoutLimit,

        // =========================
        // Tax
        // =========================

        vatNumber:
          result.tax.taxIdNumber ?? "",

        vatPercentage:
          result.tax.vatPercentage,

        // =========================
        // Security
        // =========================

        twoFactorAuth:
          result.security
            .twoFactorAuth,

        sessionTimeoutMins:
          result.security
            .sessionTimeoutMins,

        maxLoginAttempts:
          result.security
            .maxLoginAttempts,
      },
    });
  } catch (error) {
    console.error(
      "UPDATE Settings Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Settings save করা যায়নি",

      error:
        error instanceof Error
          ? error.message
          : "Internal Server Error",
    });
  }
};

// ============================================================
// GET MAINTENANCE STATUS
// GET /api/settings/maintenance
// ============================================================

export const getMaintenanceStatus = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const setting =
      await prisma.generalSetting.findUnique({
        where: {
          id: "default-settings-id",
        },

        select: {
          maintenance: true,
        },
      });

    return res.status(200).json({
      success: true,

      data: {
        maintenance:
          setting?.maintenance ?? false,
      },
    });
  } catch (error) {
    console.error(
      "GET Maintenance Status Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Maintenance status load করা যায়নি",

      error:
        error instanceof Error
          ? error.message
          : "Internal Server Error",
    });
  }
};