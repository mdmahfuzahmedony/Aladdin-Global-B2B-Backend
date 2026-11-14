
import { Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middleware/auth-middleware";
import { createActivity } from "../services/activity-service";
import { notifyAdmins } from "../services/notification-service";

// =====================================================
// CREATE PRODUCT
// =====================================================



export async function createProduct(
  req: AuthRequest,
  res: Response
) {
  try {
    const {
      title,
      slug,
      sku,
      shortDescription,
      description,
      stockQuantity,
      categoryId,
      vendorId,
      attributes,
      customFields,
      images,

      // Customer pricing
      customerRegularPrice,
      customerSalePrice,

      // Vendor / Retailer pricing
      sellerRegularPrice,
      sellerSalePrice,

      // Wholesaler pricing
      wholesalerRegularPrice,
      wholesalerSalePrice,

      // Dropshipping
      dropshipPrice,

      // Affiliate
      affiliateCommissionType,
      affiliateCommissionValue,

      // Home placements
      placements,

      // Delivery settings
      deliverySettings,

      // Product coupon
      coupon,
    } = req.body;

    // AUTHENTICATION
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    // BASIC VALIDATION
    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        success: false,
        error: "Product title is required",
      });
    }

    if (typeof slug !== "string" || !slug.trim()) {
      return res.status(400).json({
        success: false,
        error: "Product slug is required",
      });
    }

    if (typeof sku !== "string" || !sku.trim()) {
      return res.status(400).json({
        success: false,
        error: "Product SKU is required",
      });
    }

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        error: "Category is required",
      });
    }

    if (
      stockQuantity === undefined ||
      stockQuantity === null ||
      stockQuantity === "" ||
      !Number.isFinite(Number(stockQuantity)) ||
      !Number.isInteger(Number(stockQuantity)) ||
      Number(stockQuantity) < 0
    ) {
      return res.status(400).json({
        success: false,
        error: "Valid stock quantity is required",
      });
    }

    // =====================================================
    // NORMALIZE PRODUCT SLUG
    // =====================================================

    let decodedSlug = slug.trim();

    try {
      decodedSlug = decodeURIComponent(decodedSlug);
    } catch {
      decodedSlug = slug.trim();
    }

    const finalSlug = decodedSlug
      .normalize("NFC")
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    if (!finalSlug) {
      return res.status(400).json({
        success: false,
        error: "Invalid product slug",
      });
    }

    console.log("PRODUCT SLUG:", {
      original: slug,
      final: finalSlug,
    });

    // =====================================================
    // COUPON VALIDATION
    // =====================================================

    let couponData:
      | {
          couponName: string;
          discount: number;
          isActive: boolean;
        }
      | null = null;

    if (coupon !== undefined && coupon !== null && coupon !== false) {
      if (
        typeof coupon !== "object" ||
        Array.isArray(coupon)
      ) {
        return res.status(400).json({
          success: false,
          error: "Invalid coupon data",
        });
      }

      if (
        typeof coupon.couponName !== "string" ||
        !coupon.couponName.trim()
      ) {
        return res.status(400).json({
          success: false,
          error: "Coupon name is required",
        });
      }

      const discount = Number(coupon.discount);

      if (
        coupon.discount === undefined ||
        coupon.discount === null ||
        coupon.discount === "" ||
        !Number.isFinite(discount) ||
        discount <= 0
      ) {
        return res.status(400).json({
          success: false,
          error: "Coupon discount must be greater than 0",
        });
      }

      if (
        coupon.isActive !== undefined &&
        typeof coupon.isActive !== "boolean"
      ) {
        return res.status(400).json({
          success: false,
          error: "Invalid coupon status",
        });
      }

      couponData = {
        couponName: coupon.couponName.trim().toUpperCase(),
        discount,
        isActive: coupon.isActive ?? true,
      };
    }

    // =====================================================
    // DELIVERY SETTINGS VALIDATION
    // =====================================================

    type DeliveryRateInput = {
      minDistanceKm: number;
      maxDistanceKm: number;
      firstKgCharge: number;
      additionalKgCharge: number;
    };

    type DeliveryInput = {
      scope: "UPAZILA_BASED" | "NATIONWIDE";
      weightKg: number | null;
      nationwideCharge?: number | null;
      rates: DeliveryRateInput[];
    };

    let deliveryData: DeliveryInput | undefined;

    if (deliverySettings !== undefined && deliverySettings !== null) {
      if (
        typeof deliverySettings !== "object" ||
        Array.isArray(deliverySettings)
      ) {
        return res.status(400).json({
          success: false,
          error: "Invalid delivery settings",
        });
      }

      const { scope, weightKg, rates, nationwideCharge } = deliverySettings;

      if (
        scope !== "UPAZILA_BASED" &&
        scope !== "NATIONWIDE"
      ) {
        return res.status(400).json({
          success: false,
          error: "Valid delivery scope is required",
        });
      }

      if (scope === "NATIONWIDE") {
        const parsedNationwideCharge = Number(nationwideCharge);

        if (
          nationwideCharge === undefined ||
          nationwideCharge === null ||
          nationwideCharge === "" ||
          !Number.isFinite(parsedNationwideCharge) ||
          parsedNationwideCharge < 0
        ) {
          return res.status(400).json({
            success: false,
            error: "Nationwide delivery charge must be 0 or greater",
          });
        }

        deliveryData = {
          scope: "NATIONWIDE",
          weightKg: null,
          nationwideCharge: parsedNationwideCharge,
          rates: [],
        };
      } else {
        if (
          weightKg === undefined ||
          weightKg === null ||
          weightKg === "" ||
          !Number.isFinite(Number(weightKg)) ||
          Number(weightKg) <= 0
        ) {
          return res.status(400).json({
            success: false,
            error: "Product weight must be greater than 0",
          });
        }

        if (!Array.isArray(rates) || rates.length === 0) {
          return res.status(400).json({
            success: false,
            error: "At least one delivery rate is required",
          });
        }

        const parsedRates: DeliveryRateInput[] = [];

        for (const rate of rates) {
          if (
            !rate ||
            typeof rate !== "object" ||
            Array.isArray(rate)
          ) {
            return res.status(400).json({
              success: false,
              error: "Invalid delivery rate",
            });
          }

          const parsedRate: DeliveryRateInput = {
            minDistanceKm: Number(rate.minDistanceKm),
            maxDistanceKm: Number(rate.maxDistanceKm),
            firstKgCharge: Number(rate.firstKgCharge),
            additionalKgCharge: Number(rate.additionalKgCharge),
          };

          if (
            !Number.isInteger(parsedRate.minDistanceKm) ||
            !Number.isInteger(parsedRate.maxDistanceKm) ||
            parsedRate.minDistanceKm < 0 ||
            parsedRate.maxDistanceKm <= parsedRate.minDistanceKm
          ) {
            return res.status(400).json({
              success: false,
              error: "Invalid delivery distance range",
            });
          }

          if (
            !Number.isFinite(parsedRate.firstKgCharge) ||
            !Number.isFinite(parsedRate.additionalKgCharge) ||
            parsedRate.firstKgCharge < 0 ||
            parsedRate.additionalKgCharge < 0
          ) {
            return res.status(400).json({
              success: false,
              error: "Invalid delivery charges",
            });
          }

          parsedRates.push(parsedRate);
        }

        parsedRates.sort(
          (a, b) => a.minDistanceKm - b.minDistanceKm
        );

        for (let i = 1; i < parsedRates.length; i++) {
          if (
            parsedRates[i].minDistanceKm !==
            parsedRates[i - 1].maxDistanceKm
          ) {
            return res.status(400).json({
              success: false,
              error:
                "Delivery distance ranges must be continuous and non-overlapping",
            });
          }
        }

        deliveryData = {
          scope: "UPAZILA_BASED",
          weightKg: Number(weightKg),
          rates: parsedRates,
        };
      }
    }

    // CHECK CATEGORY
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return res.status(400).json({
        success: false,
        error: "Selected category does not exist",
      });
    }

    // FIND VENDOR
    let finalVendorId: string;

    const isAdminOrManager =
      req.user.role === "SUPER_ADMIN" ||
      req.user.role === "MANAGER";

    if (vendorId && typeof vendorId === "string" && vendorId.trim()) {
      const vendor = await prisma.vendor.findFirst({
        where: {
          OR: [
            { id: vendorId.trim() },
            { userId: vendorId.trim() },
          ],
        },
      });

      if (!vendor) {
        return res.status(400).json({
          success: false,
          error: "Selected vendor does not exist",
        });
      }

      if (!isAdminOrManager && vendor.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: "You are not authorized to create products for another vendor",
        });
      }

      finalVendorId = vendor.id;
    } else if (req.user.role === "VENDOR") {
      const vendor = await prisma.vendor.findUnique({
        where: { userId: req.user.id },
      });

      if (!vendor) {
        return res.status(403).json({
          success: false,
          error: "Vendor profile not found",
        });
      }

      finalVendorId = vendor.id;
    } else {
      if (!vendorId) {
        return res.status(400).json({
          success: false,
          error: "Vendor is required when creating a product as admin.",
        });
      }

      const vendor = await prisma.vendor.findUnique({
        where: { id: vendorId },
      });

      if (!vendor) {
        return res.status(400).json({
          success: false,
          error: "Selected vendor does not exist",
        });
      }

      finalVendorId = vendor.id;
    }

    // CHECK DUPLICATE SLUG
    const existingProduct = await prisma.product.findUnique({
      where: { slug: finalSlug },
    });

    if (existingProduct) {
      return res.status(409).json({
        success: false,
        error: "A product with this slug already exists",
      });
    }

    // CHECK DUPLICATE SKU
    const existingSku = await prisma.product.findUnique({
      where: { sku: sku.trim() },
    });

    if (existingSku) {
      return res.status(409).json({
        success: false,
        error: "A product with this SKU already exists",
      });
    }

    // =====================================================
    // CREATE PRODUCT, COUPON, PRICING AND PLACEMENTS
    // =====================================================

    const result = await prisma.$transaction(
      async (tx) => {
        // CREATE PRODUCT
        const product = await tx.product.create({
          data: {
            title: title.trim(),
            slug: finalSlug,
            sku: sku.trim(),

            shortDescription:
              typeof shortDescription === "string"
                ? shortDescription.trim() || null
                : null,

            description:
              typeof description === "string"
                ? description.trim() || null
                : null,

            stockQuantity: Number(stockQuantity),

            category: {
              connect: { id: categoryId },
            },

            vendor: {
              connect: { id: finalVendorId },
            },

            attributes: attributes ?? null,
            customFields: customFields ?? null,
            images: Array.isArray(images) ? images : [],

            ...(deliveryData
              ? {
                  deliverySettings: {
                    create: {
                      scope: deliveryData.scope,
                      weightKg: deliveryData.weightKg,
                      nationwideCharge:
                        deliveryData.nationwideCharge ?? null,
                      rates: {
                        create: deliveryData.rates,
                      },
                    },
                  },
                }
              : {}),
          },
        });

        // SAVE PRODUCT COUPON
        console.log("RECEIVED COUPON:", coupon ?? null);
        console.log("VALIDATED COUPON DATA:", couponData);

        if (couponData) {
          const savedCoupon = await tx.productCoupon.create({
            data: {
              productId: product.id,
              couponName: couponData.couponName,
              discount: couponData.discount,
              isActive: couponData.isActive,
            },
          });

          console.log("COUPON SAVED SUCCESSFULLY:", savedCoupon);
        } else {
          console.log("NO COUPON TO SAVE");
        }

        // SAVE PRICING
        const hasPricing =
          customerRegularPrice !== undefined ||
          customerSalePrice !== undefined ||
          sellerRegularPrice !== undefined ||
          sellerSalePrice !== undefined ||
          wholesalerRegularPrice !== undefined ||
          wholesalerSalePrice !== undefined ||
          dropshipPrice !== undefined ||
          affiliateCommissionType !== undefined ||
          affiliateCommissionValue !== undefined;

        if (hasPricing) {
          await tx.productPricing.create({
            data: {
              productId: product.id,

              customerRegularPrice:
                customerRegularPrice !== null &&
                customerRegularPrice !== undefined &&
                customerRegularPrice !== ""
                  ? Number(customerRegularPrice)
                  : 0,

              customerSalePrice:
                customerSalePrice !== null &&
                customerSalePrice !== undefined &&
                customerSalePrice !== ""
                  ? Number(customerSalePrice)
                  : null,

              sellerRegularPrice:
                sellerRegularPrice !== null &&
                sellerRegularPrice !== undefined &&
                sellerRegularPrice !== ""
                  ? Number(sellerRegularPrice)
                  : null,

              sellerSalePrice:
                sellerSalePrice !== null &&
                sellerSalePrice !== undefined &&
                sellerSalePrice !== ""
                  ? Number(sellerSalePrice)
                  : null,

              wholesalerRegularPrice:
                wholesalerRegularPrice !== null &&
                wholesalerRegularPrice !== undefined &&
                wholesalerRegularPrice !== ""
                  ? Number(wholesalerRegularPrice)
                  : null,

              wholesalerSalePrice:
                wholesalerSalePrice !== null &&
                wholesalerSalePrice !== undefined &&
                wholesalerSalePrice !== ""
                  ? Number(wholesalerSalePrice)
                  : null,

              dropshipPrice:
                dropshipPrice !== null &&
                dropshipPrice !== undefined &&
                dropshipPrice !== ""
                  ? Number(dropshipPrice)
                  : null,

              affiliateCommissionType:
                affiliateCommissionType || null,

              affiliateCommissionValue:
                affiliateCommissionValue !== null &&
                affiliateCommissionValue !== undefined &&
                affiliateCommissionValue !== ""
                  ? Number(affiliateCommissionValue)
                  : null,
            },
          });
        }

        // NEW ARRIVAL
        if (placements?.newArrival) {
          const item = placements.newArrival;

          await tx.newArrivalAttribute.create({
            data: {
              productId: product.id,
              badgeText: item.badgeText?.trim() || null,

              displayOrder:
                item.displayOrder !== undefined &&
                item.displayOrder !== null &&
                item.displayOrder !== ""
                  ? Number(item.displayOrder)
                  : null,

              startDate: item.startDate
                ? new Date(item.startDate)
                : null,

              endDate: item.endDate
                ? new Date(item.endDate)
                : null,
            },
          });
        }

        // FLASH SALE
        if (placements?.flashSale) {
          const item = placements.flashSale;

          await tx.flashSaleAttribute.create({
            data: {
              productId: product.id,
              flashSalePrice: Number(item.flashSalePrice),
              flashSaleStock: Number(item.flashSaleStock),

              soldCount:
                item.soldCount !== undefined
                  ? Number(item.soldCount)
                  : 0,

              startTime: new Date(item.startTime),
              endTime: new Date(item.endTime),
              discountBadge: item.discountBadge?.trim() || null,
            },
          });
        }

        // FEATURED
        if (placements?.featured) {
          const item = placements.featured;

          await tx.featuredAttribute.create({
            data: {
              productId: product.id,

              featuredBadgeText:
                item.featuredBadgeText?.trim() || null,

              bannerImage: item.bannerImage?.trim() || null,

              displayOrder:
                item.displayOrder !== undefined &&
                item.displayOrder !== null &&
                item.displayOrder !== ""
                  ? Number(item.displayOrder)
                  : null,
            },
          });
        }

        // TOP SELLER
        if (placements?.topSeller) {
          const item = placements.topSeller;

          await tx.topSellerAttribute.create({
            data: {
              productId: product.id,

              unitsSold:
                item.unitsSold !== undefined
                  ? Number(item.unitsSold)
                  : 0,

              salesBadge: item.salesBadge?.trim() || null,
              isExpressEligible: Boolean(item.isExpressEligible),
            },
          });
        }

        // TOP RATED
        if (placements?.topRated) {
          const item = placements.topRated;

          await tx.topRatedAttribute.create({
            data: {
              productId: product.id,

              averageRating:
                item.averageRating !== undefined
                  ? Number(item.averageRating)
                  : 0,

              totalReviews:
                item.totalReviews !== undefined
                  ? Number(item.totalReviews)
                  : 0,

              reviewSnippet: item.reviewSnippet?.trim() || null,
            },
          });
        }

        // TRUSTED
        if (placements?.trusted) {
          const item = placements.trusted;

          await tx.trustedAttribute.create({
            data: {
              productId: product.id,
              trustBadgeText: item.trustBadgeText?.trim() || null,
              warrantyInfo: item.warrantyInfo?.trim() || null,
              officialStore: Boolean(item.officialStore),
            },
          });
        }

        // RETURN PRODUCT WITH RELATED DATA
        return tx.product.findUnique({
          where: { id: product.id },

          include: {
            category: true,

            vendor: {
              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    phone: true,
                    email: true,
                  },
                },
              },
            },

            pricing: true,
            coupon: true,

            deliverySettings: {
              include: {
                rates: true,
              },
            },

            newArrivalAttribute: true,
            flashSaleAttribute: true,
            featuredAttribute: true,
            topSellerAttribute: true,
            topRatedAttribute: true,
            trustedAttribute: true,
          },
        });
      },
      {
        maxWait: 10000,
        timeout: 20000,
      }
    );

    // PRODUCT ACTIVITY & ADMIN NOTIFICATION
    try {
      const createdProduct = result as any;
      const currentUserId = req.user?.id;

      if (createdProduct && currentUserId) {
        const role = req.user?.role || "USER";

        const titleLog =
          `নতুন পণ্য যোগ করা হয়েছে: ${createdProduct.title}`;

        const descLog =
          `${role === "VENDOR" ? "ভেন্ডর" : "অ্যাডমিন"} "${createdProduct.title}" পণ্যটি প্ল্যাটফর্মে যুক্ত করেছে।`;

        await createActivity({
          userId: currentUserId,
          action: "CREATE",
          title: titleLog,
          description: descLog,
          entityId: createdProduct.id,
          entityType: "PRODUCT",
        });

        await notifyAdmins({
          type: "PRODUCT_CREATED",
          title: titleLog,
          message: descLog,
          entityId: createdProduct.id,
          entityType: "PRODUCT",
        });
      }
    } catch (logErr) {
      console.error("Product create activity error:", logErr);
    }

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: result,
    });

  } catch (error: any) {
    console.error("CREATE PRODUCT ERROR:", error);

    return res.status(500).json({
      success: false,
      error:
        error?.message ||
        "Failed to create product",
    });
  }
}



// =====================================================
// GET HOME PRODUCTS
// =====================================================





export async function getHomeProducts(
  req: any,
  res: Response
) {
  try {
    const placement = String(req.params.placement ?? "");

    console.log(
      "🔥 GET HOME PRODUCTS PLACEMENT:",
      placement
    );

    console.log("🔥 PRODUCT CONTROLLER UPDATED");

    // Common include for all home product placements
    const include: Prisma.ProductInclude = {
      // Category
      category: true,

      // Vendor information
      vendor: {
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
      },

      // All product pricing
      pricing: true,

      // Delivery settings
      deliverySettings: {
        include: {
          rates: true,
        },
      },

      // Product reviews: Published only
      reviews: {
        where: {
          status: "PUBLISHED" as const,
        },
        select: {
          id: true,
          rating: true,
          comment: true,
          verified: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },

      // Product placement attributes
      newArrivalAttribute: true,
      featuredAttribute: true,
      topSellerAttribute: true,
      topRatedAttribute: true,
      flashSaleAttribute: true,
      trustedAttribute: true,

      // Brand information
      brand: true,
    };

    let products;

    switch (placement) {
      // NEW ARRIVALS
      case "new-arrivals":
        products = await prisma.product.findMany({
          where: {
            newArrivalAttribute: {
              isNot: null,
            },
          },
          include,
          orderBy: {
            createdAt: "desc",
          },
        });
        break;

      // FEATURED PRODUCTS
      case "featured":
        products = await prisma.product.findMany({
          where: {
            featuredAttribute: {
              isNot: null,
            },
          },
          include,
          orderBy: {
            featuredAttribute: {
              displayOrder: "asc",
            },
          },
        });
        break;

      // BEST SELLERS
      case "best-sellers":
        products = await prisma.product.findMany({
          where: {
            topSellerAttribute: {
              isNot: null,
            },
          },
          include,
          orderBy: {
            topSellerAttribute: {
              unitsSold: "desc",
            },
          },
        });
        break;

      // TOP RATED
      case "top-rated":
        products = await prisma.product.findMany({
          where: {
            topRatedAttribute: {
              isNot: null,
            },
          },
          include,
          orderBy: {
            topRatedAttribute: {
              averageRating: "desc",
            },
          },
        });
        break;

      // FLASH SALE
      case "flash-sale":
        products = await prisma.product.findMany({
          where: {
            flashSaleAttribute: {
              isNot: null,
            },
          },
          include,
          orderBy: {
            flashSaleAttribute: {
              startTime: "asc",
            },
          },
        });
        break;

      // JUST FOR YOU
      case "just-for-you":
        products = await prisma.product.findMany({
          include,
          orderBy: {
            createdAt: "desc",
          },
        });
        break;

      // INVALID PLACEMENT
      default:
        return res.status(400).json({
          success: false,
          error: "Invalid placement",
        });
    }

    return res.status(200).json({
      success: true,
      data: products,
    });

  } catch (error: any) {
    console.error("GET HOME PRODUCTS ERROR:", error);

    return res.status(500).json({
      success: false,
      error:
        error?.message ||
        "Failed to fetch home products",
    });
  }
}

// =====================================================
// NORMALIZE PRODUCT SLUG
// =====================================================

function normalizeProductSlug(value: string): string {
  return value
    .trim()
    .normalize("NFC")
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// =====================================================
// GET SINGLE PRODUCT BY SLUG
// =====================================================

export async function getProductBySlug(
  req: any,
  res: Response
) {
  try {
    // Express automatically decodes URL parameters.
    const rawSlug = String(req.params.slug ?? "").trim();

    if (!rawSlug) {
      return res.status(400).json({
        success: false,
        error: "Product slug is required",
      });
    }

    const normalizedSlug = normalizeProductSlug(rawSlug);

    console.log("PRODUCT SLUG LOOKUP:", {
      rawSlug,
      normalizedSlug,
    });

    // Search both new normalized slug and old existing slug.
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          {
            slug: {
              equals: normalizedSlug,
              mode: "insensitive",
            },
          },
          {
            slug: {
              equals: rawSlug,
              mode: "insensitive",
            },
          },
          {
            id: rawSlug,
          },
        ],
      },

      include: {
        category: true,

        vendor: {
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
        },

        pricing: true,
        coupon: true,

        deliverySettings: {
          include: {
            rates: true,
          },
        },

        newArrivalAttribute: true,
        flashSaleAttribute: true,
        featuredAttribute: true,
        topSellerAttribute: true,
        topRatedAttribute: true,
        trustedAttribute: true,

        reviews: true,
      },
    });

    if (!product) {
      console.warn("PRODUCT NOT FOUND:", {
        rawSlug,
        normalizedSlug,
      });

      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // VENDOR METRICS

    let positiveSellerRating = 96;
    let shippingOnTime = 98;
    let averageVendorRating = 4.8;
    let totalVendorReviews = 0;

    if (product.vendorId) {
      try {
        const [
          totalPublished,
          positiveCount,
          avgRating,
        ] = await Promise.all([
          prisma.productReview.count({
            where: {
              product: {
                vendorId: product.vendorId,
              },
              status: "PUBLISHED",
            },
          }),

          prisma.productReview.count({
            where: {
              product: {
                vendorId: product.vendorId,
              },
              status: "PUBLISHED",
              rating: {
                gte: 4,
              },
            },
          }),

          prisma.productReview.aggregate({
            where: {
              product: {
                vendorId: product.vendorId,
              },
              status: "PUBLISHED",
            },
            _avg: {
              rating: true,
            },
          }),
        ]);

        totalVendorReviews = totalPublished;

        if (totalPublished > 0) {
          positiveSellerRating = Math.round(
            (positiveCount / totalPublished) * 100
          );

          averageVendorRating = avgRating._avg.rating
            ? Number(avgRating._avg.rating.toFixed(1))
            : 4.8;
        }
      } catch (err) {
        console.error("VENDOR METRICS ERROR:", err);
      }
    }

    // FINAL RESPONSE

    const responseData = {
      ...product,

      vendor: product.vendor
        ? {
            ...product.vendor,
            positiveSellerRating,
            shippingOnTime,
            averageRating: averageVendorRating,
            totalReviews: totalVendorReviews,
          }
        : null,
    };

    return res.status(200).json({
      success: true,
      data: responseData,
    });

  } catch (error: any) {
    console.error("GET PRODUCT BY SLUG ERROR:", error);

    return res.status(500).json({
      success: false,
      error:
        error?.message ||
        "Failed to fetch product",
    });
  }
}


// =====================================================
// GET ALL PRODUCTS (ADMIN)
// =====================================================

export async function getAllProducts(
  req: AuthRequest,
  res: Response
) {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,

        vendor: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },

        pricing: true,
        coupon: true,

        deliverySettings: {
          include: {
            rates: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      total: products.length,
      data: products,
    });
  } catch (error: any) {
    console.error("GET ALL PRODUCTS ERROR:", error);

    return res.status(500).json({
      success: false,
      error:
        error?.message ||
        "Failed to fetch products",
    });
  }
}
// =====================================================
// UPDATE PRODUCT
// =====================================================


export async function updateProduct(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id ?? "");
    const body = req.body ?? {};

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Product ID is required",
      });
    }

    const existing = await prisma.product.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
        ],
      },
      include: {
        vendor: true,
        pricing: true,
        deliverySettings: {
          include: { rates: true },
        },
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    const targetId = existing.id;

    // Vendor can delete only their own products
    if (req.user.role === "VENDOR") {
      const vendor = await prisma.vendor.findUnique({
        where: { userId: req.user.id },
      });

      if (!vendor || existing.vendorId !== vendor.id) {
        return res.status(403).json({
          success: false,
          error: "You cannot update this product",
        });
      }
    }

    const data: any = {};

    // Basic product fields
    if (body.title !== undefined) {
      if (typeof body.title !== "string" || !body.title.trim()) {
        return res.status(400).json({
          success: false,
          error: "Product title cannot be empty",
        });
      }
      data.title = body.title.trim();
    }

    if (body.slug !== undefined) {
      if (typeof body.slug !== "string" || !body.slug.trim()) {
        return res.status(400).json({
          success: false,
          error: "Product slug cannot be empty",
        });
      }

      const duplicate = await prisma.product.findFirst({
        where: {
          slug: body.slug.trim(),
          NOT: { id: targetId },
        },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          error: "A product with this slug already exists",
        });
      }

      data.slug = body.slug.trim();
    }

    if (body.sku !== undefined) {
      if (typeof body.sku !== "string" || !body.sku.trim()) {
        return res.status(400).json({
          success: false,
          error: "Product SKU cannot be empty",
        });
      }

      const duplicate = await prisma.product.findFirst({
        where: {
          sku: body.sku.trim(),
          NOT: { id: targetId },
        },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          error: "A product with this SKU already exists",
        });
      }

      data.sku = body.sku.trim();
    }

    if (body.shortDescription !== undefined) {
      data.shortDescription =
        typeof body.shortDescription === "string"
          ? body.shortDescription.trim() || null
          : null;
    }

    if (body.description !== undefined) {
      data.description =
        typeof body.description === "string"
          ? body.description.trim() || null
          : null;
    }

    if (body.stockQuantity !== undefined) {
      const stock = Number(body.stockQuantity);

      if (
        body.stockQuantity === "" ||
        !Number.isInteger(stock) ||
        stock < 0
      ) {
        return res.status(400).json({
          success: false,
          error: "Valid stock quantity is required",
        });
      }

      data.stockQuantity = stock;
    }

    if (body.attributes !== undefined) {
      data.attributes = body.attributes;
    }

    if (body.customFields !== undefined) {
      data.customFields = body.customFields;
    }

    if (body.images !== undefined) {
      if (
        !Array.isArray(body.images) ||
        body.images.some((x: unknown) => typeof x !== "string")
      ) {
        return res.status(400).json({
          success: false,
          error: "Images must be an array of URLs",
        });
      }

      data.images = body.images;
    }

    if (body.categoryId !== undefined) {
      const category = await prisma.category.findUnique({
        where: { id: body.categoryId },
      });

      if (!category) {
        return res.status(400).json({
          success: false,
          error: "Selected category does not exist",
        });
      }

      data.category = {
        connect: { id: body.categoryId },
      };
    }

    if (body.vendorId !== undefined && req.user.role !== "VENDOR") {
      const vendor = await prisma.vendor.findUnique({
        where: { id: body.vendorId },
      });

      if (!vendor) {
        return res.status(400).json({
          success: false,
          error: "Selected vendor does not exist",
        });
      }

      data.vendor = {
        connect: { id: body.vendorId },
      };
    }

    // Map legacy / alternative price keys
    if (body.customerRegularPrice === undefined && (body.regularPrice !== undefined || body.price !== undefined)) {
      body.customerRegularPrice = body.regularPrice ?? body.price;
    }
    if (body.customerSalePrice === undefined && body.salePrice !== undefined) {
      body.customerSalePrice = body.salePrice;
    }

    // Pricing
    const pricingKeys = [
      "customerRegularPrice",
      "customerSalePrice",
      "sellerRegularPrice",
      "sellerSalePrice",
      "wholesalerRegularPrice",
      "wholesalerSalePrice",
      "dropshipPrice",
      "affiliateCommissionType",
      "affiliateCommissionValue",
    ];

    const pricingTouched = pricingKeys.some(
      (key) => body[key] !== undefined
    );

    const pricingData: any = {};

    const priceFields = [
      "customerRegularPrice",
      "customerSalePrice",
      "sellerRegularPrice",
      "sellerSalePrice",
      "wholesalerRegularPrice",
      "wholesalerSalePrice",
      "dropshipPrice",
      "affiliateCommissionValue",
    ];

    for (const key of priceFields) {
      if (body[key] === undefined) continue;

      if (body[key] === null || body[key] === "") {
        pricingData[key] =
          key === "customerRegularPrice" ? 0 : null;
      } else {
        const value = Number(body[key]);

        if (!Number.isFinite(value) || value < 0) {
          return res.status(400).json({
            success: false,
            error: `Invalid ${key}`,
          });
        }

        pricingData[key] = value;
      }
    }

    if (body.affiliateCommissionType !== undefined) {
      pricingData.affiliateCommissionType =
        body.affiliateCommissionType || null;
    }

    // Coupon validation
    let couponData:
      | {
          couponName: string;
          discount: number;
          isActive: boolean;
        }
      | null
      | undefined = undefined;

    if (body.coupon === null || body.coupon === false) {
      couponData = null;
    } else if (body.coupon !== undefined) {
      const coupon = body.coupon;

      if (
        !coupon ||
        typeof coupon !== "object" ||
        Array.isArray(coupon) ||
        typeof coupon.couponName !== "string" ||
        !coupon.couponName.trim()
      ) {
        return res.status(400).json({
          success: false,
          error: "Valid coupon name is required",
        });
      }

      const discount = Number(coupon.discount);

      if (
        coupon.discount === undefined ||
        coupon.discount === null ||
        coupon.discount === "" ||
        !Number.isFinite(discount) ||
        discount <= 0
      ) {
        return res.status(400).json({
          success: false,
          error: "Coupon discount must be greater than 0",
        });
      }

      if (
        coupon.isActive !== undefined &&
        typeof coupon.isActive !== "boolean"
      ) {
        return res.status(400).json({
          success: false,
          error: "Invalid coupon status",
        });
      }

      couponData = {
        couponName: coupon.couponName.trim().toUpperCase(),
        discount,
        isActive: coupon.isActive ?? true,
      };
    }

    // Delivery settings
    let deliveryAction: any = undefined;

    if (body.deliverySettings === null) {
      deliveryAction = { delete: true };
    } else if (body.deliverySettings !== undefined) {
      const d = body.deliverySettings;

      if (
        !d ||
        typeof d !== "object" ||
        Array.isArray(d) ||
        !["UPAZILA_BASED", "NATIONWIDE"].includes(d.scope)
      ) {
        return res.status(400).json({
          success: false,
          error: "Invalid delivery settings or scope",
        });
      }

      if (d.scope === "NATIONWIDE") {
        const parsedNationwideCharge = Number(d.nationwideCharge);
        if (
          d.nationwideCharge === undefined ||
          d.nationwideCharge === null ||
          d.nationwideCharge === "" ||
          !Number.isFinite(parsedNationwideCharge) ||
          parsedNationwideCharge < 0
        ) {
          return res.status(400).json({
            success: false,
            error: "Nationwide delivery charge must be 0 or greater",
          });
        }

        deliveryAction = {
          scope: "NATIONWIDE",
          weightKg: null,
          nationwideCharge: parsedNationwideCharge,
          rates: [],
        };
      } else {
        if (
          d.weightKg === undefined ||
          d.weightKg === null ||
          d.weightKg === "" ||
          !Number.isFinite(Number(d.weightKg)) ||
          Number(d.weightKg) <= 0
        ) {
          return res.status(400).json({
            success: false,
            error: "Product weight must be greater than 0",
          });
        }

        if (!Array.isArray(d.rates) || d.rates.length === 0) {
          return res.status(400).json({
            success: false,
            error: "At least one delivery rate is required",
          });
        }

        const rates = d.rates
          .map((r: any) => ({
            minDistanceKm: Number(r?.minDistanceKm),
            maxDistanceKm: Number(r?.maxDistanceKm),
            firstKgCharge: Number(r?.firstKgCharge),
            additionalKgCharge: Number(r?.additionalKgCharge),
          }))
          .sort((a: any, b: any) => a.minDistanceKm - b.minDistanceKm);

        for (let i = 0; i < rates.length; i++) {
          const r = rates[i];

          if (
            !Number.isInteger(r.minDistanceKm) ||
            !Number.isInteger(r.maxDistanceKm) ||
            r.minDistanceKm < 0 ||
            r.maxDistanceKm <= r.minDistanceKm ||
            !Number.isFinite(r.firstKgCharge) ||
            !Number.isFinite(r.additionalKgCharge) ||
            r.firstKgCharge < 0 ||
            r.additionalKgCharge < 0 ||
            (i > 0 &&
              r.minDistanceKm !== rates[i - 1].maxDistanceKm)
          ) {
            return res.status(400).json({
              success: false,
              error: "Invalid or discontinuous delivery distance rates",
            });
          }
        }

        deliveryAction = {
          scope: "UPAZILA_BASED",
          weightKg: Number(d.weightKg),
          rates,
        };
      }
    }

    // Update everything atomically
    const updated = await prisma.$transaction(async (tx) => {
      if (Object.keys(data).length > 0) {
        await tx.product.update({
          where: { id: targetId },
          data,
        });
      }

      if (pricingTouched) {
        await tx.productPricing.upsert({
          where: { productId: id },
          create: {
            productId: targetId,
            customerRegularPrice: 0,
            ...pricingData,
          },
          update: pricingData,
        });
      }

      // Create, update or remove the product coupon
      if (couponData === null) {
        await tx.productCoupon.deleteMany({
          where: { productId: id },
        });
      } else if (couponData !== undefined) {
        await tx.productCoupon.upsert({
          where: { productId: id },
          create: {
            productId: targetId,
            ...couponData,
          },
          update: couponData,
        });
      }

      // Create, update or remove delivery settings
      if (deliveryAction?.delete) {
        await tx.productDelivery.deleteMany({
          where: { productId: id },
        });
      } else if (deliveryAction) {
        const deliveryData = {
          scope: deliveryAction.scope,
          weightKg: deliveryAction.weightKg,
          nationwideCharge: deliveryAction.nationwideCharge ?? null,
          rates: deliveryAction.rates,
        };

        const current = await tx.productDelivery.findUnique({
          where: { productId: id },
        });

        if (current) {
          await tx.productDelivery.update({
            where: { productId: id },
            data: {
              scope: deliveryData.scope,
              weightKg: deliveryData.weightKg,
              nationwideCharge: deliveryData.nationwideCharge,
              rates: {
                deleteMany: {},
                create: deliveryData.rates,
              },
            },
          });
        } else {
          await tx.productDelivery.create({
            data: {
              productId: targetId,
              scope: deliveryData.scope,
              weightKg: deliveryData.weightKg,
              nationwideCharge: deliveryData.nationwideCharge,
              rates: {
                create: deliveryData.rates,
              },
            },
          });
        }
      }

      return tx.product.findUnique({
        where: { id: targetId },
        include: {
          category: true,
          vendor: {
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
          },
          pricing: true,
          coupon: true,
          deliverySettings: {
            include: { rates: true },
          },
          newArrivalAttribute: true,
          flashSaleAttribute: true,
          featuredAttribute: true,
          topSellerAttribute: true,
          topRatedAttribute: true,
          trustedAttribute: true,
          reviews: true,
        },
      });
    });

    try {
      if (updated && req.user?.id) {
        const role = req.user?.role || "USER";
        const titleLog = `পণ্য আপডেট করা হয়েছে: ${updated.title}`;
        const descLog = `${role === "VENDOR" ? "ভেন্ডর" : "অ্যাডমিন"} "${updated.title}" পণ্যের তথ্য আপডেট করেছে।`;

        await createActivity({
          userId: req.user.id,
          action: "UPDATE",
          title: titleLog,
          description: descLog,
          entityId: updated.id,
          entityType: "PRODUCT",
        });

        await notifyAdmins({
          type: "PRODUCT_UPDATED",
          title: titleLog,
          message: descLog,
          entityId: updated.id,
          entityType: "PRODUCT",
        });
      }
    } catch (logErr) {
      console.error("Product update activity error:", logErr);
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updated,
    });
  } catch (error: any) {
    console.error("UPDATE PRODUCT ERROR:", error);

    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to update product",
    });
  }
}
// =====================================================
// GET PRODUCTS FOR PRODUCTS PAGE
// =====================================================


export async function getProducts(
  req: any,
  res: Response
) {
  try {
    const { type, search } = req.query;

    const where: any = {};

    // =====================================================
    // SECTION / PLACEMENT FILTER
    // =====================================================

    switch (type) {
      case "new-arrivals":
        where.newArrivalAttribute = {
          isNot: null,
        };
        break;

      case "flash-sale":
        where.flashSaleAttribute = {
          isNot: null,
        };
        break;

      case "featured":
        where.featuredAttribute = {
          isNot: null,
        };
        break;

      case "best-sellers":
        where.topSellerAttribute = {
          isNot: null,
        };
        break;

      case "top-rated":
        where.topRatedAttribute = {
          isNot: null,
        };
        break;

      case "trusted":
        where.trustedAttribute = {
          isNot: null,
        };
        break;

      case undefined:
      case "":
        break;

      default:
        return res.status(400).json({
          success: false,
          error: "Invalid product type",
        });
    }

    // =====================================================
    // SEARCH
    // =====================================================

    if (
      typeof search === "string" &&
      search.trim()
    ) {
      const keyword = search.trim();

      where.OR = [
        {
          title: {
            contains: keyword,
            mode: "insensitive",
          },
        },
        {
          sku: {
            contains: keyword,
            mode: "insensitive",
          },
        },
        {
          category: {
            name: {
              contains: keyword,
              mode: "insensitive",
            },
          },
        },
        {
          vendor: {
            storeName: {
              contains: keyword,
              mode: "insensitive",
            },
          },
        },
        {
          vendor: {
            user: {
              fullName: {
                contains: keyword,
                mode: "insensitive",
              },
            },
          },
        },
      ];
    }

    // =====================================================
    // FETCH PRODUCTS WITH COUPON
    // =====================================================

    const products = await prisma.product.findMany({
      where,

      include: {
        category: true,

        vendor: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                phone: true,
                email: true,
              },
            },
          },
        },

        // Product pricing
        pricing: true,

        // IMPORTANT: Include existing product coupon
        coupon: true,

        // Product delivery settings
        deliverySettings: {
          include: {
            rates: true,
          },
        },

        // Product placements
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
    // RESPONSE
    // =====================================================

    return res.status(200).json({
      success: true,
      total: products.length,
      data: products,
    });
  } catch (error: any) {
    console.error("GET PRODUCTS ERROR:", error);

    return res.status(500).json({
      success: false,
      error:
        error?.message ||
        "Failed to fetch products",
    });
  }
}
// =====================================================
// DELETE PRODUCT
// =====================================================

export async function deleteProduct(
  req: AuthRequest,
  res: Response
) {
  try {
    const id = String(req.params.id ?? "");

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Product ID is required",
      });
    }

    const targetId = id;

    // Find product and its vendor
    const product = await prisma.product.findUnique({
      where: { id: targetId },
      select: {
        id: true,
        title: true,
        vendorId: true,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // Vendor can delete only their own products
    if (req.user.role === "VENDOR") {
      const vendor = await prisma.vendor.findUnique({
        where: {
          userId: req.user.id,
        },
        select: {
          id: true,
        },
      });

      if (!vendor || product.vendorId !== vendor.id) {
        return res.status(403).json({
          success: false,
          error: "You cannot delete this product",
        });
      }
    }

    // Delete the product and its dependent relations
    await prisma.$transaction(
      async (tx) => {
        // 1. Delete cart, wishlist, coupons, reviews, pricing
        await Promise.all([
          tx.cartItem.deleteMany({ where: { productId: targetId } }),
          tx.wishlistItem.deleteMany({ where: { productId: targetId } }),
          tx.productCoupon.deleteMany({ where: { productId: targetId } }),
          tx.productReview.deleteMany({ where: { productId: targetId } }),
          tx.productPricing.deleteMany({ where: { productId: targetId } }),
        ]);

        // 2. Delete product placements / attributes
        await Promise.all([
          tx.featuredAttribute.deleteMany({ where: { productId: targetId } }),
          tx.flashSaleAttribute.deleteMany({ where: { productId: targetId } }),
          tx.newArrivalAttribute.deleteMany({ where: { productId: targetId } }),
          tx.topRatedAttribute.deleteMany({ where: { productId: targetId } }),
          tx.topSellerAttribute.deleteMany({ where: { productId: targetId } }),
          tx.trustedAttribute.deleteMany({ where: { productId: targetId } }),
        ]);

        // 3. Delete delivery settings and rates
        await tx.productDeliveryRate.deleteMany({
          where: { productDelivery: { productId: targetId } },
        });
        await tx.productDelivery.deleteMany({ where: { productId: targetId } });

        // 4. Detach from any vendor order items if any
        await tx.vendorOrderItem.updateMany({
          where: { productId: targetId },
          data: { productId: null },
        });

        // 5. Finally delete the product
        await tx.product.delete({ where: { id: targetId } });
      },
      {
        maxWait: 15000,
        timeout: 30000,
      }
    );

    try {
      const role = req.user?.role || "USER";
      const titleLog = `পণ্য ডিলিট করা হয়েছে: ${product.title}`;
      const descLog = `${role === "VENDOR" ? "ভেন্ডর" : "অ্যাডমিন"} "${product.title}" পণ্যটি মুছে ফেলেছে।`;

      await createActivity({
        userId: req.user?.id,
        action: "DELETE",
        title: titleLog,
        description: descLog,
        entityId: product.id,
        entityType: "PRODUCT",
      });

      await notifyAdmins({
        type: "PRODUCT_DELETED",
        title: titleLog,
        message: descLog,
        entityId: product.id,
        entityType: "PRODUCT",
      });
    } catch (logErr) {
      console.error("Product delete activity error:", logErr);
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: {
        id: product.id,
        title: product.title,
      },
    });
  } catch (error: any) {
    console.error("DELETE PRODUCT ERROR:", error);

    // A foreign-key restriction can prevent deletion if related
    // records (for example, order items) must be preserved.
    if (error?.code === "P2003" || error?.code === "P2014") {
      return res.status(409).json({
        success: false,
        error:
          "This product has related records and cannot be deleted directly.",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Failed to delete product",
    });
  }
}