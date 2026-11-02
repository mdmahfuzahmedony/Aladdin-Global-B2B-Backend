import { Response } from "express";

import crypto from "crypto";

import { prisma } from "../config/prisma";

import { supabaseAdmin } from "../config/supabase-admin";

import { AuthRequest } from "../middleware/auth-middleware";

import { createNotification, notifyAdmins } from "../services/notification-service";
import { createActivity } from "../services/activity-service";
import { cleanupAndCascadeDeleteUsers } from "./user.controller";


// =====================================================
// REGISTER VENDOR
// =====================================================



export async function registerVendor(
  req: AuthRequest,
  res: Response
) {
  const bucketName = "vendor_documents_file";

  let supabaseUserId: string | null = null;
  let databaseCreated = false;
  const uploadedPaths: string[] = [];

  let currentStep = "request received";

  try {
    console.log("[VENDOR REGISTER] Controller reached");

    const body = req.body;

    if (!body || typeof body !== "object") {
      return res.status(400).json({
        success: false,
        error: "Request body is missing. Check Multer middleware.",
      });
    }

    const {
      email,
      phone,
      fullName,
      password,
      storeName,
      businessAddress,
      businessCategory,
      nidNumber,
      tradeLicenseNumber,
      taxIdentificationNumber,
      payoutMethod,
      bankName,
      bankAccountNumber,
      bankAccountHolder,
      mobileBankingNumber,
      otp,
    } = body;

    const files = (req.files ?? {}) as Record<
      string,
      Express.Multer.File[]
    >;

    const nidFrontFile = files.nidFrontDocument?.[0];
    const nidBackFile = files.nidBackDocument?.[0];
    const tradeLicenseFile = files.tradeLicenseDocument?.[0];
    const tinFile = files.tinDocument?.[0];

    // 1. Validate required account fields
    if (
      !email ||
      !phone ||
      !fullName ||
      !password ||
      !String(email).trim() ||
      !String(phone).trim() ||
      !String(fullName).trim()
    ) {
      return res.status(400).json({
        success: false,
        error: "Name, email, phone and password are required.",
      });
    }

    if (String(password).length < 8) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 8 characters long.",
      });
    }

    if (!storeName || !String(storeName).trim()) {
      return res.status(400).json({
        success: false,
        error: "Store name is required.",
      });
    }

    if (!nidNumber || !String(nidNumber).trim()) {
      return res.status(400).json({
        success: false,
        error: "NID number is required.",
      });
    }

    if (!payoutMethod) {
      return res.status(400).json({
        success: false,
        error: "Payout method is required.",
      });
    }

    if (!nidFrontFile || !nidBackFile) {
      return res.status(400).json({
        success: false,
        error: "Please upload both NID front and back documents.",
      });
    }

    if (tradeLicenseNumber && !tradeLicenseFile) {
      return res.status(400).json({
        success: false,
        error: "Please upload the trade license document.",
      });
    }

    if (taxIdentificationNumber && !tinFile) {
      return res.status(400).json({
        success: false,
        error: "Please upload the TIN document.",
      });
    }

    // 2. Read location fields
    const locationInput =
      body.location && typeof body.location === "object"
        ? body.location
        : {};

    const division = locationInput.division ?? body.division;
    const district = locationInput.district ?? body.district;
    const upazila = locationInput.upazila ?? body.upazila;
    const area = locationInput.area ?? body.area;

    const fullAddress =
      locationInput.fullAddress ??
      locationInput.address ??
      body.fullAddress ??
      body.address ??
      businessAddress;

    if (
      !division ||
      !district ||
      !upazila ||
      !fullAddress
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Division, district, upazila and full address are required.",
      });
    }

    if (!otp) {
      return res.status(400).json({
        success: false,
        error: "OTP is required.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // 3. Verify OTP
    currentStep = "OTP verification";

    const otpRecord = await prisma.otpVerification.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        error: "OTP not found. Please request a new OTP.",
      });
    }

    if (new Date() > otpRecord.expiresAt) {
      await prisma.otpVerification.deleteMany({
        where: {
          email: normalizedEmail,
        },
      });

      return res.status(400).json({
        success: false,
        error: "OTP has expired. Please request a new OTP.",
      });
    }

    if (otpRecord.otp !== String(otp).trim()) {
      return res.status(400).json({
        success: false,
        error: "Invalid OTP.",
      });
    }

    // 4. Check whether the email already exists
    currentStep = "existing user check";

    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      const existingVendor = await prisma.vendor.findUnique({
        where: {
          userId: existingUser.id,
        },
      });

      return res.status(409).json({
        success: false,
        error: existingVendor
          ? "You are already registered as a vendor."
          : "This email is already registered. Please use another email.",
      });
    }

    // 5. Create Supabase Auth user
    currentStep = "Supabase Auth user creation";

    const {
      data: authData,
      error: authError,
    } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password: String(password),
      email_confirm: true,
      user_metadata: {
        full_name: String(fullName).trim(),
        phone: String(phone).trim(),
        role: "VENDOR",
      },
    });

    if (authError || !authData.user) {
      console.error("[VENDOR REGISTER] Supabase Auth error:", authError);

      return res.status(400).json({
        success: false,
        error:
          authError?.message ??
          "Unable to create vendor account.",
      });
    }

    supabaseUserId = authData.user.id;

    // 6. Upload documents to private Supabase Storage
    const uploadDocument = async (
      file: Express.Multer.File,
      documentType: string
    ): Promise<string> => {
      const mimeType = file.mimetype.toLowerCase();

      const extensionByMimeType: Record<string, string> = {
        "application/pdf": "pdf",
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
      };

      const extension = extensionByMimeType[mimeType];

      if (!extension) {
        throw new Error(
          `Unsupported file type for ${documentType}: ${mimeType}`
        );
      }

      const filePath =
        `${supabaseUserId}/${documentType}-${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from(bucketName)
        .upload(filePath, file.buffer, {
          contentType: mimeType,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(
          `Failed to upload ${documentType}: ${uploadError.message}`
        );
      }

      uploadedPaths.push(filePath);

      // Store only the private storage path in the database.
      return filePath;
    };

    currentStep = "NID front document upload";
    const nidFrontDocumentPath = await uploadDocument(
      nidFrontFile,
      "nid-front"
    );

    currentStep = "NID back document upload";
    const nidBackDocumentPath = await uploadDocument(
      nidBackFile,
      "nid-back"
    );

    let tradeLicenseDocumentPath: string | null = null;

    if (tradeLicenseFile) {
      currentStep = "trade license document upload";
      tradeLicenseDocumentPath = await uploadDocument(
        tradeLicenseFile,
        "trade-license"
      );
    }

    let tinDocumentPath: string | null = null;

    if (tinFile) {
      currentStep = "TIN document upload";
      tinDocumentPath = await uploadDocument(tinFile, "tin");
    }

    // 7. Create user, vendor, location and payout in one transaction
    currentStep = "Prisma transaction";

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          id: supabaseUserId!,
          email: normalizedEmail,
          phone: String(phone).trim(),
          fullName: String(fullName).trim(),
          role: "VENDOR",
          status: "ACTIVE",
        },
      });

      const vendor = await tx.vendor.create({
        data: {
          userId: user.id,
          storeName: String(storeName).trim(),
          businessCategory: businessCategory || null,

          nidNumber: String(nidNumber).trim(),

          // These fields must exist in your Prisma schema.
          nidDocumentUrl: null,
          nidFrontDocumentUrl: nidFrontDocumentPath,
          nidBackDocumentUrl: nidBackDocumentPath,

          tradeLicenseNumber: tradeLicenseNumber || null,
          tradeLicenseDocUrl: tradeLicenseDocumentPath,

          taxIdentificationNumber: taxIdentificationNumber || null,
          tinDocUrl: tinDocumentPath,

          status: "PENDING",

          location: {
            create: {
              division: String(division).trim(),
              district: String(district).trim(),
              upazila: String(upazila).trim(),
              area: area ? String(area).trim() : null,
              fullAddress: String(fullAddress).trim(),
            },
          },

          payout: {
            create: {
              payoutMethod,
              bankName: bankName || null,
              bankAccountNumber: bankAccountNumber || null,
              bankAccountHolder: bankAccountHolder || null,
              mobileBankingNumber: mobileBankingNumber || null,
            },
          },
        },
        include: {
          location: true,
          payout: true,
        },
      });

      return { user, vendor };
    });

    // The database transaction has committed successfully.
    databaseCreated = true;

    console.log("[VENDOR REGISTER] Prisma transaction completed");

    // 8. Remove OTP after successful registration.
    // OTP cleanup failure should not turn a successful registration into a 500.
    try {
      currentStep = "OTP cleanup";

      await prisma.otpVerification.deleteMany({
        where: {
          email: normalizedEmail,
        },
      });
    } catch (otpCleanupError) {
      console.error(
        "[VENDOR REGISTER] OTP cleanup failed:",
        otpCleanupError
      );
    }

    // 9. Send notifications without failing registration
    try {
      currentStep = "admin notifications";

      const superAdmins = await prisma.user.findMany({
        where: {
          role: "SUPER_ADMIN",
        },
        select: {
          id: true,
        },
      });

      for (const admin of superAdmins) {
        try {
          await createNotification({
            userId: admin.id,
            type: "NEW_VENDOR",
            title: "নতুন Vendor Registration",
            message:
              `${result.vendor.storeName} নামে একটি নতুন vendor registration request এসেছে।`,
            entityId: result.vendor.id,
            entityType: "VENDOR",
          });
        } catch (singleNotificationError) {
          console.error(
            `[VENDOR REGISTER] Notification failed for admin ${admin.id}:`,
            singleNotificationError
          );
        }
      }
    } catch (notificationError) {
      console.error(
        "[VENDOR REGISTER] Admin notification error:",
        notificationError
      );
    }

    // 10. Successful response
    return res.status(201).json({
      success: true,
      message: "Vendor application submitted successfully!",

      user: {
        id: result.user.id,
        email: result.user.email,
        fullName: result.user.fullName,
        role: result.user.role,
      },

      vendor: {
        id: result.vendor.id,
        userId: result.vendor.userId,
        storeName: result.vendor.storeName,
        businessCategory: result.vendor.businessCategory,
        status: result.vendor.status,

        // Private storage paths, not public URLs.
        nidFrontDocumentUrl: result.vendor.nidFrontDocumentUrl,
        nidBackDocumentUrl: result.vendor.nidBackDocumentUrl,

        location: result.vendor.location,
        payout: result.vendor.payout,
      },
    });
  } catch (error: unknown) {
    console.error(
      `[VENDOR REGISTER] Failed at step: ${currentStep}`
    );

    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    } else {
      console.error("Unknown error:", error);
    }

    // Clean up uploaded files and Auth user only if the DB transaction
    // did not commit successfully.
    if (!databaseCreated) {
      if (uploadedPaths.length > 0) {
        try {
          const { error: cleanupError } = await supabaseAdmin.storage
            .from(bucketName)
            .remove(uploadedPaths);

          if (cleanupError) {
            console.error(
              "[VENDOR REGISTER] Storage cleanup error:",
              cleanupError
            );
          }
        } catch (cleanupError) {
          console.error(
            "[VENDOR REGISTER] Storage cleanup exception:",
            cleanupError
          );
        }
      }

      if (supabaseUserId) {
        try {
          const { error: deleteUserError } =
            await supabaseAdmin.auth.admin.deleteUser(supabaseUserId);

          if (deleteUserError) {
            console.error(
              "[VENDOR REGISTER] Auth cleanup error:",
              deleteUserError
            );
          }
        } catch (cleanupError) {
          console.error(
            "[VENDOR REGISTER] Auth cleanup exception:",
            cleanupError
          );
        }
      }
    }

    return res.status(500).json({
      success: false,
      error: "Vendor registration failed. Please try again.",
      failedAt: currentStep,
    });
  }
}




// =====================================================
// GET ALL VENDORS
// SUPER_ADMIN ONLY
// =====================================================

export async function getVendors(
  req: AuthRequest,
  res: Response
) {
  try {
    const vendors = await prisma.vendor.findMany({
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
            role: true,
            status: true,
          },
        },

        location: true,

        payout: true,

        storeChangeRequests: {
          where: {
            status: "PENDING",
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,

      count: vendors.length,

      data: vendors.map((vendor) => ({
        id: vendor.id,

        userId: vendor.userId,

        storeName: vendor.storeName,

        businessCategory:
          vendor.businessCategory,

        businessAddress:
          vendor.location?.fullAddress ?? null,

        location: vendor.location,

        status: vendor.status,

        commissionRate:
          vendor.commissionRate,

        payout: vendor.payout,

        fullName:
          vendor.user.fullName,

        phone:
          vendor.user.phone,

        email:
          vendor.user.email,

        role:
          vendor.user.role,

        userStatus:
          vendor.user.status,

        createdAt:
          vendor.createdAt,

        updatedAt:
          vendor.updatedAt,

        hasPendingChangeRequest: (vendor.storeChangeRequests?.length ?? 0) > 0,

        pendingChangeRequest: vendor.storeChangeRequests?.[0] ?? null,
      })),
    });
  } catch (error: any) {
    console.error(
      "Get Vendors Error:",
      error
    );

    return res.status(500).json({
      success: false,

      error:
        error?.message ||
        "Failed to fetch vendors",
    });
  }
}

// =====================================================
// GET MY STORE SETTINGS
// AUTHENTICATED VENDOR
// =====================================================

export async function getMyStoreSettings(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: "লগইন করা নেই",
      });
    }

    const vendor = await prisma.vendor.findUnique({
      where: {
        userId: req.user.id,
      },

      include: {
        user: {
          select: {
            fullName: true,
            email: true,
            phone: true,
          },
        },

        location: true,

        settings: true,

        openingHours: {
          orderBy: {
            dayOfWeek: "asc",
          },
        },
      },
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: "Vendor profile পাওয়া যায়নি",
      });
    }

    const settings = vendor.settings;

    const reviewStats = await prisma.productReview.aggregate({
      where: {
        product: { vendorId: vendor.id },
        status: "PUBLISHED",
      },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const storeRating =
      reviewStats._count.rating > 0 && reviewStats._avg.rating != null
        ? Number(reviewStats._avg.rating.toFixed(1))
        : 0;

    const totalReviews = reviewStats._count.rating;

    return res.status(200).json({
      success: true,

      data: {
        storeName:
          vendor.storeName,

        storeRating,
        rating: storeRating,
        totalReviews,

        vendorName:
          vendor.user?.fullName ?? "",

        fullName:
          vendor.user?.fullName ?? "",

        description:
          settings?.description ?? "",

        phone:
          settings?.phone ??
          vendor.user?.phone ??
          req.user.phone ??
          "",

        email:
          settings?.email ??
          vendor.user?.email ??
          req.user.email ??
          "",

        logoUrl:
          settings?.logoUrl ?? "",

        bannerUrl:
          settings?.bannerUrl ?? "",

        location: {
          division:
            vendor.location?.division ?? "",

          district:
            vendor.location?.district ?? "",

          upazila:
            vendor.location?.upazila ?? "",

          area:
            vendor.location?.area ?? "",

          fullAddress:
            vendor.location?.fullAddress ?? "",
        },

        business: {
          businessCategory:
            vendor.businessCategory ?? "",

          tradeLicenseNumber:
            vendor.tradeLicenseNumber ?? "",

          taxIdentificationNumber:
            vendor.taxIdentificationNumber ?? "",
        },

        openingHours:
          vendor.openingHours.map(
            (hour) => ({
              dayOfWeek:
                hour.dayOfWeek,

              enabled:
                hour.enabled,

              open:
                hour.open ?? "",

              close:
                hour.close ?? "",
            })
          ),

        delivery: {
          deliveryAvailable:
            settings?.deliveryAvailable ??
            true,

          cityDeliveryCharge:
            settings?.cityDeliveryCharge.toString() ??
            "0",

          outsideDeliveryCharge:
            settings?.outsideDeliveryCharge.toString() ??
            "0",

          freeDeliveryThreshold:
            settings?.freeDeliveryThreshold.toString() ??
            "0",

          deliveryTime:
            settings?.deliveryTime ?? "",
        },

        orders: {
          acceptOrders:
            settings?.acceptOrders ??
            true,

          autoConfirm:
            settings?.autoConfirm ??
            false,

          minimumOrder:
            settings?.minimumOrder.toString() ??
            "0",
        },

        payment: {
          cashOnDelivery:
            settings?.cashOnDelivery ??
            true,

          onlinePayment:
            settings?.onlinePayment ??
            false,
        },

        status: {
          storeActive:
            settings?.storeActive ??
            true,

          vacationMode:
            settings?.vacationMode ??
            false,

          vacationStart:
            settings?.vacationStart?.toISOString() ??
            null,

          vacationEnd:
            settings?.vacationEnd?.toISOString() ??
            null,
        },

        visibility: {
          showPhone:
            settings?.showPhone ??
            true,

          showEmail:
            settings?.showEmail ??
            true,

          showAddress:
            settings?.showAddress ??
            true,
        },
      },
    });
  } catch (error: any) {
    console.error(
      "Get My Store Settings Error:",
      error
    );

    return res.status(500).json({
      success: false,

      error:
        error?.message ||
        "Failed to fetch store settings",
    });
  }
}

// =====================================================
// UPDATE MY STORE SETTINGS
// AUTHENTICATED VENDOR
// =====================================================

export async function updateMyStoreSettings(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: "লগইন করা নেই",
      });
    }

    const body = req.body ?? {};

    const vendor = await prisma.vendor.findUnique({
      where: {
        userId: req.user.id,
      },

      select: {
        id: true,
      },
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: "Vendor profile পাওয়া যায়নি",
      });
    }

    const location =
      body.location ?? {};

    const business =
      body.business ?? {};

    const delivery =
      body.delivery ?? {};

    const orders =
      body.orders ?? {};

    const payment =
      body.payment ?? {};

    const status =
      body.status ?? {};

    const visibility =
      body.visibility ?? {};

    const toNullableString = (
      value: unknown
    ) =>
      value === undefined
        ? undefined
        : value === null
          ? null
          : String(value);

    const toDateOrNull = (
      value: unknown
    ): Date | null | undefined => {
      if (value === undefined) {
        return undefined;
      }

      if (value === null || value === "") {
        return null;
      }

      const date = new Date(
        String(value)
      );

      if (Number.isNaN(date.getTime())) {
        throw new Error(
          "Invalid vacation date"
        );
      }

      return date;
    };

    const toNumber = (
      value: unknown,
      fieldName: string
    ): number | undefined => {
      if (value === undefined) {
        return undefined;
      }

      const parsed = Number(value);

      if (
        !Number.isFinite(parsed) ||
        parsed < 0
      ) {
        throw new Error(
          `${fieldName} must be a valid non-negative number`
        );
      }

      return parsed;
    };

    const openingHours =
      Array.isArray(body.openingHours)
        ? body.openingHours
        : undefined;

    if (openingHours) {
      const seenDays =
        new Set<number>();

      for (const hour of openingHours) {
        const day =
          Number(hour.dayOfWeek);

        if (
          !Number.isInteger(day) ||
          day < 0 ||
          day > 6
        ) {
          return res.status(400).json({
            success: false,
            error:
              "Opening hour dayOfWeek must be between 0 and 6",
          });
        }

        if (seenDays.has(day)) {
          return res.status(400).json({
            success: false,
            error:
              "Duplicate opening hour day",
          });
        }

        seenDays.add(day);

        if (
          hour.enabled &&
          (!hour.open || !hour.close)
        ) {
          return res.status(400).json({
            success: false,
            error:
              "Open and close time are required for enabled days",
          });
        }
      }
    }

    const vacationStart =
      toDateOrNull(
        status.vacationStart
      );

    const vacationEnd =
      toDateOrNull(
        status.vacationEnd
      );

    if (
      vacationStart instanceof Date &&
      vacationEnd instanceof Date &&
      vacationEnd < vacationStart
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Vacation end date must be after start date",
      });
    }

    const settingsData = {
      description:
        toNullableString(
          body.description
        ),

      phone:
        toNullableString(
          body.phone
        ),

      email:
        toNullableString(
          body.email
        ),

      logoUrl:
        toNullableString(
          body.logoUrl
        ),

      bannerUrl:
        toNullableString(
          body.bannerUrl
        ),

      deliveryAvailable:
        delivery.deliveryAvailable ===
        undefined
          ? undefined
          : Boolean(
              delivery.deliveryAvailable
            ),

      cityDeliveryCharge:
        toNumber(
          delivery.cityDeliveryCharge,
          "cityDeliveryCharge"
        ),

      outsideDeliveryCharge:
        toNumber(
          delivery.outsideDeliveryCharge,
          "outsideDeliveryCharge"
        ),

      freeDeliveryThreshold:
        toNumber(
          delivery.freeDeliveryThreshold,
          "freeDeliveryThreshold"
        ),

      deliveryTime:
        toNullableString(
          delivery.deliveryTime
        ),

      acceptOrders:
        orders.acceptOrders ===
        undefined
          ? undefined
          : Boolean(
              orders.acceptOrders
            ),

      autoConfirm:
        orders.autoConfirm ===
        undefined
          ? undefined
          : Boolean(
              orders.autoConfirm
            ),

      minimumOrder:
        toNumber(
          orders.minimumOrder,
          "minimumOrder"
        ),

      cashOnDelivery:
        payment.cashOnDelivery ===
        undefined
          ? undefined
          : Boolean(
              payment.cashOnDelivery
            ),

      onlinePayment:
        payment.onlinePayment ===
        undefined
          ? undefined
          : Boolean(
              payment.onlinePayment
            ),

      storeActive:
        status.storeActive ===
        undefined
          ? undefined
          : Boolean(
              status.storeActive
            ),

      vacationMode:
        status.vacationMode ===
        undefined
          ? undefined
          : Boolean(
              status.vacationMode
            ),

      vacationStart,

      vacationEnd,

      showPhone:
        visibility.showPhone ===
        undefined
          ? undefined
          : Boolean(
              visibility.showPhone
            ),

      showEmail:
        visibility.showEmail ===
        undefined
          ? undefined
          : Boolean(
              visibility.showEmail
            ),

      showAddress:
        visibility.showAddress ===
        undefined
          ? undefined
          : Boolean(
              visibility.showAddress
            ),
    };

    const result =
      await prisma.$transaction(
        async (tx) => {
          const updatedVendor =
            await tx.vendor.update({
              where: {
                id: vendor.id,
              },

              data: {
                ...(body.storeName !==
                  undefined && {
                  storeName: String(
                    body.storeName
                  ).trim(),
                }),

                ...(business.businessCategory !==
                  undefined && {
                  businessCategory:
                    toNullableString(
                      business.businessCategory
                    ),
                }),

                ...(business.tradeLicenseNumber !==
                  undefined && {
                  tradeLicenseNumber:
                    toNullableString(
                      business.tradeLicenseNumber
                    ),
                }),

                ...(business.taxIdentificationNumber !==
                  undefined && {
                  taxIdentificationNumber:
                    toNullableString(
                      business.taxIdentificationNumber
                    ),
                }),
              },
            });

          if (
            location.division !==
              undefined ||
            location.district !==
              undefined ||
            location.upazila !==
              undefined ||
            location.area !==
              undefined ||
            location.fullAddress !==
              undefined
          ) {
            await tx.vendorLocation.upsert(
              {
                where: {
                  vendorId:
                    vendor.id,
                },

                create: {
                  vendorId:
                    vendor.id,

                  division: String(
                    location.division ??
                      ""
                  ),

                  district: String(
                    location.district ??
                      ""
                  ),

                  upazila: String(
                    location.upazila ??
                      ""
                  ),

                  area:
                    toNullableString(
                      location.area
                    ) ?? null,

                  fullAddress:
                    String(
                      location.fullAddress ??
                        ""
                    ),
                },

                update: {
                  ...(location.division !==
                    undefined && {
                    division: String(
                      location.division
                    ),
                  }),

                  ...(location.district !==
                    undefined && {
                    district: String(
                      location.district
                    ),
                  }),

                  ...(location.upazila !==
                    undefined && {
                    upazila: String(
                      location.upazila
                    ),
                  }),

                  ...(location.area !==
                    undefined && {
                    area:
                      toNullableString(
                        location.area
                      ),
                  }),

                  ...(location.fullAddress !==
                    undefined && {
                    fullAddress:
                      String(
                        location.fullAddress
                      ),
                  }),
                },
              }
            );
          }

          await tx.vendorSettings.upsert(
            {
              where: {
                vendorId:
                  vendor.id,
              },

              create: {
                vendorId:
                  vendor.id,

                description:
                  settingsData.description ??
                  null,

                phone:
                  settingsData.phone ??
                  null,

                email:
                  settingsData.email ??
                  null,

                logoUrl:
                  settingsData.logoUrl ??
                  null,

                bannerUrl:
                  settingsData.bannerUrl ??
                  null,

                deliveryAvailable:
                  settingsData.deliveryAvailable ??
                  true,

                cityDeliveryCharge:
                  settingsData.cityDeliveryCharge ??
                  0,

                outsideDeliveryCharge:
                  settingsData.outsideDeliveryCharge ??
                  0,

                freeDeliveryThreshold:
                  settingsData.freeDeliveryThreshold ??
                  0,

                deliveryTime:
                  settingsData.deliveryTime ??
                  null,

                acceptOrders:
                  settingsData.acceptOrders ??
                  true,

                autoConfirm:
                  settingsData.autoConfirm ??
                  false,

                minimumOrder:
                  settingsData.minimumOrder ??
                  0,

                cashOnDelivery:
                  settingsData.cashOnDelivery ??
                  true,

                onlinePayment:
                  settingsData.onlinePayment ??
                  false,

                storeActive:
                  settingsData.storeActive ??
                  true,

                vacationMode:
                  settingsData.vacationMode ??
                  false,

                vacationStart:
                  settingsData.vacationStart ??
                  null,

                vacationEnd:
                  settingsData.vacationEnd ??
                  null,

                showPhone:
                  settingsData.showPhone ??
                  true,

                showEmail:
                  settingsData.showEmail ??
                  true,

                showAddress:
                  settingsData.showAddress ??
                  true,
              },

              update:
                settingsData,
            }
          );

          if (openingHours) {
            for (
              const hour of openingHours
            ) {
              await tx.vendorOpeningHour.upsert(
                {
                  where: {
                    vendorId_dayOfWeek: {
                      vendorId:
                        vendor.id,

                      dayOfWeek:
                        Number(
                          hour.dayOfWeek
                        ),
                    },
                  },

                  create: {
                    vendorId:
                      vendor.id,

                    dayOfWeek:
                      Number(
                        hour.dayOfWeek
                      ),

                    enabled:
                      hour.enabled ===
                      undefined
                        ? true
                        : Boolean(
                            hour.enabled
                          ),

                    open: hour.open
                      ? String(
                          hour.open
                        )
                      : null,

                    close: hour.close
                      ? String(
                          hour.close
                        )
                      : null,
                  },

                  update: {
                    ...(hour.enabled !==
                      undefined && {
                      enabled: Boolean(
                        hour.enabled
                      ),
                    }),

                    ...(hour.open !==
                      undefined && {
                      open: hour.open
                        ? String(
                            hour.open
                          )
                        : null,
                    }),

                    ...(hour.close !==
                      undefined && {
                      close: hour.close
                        ? String(
                            hour.close
                          )
                        : null,
                    }),
                  },
                }
              );
            }
          }

          return updatedVendor;
        }
      );

    return res.status(200).json({
      success: true,

      message:
        "Store settings updated successfully",

      data: {
        vendorId: result.id,

        storeName:
          result.storeName,
      },
    });
  } catch (error: any) {
    console.error(
      "Update My Store Settings Error:",
      error
    );

    return res.status(400).json({
      success: false,

      error:
        error?.message ||
        "Failed to update store settings",
    });
  }
}

// =====================================================
// GET MY VENDOR PRODUCTS
// AUTHENTICATED VENDOR
// =====================================================


export async function getMyVendorProducts(
  req: AuthRequest,
  res: Response
) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Find the logged-in vendor
    const vendor = await prisma.vendor.findUnique({
      where: {
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor profile not found",
      });
    }

    // Fetch vendor products, including their coupons
    const products = await prisma.product.findMany({
      where: {
        vendorId: vendor.id,
      },
      include: {
        category: true,
        pricing: true,

        // Important: include the product coupon
        coupon: true,

        newArrivalAttribute: true,
        flashSaleAttribute: true,
        featuredAttribute: true,
        topSellerAttribute: true,
        topRatedAttribute: true,
        trustedAttribute: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Debug: verify coupon data returned by Prisma
    console.log(
      "VENDOR PRODUCTS COUPON CHECK:",
      JSON.stringify(
        products.map((product) => ({
          id: product.id,
          title: product.title,
          coupon: product.coupon,
        })),
        null,
        2
      )
    );

    // Existing stock log
    console.log(
      "Vendor product stock:",
      products.map((product) => ({
        title: product.title,
        stockQuantity: product.stockQuantity,
      }))
    );

    // Review stats for vendor store rating
    const reviewStats = await prisma.productReview.aggregate({
      where: {
        product: { vendorId: vendor.id },
        status: "PUBLISHED",
      },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const storeRating =
      reviewStats._count.rating > 0 && reviewStats._avg.rating != null
        ? Number(reviewStats._avg.rating.toFixed(1))
        : 0;

    return res.status(200).json({
      success: true,
      total: products.length,
      storeRating,
      rating: storeRating,
      totalReviews: reviewStats._count.rating,
      products,
    });
  } catch (error: unknown) {
    console.error("GET MY VENDOR PRODUCTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch vendor products",
    });
  }
}


// =====================================================
// GET PUBLIC VENDOR STORE
// =====================================================

export async function getVendorStore(
  req: AuthRequest,
  res: Response
) {
  try {
    const vendorId = String(req.params.vendorId ?? "");

    // =====================================================
    // VALIDATE VENDOR ID
    // =====================================================

    if (!vendorId) {
      return res.status(400).json({
        success: false,
        error:
          "Vendor ID is required",
      });
    }

    // =====================================================
    // GET VENDOR
    // =====================================================

    const vendor =
      await prisma.vendor.findUnique({
        where: {
          id: vendorId,
        },

        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              email: true,
            },
          },

          location: true,

          settings: true,
        },
      });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        error:
          "Vendor not found",
      });
    }

    // =====================================================
    // GET VENDOR PRODUCTS
    // =====================================================

    const products =
      await prisma.product.findMany({
        where: {
          vendorId:
            vendor.id,
        },

     include: {
  category: true,
  pricing: true,

  // Product coupon
  coupon: true,

  newArrivalAttribute: true,
  flashSaleAttribute: true,
  featuredAttribute: true,
  topSellerAttribute: true,
  topRatedAttribute: true,
  trustedAttribute: true,
},

        orderBy: {
          createdAt: "desc",
        },
      });

    // =====================================================
    // BUILD CATEGORY LIST
    // =====================================================

    const categoryMap =
      new Map<
        string,
        {
          id: string;
          name: string;
          slug: string;
          productCount: number;
        }
      >();

    for (const product of products) {
      if (!product.category) {
        continue;
      }

      const category =
        product.category;

      const existingCategory =
        categoryMap.get(
          category.id
        );

      if (existingCategory) {
        existingCategory.productCount +=
          1;
      } else {
        categoryMap.set(
          category.id,
          {
            id:
              category.id,

            name:
              category.name,

            slug:
              category.slug,

            productCount:
              1,
          }
        );
      }
    }

    const categories =
      Array.from(
        categoryMap.values()
      );

    // =====================================================
    // RESPONSE
    // =====================================================

    return res.status(200).json({
      success: true,

      data: {
        // =================================================
        // VENDOR
        // =================================================

        vendor: {
          id:
            vendor.id,

          storeName:
            vendor.storeName,

          businessCategory:
            vendor.businessCategory,

          status:
            vendor.status,

          location:
            vendor.location,

          settings:
            vendor.settings,

          user:
            vendor.user,
        },

        // =================================================
        // CATEGORIES
        // =================================================

        categories,

        // =================================================
        // PRODUCTS
        // =================================================

        products,

        // =================================================
        // TOTAL
        // =================================================

        totalProducts:
          products.length,
      },
    });
  } catch (error: any) {
    console.error(
      "GET VENDOR STORE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      error:
        error?.message ||
        "Failed to fetch vendor store",
    });getMyStoreSettings
  }
}

// =====================================================
// GET VENDOR DETAILS
// SUPER_ADMIN ONLY
// =====================================================

export const getVendorDetails =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      const vendorId = String(req.params.vendorId ?? "");

      if (!vendorId) {
        return res.status(400).json({
          success: false,
          message:
            "Vendor ID is required",
        });
      }

      const vendor =
        await prisma.vendor.findUnique({
          where: {
            id: vendorId,
          },

          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                role: true,
                status: true,
              },
            },

            location: true,

            payout: true,

            settings: true,

            storeChangeRequests: {
              orderBy: {
                createdAt: "desc",
              },
            },

            openingHours: {
              orderBy: {
                dayOfWeek:
                  "asc",
              },
            },

            products: {
              orderBy: {
                createdAt:
                  "desc",
              },

              include: {
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },

                brand: {
                  select: {
                    id: true,
                    name: true,
                    logo: true,
                  },
                },

                pricing: {
                  select: {
                    customerRegularPrice:
                      true,

                    customerSalePrice:
                      true,
                  },
                },
              },
            },
          },
        });

      if (!vendor) {
        return res.status(404).json({
          success: false,
          message:
            "Vendor not found",
        });
      }

      const totalProducts =
        vendor.products.length;

      const totalStock =
        vendor.products.reduce(
          (total, product) =>
            total +
            product.stockQuantity,
          0
        );

      const inStock =
        vendor.products.filter(
          (product) =>
            product.stockQuantity > 0
        ).length;

      const outOfStock =
        vendor.products.filter(
          (product) =>
            product.stockQuantity <=
            0
        ).length;

      const lowStock =
        vendor.products.filter(
          (product) =>
            product.stockQuantity >
              0 &&
            product.stockQuantity <=
              10
        ).length;

      const categoryMap =
        new Map<
          string,
          {
            id: string;
            name: string;
            productCount: number;
          }
        >();

      for (const product of vendor.products) {
        if (!product.category) {
          continue;
        }

        const existing =
          categoryMap.get(
            product.category.id
          );

        if (existing) {
          existing.productCount +=
            1;
        } else {
          categoryMap.set(
            product.category.id,
            {
              id:
                product.category.id,

              name:
                product.category.name,

              productCount:
                1,
            }
          );
        }
      }

      return res.status(200).json({
        success: true,

        data: {
          vendor: {
            id:
              vendor.id,

            storeName:
              vendor.storeName,

            businessCategory:
              vendor.businessCategory,

            status:
              vendor.status,

            commissionRate:
              Number(
                vendor.commissionRate
              ),

            createdAt:
              vendor.createdAt,

            updatedAt:
              vendor.updatedAt,
          },

          owner: vendor.user
            ? {
                id:
                  vendor.user.id,

                fullName:
                  vendor.user.fullName,

                email:
                  vendor.user.email,

                phone:
                  vendor.user.phone,

                role:
                  vendor.user.role,

                status:
                  vendor.user.status,
              }
            : null,

          location:
            vendor.location
              ? {
                  division:
                    vendor.location
                      .division,

                  district:
                    vendor.location
                      .district,

                  upazila:
                    vendor.location
                      .upazila,

                  area:
                    vendor.location.area,

                  fullAddress:
                    vendor.location
                      .fullAddress,

                  latitude:
                    vendor.location
                      .latitude,

                  longitude:
                    vendor.location
                      .longitude,
                }
              : null,

          verification: {
            nidNumber:
              vendor.nidNumber,

            nidDocumentUrl:
              vendor.nidDocumentUrl,

            tradeLicenseNumber:
              vendor.tradeLicenseNumber,

            tradeLicenseDocUrl:
              vendor.tradeLicenseDocUrl,

            taxIdentificationNumber:
              vendor.taxIdentificationNumber,

            tinDocUrl:
              vendor.tinDocUrl,
          },

          payout:
            vendor.payout
              ? {
                  payoutMethod:
                    vendor.payout
                      .payoutMethod,

                  bankName:
                    vendor.payout
                      .bankName,

                  bankAccountNumber:
                    vendor.payout
                      .bankAccountNumber,

                  bankAccountHolder:
                    vendor.payout
                      .bankAccountHolder,

                  mobileBankingNumber:
                    vendor.payout
                      .mobileBankingNumber,
                }
              : null,

          settings:
            vendor.settings
              ? {
                  description:
                    vendor.settings
                      .description,

                  phone:
                    vendor.settings
                      .phone,

                  email:
                    vendor.settings
                      .email,

                  logoUrl:
                    vendor.settings
                      .logoUrl,

                  bannerUrl:
                    vendor.settings
                      .bannerUrl,

                  deliveryAvailable:
                    vendor.settings
                      .deliveryAvailable,

                  cityDeliveryCharge:
                    Number(
                      vendor.settings
                        .cityDeliveryCharge
                    ),

                  outsideDeliveryCharge:
                    Number(
                      vendor.settings
                        .outsideDeliveryCharge
                    ),

                  freeDeliveryThreshold:
                    Number(
                      vendor.settings
                        .freeDeliveryThreshold
                    ),

                  deliveryTime:
                    vendor.settings
                      .deliveryTime,

                  acceptOrders:
                    vendor.settings
                      .acceptOrders,

                  autoConfirm:
                    vendor.settings
                      .autoConfirm,

                  minimumOrder:
                    Number(
                      vendor.settings
                        .minimumOrder
                    ),

                  cashOnDelivery:
                    vendor.settings
                      .cashOnDelivery,

                  onlinePayment:
                    vendor.settings
                      .onlinePayment,

                  storeActive:
                    vendor.settings
                      .storeActive,

                  vacationMode:
                    vendor.settings
                      .vacationMode,

                  vacationStart:
                    vendor.settings
                      .vacationStart,

                  vacationEnd:
                    vendor.settings
                      .vacationEnd,

                  showPhone:
                    vendor.settings
                      .showPhone,

                  showEmail:
                    vendor.settings
                      .showEmail,

                  showAddress:
                    vendor.settings
                      .showAddress,
                }
              : null,

          openingHours:
            vendor.openingHours.map(
              (hour) => ({
                id:
                  hour.id,

                dayOfWeek:
                  hour.dayOfWeek,

                enabled:
                  hour.enabled,

                open:
                  hour.open,

                close:
                  hour.close,
              })
            ),

          products:
            vendor.products.map(
              (product) => ({
                id:
                  product.id,

                title:
                  product.title,

                sku:
                  product.sku,

                slug:
                  product.slug,

                stockQuantity:
                  product.stockQuantity,

                images:
                  product.images,

                category:
                  product.category
                    ? {
                        id:
                          product
                            .category
                            .id,

                        name:
                          product
                            .category
                            .name,
                      }
                    : null,

                brand:
                  product.brand
                    ? {
                        id:
                          product.brand.id,

                        name:
                          product
                            .brand
                            .name,

                        logo:
                          product
                            .brand
                            .logo,
                      }
                    : null,

                pricing:
                  product.pricing
                    ? {
                        customerRegularPrice:
                          Number(
                            product
                              .pricing
                              .customerRegularPrice
                          ),

                        customerSalePrice:
                          product
                            .pricing
                            .customerSalePrice !==
                          null
                            ? Number(
                                product
                                  .pricing
                                  .customerSalePrice
                              )
                            : null,
                      }
                    : null,
              })
            ),

          productSummary: {
            totalProducts,

            totalStock,

            inStock,

            lowStock,

            outOfStock,
          },

          categories:
            Array.from(
              categoryMap.values()
            ),

          storeChangeRequests: vendor.storeChangeRequests || [],

          pendingChangeRequest:
            vendor.storeChangeRequests?.find(
              (r) => r.status === "PENDING"
            ) ?? null,
        },
      });
    } catch (error) {
      console.error(
        "getVendorDetails error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to load vendor details",
      });
    }
  };

// =====================================================
// UPDATE VENDOR
// SUPER_ADMIN ONLY
// =====================================================

/* =========================================================
   UPDATE VENDOR (FULL)
========================================================= */
export const updateVendor = async (req: AuthRequest, res: Response) => {
  try {
    const vendorId = String(req.params.vendorId || "");
    const {
      storeName,
      businessCategory,
      commissionRate,
      status,
      nidNumber,
      tradeLicenseNumber,
      taxIdentificationNumber,
    } = req.body;

    if (!vendorId) {
      return res.status(400).json({
        success: false,
        message: "Vendor ID is required",
      });
    }

    const updated = await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        ...(storeName !== undefined ? { storeName: storeName.trim() } : {}),
        ...(businessCategory !== undefined ? { businessCategory } : {}),
        ...(commissionRate !== undefined ? { commissionRate: Number(commissionRate) } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(nidNumber !== undefined ? { nidNumber } : {}),
        ...(tradeLicenseNumber !== undefined ? { tradeLicenseNumber } : {}),
        ...(taxIdentificationNumber !== undefined ? { taxIdentificationNumber } : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    await createActivity({
      userId: req.user?.id,
      action: "UPDATE",
      title: `ভেন্ডর প্রোফাইল আপডেট: ${updated.storeName}`,
      description: `ভেন্ডর "${updated.storeName}" এর তথ্য পরিবর্তন করা হয়েছে।`,
      entityId: updated.id,
      entityType: "VENDOR",
    });

    return res.status(200).json({
      success: true,
      message: "Vendor updated successfully",
      data: updated,
    });
  } catch (error: any) {
    console.error("UPDATE VENDOR ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to update vendor",
    });
  }
};

/* =========================================================
   UPDATE VENDOR STATUS (APPROVE / REJECT / SUSPEND)
========================================================= */
export async function updateVendorStatus(req: AuthRequest, res: Response) {
  try {
    const vendorId = String(req.params.vendorId || "");
    const { status, reason } = req.body;

    if (!vendorId) {
      return res.status(400).json({ success: false, message: "Vendor ID is required" });
    }

    if (!["PENDING", "APPROVED", "REJECTED", "SUSPENDED"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid vendor status" });
    }

    const existingVendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: { user: true },
    });

    if (!existingVendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }

    const updatedVendor = await prisma.$transaction(async (tx) => {
      const vendor = await tx.vendor.update({
        where: { id: vendorId },
        data: { status },
      });

      if (status === "APPROVED") {
        await tx.user.update({
          where: { id: existingVendor.userId },
          data: {
            role: "VENDOR",
            status: "ACTIVE",
          },
        });
      } else if (status === "SUSPENDED") {
        await tx.user.update({
          where: { id: existingVendor.userId },
          data: {
            status: "SUSPENDED",
          },
        });
      }

      return vendor;
    });

    const statusLabels: Record<string, string> = {
      APPROVED: "অনুমোদন করা হয়েছে",
      REJECTED: "বাতিল করা হয়েছে",
      SUSPENDED: "স্থগিত করা হয়েছে",
      PENDING: "পেন্ডিং করা হয়েছে",
    };

    const actionText = statusLabels[status] || status;
    const titleLog = `ভেন্ডর ${actionText}: ${existingVendor.storeName}`;
    const descLog = `অ্যাডমিন (${req.user?.fullName || req.user?.email || "Admin"}) ভেন্ডর "${existingVendor.storeName}" কে ${actionText}।`;

    await createActivity({
      userId: req.user?.id,
      action: status === "APPROVED" ? "APPROVE" : status === "REJECTED" ? "REJECT" : "UPDATE",
      title: titleLog,
      description: descLog,
      entityId: existingVendor.id,
      entityType: "VENDOR",
    });

    const userNotificationMessages: Record<string, { title: string; message: string }> = {
      APPROVED: {
        title: "আপনার ভেন্ডর একাউন্ট অনুমোদিত হয়েছে!",
        message: `অভিনন্দন! আপনার স্টোর "${existingVendor.storeName}" অনুমোদিত হয়েছে। এখন আপনি প্রোডাক্ট আপলোড ও ব্যবসা শুরু করতে পারেন।`,
      },
      REJECTED: {
        title: "ভেন্ডর আবেদন বাতিল করা হয়েছে",
        message: `দুঃখিত, আপনার স্টোর "${existingVendor.storeName}" এর আবেদনটি অ্যাডমিন দ্বারা বাতিল করা হয়েছে। ${reason ? `কারণ: ${reason}` : "বিস্তারিত তথ্যের জন্য সাপোর্টে যোগাযোগ করুন।"}`,
      },
      SUSPENDED: {
        title: "আপনার ভেন্ডর একাউন্ট সাময়িকভাবে স্থগিত করা হয়েছে",
        message: `আপনার স্টোর "${existingVendor.storeName}" সাময়িকভাবে স্থগিত করা হয়েছে। আরও জানতে সাপোর্টে যোগাযোগ করুন।`,
      },
    };

    if (userNotificationMessages[status]) {
      await createNotification({
        userId: existingVendor.userId,
        type: `VENDOR_${status}`,
        title: userNotificationMessages[status].title,
        message: userNotificationMessages[status].message,
        entityId: existingVendor.id,
        entityType: "VENDOR",
      });
    }

    await notifyAdmins({
      type: `VENDOR_${status}`,
      title: titleLog,
      message: descLog,
      entityId: existingVendor.id,
      entityType: "VENDOR",
    });

    return res.status(200).json({
      success: true,
      message: `Vendor status updated to ${status} successfully`,
      data: updatedVendor,
    });
  } catch (error: any) {
    console.error("UPDATE VENDOR STATUS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to update vendor status",
    });
  }
}

/* =========================================================
   BULK UPDATE VENDOR STATUS
========================================================= */
export async function bulkUpdateVendorStatus(req: AuthRequest, res: Response) {
  try {
    const ids = req.body.ids || req.body.vendorIds;
    const status = req.body.status;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "Vendor IDs array is required" });
    }

    if (!["PENDING", "APPROVED", "REJECTED", "SUSPENDED"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid vendor status" });
    }

    const vendors = await prisma.vendor.findMany({
      where: { id: { in: ids } },
      select: { id: true, userId: true, storeName: true },
    });

    await prisma.$transaction(async (tx) => {
      await tx.vendor.updateMany({
        where: { id: { in: ids } },
        data: { status },
      });

      const userIds = vendors.map((v) => v.userId);
      if (status === "APPROVED") {
        await tx.user.updateMany({
          where: { id: { in: userIds } },
          data: { role: "VENDOR", status: "ACTIVE" },
        });
      } else if (status === "SUSPENDED") {
        await tx.user.updateMany({
          where: { id: { in: userIds } },
          data: { status: "SUSPENDED" },
        });
      }
    });

    await createActivity({
      userId: req.user?.id,
      action: status === "APPROVED" ? "APPROVE" : "UPDATE",
      title: `${vendors.length}টি ভেন্ডর আপডেট করা হয়েছে (${status})`,
      description: `অ্যাডমিন একযোগে ${vendors.length}টি ভেন্ডরের স্ট্যাটাস "${status}" করেছে।`,
      entityType: "VENDOR",
    });

    await notifyAdmins({
      type: "VENDOR_BULK_STATUS_UPDATED",
      title: `${vendors.length}টি ভেন্ডর স্ট্যাটাস পরিবর্তন (${status})`,
      message: `অ্যাডমিন একযোগে ${vendors.length}টি ভেন্ডরের স্ট্যাটাস "${status}" করেছে।`,
      entityType: "VENDOR",
    });

    return res.status(200).json({
      success: true,
      message: `${vendors.length} vendors updated to ${status} successfully`,
    });
  } catch (error: any) {
    console.error("BULK UPDATE VENDOR STATUS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to update vendors",
    });
  }
}

/* =========================================================
   DELETE VENDOR (ADMIN)
========================================================= */
export async function deleteVendor(req: AuthRequest, res: Response) {
  try {
    const vendorId = String(req.params.vendorId || "");
    if (!vendorId) {
      return res.status(400).json({ success: false, message: "Vendor ID is required" });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: { user: true },
    });

    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }

    const targetUserId = vendor.userId;

    await prisma.$transaction(
      async (tx) => {
        // 1. Delete order-related items & earnings for this vendor concurrently
        await Promise.all([
          tx.courierShipment.deleteMany({
            where: { vendorOrder: { vendorId } },
          }),
          tx.payment.deleteMany({
            where: { vendorOrder: { vendorId } },
          }),
          tx.vendorOrderItem.deleteMany({
            where: { order: { vendorId } },
          }),
          tx.vendorEarning.deleteMany({ where: { vendorId } }),
          tx.customerOrderItem.deleteMany({ where: { vendorId } }),
        ]);

        await tx.vendorOrder.deleteMany({ where: { vendorId } });

        // 2. Find and delete all products & related records
        const products = await tx.product.findMany({
          where: { vendorId },
          select: { id: true },
        });
        const productIds = products.map((p) => p.id);

        if (productIds.length > 0) {
          await Promise.all([
            tx.cartItem.deleteMany({ where: { productId: { in: productIds } } }),
            tx.wishlistItem.deleteMany({ where: { productId: { in: productIds } } }),
            tx.customerOrderItem.deleteMany({ where: { productId: { in: productIds } } }),
            tx.vendorOrderItem.deleteMany({ where: { productId: { in: productIds } } }),
            tx.productReview.deleteMany({ where: { productId: { in: productIds } } }),
            tx.productDeliveryRate.deleteMany({
              where: { productDelivery: { productId: { in: productIds } } },
            }),
            tx.productCoupon.deleteMany({ where: { productId: { in: productIds } } }),
            tx.productPricing.deleteMany({ where: { productId: { in: productIds } } }),
            tx.newArrivalAttribute.deleteMany({ where: { productId: { in: productIds } } }),
            tx.flashSaleAttribute.deleteMany({ where: { productId: { in: productIds } } }),
            tx.featuredAttribute.deleteMany({ where: { productId: { in: productIds } } }),
            tx.topSellerAttribute.deleteMany({ where: { productId: { in: productIds } } }),
            tx.topRatedAttribute.deleteMany({ where: { productId: { in: productIds } } }),
            tx.trustedAttribute.deleteMany({ where: { productId: { in: productIds } } }),
          ]);

          await tx.productDelivery.deleteMany({ where: { productId: { in: productIds } } });
          await tx.product.deleteMany({ where: { id: { in: productIds } } });
        }

        // 3. Delete vendor profile details concurrently
        await Promise.all([
          tx.vendorOpeningHour.deleteMany({ where: { vendorId } }),
          tx.vendorLocation.deleteMany({ where: { vendorId } }),
          tx.vendorPayout.deleteMany({ where: { vendorId } }),
          tx.vendorSettings.deleteMany({ where: { vendorId } }),
          tx.vendorPayoutTransaction.deleteMany({ where: { vendorId } }),
        ]);

        // 4. Delete the vendor record
        await tx.vendor.delete({ where: { id: vendorId } });

        // 5. Delete associated user account completely from database
        if (targetUserId && targetUserId !== req.user?.id) {
          await cleanupAndCascadeDeleteUsers(tx, [targetUserId]);
        }
      },
      {
        maxWait: 15000,
        timeout: 45000,
      }
    );

    // 6. Delete from Supabase Auth as well
    if (targetUserId && targetUserId !== req.user?.id) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(targetUserId);
      } catch (authErr) {
        console.warn("Could not delete vendor user from Supabase Auth:", authErr);
      }
    }

    await createActivity({
      userId: req.user?.id,
      action: "DELETE",
      title: `ভেন্ডর মুছে ফেলা হয়েছে: ${vendor.storeName}`,
      description: `অ্যাডমিন (${req.user?.fullName || req.user?.email || "Admin"}) ভেন্ডর "${vendor.storeName}" এবং সংশ্লিষ্ট অ্যাকাউন্ট স্থায়ীভাবে মুছে ফেলেছে।`,
      entityType: "VENDOR",
    });

    await notifyAdmins({
      type: "VENDOR_DELETED",
      title: `ভেন্ডর মুছে ফেলা হয়েছে: ${vendor.storeName}`,
      message: `অ্যাডমিন (${req.user?.fullName || req.user?.email || "Admin"}) ভেন্ডর "${vendor.storeName}" এবং সংশ্লিষ্ট অ্যাকাউন্ট ডাটাবেজ থেকে স্থায়ীভাবে মুছে ফেলেছে।`,
      entityType: "VENDOR",
    });

    return res.status(200).json({
      success: true,
      message: `Vendor "${vendor.storeName}" deleted successfully`,
    });
  } catch (error: any) {
    console.error("DELETE VENDOR ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to delete vendor",
    });
  }
}

/* =========================================================
   BULK DELETE VENDORS (ADMIN)
========================================================= */
export async function bulkDeleteVendors(req: AuthRequest, res: Response) {
  try {
    const ids = req.body.ids || req.body.vendorIds;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "Vendor IDs array is required" });
    }

    const vendors = await prisma.vendor.findMany({
      where: { id: { in: ids } },
      select: { id: true, userId: true, storeName: true },
    });

    if (vendors.length === 0) {
      return res.status(404).json({ success: false, message: "No vendors found" });
    }

    const vendorIds = vendors.map((v) => v.id);
    const userIds = vendors
      .map((v) => v.userId)
      .filter((uid): uid is string => Boolean(uid) && uid !== req.user?.id);

    await prisma.$transaction(
      async (tx) => {
        // 1. Delete order-related items & earnings concurrently
        await Promise.all([
          tx.courierShipment.deleteMany({
            where: { vendorOrder: { vendorId: { in: vendorIds } } },
          }),
          tx.payment.deleteMany({
            where: { vendorOrder: { vendorId: { in: vendorIds } } },
          }),
          tx.vendorOrderItem.deleteMany({
            where: { order: { vendorId: { in: vendorIds } } },
          }),
          tx.vendorEarning.deleteMany({ where: { vendorId: { in: vendorIds } } }),
          tx.customerOrderItem.deleteMany({ where: { vendorId: { in: vendorIds } } }),
        ]);

        await tx.vendorOrder.deleteMany({ where: { vendorId: { in: vendorIds } } });

        // 2. Find and delete all products & related records
        const products = await tx.product.findMany({
          where: { vendorId: { in: vendorIds } },
          select: { id: true },
        });
        const productIds = products.map((p) => p.id);

        if (productIds.length > 0) {
          await Promise.all([
            tx.cartItem.deleteMany({ where: { productId: { in: productIds } } }),
            tx.wishlistItem.deleteMany({ where: { productId: { in: productIds } } }),
            tx.customerOrderItem.deleteMany({ where: { productId: { in: productIds } } }),
            tx.vendorOrderItem.deleteMany({ where: { productId: { in: productIds } } }),
            tx.productReview.deleteMany({ where: { productId: { in: productIds } } }),
            tx.productDeliveryRate.deleteMany({
              where: { productDelivery: { productId: { in: productIds } } },
            }),
            tx.productCoupon.deleteMany({ where: { productId: { in: productIds } } }),
            tx.productPricing.deleteMany({ where: { productId: { in: productIds } } }),
            tx.newArrivalAttribute.deleteMany({ where: { productId: { in: productIds } } }),
            tx.flashSaleAttribute.deleteMany({ where: { productId: { in: productIds } } }),
            tx.featuredAttribute.deleteMany({ where: { productId: { in: productIds } } }),
            tx.topSellerAttribute.deleteMany({ where: { productId: { in: productIds } } }),
            tx.topRatedAttribute.deleteMany({ where: { productId: { in: productIds } } }),
            tx.trustedAttribute.deleteMany({ where: { productId: { in: productIds } } }),
          ]);

          await tx.productDelivery.deleteMany({ where: { productId: { in: productIds } } });
          await tx.product.deleteMany({ where: { id: { in: productIds } } });
        }

        // 3. Delete vendor profile details concurrently
        await Promise.all([
          tx.vendorOpeningHour.deleteMany({ where: { vendorId: { in: vendorIds } } }),
          tx.vendorLocation.deleteMany({ where: { vendorId: { in: vendorIds } } }),
          tx.vendorPayout.deleteMany({ where: { vendorId: { in: vendorIds } } }),
          tx.vendorSettings.deleteMany({ where: { vendorId: { in: vendorIds } } }),
          tx.vendorPayoutTransaction.deleteMany({ where: { vendorId: { in: vendorIds } } }),
        ]);

        // 4. Delete vendor records
        await tx.vendor.deleteMany({ where: { id: { in: vendorIds } } });

        // 5. Delete associated users completely from database
        const userIdsToDelete = userIds.filter((uid) => uid !== req.user?.id);
        if (userIdsToDelete.length > 0) {
          await cleanupAndCascadeDeleteUsers(tx, userIdsToDelete);
        }
      },
      {
        maxWait: 15000,
        timeout: 45000,
      }
    );

    for (const uid of userIds) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(uid);
      } catch (authErr) {
        console.warn("Could not delete vendor user from Supabase Auth:", authErr);
      }
    }

    await createActivity({
      userId: req.user?.id,
      action: "DELETE",
      title: `${vendors.length}টি ভেন্ডর মুছে ফেলা হয়েছে`,
      description: `অ্যাডমিন একযোগে ${vendors.length}টি ভেন্ডর এবং তাদের অ্যাকাউন্ট মুছে ফেলেছে।`,
      entityType: "VENDOR",
    });

    await notifyAdmins({
      type: "VENDOR_BULK_DELETED",
      title: `${vendors.length}টি ভেন্ডর মুছে ফেলা হয়েছে`,
      message: `অ্যাডমিন (${req.user?.fullName || req.user?.email || "Admin"}) একযোগে ${vendors.length}টি ভেন্ডর এবং তাদের অ্যাকাউন্ট মুছে ফেলেছে।`,
      entityType: "VENDOR",
    });

    return res.status(200).json({
      success: true,
      message: `${vendors.length} vendors deleted successfully`,
    });
  } catch (error: any) {
    console.error("BULK DELETE VENDORS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to delete vendors",
    });
  }
}

// =====================================================
// VENDOR STORE CHANGE REQUESTS
// =====================================================

export async function requestStoreChange(req: AuthRequest, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: "লগইন করা নেই",
      });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: req.user.id },
      include: {
        user: { select: { fullName: true, phone: true } },
      },
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: "Vendor profile পাওয়া যায়নি",
      });
    }

    // Check if there is already a PENDING request
    const existingPending = await prisma.vendorStoreChangeRequest.findFirst({
      where: {
        vendorId: vendor.id,
        status: "PENDING",
      },
    });

    if (existingPending) {
      return res.status(400).json({
        success: false,
        error:
          "আপনার পূর্বের পরিবর্তনের অনুরোধ এখনও প্রক্রিয়াধীন রয়েছে। অ্যাডমিন পর্যালোচনা করার পর নতুন অনুরোধ পাঠানো যাবে।",
      });
    }

    const {
      storeName,
      ownerName,
      phone,
      businessCategory,
      tradeLicenseNumber,
      nidNumber,
      taxIdentificationNumber,
      reason,
    } = req.body ?? {};

    // Validate that at least one field has changed
    const hasAnyChange =
      (storeName && String(storeName).trim() !== vendor.storeName) ||
      (ownerName && String(ownerName).trim() !== (vendor.user.fullName || "")) ||
      (phone && String(phone).trim() !== (vendor.user.phone || "")) ||
      (businessCategory && String(businessCategory).trim() !== (vendor.businessCategory || "")) ||
      (tradeLicenseNumber && String(tradeLicenseNumber).trim() !== (vendor.tradeLicenseNumber || "")) ||
      (nidNumber && String(nidNumber).trim() !== (vendor.nidNumber || "")) ||
      (taxIdentificationNumber && String(taxIdentificationNumber).trim() !== (vendor.taxIdentificationNumber || ""));

    if (!hasAnyChange) {
      return res.status(400).json({
        success: false,
        error: "তথ্য পরিবর্তন করার জন্য কমপক্ষে একটি নতুন তথ্য প্রদান করুন।",
      });
    }

    const changeRequest = await prisma.vendorStoreChangeRequest.create({
      data: {
        vendorId: vendor.id,
        status: "PENDING",

        // New requested values
        storeName: storeName ? String(storeName).trim() : null,
        ownerName: ownerName ? String(ownerName).trim() : null,
        phone: phone ? String(phone).trim() : null,
        businessCategory: businessCategory ? String(businessCategory).trim() : null,
        tradeLicenseNumber: tradeLicenseNumber ? String(tradeLicenseNumber).trim() : null,
        nidNumber: nidNumber ? String(nidNumber).trim() : null,
        taxIdentificationNumber: taxIdentificationNumber ? String(taxIdentificationNumber).trim() : null,

        // Old values at the time of request
        oldStoreName: vendor.storeName,
        oldOwnerName: vendor.user.fullName,
        oldPhone: vendor.user.phone,
        oldBusinessCategory: vendor.businessCategory,
        oldTradeLicenseNumber: vendor.tradeLicenseNumber,
        oldNidNumber: vendor.nidNumber,
        oldTaxIdNumber: vendor.taxIdentificationNumber,

        reason: reason ? String(reason).trim() : null,
      },
    });

    // Notify admins
    await notifyAdmins({
      type: "VENDOR_STORE_CHANGE_REQUEST",
      title: "দোকানের তথ্য পরিবর্তনের অনুরোধ",
      message: `${vendor.storeName} ভেন্ডর তাদের দোকানের তথ্য (${storeName ? `নতুন নাম: ${storeName}` : "নতুন প্রোফাইল তথ্য"}) পরিবর্তনের আবেদন করেছেন।`,
      entityId: changeRequest.id,
      entityType: "VENDOR_CHANGE_REQUEST",
    });

    return res.status(201).json({
      success: true,
      message:
        "তথ্য পরিবর্তনের অনুরোধ সফলভাবে অ্যাডমিনের কাছে পাঠানো হয়েছে। অ্যাডমিন অনুমোদন দিলে এটি আপডেট হবে।",
      data: changeRequest,
    });
  } catch (error: any) {
    console.error("Request Store Change Error:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "তথ্য পরিবর্তনের অনুরোধ পাঠাতে ব্যর্থ হয়েছে",
    });
  }
}

export async function getMyStoreChangeRequests(req: AuthRequest, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: "লগইন করা নেই",
      });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: req.user.id },
      select: { id: true },
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: "Vendor profile পাওয়া যায়নি",
      });
    }

    const requests = await prisma.vendorStoreChangeRequest.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: "desc" },
    });

    const pendingRequest = requests.find((r) => r.status === "PENDING") ?? null;

    return res.status(200).json({
      success: true,
      data: requests,
      pendingRequest,
    });
  } catch (error: any) {
    console.error("Get My Store Change Requests Error:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "অনুরোধ তালিকা আনতে সমস্যা হয়েছে",
    });
  }
}

export async function getAdminVendorChangeRequests(req: AuthRequest, res: Response) {
  try {
    const { status } = req.query;

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }

    const requests = await prisma.vendorStoreChangeRequest.findMany({
      where,
      include: {
        vendor: {
          select: {
            id: true,
            storeName: true,
            businessCategory: true,
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const pendingCount = await prisma.vendorStoreChangeRequest.count({
      where: { status: "PENDING" },
    });

    return res.status(200).json({
      success: true,
      data: requests,
      pendingCount,
    });
  } catch (error: any) {
    console.error("Get Admin Vendor Change Requests Error:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to fetch change requests",
    });
  }
}

export async function reviewVendorChangeRequest(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id ?? "");
    const { status, adminNote } = req.body ?? {};

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status. Must be APPROVED or REJECTED",
      });
    }

    const changeRequest = await prisma.vendorStoreChangeRequest.findUnique({
      where: { id },
      include: {
        vendor: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!changeRequest) {
      return res.status(404).json({
        success: false,
        error: "অনুরোধটি পাওয়া যায়নি",
      });
    }

    if (changeRequest.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        error: `এই অনুরোধটি ইতিমধ্যে ${changeRequest.status === "APPROVED" ? "অনুমোদিত" : "বাতিল"} করা হয়েছে`,
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update the request status
      const updatedReq = await tx.vendorStoreChangeRequest.update({
        where: { id },
        data: {
          status,
          adminNote: adminNote ? String(adminNote).trim() : null,
          reviewedAt: new Date(),
          reviewedBy: req.user?.id ?? null,
        },
      });

      // 2. If approved, apply changes to Vendor and User
      if (status === "APPROVED") {
        const vendorUpdateData: any = {};
        if (changeRequest.storeName) vendorUpdateData.storeName = changeRequest.storeName;
        if (changeRequest.businessCategory) vendorUpdateData.businessCategory = changeRequest.businessCategory;
        if (changeRequest.tradeLicenseNumber) vendorUpdateData.tradeLicenseNumber = changeRequest.tradeLicenseNumber;
        if (changeRequest.nidNumber) vendorUpdateData.nidNumber = changeRequest.nidNumber;
        if (changeRequest.taxIdentificationNumber) vendorUpdateData.taxIdentificationNumber = changeRequest.taxIdentificationNumber;

        if (Object.keys(vendorUpdateData).length > 0) {
          await tx.vendor.update({
            where: { id: changeRequest.vendorId },
            data: vendorUpdateData,
          });
        }

        const userUpdateData: any = {};
        if (changeRequest.ownerName) userUpdateData.fullName = changeRequest.ownerName;
        if (changeRequest.phone) userUpdateData.phone = changeRequest.phone;

        if (Object.keys(userUpdateData).length > 0) {
          await tx.user.update({
            where: { id: changeRequest.vendor.userId },
            data: userUpdateData,
          });
        }
      }

      return updatedReq;
    });

    // 3. Send notification to vendor
    if (changeRequest.vendor?.userId) {
      await createNotification({
        userId: changeRequest.vendor.userId,
        type: "STORE_CHANGE_REQUEST_RESULT",
        title:
          status === "APPROVED"
            ? "দোকানের তথ্য পরিবর্তন অনুমোদিত হয়েছে"
            : "তথ্য পরিবর্তনের অনুরোধ বাতিল হয়েছে",
        message:
          status === "APPROVED"
            ? "আপনার দোকানের তথ্যের পরিবর্তন অনুরোধটি অ্যাডমিন অনুমোদন করেছেন। আপনার তথ্য সফলভাবে আপডেট করা হয়েছে।"
            : `আপনার দোকানের তথ্য পরিবর্তনের অনুরোধটি বাতিল করা হয়েছে।${adminNote ? ` কারণ: ${adminNote}` : ""}`,
        entityId: changeRequest.id,
        entityType: "VENDOR_CHANGE_REQUEST",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        status === "APPROVED"
          ? "অনুরোধটি অনুমোদিত হয়েছে এবং তথ্য আপডেট করা হয়েছে।"
          : "অনুরোধটি বাতিল করা হয়েছে।",
      data: result,
    });
  } catch (error: any) {
    console.error("Review Vendor Change Request Error:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "অনুরোধ পর্যালোচনা করতে ব্যর্থ হয়েছে",
    });
  }
}
