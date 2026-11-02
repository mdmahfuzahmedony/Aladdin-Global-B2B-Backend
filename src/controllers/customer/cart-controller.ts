
// import { Response } from "express";
// import { prisma } from "../../config/prisma";
// import { AuthRequest } from "../../middleware/auth-middleware";

// // ------------------------------------------------------------
// // LOCATION NORMALIZATION
// // ------------------------------------------------------------

// const normalizeLocation = (
//   value: string | null | undefined,
// ): string => {
//   return (value ?? "")
//     .normalize("NFKC")
//     .trim()
//     .replace(/\s+/g, " ")
//     .toLocaleLowerCase("en");
// };

// const sameLocation = (
//   first: string | null | undefined,
//   second: string | null | undefined,
// ): boolean => {
//   const normalizedFirst = normalizeLocation(first);
//   const normalizedSecond = normalizeLocation(second);

//   if (!normalizedFirst || !normalizedSecond) {
//     return false;
//   }

//   return normalizedFirst === normalizedSecond;
// };

// // ------------------------------------------------------------
// // SHARED CART ITEM INCLUDE
// // ------------------------------------------------------------

// const cartProductInclude = {
//   pricing: true,
//   brand: true,
//   deliverySettings: {
//     include: {
//       rates: {
//         orderBy: {
//           minDistanceKm: "asc" as const,
//         },
//       },
//     },
//   },
//   vendor: {
//     include: {
//       location: true,
//       settings: true,
//     },
//   },
// };

// // ------------------------------------------------------------
// // GET CART
// // ------------------------------------------------------------

// export const getCart = async (
//   req: AuthRequest,
//   res: Response,
// ) => {
//   try {
//     const userId = req.user?.id;

//     if (!userId) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized",
//       });
//     }

//     const cart = await prisma.cart.findUnique({
//       where: { userId },
//       include: {
//         items: {
//           orderBy: { createdAt: "desc" },
//           include: {
//             product: {
//               include: cartProductInclude,
//             },
//           },
//         },
//       },
//     });

//     if (!cart) {
//       return res.status(200).json({
//         success: true,
//         cart: null,
//         items: [],
//         totalItems: 0,
//       });
//     }

//     const totalItems = cart.items.reduce(
//       (total, item) => total + item.quantity,
//       0,
//     );

//     return res.status(200).json({
//       success: true,
//       cart,
//       items: cart.items,
//       totalItems,
//     });
//   } catch (error) {
//     console.error("Get Cart Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to load cart",
//     });
//   }
// };

// // ------------------------------------------------------------
// // ADD TO CART
// // ------------------------------------------------------------

// export const addToCart = async (
//   req: AuthRequest,
//   res: Response,
// ) => {
//   try {
//     const userId = req.user?.id;
//     const { productId, quantity = 1 } = req.body;

//     if (!userId) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized",
//       });
//     }

//     if (
//       typeof productId !== "string" ||
//       !productId.trim()
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Valid Product ID is required",
//       });
//     }

//     const parsedQuantity = Number(quantity);

//     if (
//       !Number.isSafeInteger(parsedQuantity) ||
//       parsedQuantity < 1
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Quantity must be at least 1",
//       });
//     }

//     const normalizedProductId = productId.trim();

//     const product = await prisma.product.findUnique({
//       where: { id: normalizedProductId },
//       select: {
//         id: true,
//         stockQuantity: true,
//         deliverySettings: {
//           select: {
//             scope: true,
//           },
//         },
//         vendor: {
//           select: {
//             location: {
//               select: {
//                 division: true,
//                 district: true,
//                 upazila: true,
//               },
//             },
//           },
//         },
//       },
//     });

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message: "Product not found",
//       });
//     }

//     if (product.stockQuantity < parsedQuantity) {
//       return res.status(400).json({
//         success: false,
//         message: "Not enough stock available",
//       });
//     }

//     const scope = product.deliverySettings?.scope;

//     // UPAZILA_BASED products require matching customer/vendor locations.
//     if (scope === "UPAZILA_BASED") {
//       const customer = await prisma.customer.findUnique({
//         where: { userId },
//         select: {
//           division: true,
//           district: true,
//           upazila: true,
//         },
//       });

//       if (
//         !customer?.division?.trim() ||
//         !customer?.district?.trim() ||
//         !customer?.upazila?.trim()
//       ) {
//         return res.status(400).json({
//           success: false,
//           code: "CUSTOMER_LOCATION_REQUIRED",
//           message:
//             "কার্টে যোগ করার আগে আপনার বিভাগ, জেলা ও উপজেলা সেট করুন।",
//         });
//       }

//       const vendorLocation = product.vendor.location;

//       if (
//         !vendorLocation?.division?.trim() ||
//         !vendorLocation?.district?.trim() ||
//         !vendorLocation?.upazila?.trim()
//       ) {
//         console.error("VENDOR LOCATION MISSING:", {
//           productId: product.id,
//           vendorLocation,
//         });

//         return res.status(400).json({
//           success: false,
//           code: "VENDOR_LOCATION_MISSING",
//           message: "ভেন্ডরের বিভাগ, জেলা ও উপজেলা সেট করা নেই।",
//         });
//       }

//       const divisionMatches = sameLocation(
//         customer.division,
//         vendorLocation.division,
//       );

//       const districtMatches = sameLocation(
//         customer.district,
//         vendorLocation.district,
//       );

//       const upazilaMatches = sameLocation(
//         customer.upazila,
//         vendorLocation.upazila,
//       );

//       console.log("PRODUCT DELIVERY LOCATION CHECK:", {
//         productId: product.id,
//         scope,
//         customer: {
//           division: customer.division,
//           district: customer.district,
//           upazila: customer.upazila,
//         },
//         vendor: {
//           division: vendorLocation.division,
//           district: vendorLocation.district,
//           upazila: vendorLocation.upazila,
//         },
//         matches: {
//           divisionMatches,
//           districtMatches,
//           upazilaMatches,
//         },
//       });

//       if (
//         !divisionMatches ||
//         !districtMatches ||
//         !upazilaMatches
//       ) {
//         return res.status(403).json({
//           success: false,
//           code: "LOCATION_MISMATCH",
//           message: "এই প্রোডাক্টটি আপনার লোকেশনে উপলব্ধ নেই।",
//         });
//       }
//     }

//     // Nationwide products are not blocked by location.
//     // Products without delivery settings are not blocked here.

//     const cart = await prisma.cart.upsert({
//       where: { userId },
//       create: { userId },
//       update: {},
//     });

//     const existingItem = await prisma.cartItem.findUnique({
//       where: {
//         cartId_productId: {
//           cartId: cart.id,
//           productId: normalizedProductId,
//         },
//       },
//     });

//     const newQuantity =
//       (existingItem?.quantity ?? 0) + parsedQuantity;

//     if (newQuantity > product.stockQuantity) {
//       return res.status(400).json({
//         success: false,
//         message: "Requested quantity exceeds available stock",
//       });
//     }

//     const cartItem = existingItem
//       ? await prisma.cartItem.update({
//           where: { id: existingItem.id },
//           data: { quantity: newQuantity },
//           include: {
//             product: {
//               include: cartProductInclude,
//             },
//           },
//         })
//       : await prisma.cartItem.create({
//           data: {
//             cartId: cart.id,
//             productId: normalizedProductId,
//             quantity: parsedQuantity,
//           },
//           include: {
//             product: {
//               include: cartProductInclude,
//             },
//           },
//         });

//     return res.status(200).json({
//       success: true,
//       message: "Product added to cart",
//       item: cartItem,
//     });
//   } catch (error) {
//     console.error("Add To Cart Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to add product to cart",
//     });
//   }
// };

// // ------------------------------------------------------------
// // UPDATE CART ITEM
// // ------------------------------------------------------------

// export const updateCartItem = async (
//   req: AuthRequest,
//   res: Response,
// ) => {
//   try {
//     const userId = req.user?.id;
//     const { itemId } = req.params;
//     const parsedQuantity = Number(req.body.quantity);

//     if (!userId) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized",
//       });
//     }

//     if (
//       !Number.isSafeInteger(parsedQuantity) ||
//       parsedQuantity < 1
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Quantity must be at least 1",
//       });
//     }

//     const cartItem = await prisma.cartItem.findFirst({
//       where: {
//         id: itemId,
//         cart: { userId },
//       },
//       include: {
//         product: {
//           select: {
//             stockQuantity: true,
//           },
//         },
//       },
//     });

//     if (!cartItem) {
//       return res.status(404).json({
//         success: false,
//         message: "Cart item not found",
//       });
//     }

//     if (parsedQuantity > cartItem.product.stockQuantity) {
//       return res.status(400).json({
//         success: false,
//         message: "Requested quantity exceeds available stock",
//       });
//     }

//     const updatedItem = await prisma.cartItem.update({
//       where: { id: cartItem.id },
//       data: { quantity: parsedQuantity },
//       include: {
//         product: {
//           include: cartProductInclude,
//         },
//       },
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Cart updated successfully",
//       item: updatedItem,
//     });
//   } catch (error) {
//     console.error("Update Cart Item Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to update cart",
//     });
//   }
// };

// // ------------------------------------------------------------
// // REMOVE FROM CART
// // ------------------------------------------------------------

// export const removeFromCart = async (
//   req: AuthRequest,
//   res: Response,
// ) => {
//   try {
//     const userId = req.user?.id;
//     const { itemId } = req.params;

//     if (!userId) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized",
//       });
//     }

//     const cartItem = await prisma.cartItem.findFirst({
//       where: {
//         id: itemId,
//         cart: { userId },
//       },
//     });

//     if (!cartItem) {
//       return res.status(404).json({
//         success: false,
//         message: "Cart item not found",
//       });
//     }

//     await prisma.cartItem.delete({
//       where: { id: cartItem.id },
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Product removed from cart",
//     });
//   } catch (error) {
//     console.error("Remove From Cart Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to remove product from cart",
//     });
//   }
// };

// // ------------------------------------------------------------
// // CLEAR CART
// // ------------------------------------------------------------

// export const clearCart = async (
//   req: AuthRequest,
//   res: Response,
// ) => {
//   try {
//     const userId = req.user?.id;

//     if (!userId) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized",
//       });
//     }

//     const cart = await prisma.cart.findUnique({
//       where: { userId },
//     });

//     if (!cart) {
//       return res.status(200).json({
//         success: true,
//         message: "Cart is already empty",
//       });
//     }

//     await prisma.cartItem.deleteMany({
//       where: { cartId: cart.id },
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Cart cleared successfully",
//     });
//   } catch (error) {
//     console.error("Clear Cart Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to clear cart",
//     });
//   }
// };


import { Response } from "express";
import { prisma } from "../../config/prisma";
import { AuthRequest } from "../../middleware/auth-middleware";

// ------------------------------------------------------------
// ROUTE PARAMETER
// ------------------------------------------------------------

const getRouteParam = (
  value: unknown,
): string => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

// ------------------------------------------------------------
// LOCATION NORMALIZATION
// ------------------------------------------------------------

const normalizeLocation = (
  value: string | null | undefined,
): string => {
  return (value ?? "")
    .normalize("NFKC")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("en");
};

const sameLocation = (
  first: string | null | undefined,
  second: string | null | undefined,
): boolean => {
  const normalizedFirst = normalizeLocation(first);
  const normalizedSecond = normalizeLocation(second);

  if (!normalizedFirst || !normalizedSecond) {
    return false;
  }

  return normalizedFirst === normalizedSecond;
};

// ------------------------------------------------------------
// SHARED CART ITEM INCLUDE
// ------------------------------------------------------------

const cartProductInclude = {
  pricing: true,
  brand: true,
  deliverySettings: {
    include: {
      rates: {
        orderBy: {
          minDistanceKm: "asc" as const,
        },
      },
    },
  },
  vendor: {
    include: {
      location: true,
      settings: true,
    },
  },
};

// ------------------------------------------------------------
// GET CART
// ------------------------------------------------------------

export const getCart = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          orderBy: { createdAt: "desc" },
          include: {
            product: {
              include: cartProductInclude,
            },
          },
        },
      },
    });

    if (!cart) {
      return res.status(200).json({
        success: true,
        cart: null,
        items: [],
        totalItems: 0,
      });
    }

    const totalItems = cart.items.reduce(
      (total, item) => total + item.quantity,
      0,
    );

    return res.status(200).json({
      success: true,
      cart,
      items: cart.items,
      totalItems,
    });
  } catch (error) {
    console.error("Get Cart Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load cart",
    });
  }
};

// ------------------------------------------------------------
// ADD TO CART
// ------------------------------------------------------------

export const addToCart = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.id;

    const { productId, quantity = 1 } = req.body as {
      productId?: unknown;
      quantity?: unknown;
    };

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (
      typeof productId !== "string" ||
      !productId.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid Product ID is required",
      });
    }

    const parsedQuantity = Number(quantity);

    if (
      !Number.isSafeInteger(parsedQuantity) ||
      parsedQuantity < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const normalizedProductId = productId.trim();

    const product = await prisma.product.findUnique({
      where: { id: normalizedProductId },
      select: {
        id: true,
        stockQuantity: true,
        deliverySettings: {
          select: {
            scope: true,
          },
        },
        vendor: {
          select: {
            location: {
              select: {
                division: true,
                district: true,
                upazila: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.stockQuantity < parsedQuantity) {
      return res.status(400).json({
        success: false,
        message: "Not enough stock available",
      });
    }

    const scope = product.deliverySettings?.scope;

    // UPAZILA_BASED হলে customer এবং vendor location মিলতে হবে।
    if (scope === "UPAZILA_BASED") {
      const customer = await prisma.customer.findUnique({
        where: { userId },
        select: {
          division: true,
          district: true,
          upazila: true,
        },
      });

      if (
        !customer?.division?.trim() ||
        !customer?.district?.trim() ||
        !customer?.upazila?.trim()
      ) {
        return res.status(400).json({
          success: false,
          code: "CUSTOMER_LOCATION_REQUIRED",
          message:
            "কার্টে যোগ করার আগে আপনার বিভাগ, জেলা ও উপজেলা সেট করুন।",
        });
      }

      const vendorLocation = product.vendor.location;

      if (
        !vendorLocation?.division?.trim() ||
        !vendorLocation?.district?.trim() ||
        !vendorLocation?.upazila?.trim()
      ) {
        console.error("VENDOR LOCATION MISSING:", {
          productId: product.id,
          vendorLocation,
        });

        return res.status(400).json({
          success: false,
          code: "VENDOR_LOCATION_MISSING",
          message:
            "ভেন্ডরের বিভাগ, জেলা ও উপজেলা সেট করা নেই।",
        });
      }

      const divisionMatches = sameLocation(
        customer.division,
        vendorLocation.division,
      );

      const districtMatches = sameLocation(
        customer.district,
        vendorLocation.district,
      );

      const upazilaMatches = sameLocation(
        customer.upazila,
        vendorLocation.upazila,
      );

      console.log("PRODUCT DELIVERY LOCATION CHECK:", {
        productId: product.id,
        scope,
        customer: {
          division: customer.division,
          district: customer.district,
          upazila: customer.upazila,
        },
        vendor: {
          division: vendorLocation.division,
          district: vendorLocation.district,
          upazila: vendorLocation.upazila,
        },
        matches: {
          divisionMatches,
          districtMatches,
          upazilaMatches,
        },
      });

      if (
        !divisionMatches ||
        !districtMatches ||
        !upazilaMatches
      ) {
        return res.status(403).json({
          success: false,
          code: "LOCATION_MISMATCH",
          message:
            "এই প্রোডাক্টটি আপনার লোকেশনে উপলব্ধ নেই।",
        });
      }
    }

    // Nationwide এবং delivery settings ছাড়া product এখানে
    // location mismatch-এর কারণে block করা হচ্ছে না।

    const cart = await prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: normalizedProductId,
        },
      },
    });

    const newQuantity =
      (existingItem?.quantity ?? 0) + parsedQuantity;

    if (newQuantity > product.stockQuantity) {
      return res.status(400).json({
        success: false,
        message:
          "Requested quantity exceeds available stock",
      });
    }

    const cartItem = existingItem
      ? await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: newQuantity },
          include: {
            product: {
              include: cartProductInclude,
            },
          },
        })
      : await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: normalizedProductId,
            quantity: parsedQuantity,
          },
          include: {
            product: {
              include: cartProductInclude,
            },
          },
        });

    return res.status(200).json({
      success: true,
      message: "Product added to cart",
      item: cartItem,
    });
  } catch (error) {
    console.error("Add To Cart Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add product to cart",
    });
  }
};

// ------------------------------------------------------------
// UPDATE CART ITEM
// ------------------------------------------------------------

export const updateCartItem = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.id;
    const itemId = getRouteParam(req.params.itemId);

    const parsedQuantity = Number(req.body.quantity);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: "Valid Cart Item ID is required",
      });
    }

    if (
      !Number.isSafeInteger(parsedQuantity) ||
      parsedQuantity < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        cart: { userId },
        OR: [
          { id: itemId },
          { productId: itemId },
        ],
      },
      include: {
        product: {
          select: {
            stockQuantity: true,
          },
        },
      },
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    if (parsedQuantity > cartItem.product.stockQuantity) {
      return res.status(400).json({
        success: false,
        message:
          "Requested quantity exceeds available stock",
      });
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity: parsedQuantity },
      include: {
        product: {
          include: cartProductInclude,
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      item: updatedItem,
    });
  } catch (error) {
    console.error("Update Cart Item Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update cart",
    });
  }
};

// ------------------------------------------------------------
// REMOVE FROM CART
// ------------------------------------------------------------

export const removeFromCart = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.id;
    const itemId = getRouteParam(req.params.itemId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: "Valid Cart Item ID is required",
      });
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        cart: { userId },
        OR: [
          { id: itemId },
          { productId: itemId },
        ],
      },
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    await prisma.cartItem.delete({
      where: { id: cartItem.id },
    });

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
    });
  } catch (error) {
    console.error("Remove From Cart Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove product from cart",
    });
  }
};

// ------------------------------------------------------------
// CLEAR CART
// ------------------------------------------------------------

export const clearCart = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Cart is already empty",
      });
    }

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.error("Clear Cart Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to clear cart",
    });
  }
};
