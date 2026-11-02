import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("🌱 Starting database seed...");

  const placements = [
    // =====================================================
    // TOP BANNER
    // =====================================================

    {
      key: "TOP_BANNER",
      label: "Top Banner",
      description: "Promotional banner displayed at the top of the website",
      width: 1200,
      height: 100,
    },

    // =====================================================
    // HOMEPAGE HERO
    // =====================================================

    {
      key: "HOMEPAGE_HERO",
      label: "Homepage Hero",
      description: "Main hero banner displayed on the homepage",
      width: 1920,
      height: 500,
    },

    // =====================================================
    // HOME PRODUCT SECTION BANNERS
    // =====================================================

    {
      key: "FLASH_SALE",
      label: "Flash Sale",
      description: "Banner displayed above the Flash Sale section",
      width: 1200,
      height: 250,
    },

    {
      key: "NEW_ARRIVALS",
      label: "New Arrivals",
      description: "Banner displayed above the New Arrivals section",
      width: 1200,
      height: 250,
    },

    {
      key: "BEST_SELLERS",
      label: "Best Sellers",
      description: "Banner displayed above the Best Sellers section",
      width: 1200,
      height: 250,
    },

    {
      key: "FEATURED_PRODUCTS",
      label: "Featured Products",
      description: "Banner displayed above the Featured Products section",
      width: 1200,
      height: 250,
    },

    {
      key: "TOP_RATED_PRODUCTS",
      label: "Top Rated Products",
      description: "Banner displayed above the Top Rated Products section",
      width: 1200,
      height: 250,
    },
  ];

  for (const placement of placements) {
    await prisma.bannerPlacementConfig.upsert({
      where: {
        key: placement.key,
      },

      update: {
        label: placement.label,
        description: placement.description,
        width: placement.width,
        height: placement.height,
        isEnabled: true,
      },

      create: {
        key: placement.key,
        label: placement.label,
        description: placement.description,
        width: placement.width,
        height: placement.height,
        isEnabled: true,
      },
    });

    console.log(`✅ ${placement.key}`);
  }

  console.log("🎉 Banner placements seeded successfully!");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });