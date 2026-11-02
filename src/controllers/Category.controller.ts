// import type { Prisma } from "@prisma/client";
// import { Response } from "express";
// import { prisma } from "../config/prisma";
// import { AuthRequest } from "../middleware/auth-middleware";

// /* =========================================================
//    TYPES
// ========================================================= */

// type IncomingCategory = {
//   name: string;
//   image?: string;
//   icon?: string;
//   children?: IncomingCategory[];
// };

// /* =========================================================
//    GENERATE SLUG
// ========================================================= */

// function generateSlug(name: string): string {
//   const baseSlug = name
//     .toLowerCase()
//     .replace(/[^a-z0-9]+/g, "-")
//     .replace(/(^-|-$)+/g, "");

//   const randomSuffix = Math.random().toString(36).substring(2, 7);

//   return `${baseSlug || "category"}-${randomSuffix}`;
// }

// /* =========================================================
//    GENERATE CATEGORY ICON
// ========================================================= */

// function generateCategoryIcon(name: string): string | null {
//   const normalize = (value: string) =>
//     value
//       .toLowerCase()
//       .replace(/&/g, " and ")
//       .replace(/[^a-z0-9\u0980-\u09FF]+/g, " ")
//       .trim();
//   const value = ` ${normalize(name)} `;

//   const rules: { keywords: string[]; icon: string }[] = [
//     {
//       keywords: ["bread", "breads", "loaf", "loaves", "রুটি"],
//       icon: "wheat",
//     },
//     {
//       keywords: [
//         "bakery", "bakeries", "cake", "cakes", "pastry", "pastries",
//         "বেকারি", "কেক",
//       ],
//       icon: "cake",
//     },
//     {
//       keywords: [
//         "beverage", "beverages", "drink", "drinks", "juice", "juices",
//         "soda", "water", "পানীয়", "জুস",
//       ],
//       icon: "cup-soda",
//     },
//     {
//       keywords: ["coffee", "coffees", "tea", "কফি", "চা"],
//       icon: "coffee",
//     },
//     { keywords: ["egg", "eggs", "ডিম"], icon: "egg" },
//     {
//       keywords: [
//         "dairy", "milk", "cheese", "cheeses", "yogurt", "yogurts",
//         "দুধ", "দুগ্ধ", "চিজ",
//       ],
//       icon: "milk",
//     },
//     {
//       keywords: ["fish", "fishes", "seafood", "মাছ", "সামুদ্রিক"],
//       icon: "fish",
//     },
//     {
//       keywords: [
//         "meat", "meats", "chicken", "beef", "poultry",
//         "মাংস", "মুরগি", "গরুর",
//       ],
//       icon: "drumstick",
//     },
//     {
//       keywords: [
//         "fruit", "fruits", "vegetable", "vegetables", "produce",
//         "ফল", "সবজি", "শাক",
//       ],
//       icon: "carrot",
//     },
//     {
//       keywords: [
//         "snack", "snacks", "cookie", "cookies", "biscuit", "biscuits",
//         "chocolate", "স্ন্যাক", "বিস্কুট",
//       ],
//       icon: "cookie",
//     },
//     {
//       keywords: ["frozen", "ice cream", "হিমায়িত", "আইসক্রিম"],
//       icon: "snowflake",
//     },
//     {
//       keywords: [
//         "grain", "grains", "rice", "flour", "wheat", "cereal", "cereals",
//         "চাল", "আটা", "শস্য",
//       ],
//       icon: "wheat",
//     },
//     {
//       keywords: [
//         "cooking", "oil", "oils", "spice", "spices", "condiment",
//         "condiments", "রান্না", "তেল", "মসলা",
//       ],
//       icon: "utensils",
//     },
//     {
//       keywords: [
//         "footwear", "shoe", "shoes", "sandal", "sandals", "boot", "boots",
//         "sneaker", "sneakers", "জুতা",
//       ],
//       icon: "footprints",
//     },
//     {
//       keywords: ["watch", "clock", "ঘড়ি"],
//       icon: "watch",
//     },
//     {
//       keywords: ["bag", "backpack", "luggage", "ব্যাগ"],
//       icon: "backpack",
//     },
//     {
//       keywords: [
//         "fashion", "clothing", "apparel", "garment", "dress",
//         "ফ্যাশন", "পোশাক", "জামা",
//       ],
//       icon: "shirt",
//     },
//     {
//       keywords: [
//         "electronics", "electronic", "mobile", "phone", "laptop",
//         "computer", "gadget", "ইলেকট্রনিক", "মোবাইল", "ফোন",
//         "কম্পিউটার",
//       ],
//       icon: "smartphone",
//     },
//     {
//       keywords: [
//         "grocery", "food", "beverage", "supermarket",
//         "মুদি", "খাবার", "ফুড", "গ্রোসারি",
//       ],
//       icon: "shopping-basket",
//     },
//     {
//       keywords: [
//         "beauty", "cosmetic", "skincare", "makeup",
//         "সৌন্দর্য", "কসমেটিক",
//       ],
//       icon: "sparkles",
//     },
//     {
//       keywords: [
//         "health", "medical", "medicine", "pharmacy",
//         "স্বাস্থ্য", "মেডিকেল", "ওষুধ", "ফার্মেসি",
//       ],
//       icon: "heart-pulse",
//     },
//     {
//       keywords: [
//         "home", "furniture", "decor", "kitchen",
//         "বাড়ি", "হোম", "ফার্নিচার", "রান্নাঘর",
//       ],
//       icon: "home",
//     },
//     {
//       keywords: [
//         "automotive", "automobile", "car", "vehicle",
//         "motorcycle", "bike", "গাড়ি", "অটোমোবাইল",
//         "মোটরসাইকেল",
//       ],
//       icon: "car",
//     },
//     {
//       keywords: [
//         "book", "books", "stationery", "education",
//         "বই", "স্টেশনারি", "শিক্ষা",
//       ],
//       icon: "book-open",
//     },
//     {
//       keywords: [
//         "sports", "sport", "fitness", "gym",
//         "খেলা", "স্পোর্টস", "ফিটনেস",
//       ],
//       icon: "dumbbell",
//     },
//     {
//       keywords: [
//         "travel", "tour", "hotel", "flight",
//         "ট্রাভেল", "ভ্রমণ",
//       ],
//       icon: "plane",
//     },
//     {
//       keywords: [
//         "jewelry", "jewellery", "gold", "diamond",
//         "জুয়েলারি", "গহনা",
//       ],
//       icon: "gem",
//     },
//     {
//       keywords: [
//         "baby", "kids", "toy", "toys",
//         "শিশু", "বাচ্চা", "খেলনা",
//       ],
//       icon: "baby",
//     },
//     {
//       keywords: [
//         "pet", "pets", "animal", "পোষা", "প্রাণী",
//       ],
//       icon: "paw-print",
//     },
//     {
//       keywords: [
//         "office", "business", "corporate",
//         "অফিস", "ব্যবসা",
//       ],
//       icon: "briefcase",
//     },
//     {
//       keywords: [
//         "tool", "tools", "hardware",
//         "টুলস", "হার্ডওয়্যার",
//       ],
//       icon: "wrench",
//     },
//     {
//       keywords: [
//         "game", "gaming", "video game",
//         "গেম", "গেমিং",
//       ],
//       icon: "gamepad-2",
//     },
//   ];

//   const matchedRule = rules.find((rule) =>
//     rule.keywords.some((keyword) =>
//       value.includes(` ${normalize(keyword)} `),
//     )
//   );

//   return matchedRule?.icon ?? null;
// }

// /* =========================================================
//    GET NEXT SIBLING SORT ORDER
//    নতুন category একই parent-এর শেষে যুক্ত হবে
// ========================================================= */

// async function getNextSortOrder(
//   parentId: string | null,
// ): Promise<number> {
//   const lastCategory = await prisma.category.findFirst({
//     where: {
//       parentId,
//     },
//     orderBy: [
//       { sortOrder: "desc" },
//       { name: "desc" },
//     ],
//     select: {
//       sortOrder: true,
//     },
//   });

//   return (lastCategory?.sortOrder ?? 0) + 1;
// }

// /* =========================================================
//    CREATE CATEGORY RECURSIVELY
// ========================================================= */

// async function createCategoryRecursive(
//   node: IncomingCategory,
//   parentId: string | null,
// ) {
//   const cleanName = String(node.name || "").trim();

//   if (!cleanName) {
//     throw new Error("Category name is required");
//   }

//   const sortOrder = await getNextSortOrder(parentId);

//   const created = await prisma.category.create({
//     data: {
//       name: cleanName,
//       slug: generateSlug(cleanName),
//       parentId,
//       sortOrder,

//       image: String(node.image || "").trim() || null,

//       icon: generateCategoryIcon(cleanName),
//     },
//   });

//   if (Array.isArray(node.children)) {
//     for (const child of node.children) {
//       await createCategoryRecursive(child, created.id);
//     }
//   }

//   return created;
// }

// /* =========================================================
//    BULK CREATE CATEGORIES
// ========================================================= */

// export async function bulkCreateCategories(
//   req: AuthRequest,
//   res: Response,
// ) {
//   try {
//     const { categories } = req.body as {
//       categories: IncomingCategory[];
//     };

//     if (!Array.isArray(categories) || categories.length === 0) {
//       return res.status(400).json({
//         success: false,
//         error: "কোনো category দেওয়া হয়নি",
//       });
//     }

//     for (const root of categories) {
//       await createCategoryRecursive(root, null);
//     }

//     return res.status(201).json({
//       success: true,
//       message: "Categories created successfully.",
//     });
//   } catch (err: any) {
//     console.error("Bulk category create error:", err);

//     return res.status(500).json({
//       success: false,
//       error: err?.message || "সেভ করা যায়নি",
//     });
//   }
// }

// /* =========================================================
//    DELETE CATEGORY
// ========================================================= */

// export async function deleteCategory(
//   req: AuthRequest,
//   res: Response,
// ) {
//   try {
//     const id = String(req.params.id || "").trim();

//     if (!id) {
//       return res.status(400).json({
//         success: false,
//         error: "Category id is required",
//       });
//     }

//     const category = await prisma.category.findUnique({
//       where: { id },
//       select: {
//         id: true,
//         name: true,
//       },
//     });

//     if (!category) {
//       return res.status(404).json({
//         success: false,
//         error: "Category পাওয়া যায়নি",
//       });
//     }

//     await prisma.category.delete({
//       where: { id },
//     });

//     return res.status(200).json({
//       success: true,
//       message: `Category "${category.name}" deleted successfully.`,
//       data: {
//         id: category.id,
//         name: category.name,
//       },
//     });
//   } catch (err: any) {
//     console.error("Delete category error:", err);

//     return res.status(500).json({
//       success: false,
//       error: err?.message || "Category delete করা যায়নি",
//     });
//   }
// }

// /* =========================================================
//    GET ALL CATEGORIES
//    ADMIN CATEGORY LIST
// ========================================================= */

// export async function getCategories(
//   req: AuthRequest,
//   res: Response,
// ) {
//   try {
//     const categories = await prisma.category.findMany({
//       select: {
//         id: true,
//         name: true,
//         slug: true,
//         type: true,
//         fieldsConfig: true,
//         parentId: true,
//         image: true,
//         icon: true,
//         sortOrder: true,
//       },
//     });

//     // Root category আগে; এরপর parent group এবং manual order
//    categories.sort((a: (typeof categories)[number], b: (typeof categories)[number]) => {
//       if (a.parentId === null && b.parentId !== null) return -1;
//       if (a.parentId !== null && b.parentId === null) return 1;

//       if (a.parentId !== b.parentId) {
//         return String(a.parentId ?? "").localeCompare(
//           String(b.parentId ?? ""),
//         );
//       }

//       return (
//         a.sortOrder - b.sortOrder ||
//         a.name.localeCompare(b.name)
//       );
//     });

//     return res.status(200).json({
//       success: true,
//       count: categories.length,
//       data: categories,
//     });
//   } catch (err: any) {
//     console.error("Get categories error:", err);

//     return res.status(500).json({
//       success: false,
//       error: err?.message || "Categories fetch করা যায়নি",
//     });
//   }
// }

// /* =========================================================
//    CREATE SINGLE CATEGORY
// ========================================================= */

// export async function createCategory(
//   req: AuthRequest,
//   res: Response,
// ) {
//   try {
//     const { name, parentId, image } = req.body;

//     const cleanName = String(name || "").trim();

//     if (!cleanName) {
//       return res.status(400).json({
//         success: false,
//         error: "Category name is required",
//       });
//     }

//     const existing = await prisma.category.findFirst({
//       where: {
//         name: {
//           equals: cleanName,
//           mode: "insensitive",
//         },
//       },
//       select: {
//         id: true,
//       },
//     });

//     if (existing) {
//       return res.status(409).json({
//         success: false,
//         error: `Category "${cleanName}" already exists.`,
//       });
//     }

//     let cleanParentId: string | null = null;

//     if (parentId) {
//       cleanParentId = String(parentId).trim();

//       const parent = await prisma.category.findUnique({
//         where: { id: cleanParentId },
//         select: { id: true },
//       });

//       if (!parent) {
//         return res.status(404).json({
//           success: false,
//           error: "Parent category not found.",
//         });
//       }
//     }

//     const sortOrder = await getNextSortOrder(cleanParentId);

//     const category = await prisma.category.create({
//       data: {
//         name: cleanName,
//         slug: generateSlug(cleanName),
//         parentId: cleanParentId,
//         sortOrder,

//         image: String(image || "").trim() || null,

//         icon: generateCategoryIcon(cleanName),
//       },
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Category created successfully.",
//       data: category,
//     });
//   } catch (err: any) {
//     console.error("Create category error:", err);

//     return res.status(500).json({
//       success: false,
//       error: err?.message || "Category create করা যায়নি",
//     });
//   }
// }

// export async function updateCategoryImage(
//   req: AuthRequest,
//   res: Response,
// ) {
//   try {
//     const id = String(req.params.id || "").trim();
//     const image =
//       typeof req.body?.image === "string" ? req.body.image.trim() : "";

//     if (!id || !image) {
//       return res.status(400).json({
//         success: false,
//         error: "Category id and image are required.",
//       });
//     }

//     const category = await prisma.category.update({
//       where: { id },
//       data: { image },
//       select: {
//         id: true,
//         name: true,
//         image: true,
//       },
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Category image updated successfully.",
//       data: category,
//     });
//   } catch (err: any) {
//     console.error("Update category image error:", err);

//     if (err?.code === "P2025") {
//       return res.status(404).json({
//         success: false,
//         error: "Category পাওয়া যায়নি",
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       error: err?.message || "Category image update করা যায়নি",
//     });
//   }
// }

// /* =========================================================
//    GET MAIN CATEGORIES WITH PRODUCT COUNT
//    COMPLETE CATEGORY TREE + SORT ORDER
// ========================================================= */

// export async function getMainCategoriesWithProductCount(
//   req: AuthRequest,
//   res: Response,
// ) {
//   try {
//     const categories = await prisma.category.findMany({
//       select: {
//         id: true,
//         name: true,
//         slug: true,
//         image: true,
//         icon: true,
//         parentId: true,
//         sortOrder: true,
//         _count: {
//           select: {
//             products: true,
//           },
//         },
//       },
//       orderBy: [
//         { sortOrder: "asc" },
//         { name: "asc" },
//       ],
//     });

//     type CategoryMapItem = {
//       id: string;
//       name: string;
//       slug: string;
//       image: string | null;
//       icon: string | null;
//       parentId: string | null;
//       sortOrder: number;
//       productCount: number;
//       children: string[];
//     };

//     const categoryMap = new Map<string, CategoryMapItem>();

//     for (const category of categories) {
//       categoryMap.set(category.id, {
//         id: category.id,
//         name: category.name,
//         slug: category.slug,
//         image: category.image,
//         icon: category.icon,
//         parentId: category.parentId,
//         sortOrder: category.sortOrder,
//         productCount: category._count.products,
//         children: [],
//       });
//     }

//     // Build parent-child relationships
//     for (const category of categories) {
//       if (category.parentId) {
//         const parent = categoryMap.get(category.parentId);

//         if (parent) {
//           parent.children.push(category.id);
//         }
//       }
//     }

//     // Sort children within each parent
//     function sortChildren(parent: CategoryMapItem): void {
//       parent.children.sort((idA, idB) => {
//         const a = categoryMap.get(idA)!;
//         const b = categoryMap.get(idB)!;

//         return (
//           a.sortOrder - b.sortOrder ||
//           a.name.localeCompare(b.name)
//         );
//       });

//       for (const childId of parent.children) {
//         const child = categoryMap.get(childId);

//         if (child) {
//           sortChildren(child);
//         }
//       }
//     }

//     const rootCategories = categories
//       .filter((category) => category.parentId === null)
//       .map((category) => categoryMap.get(category.id)!)
//       .sort(
//         (a, b) =>
//           a.sortOrder - b.sortOrder ||
//           a.name.localeCompare(b.name),
//       );

//     for (const root of rootCategories) {
//       sortChildren(root);
//     }

//     // Count products in this category and its descendants
//     function getTotalProductCount(
//       categoryId: string,
//       visited: Set<string> = new Set(),
//     ): number {
//       if (visited.has(categoryId)) return 0;

//       visited.add(categoryId);

//       const category = categoryMap.get(categoryId);

//       if (!category) return 0;

//       let total = category.productCount;

//       for (const childId of category.children) {
//         total += getTotalProductCount(childId, visited);
//       }

//       return total;
//     }

//     // Build nested category tree
//     function buildTree(
//       categoryId: string,
//       visited: Set<string> = new Set(),
//     ): any {
//       if (visited.has(categoryId)) return null;

//       const category = categoryMap.get(categoryId);

//       if (!category) return null;

//       const nextVisited = new Set(visited);
//       nextVisited.add(categoryId);

//       return {
//         id: category.id,
//         name: category.name,
//         slug: category.slug,
//         image: category.image,
//         icon: category.icon,
//         parentId: category.parentId,
//         sortOrder: category.sortOrder,
//         productCount: getTotalProductCount(categoryId),
//         children: category.children
//           .map((childId) => buildTree(childId, nextVisited))
//           .filter(Boolean),
//       };
//     }

//     const data = rootCategories.map((category) =>
//       buildTree(category.id),
//     );

//     return res.status(200).json({
//       success: true,
//       count: data.length,
//       data,
//     });
//   } catch (err: any) {
//     console.error("Get main categories error:", err);

//     return res.status(500).json({
//       success: false,
//       error: err?.message || "Categories fetch করা যায়নি",
//     });
//   }
// }

// /* =========================================================
//    REORDER CATEGORIES
//    MANUAL DRAG-AND-DROP ORDER
// ========================================================= */

// export async function reorderCategories(
//   req: AuthRequest,
//   res: Response,
// ) {
//   try {
//     const { parentId, categoryIds } = req.body as {
//       parentId: string | null;
//       categoryIds: string[];
//     };

//     if (
//       !Array.isArray(categoryIds) ||
//       categoryIds.length === 0 ||
//       categoryIds.some((id) => typeof id !== "string" || !id.trim()) ||
//       new Set(categoryIds).size !== categoryIds.length
//     ) {
//       return res.status(400).json({
//         success: false,
//         error: "Valid categoryIds দিতে হবে।",
//       });
//     }

//     const normalizedParentId = parentId || null;

//     const existing = await prisma.category.findMany({
//       where: {
//         id: { in: categoryIds },
//       },
//       select: {
//         id: true,
//         parentId: true,
//       },
//     });

//     if (
//       existing.length !== categoryIds.length ||
//       existing.some(
//         (item) => item.parentId !== normalizedParentId,
//       )
//     ) {
//       return res.status(400).json({
//         success: false,
//         error: "Category list-এ invalid parent বা category আছে।",
//       });
//     }

//     await prisma.$transaction(
//       categoryIds.map((id, index) =>
//         prisma.category.update({
//           where: { id },
//           data: { sortOrder: index + 1 },
//         }),
//       ),
//     );

//     return res.status(200).json({
//       success: true,
//       message: "Category order saved successfully.",
//     });
//   } catch (err: any) {
//     console.error("Reorder categories error:", err);

//     return res.status(500).json({
//       success: false,
//       error: err?.message || "Category order save করা যায়নি।",
//     });
//   }
// }



import { Response } from "express";
import type { Prisma } from "@prisma/client";

import { prisma } from "../config/prisma";

import { AuthRequest } from "../middleware/auth-middleware";

type IncomingCategory = {

  name: string;

  image?: string;

  icon?: string;

  children?: IncomingCategory[];

};

type AdminCategoryRow = Prisma.CategoryGetPayload<{
  select: {
    id: true;
    name: true;
    slug: true;
    type: true;
    fieldsConfig: true;
    parentId: true;
    image: true;
    icon: true;
    sortOrder: true;
  };
}>;

type MainCategoryRow = Prisma.CategoryGetPayload<{
  select: {
    id: true;
    name: true;
    slug: true;
    image: true;
    icon: true;
    parentId: true;
    sortOrder: true;
    _count: {
      select: {
        products: true;
      };
    };
  };
}>;

function generateSlug(name: string): string {

  const baseSlug = name

    .toLowerCase()

    .replace(/[^a-z0-9]+/g, "-")

    .replace(/(^-|-$)+/g, "");

  const randomSuffix = Math.random().toString(36).substring(2, 7);

  return `${baseSlug || "category"}-${randomSuffix}`;

}

function generateCategoryIcon(name: string): string | null {

  const normalize = (value: string) =>

    value

      .toLowerCase()

      .replace(/&/g, " and ")

      .replace(/[^a-z0-9\u0980-\u09FF]+/g, " ")

      .trim();

  const value = ` ${normalize(name)} `;

  const rules: { keywords: string[]; icon: string }[] = [

    {

      keywords: ["bread", "breads", "loaf", "loaves", "রুটি"],

      icon: "wheat",

    },

    {

      keywords: [

        "bakery", "bakeries", "cake", "cakes", "pastry", "pastries",

        "বেকারি", "কেক",

      ],

      icon: "cake",

    },

    {

      keywords: [

        "beverage", "beverages", "drink", "drinks", "juice", "juices",

        "soda", "water", "পানীয়", "জুস",

      ],

      icon: "cup-soda",

    },

    {

      keywords: ["coffee", "coffees", "tea", "কফি", "চা"],

      icon: "coffee",

    },

    { keywords: ["egg", "eggs", "ডিম"], icon: "egg" },

    {

      keywords: [

        "dairy", "milk", "cheese", "cheeses", "yogurt", "yogurts",

        "দুধ", "দুগ্ধ", "চিজ",

      ],

      icon: "milk",

    },

    {

      keywords: ["fish", "fishes", "seafood", "মাছ", "সামুদ্রিক"],

      icon: "fish",

    },

    {

      keywords: [

        "meat", "meats", "chicken", "beef", "poultry",

        "মাংস", "মুরগি", "গরুর",

      ],

      icon: "drumstick",

    },

    {

      keywords: [

        "fruit", "fruits", "vegetable", "vegetables", "produce",

        "ফল", "সবজি", "শাক",

      ],

      icon: "carrot",

    },

    {

      keywords: [

        "snack", "snacks", "cookie", "cookies", "biscuit", "biscuits",

        "chocolate", "স্ন্যাক", "বিস্কুট",

      ],

      icon: "cookie",

    },

    {

      keywords: ["frozen", "ice cream", "হিমায়িত", "আইসক্রিম"],

      icon: "snowflake",

    },

    {

      keywords: [

        "grain", "grains", "rice", "flour", "wheat", "cereal", "cereals",

        "চাল", "আটা", "শস্য",

      ],

      icon: "wheat",

    },

    {

      keywords: [

        "cooking", "oil", "oils", "spice", "spices", "condiment",

        "condiments", "রান্না", "তেল", "মসলা",

      ],

      icon: "utensils",

    },

    {

      keywords: [

        "footwear", "shoe", "shoes", "sandal", "sandals", "boot", "boots",

        "sneaker", "sneakers", "জুতা",

      ],

      icon: "footprints",

    },

    {

      keywords: ["watch", "clock", "ঘড়ি"],

      icon: "watch",

    },

    {

      keywords: ["bag", "backpack", "luggage", "ব্যাগ"],

      icon: "backpack",

    },

    {

      keywords: [

        "fashion", "clothing", "apparel", "garment", "dress",

        "ফ্যাশন", "পোশাক", "জামা",

      ],

      icon: "shirt",

    },

    {

      keywords: [

        "electronics", "electronic", "mobile", "phone", "laptop",

        "computer", "gadget", "ইলেকট্রনিক", "মোবাইল", "ফোন",

        "কম্পিউটার",

      ],

      icon: "smartphone",

    },

    {

      keywords: [

        "grocery", "food", "beverage", "supermarket",

        "মুদি", "খাবার", "ফুড", "গ্রোসারি",

      ],

      icon: "shopping-basket",

    },

    {

      keywords: [

        "beauty", "cosmetic", "skincare", "makeup",

        "সৌন্দর্য", "কসমেটিক",

      ],

      icon: "sparkles",

    },

    {

      keywords: [

        "health", "medical", "medicine", "pharmacy",

        "স্বাস্থ্য", "মেডিকেল", "ওষুধ", "ফার্মেসি",

      ],

      icon: "heart-pulse",

    },

    {

      keywords: [

        "home", "furniture", "decor", "kitchen",

        "বাড়ি", "হোম", "ফার্নিচার", "রান্নাঘর",

      ],

      icon: "home",

    },

    {

      keywords: [

        "automotive", "automobile", "car", "vehicle",

        "motorcycle", "bike", "গাড়ি", "অটোমোবাইল",

        "মোটরসাইকেল",

      ],

      icon: "car",

    },

    {

      keywords: [

        "book", "books", "stationery", "education",

        "বই", "স্টেশনারি", "শিক্ষা",

      ],

      icon: "book-open",

    },

    {

      keywords: [

        "sports", "sport", "fitness", "gym",

        "খেলা", "স্পোর্টস", "ফিটনেস",

      ],

      icon: "dumbbell",

    },

    {

      keywords: [

        "travel", "tour", "hotel", "flight",

        "ট্রাভেল", "ভ্রমণ",

      ],

      icon: "plane",

    },

    {

      keywords: [

        "jewelry", "jewellery", "gold", "diamond",

        "জুয়েলারি", "গহনা",

      ],

      icon: "gem",

    },

    {

      keywords: [

        "baby", "kids", "toy", "toys",

        "শিশু", "বাচ্চা", "খেলনা",

      ],

      icon: "baby",

    },

    {

      keywords: [

        "pet", "pets", "animal", "পোষা", "প্রাণী",

      ],

      icon: "paw-print",

    },

    {

      keywords: [

        "office", "business", "corporate",

        "অফিস", "ব্যবসা",

      ],

      icon: "briefcase",

    },

    {

      keywords: [

        "tool", "tools", "hardware",

        "টুলস", "হার্ডওয়্যার",

      ],

      icon: "wrench",

    },

    {

      keywords: [

        "game", "gaming", "video game",

        "গেম", "গেমিং",

      ],

      icon: "gamepad-2",

    },

  ];

  const matchedRule = rules.find((rule) =>

    rule.keywords.some((keyword) =>

      value.includes(` ${normalize(keyword)} `),

    )

  );

  return matchedRule?.icon ?? null;

}

async function getNextSortOrder(

  parentId: string | null,

): Promise<number> {

  const lastCategory = await prisma.category.findFirst({

    where: {

      parentId,

    },

    orderBy: [

      { sortOrder: "desc" },

      { name: "desc" },

    ],

    select: {

      sortOrder: true,

    },

  });

  return (lastCategory?.sortOrder ?? 0) + 1;

}

async function createCategoryRecursive(

  node: IncomingCategory,

  parentId: string | null,

) {

  const cleanName = String(node.name || "").trim();

  if (!cleanName) {

    throw new Error("Category name is required");

  }

  const sortOrder = await getNextSortOrder(parentId);

  const created = await prisma.category.create({

    data: {

      name: cleanName,

      slug: generateSlug(cleanName),

      parentId,

      sortOrder,

      image: String(node.image || "").trim() || null,

      icon: parentId === null ? generateCategoryIcon(cleanName) : null,

    },

  });

  if (Array.isArray(node.children)) {

    for (const child of node.children) {

      await createCategoryRecursive(child, created.id);

    }

  }

  return created;

}

export async function bulkCreateCategories(

  req: AuthRequest,

  res: Response,

) {

  try {

    const { categories } = req.body as {

      categories: IncomingCategory[];

    };

    if (!Array.isArray(categories) || categories.length === 0) {

      return res.status(400).json({

        success: false,

        error: "কোনো category দেওয়া হয়নি",

      });

    }

    for (const root of categories) {

      await createCategoryRecursive(root, null);

    }

    return res.status(201).json({

      success: true,

      message: "Categories created successfully.",

    });

  } catch (err: any) {

    console.error("Bulk category create error:", err);

    return res.status(500).json({

      success: false,

      error: err?.message || "সেভ করা যায়নি",

    });

  }

}

export async function deleteCategory(

  req: AuthRequest,

  res: Response,

) {

  try {

    const id = String(req.params.id || "").trim();

    if (!id) {

      return res.status(400).json({

        success: false,

        error: "Category id is required",

      });

    }

    const category = await prisma.category.findUnique({

      where: { id },

      select: {

        id: true,

        name: true,

      },

    });

    if (!category) {

      return res.status(404).json({

        success: false,

        error: "Category পাওয়া যায়নি",

      });

    }

    await prisma.category.delete({

      where: { id },

    });

    return res.status(200).json({

      success: true,

      message: `Category "${category.name}" deleted successfully.`,

      data: {

        id: category.id,

        name: category.name,

      },

    });

  } catch (err: any) {

    console.error("Delete category error:", err);

    return res.status(500).json({

      success: false,

      error: err?.message || "Category delete করা যায়নি",

    });

  }

}

export async function getCategories(

  req: AuthRequest,

  res: Response,

) {

  try {

    const categories: AdminCategoryRow[] = await prisma.category.findMany({

      select: {

        id: true,

        name: true,

        slug: true,

        type: true,

        fieldsConfig: true,

        parentId: true,

        image: true,

        icon: true,

        sortOrder: true,

      },

    });

    // Root category আগে; এরপর parent group এবং manual order

   categories.sort((a: (typeof categories)[number], b: (typeof categories)[number]) => {

      if (a.parentId === null && b.parentId !== null) return -1;

      if (a.parentId !== null && b.parentId === null) return 1;

      if (a.parentId !== b.parentId) {

        return String(a.parentId ?? "").localeCompare(

          String(b.parentId ?? ""),

        );

      }

      return (

        a.sortOrder - b.sortOrder ||

        a.name.localeCompare(b.name)

      );

    });

    return res.status(200).json({

      success: true,

      count: categories.length,

      data: categories,

    });

  } catch (err: any) {

    console.error("Get categories error:", err);

    return res.status(500).json({

      success: false,

      error: err?.message || "Categories fetch করা যায়নি",

    });

  }

}

export async function createCategory(

  req: AuthRequest,

  res: Response,

) {

  try {

    const { name, parentId, image } = req.body;

    const cleanName = String(name || "").trim();

    if (!cleanName) {

      return res.status(400).json({

        success: false,

        error: "Category name is required",

      });

    }

    const existing = await prisma.category.findFirst({

      where: {

        name: {

          equals: cleanName,

          mode: "insensitive",

        },

      },

      select: {

        id: true,

      },

    });

    if (existing) {

      return res.status(409).json({

        success: false,

        error: `Category "${cleanName}" already exists.`,

      });

    }

    let cleanParentId: string | null = null;

    if (parentId) {

      cleanParentId = String(parentId).trim();

      const parent = await prisma.category.findUnique({

        where: { id: cleanParentId },

        select: { id: true },

      });

      if (!parent) {

        return res.status(404).json({

          success: false,

          error: "Parent category not found.",

        });

      }

    }

    const sortOrder = await getNextSortOrder(cleanParentId);

    const category = await prisma.category.create({

      data: {

        name: cleanName,

        slug: generateSlug(cleanName),

        parentId: cleanParentId,

        sortOrder,

        image: String(image || "").trim() || null,

        icon: cleanParentId === null ? generateCategoryIcon(cleanName) : null,

      },

    });

    return res.status(201).json({

      success: true,

      message: "Category created successfully.",

      data: category,

    });

  } catch (err: any) {

    console.error("Create category error:", err);

    return res.status(500).json({

      success: false,

      error: err?.message || "Category create করা যায়নি",

    });

  }

}

export async function updateCategoryImage(

  req: AuthRequest,

  res: Response,

) {

  try {

    const id = String(req.params.id || "").trim();

    const image =

      typeof req.body?.image === "string" ? req.body.image.trim() : "";

    if (!id || !image) {

      return res.status(400).json({

        success: false,

        error: "Category id and image are required.",

      });

    }

    const category = await prisma.category.update({

      where: { id },

      data: { image },

      select: {

        id: true,

        name: true,

        image: true,

      },

    });

    return res.status(200).json({

      success: true,

      message: "Category image updated successfully.",

      data: category,

    });

  } catch (err: any) {

    console.error("Update category image error:", err);

    if (err?.code === "P2025") {

      return res.status(404).json({

        success: false,

        error: "Category পাওয়া যায়নি",

      });

    }

    return res.status(500).json({

      success: false,

      error: err?.message || "Category image update করা যায়নি",

    });

  }

}

export async function getMainCategoriesWithProductCount(

  req: AuthRequest,

  res: Response,

) {

  try {

    const categories: MainCategoryRow[] = await prisma.category.findMany({

      select: {

        id: true,

        name: true,

        slug: true,

        image: true,

        icon: true,

        parentId: true,

        sortOrder: true,

        _count: {

          select: {

            products: true,

          },

        },

      },

      orderBy: [

        { sortOrder: "asc" },

        { name: "asc" },

      ],

    });

    type CategoryMapItem = {

      id: string;

      name: string;

      slug: string;

      image: string | null;

      icon: string | null;

      parentId: string | null;

      sortOrder: number;

      productCount: number;

      children: string[];

    };

    const categoryMap = new Map<string, CategoryMapItem>();

    for (const category of categories) {

      categoryMap.set(category.id, {

        id: category.id,

        name: category.name,

        slug: category.slug,

        image: category.image,

        icon: category.icon,

        parentId: category.parentId,

        sortOrder: category.sortOrder,

        productCount: category._count.products,

        children: [],

      });

    }

    // Build parent-child relationships

    for (const category of categories) {

      if (category.parentId) {

        const parent = categoryMap.get(category.parentId);

        if (parent) {

          parent.children.push(category.id);

        }

      }

    }

    // Sort children within each parent

    function sortChildren(parent: CategoryMapItem): void {

      parent.children.sort((idA, idB) => {

        const a = categoryMap.get(idA)!;

        const b = categoryMap.get(idB)!;

        return (

          a.sortOrder - b.sortOrder ||

          a.name.localeCompare(b.name)

        );

      });

      for (const childId of parent.children) {

        const child = categoryMap.get(childId);

        if (child) {

          sortChildren(child);

        }

      }

    }

    const rootCategories = categories

      .filter((category) => category.parentId === null)

      .map((category) => categoryMap.get(category.id)!)

      .sort(

        (a, b) =>

          a.sortOrder - b.sortOrder ||

          a.name.localeCompare(b.name),

      );

    for (const root of rootCategories) {

      sortChildren(root);

    }

    // Count products in this category and its descendants

    function getTotalProductCount(

      categoryId: string,

      visited: Set<string> = new Set(),

    ): number {

      if (visited.has(categoryId)) return 0;

      visited.add(categoryId);

      const category = categoryMap.get(categoryId);

      if (!category) return 0;

      let total = category.productCount;

      for (const childId of category.children) {

        total += getTotalProductCount(childId, visited);

      }

      return total;

    }

    // Build nested category tree

    function buildTree(

      categoryId: string,

      visited: Set<string> = new Set(),

    ): any {

      if (visited.has(categoryId)) return null;

      const category = categoryMap.get(categoryId);

      if (!category) return null;

      const nextVisited = new Set(visited);

      nextVisited.add(categoryId);

      return {

        id: category.id,

        name: category.name,

        slug: category.slug,

        image: category.image,

        icon: category.icon,

        parentId: category.parentId,

        sortOrder: category.sortOrder,

        productCount: getTotalProductCount(categoryId),

        children: category.children

          .map((childId) => buildTree(childId, nextVisited))

          .filter(Boolean),

      };

    }

    const data = rootCategories.map((category) =>

      buildTree(category.id),

    );

    return res.status(200).json({

      success: true,

      count: data.length,

      data,

    });

  } catch (err: any) {

    console.error("Get main categories error:", err);

    return res.status(500).json({

      success: false,

      error: err?.message || "Categories fetch করা যায়নি",

    });

  }

}

export async function reorderCategories(

  req: AuthRequest,

  res: Response,

) {

  try {

    const { parentId, categoryIds } = req.body as {

      parentId: string | null;

      categoryIds: string[];

    };

    if (

      !Array.isArray(categoryIds) ||

      categoryIds.length === 0 ||

      categoryIds.some((id) => typeof id !== "string" || !id.trim()) ||

      new Set(categoryIds).size !== categoryIds.length

    ) {

      return res.status(400).json({

        success: false,

        error: "Valid categoryIds দিতে হবে।",

      });

    }

    const normalizedParentId = parentId || null;

    const existing = await prisma.category.findMany({

      where: {

        id: { in: categoryIds },

      },

      select: {

        id: true,

        parentId: true,

      },

    });

    if (

      existing.length !== categoryIds.length ||

      existing.some(

        (item) => item.parentId !== normalizedParentId,

      )

    ) {

      return res.status(400).json({

        success: false,

        error: "Category list-এ invalid parent বা category আছে।",

      });

    }

    await prisma.$transaction(

      categoryIds.map((id, index) =>

        prisma.category.update({

          where: { id },

          data: { sortOrder: index + 1 },

        }),

      ),

    );

    return res.status(200).json({

      success: true,

      message: "Category order saved successfully.",

    });

  } catch (err: any) {

    console.error("Reorder categories error:", err);

    return res.status(500).json({

      success: false,

      error: err?.message || "Category order save করা যায়নি।",

    });

  }

}
