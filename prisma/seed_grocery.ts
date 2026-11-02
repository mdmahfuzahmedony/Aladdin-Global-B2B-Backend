import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in backend/.env");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

type CategoryDef = {
  name: string;
  slug: string;
  icon?: string;
  children?: CategoryDef[];
};

const groceryTree: CategoryDef = {
  name: "Grocery",
  slug: "grocery",
 
  children: [
    {
      name: "Bakery",
      slug: "bakery",
     
      children: [
        { name: "Biscuits", slug: "biscuits" },
        { name: "Bread", slug: "bread" },
        { name: "Bun", slug: "bun" },
        { name: "Cake", slug: "cake" },
        { name: "Cookies", slug: "cookies" },
        { name: "Pastry", slug: "pastry" },
        { name: "Pies", slug: "pies" },
        { name: "Sweets", slug: "sweets" },
        { name: "Toast", slug: "toast" },
        { name: "Chocolate", slug: "chocolate" },
        { name: "Candy", slug: "candy" },
        { name: "Toffee", slug: "toffee" },
      ],
    },
    {
      name: "Beverages",
      slug: "beverages",
     
      children: [
        { name: "Tea", slug: "tea" },
        { name: "Coffee", slug: "coffee" },
        { name: "Juice", slug: "juice" },
        { name: "Mineral Water", slug: "mineral-water" },
        { name: "Soft Drinks", slug: "soft-drinks" },
        { name: "Energy Drinks", slug: "energy-drinks" },
        { name: "Sports Drinks", slug: "sports-drinks" },
      ],
    },
    {
      name: "Breakfast",
      slug: "breakfast",
    
      children: [
        { name: "Cereals", slug: "cereals" },
        { name: "Granola", slug: "granola" },
        { name: "Oatmeal & Grits", slug: "oatmeal-grits" },
        { name: "Jam & Jelly", slug: "jam-jelly" },
        { name: "Honey", slug: "honey" },
        { name: "Dips & Spreads", slug: "dips-spreads" },
        { name: "Local Breakfast", slug: "local-breakfast" },
      ],
    },
    {
      name: "Cooking & Essentials",
      slug: "cooking-and-essential",
    
      children: [
        {
          name: "Rice & Grains",
          slug: "rice-and-grains",
          children: [
            { name: "Rice", slug: "rice" },
            { name: "Dal", slug: "dal" },
            { name: "Flour", slug: "flour" },
            { name: "Maida", slug: "maida" },
            { name: "Suji", slug: "suji" },
            { name: "Oats", slug: "oats" },
          ],
        },
        {
          name: "Oil & Ghee",
          slug: "oil-and-ghee",
          children: [
            { name: "Soybean Oil", slug: "soybean-oil" },
            { name: "Mustard Oil", slug: "mustard-oil" },
            { name: "Olive Oil", slug: "olive-oil" },
            { name: "Sunflower Oil", slug: "sunflower-oil" },
            { name: "Ghee", slug: "cooking-ghee" },
          ],
        },
        {
          name: "Spices & Salt",
          slug: "spices-and-salt",
          children: [
            { name: "Salt", slug: "salt" },
            { name: "Chili", slug: "chili" },
            { name: "Turmeric", slug: "turmeric" },
            { name: "Coriander", slug: "coriander" },
            { name: "Cumin", slug: "cumin" },
            { name: "Garam Masala", slug: "garam-masala" },
          ],
        },
        {
          name: "Fresh Produce",
          slug: "fresh-produce",
          children: [
            { name: "Fruits", slug: "fruits" },
            { name: "Leafy Greens", slug: "leafy-greens" },
            { name: "Vegetables", slug: "vegetables" },
          ],
        },
        {
          name: "Meat & Fish",
          slug: "meat-and-fish",
          children: [
            { name: "Chicken", slug: "chicken" },
            { name: "Beef", slug: "beef" },
            { name: "Mutton", slug: "mutton" },
            { name: "Fish", slug: "fish" },
          ],
        },
      ],
    },
    {
      name: "Dairy & Eggs",
      slug: "dairy-and-eggs",
    
      children: [
        {
          name: "Dairy",
          slug: "dairy",
          children: [
            { name: "Ghee", slug: "dairy-ghee" },
            { name: "Butter & Sour Cream", slug: "butter-sour-cream" },
            { name: "Cheese", slug: "cheese" },
            { name: "Condensed Milk & Cream", slug: "condensed-milk-cream" },
            {
              name: "UHT & Liquid Milk & Milk Powder",
              slug: "milk",
            },
            { name: "Yogurt, Curds & Sweets", slug: "yogurt-curds" },
            { name: "Laban", slug: "laban" },
            { name: "Lassi", slug: "lacchi" },
            { name: "Borhani", slug: "borhani" },
            { name: "Ice Cream", slug: "ice-cream" },
            { name: "Matha", slug: "matha" },
          ],
        },
        {
          name: "Eggs",
          slug: "eggs",
          children: [
            { name: "Chicken Eggs", slug: "chicken-eggs" },
            { name: "Duck Eggs", slug: "duck-eggs" },
            { name: "Quail Eggs", slug: "quail-eggs" },
          ],
        },
      ],
    },
    {
      name: "Snacks & Confectioneries",
      slug: "snacks-and-confectioneries",
    
      children: [
        { name: "Chips", slug: "chips" },
        { name: "Noodles", slug: "noodles" },
        { name: "Candy & Chocolate", slug: "candy-and-chocolate" },
        { name: "Dried Fruits & Nuts", slug: "dried-fruits-nuts" },
      ],
    },
    {
      name: "Canned & Frozen Food",
      slug: "canned-and-frozen-food",
      
      children: [
        { name: "Canned Fish", slug: "canned-fish" },
        { name: "Canned Vegetables", slug: "canned-vegetables" },
        { name: "Pickles", slug: "pickles" },
        { name: "Sauces", slug: "sauces" },
        { name: "Frozen Chicken", slug: "frozen-chicken" },
        { name: "Frozen Fish", slug: "frozen-fish" },
        { name: "Frozen Snacks", slug: "frozen-snacks" },
      ],
    },
    {
      name: "Laundry & Household",
      slug: "laundry-and-household",
     
      children: [
        { name: "Cleaning & Detergents", slug: "cleaning-supplies" },
      ],
    },
    {
      name: "Pet Care",
      slug: "pet-care",
    
      children: [
        { name: "Pet Food", slug: "pet-food" },
      ],
    },
  ],
};

async function insertCategoryRecursive(
  cat: CategoryDef,
  parentId: string | null = null
): Promise<void> {
  // Check if exists by slug or name+parentId
  let existing = await prisma.category.findUnique({
    where: { slug: cat.slug },
  });

  if (!existing) {
    existing = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        type: "grocery",
        icon: cat.icon ?? null,
        parentId: parentId,
      },
    });
    console.log(`Created category: ${cat.name} (${cat.slug}) -> parentId: ${parentId}`);
  } else {
    if (
      existing.name !== cat.name ||
      existing.parentId !== parentId ||
      existing.icon !== (cat.icon ?? null)
    ) {
      await prisma.category.update({
        where: { id: existing.id },
        data: {
          name: cat.name,
          parentId,
          icon: cat.icon ?? null,
        },
      });
    }
    console.log(`Category exists: ${cat.name} (${cat.slug})`);
  }

  if (cat.children && cat.children.length > 0) {
    for (const child of cat.children) {
      await insertCategoryRecursive(child, existing.id);
    }
  }
}

async function main() {
  console.log("🚀 Seeding Grocery categories into database...");
  await insertCategoryRecursive(groceryTree, null);
  console.log("✅ Grocery categories successfully seeded!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding grocery categories:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
