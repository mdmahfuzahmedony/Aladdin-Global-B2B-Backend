import dotenv from "dotenv";
import path from "path";
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};


export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error"]
        : ["error"],
  });

console.log(
  "PRISMA CART:",
  typeof prisma.cart,
);

console.log(
  "PRISMA CART ITEM:",
  typeof prisma.cartItem,
);

console.log(
  "PRISMA WISHLIST:",
  typeof prisma.wishlist,
);

console.log(
  "PRISMA WISHLIST ITEM:",
  typeof prisma.wishlistItem,
);

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}