import { Request, Response } from "express";

import { prisma } from "../config/prisma";
import { supabaseAdmin } from "../config/supabase-admin";

// =====================================================
// WHOLESALER REGISTER
// POST /api/wholesalers/register
// =====================================================

export const registerWholesaler = async (
  req: Request,
  res: Response,
) => {
  let supabaseUserId: string | null = null;

  try {
    const {
      fullName,
      email,
      phone,

      businessName,
      businessType,
      businessCategory,

      address,
      city,
      district,
      postalCode,

      interestedCategories,
      monthlyPurchaseVolume,
      preferredPaymentMethod,
      preferredDeliveryLocation,

      tradeLicenseNo,
      tradeLicenseDocumentUrl,

      password,
      confirmPassword,

      otp,
    } = req.body;

    // =====================================================
    // 1. BASIC VALIDATION
    // =====================================================

    if (!fullName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Full name is required",
      });
    }

    if (!email?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!phone?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    if (!confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Confirm password is required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters",
      });
    }

    if (!businessName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Business name is required",
      });
    }

    if (!tradeLicenseNo?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Trade license number is required",
      });
    }

    if (!Array.isArray(interestedCategories)) {
      return res.status(400).json({
        success: false,
        message:
          "Interested categories must be an array",
      });
    }

    // =====================================================
    // 2. NORMALIZE DATA
    // =====================================================

    const normalizedEmail =
      email.trim().toLowerCase();

    const normalizedPhone =
      phone.trim();

    // =====================================================
    // 3. OTP VALIDATION
    //
    // IMPORTANT:
    //
    // OtpModal first calls:
    //
    // /api/otp/verify-otp
    //
    // That endpoint only verifies the OTP.
    // It does NOT delete the OTP.
    //
    // Therefore we verify the same OTP again here
    // before creating the actual account.
    // =====================================================

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required",
      });
    }

    const otpRecord =
      await prisma.otpVerification.findUnique({
        where: {
          email: normalizedEmail,
        },
      });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message:
          "কোনো OTP request পাওয়া যায়নি!",
      });
    }

    // -----------------------------------------------------
    // OTP expired
    // -----------------------------------------------------

    if (new Date() > otpRecord.expiresAt) {
      await prisma.otpVerification.delete({
        where: {
          email: normalizedEmail,
        },
      });

      return res.status(400).json({
        success: false,
        message: "OTP code has expired!",
      });
    }

    // -----------------------------------------------------
    // OTP mismatch
    // -----------------------------------------------------

    if (
      otpRecord.otp !==
      String(otp).trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP!",
      });
    }

    // =====================================================
    // 4. CHECK EXISTING DATABASE USER
    // =====================================================

    const existingUser =
      await prisma.user.findFirst({
        where: {
          OR: [
            {
              email: normalizedEmail,
            },
            {
              phone: normalizedPhone,
            },
          ],
        },
      });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "An account already exists with this email or phone number",
      });
    }

    // =====================================================
    // 5. CREATE SUPABASE AUTH USER
    // =====================================================

    const {
      data: authData,
      error: authError,
    } =
      await supabaseAdmin.auth.admin.createUser({
        email: normalizedEmail,

        password,

        // OTP already verified by our system
        email_confirm: true,

        user_metadata: {
          full_name:
            fullName.trim(),

          phone:
            normalizedPhone,

          role: "WHOLESALER",
        },
      });

    // -----------------------------------------------------
    // Supabase error
    // -----------------------------------------------------

    if (authError) {
      console.error(
        "❌ Supabase Wholesaler Auth Error:",
        authError,
      );

      return res.status(400).json({
        success: false,
        message: authError.message,
      });
    }

    // -----------------------------------------------------
    // No Supabase user
    // -----------------------------------------------------

    if (!authData.user) {
      return res.status(500).json({
        success: false,
        message:
          "Failed to create Supabase user",
      });
    }

    // Save ID for rollback
    supabaseUserId =
      authData.user.id;

    // =====================================================
    // 6. CREATE USER + WHOLESALER
    // =====================================================

    const result =
      await prisma.$transaction(
        async (tx) => {
          const user =
            await tx.user.create({
              data: {
                id: supabaseUserId!,

                email:
                  normalizedEmail,

                phone:
                  normalizedPhone,

                fullName:
                  fullName.trim(),

                role: "WHOLESALER",

                status: "ACTIVE",

                // -----------------------------------------
                // CREATE WHOLESALER
                // -----------------------------------------

                wholesaler: {
                  create: {
                    // =====================================
                    // BUSINESS INFORMATION
                    // =====================================

                    businessName:
                      businessName.trim(),

                    businessType:
                      businessType?.trim() ||
                      null,

                    businessCategory:
                      businessCategory?.trim() ||
                      null,

                    // =====================================
                    // BUSINESS ADDRESS
                    // =====================================

                    address:
                      address?.trim() ||
                      null,

                    city:
                      city?.trim() ||
                      null,

                    district:
                      district?.trim() ||
                      null,

                    postalCode:
                      postalCode?.trim() ||
                      null,

                    // =====================================
                    // WHOLESALE BUYING
                    // =====================================

                    interestedCategories:
                      interestedCategories,

                    monthlyPurchaseVolume:
                      monthlyPurchaseVolume?.trim() ||
                      null,

                    preferredPaymentMethod:
                      preferredPaymentMethod?.trim() ||
                      null,

                    preferredDeliveryLocation:
                      preferredDeliveryLocation?.trim() ||
                      null,

                    // =====================================
                    // VERIFICATION
                    // =====================================

                    tradeLicenseNo:
                      tradeLicenseNo.trim(),

                    tradeLicenseDocumentUrl:
                      tradeLicenseDocumentUrl?.trim() ||
                      null,

                    // =====================================
                    // DEFAULT WHOLESALER STATUS
                    // =====================================

                    verificationStatus:
                      "PENDING",

                    creditLimit: 0,
                  },
                },
              },

              // -----------------------------------------
              // RETURN WHOLESALER DATA
              // -----------------------------------------

              include: {
                wholesaler: true,
              },
            });

          return user;
        },
      );

    // =====================================================
    // 7. DELETE OTP AFTER SUCCESS
    // =====================================================

    await prisma.otpVerification.delete({
      where: {
        email: normalizedEmail,
      },
    });

    // =====================================================
    // 8. SUCCESS LOG
    // =====================================================

    console.log(
      "================================================",
    );

    console.log(
      "✅ WHOLESALER CREATED SUCCESSFULLY",
    );

    console.log({
      userId: result.id,
      email: result.email,
      role: result.role,
      wholesalerId:
        result.wholesaler?.id,
    });

    console.log(
      "================================================",
    );

    // =====================================================
    // 9. SUCCESS RESPONSE
    // =====================================================

    return res.status(201).json({
      success: true,

      message:
        "Wholesaler registration successful",

      user: {
        id: result.id,

        email:
          result.email,

        phone:
          result.phone,

        fullName:
          result.fullName,

        role:
          result.role,

        status:
          result.status,
      },

      wholesaler:
        result.wholesaler,
    });
  } catch (error: any) {
    // =====================================================
    // 10. ERROR
    // =====================================================

    console.error(
      "❌ Wholesaler Registration Error:",
      error,
    );

    // =====================================================
    // 11. ROLLBACK SUPABASE USER
    //
    // যদি Supabase user তৈরি হয় কিন্তু Prisma save
    // fail করে, তাহলে orphan Supabase user delete হবে।
    // =====================================================

    if (supabaseUserId) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(
          supabaseUserId,
        );

        console.log(
          "↩️ Orphan Supabase user deleted:",
          supabaseUserId,
        );
      } catch (deleteError) {
        console.error(
          "❌ Failed to delete orphan Supabase user:",
          deleteError,
        );
      }
    }

    // =====================================================
    // 12. ERROR RESPONSE
    // =====================================================

    return res.status(500).json({
      success: false,

      message:
        error?.message ||
        "Failed to create wholesaler account",
    });
  }
};