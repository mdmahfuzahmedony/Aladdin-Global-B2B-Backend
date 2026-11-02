import { Request, Response } from "express";

import { prisma } from "../config/prisma";
import { supabaseAdmin } from "../config/supabase-admin";

// =====================================================
// GENERATE UNIQUE REFERRAL CODE
// =====================================================

async function generateReferralCode(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const randomPart = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

    const referralCode = `ALI-${randomPart}`;

    const existing =
      await prisma.affiliate.findUnique({
        where: {
          referralCode,
        },
      });

    if (!existing) {
      return referralCode;
    }
  }

  throw new Error(
    "Failed to generate unique referral code",
  );
}

// =====================================================
// AFFILIATE REGISTER
// POST /api/affiliates/register
// =====================================================

export const registerAffiliate = async (
  req: Request,
  res: Response,
) => {
  let supabaseUserId: string | null = null;

  try {
    const {
      // Personal
      fullName,
      email,
      phone,

      // Social
      socialPlatform,
      socialMediaLink,
      followerCount,

      // Payout
      payoutMethod,
      payoutAccountName,
      payoutAccountNumber,
      payoutMobileNumber,

      // Password
      password,
      confirmPassword,

      // OTP
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

    // =====================================================
    // 2. AFFILIATE INFORMATION VALIDATION
    // =====================================================

    if (!socialPlatform) {
      return res.status(400).json({
        success: false,
        message: "Social platform is required",
      });
    }

    if (!socialMediaLink?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Social media link is required",
      });
    }

    // =====================================================
    // 3. PAYOUT VALIDATION
    // =====================================================

    if (!payoutMethod) {
      return res.status(400).json({
        success: false,
        message: "Payout method is required",
      });
    }

    if (
      payoutMethod === "BKASH" ||
      payoutMethod === "NAGAD"
    ) {
      if (!payoutMobileNumber?.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Mobile banking number is required",
        });
      }
    }

    if (payoutMethod === "BANK") {
      if (!payoutAccountName?.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Bank account holder name is required",
        });
      }

      if (!payoutAccountNumber?.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Bank account number is required",
        });
      }
    }

    // =====================================================
    // 4. NORMALIZE
    // =====================================================

    const normalizedEmail =
      email.trim().toLowerCase();

    const normalizedPhone =
      phone.trim();

    // =====================================================
    // 5. OTP VALIDATION
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

    if (
      new Date() >
      otpRecord.expiresAt
    ) {
      await prisma.otpVerification.delete({
        where: {
          email: normalizedEmail,
        },
      });

      return res.status(400).json({
        success: false,
        message:
          "OTP code has expired!",
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
    // 6. CHECK EXISTING USER
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
    // 7. CREATE SUPABASE AUTH USER
    // =====================================================

    const {
      data: authData,
      error: authError,
    } =
      await supabaseAdmin.auth.admin.createUser({
        email: normalizedEmail,

        password,

        email_confirm: true,

        user_metadata: {
          full_name:
            fullName.trim(),

          phone:
            normalizedPhone,

          role: "AFFILIATE",
        },
      });

    if (authError) {
      console.error(
        "❌ Supabase Affiliate Auth Error:",
        authError,
      );

      return res.status(400).json({
        success: false,
        message: authError.message,
      });
    }

    if (!authData.user) {
      return res.status(500).json({
        success: false,
        message:
          "Failed to create Supabase user",
      });
    }

    supabaseUserId =
      authData.user.id;

    // =====================================================
    // 8. GENERATE REFERRAL CODE
    // =====================================================

    const referralCode =
      await generateReferralCode();

    // =====================================================
    // 9. CREATE USER + AFFILIATE
    // =====================================================

    const result =
      await prisma.$transaction(
        async (tx) => {
          const user =
            await tx.user.create({
              data: {
                id:
                  supabaseUserId!,

                email:
                  normalizedEmail,

                phone:
                  normalizedPhone,

                fullName:
                  fullName.trim(),

                role:
                  "AFFILIATE",

                status:
                  "ACTIVE",

                affiliate: {
                  create: {
                    referralCode,

                    couponCode:
                      null,

                    socialPlatform,

                    socialMediaLink:
                      socialMediaLink.trim(),

                    followerCount:
                      followerCount
                        ? Number(
                            followerCount,
                          )
                        : null,

                    payoutMethod:
                      payoutMethod ||
                      null,

                    payoutAccountName:
                      payoutAccountName?.trim() ||
                      null,

                    payoutAccountNumber:
                      payoutAccountNumber?.trim() ||
                      null,

                    payoutMobileNumber:
                      payoutMobileNumber?.trim() ||
                      null,

                    status:
                      "PENDING",
                  },
                },
              },

              include: {
                affiliate: true,
              },
            });

          // -----------------------------------------------
          // DELETE OTP
          // -----------------------------------------------

          await tx.otpVerification.delete({
            where: {
              email:
                normalizedEmail,
            },
          });

          return user;
        },
      );

    // =====================================================
    // 10. SUCCESS
    // =====================================================

    console.log(
      "==============================================",
    );

    console.log(
      "✅ AFFILIATE CREATED SUCCESSFULLY",
    );

    console.log({
      userId:
        result.id,

      email:
        result.email,

      role:
        result.role,

      affiliateId:
        result.affiliate?.id,

      referralCode:
        result.affiliate?.referralCode,
    });

    console.log(
      "==============================================",
    );

    return res.status(201).json({
      success: true,

      message:
        "Affiliate registration successful",

      user: {
        id:
          result.id,

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

      affiliate:
        result.affiliate,
    });
  } catch (error: any) {
    // =====================================================
    // 11. ERROR
    // =====================================================

    console.error(
      "❌ Affiliate Registration Error:",
      error,
    );

    // =====================================================
    // 12. ROLLBACK SUPABASE USER
    // =====================================================

    if (supabaseUserId) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(
          supabaseUserId,
        );

        console.log(
          "↩️ Orphan Supabase affiliate user deleted:",
          supabaseUserId,
        );
      } catch (deleteError) {
        console.error(
          "❌ Failed to delete orphan Supabase user:",
          deleteError,
        );
      }
    }

    return res.status(500).json({
      success: false,

      message:
        error?.message ||
        "Failed to create affiliate account",
    });
  }
};


// GET /api/affiliates/admin/all

export const getAllAffiliates = async (
  req: Request,
  res: Response,
) => {
  try {
    const affiliates = await prisma.affiliate.findMany({
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      total: affiliates.length,
      affiliates,
    });
  } catch (error) {
    console.error("Failed to fetch affiliates:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch affiliates",
    });
  }
};