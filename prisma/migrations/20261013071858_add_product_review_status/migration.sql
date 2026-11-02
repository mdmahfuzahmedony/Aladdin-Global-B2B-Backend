-- CreateEnum
CREATE TYPE "ProductReviewStatus" AS ENUM ('PUBLISHED', 'PENDING', 'HIDDEN');

-- DropIndex
DROP INDEX "ProductReview_productId_idx";

-- AlterTable
ALTER TABLE "ProductReview" ADD COLUMN     "status" "ProductReviewStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "ProductReview_productId_status_createdAt_idx" ON "ProductReview"("productId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "ProductReview_status_createdAt_idx" ON "ProductReview"("status", "createdAt");
