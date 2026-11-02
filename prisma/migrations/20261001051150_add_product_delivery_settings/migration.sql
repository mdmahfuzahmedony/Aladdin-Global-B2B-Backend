-- CreateEnum
CREATE TYPE "ProductDeliveryScope" AS ENUM ('UPAZILA_BASED', 'NATIONWIDE');

-- CreateTable
CREATE TABLE "ProductDelivery" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "scope" "ProductDeliveryScope" NOT NULL,
    "weightKg" DECIMAL(10,3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductDeliveryRate" (
    "id" TEXT NOT NULL,
    "productDeliveryId" TEXT NOT NULL,
    "minDistanceKm" INTEGER NOT NULL,
    "maxDistanceKm" INTEGER NOT NULL,
    "firstKgCharge" DECIMAL(10,2) NOT NULL,
    "additionalKgCharge" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductDeliveryRate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductDelivery_productId_key" ON "ProductDelivery"("productId");

-- CreateIndex
CREATE INDEX "ProductDeliveryRate_productDeliveryId_idx" ON "ProductDeliveryRate"("productDeliveryId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductDeliveryRate_productDeliveryId_minDistanceKm_key" ON "ProductDeliveryRate"("productDeliveryId", "minDistanceKm");

-- AddForeignKey
ALTER TABLE "ProductDelivery" ADD CONSTRAINT "ProductDelivery_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductDeliveryRate" ADD CONSTRAINT "ProductDeliveryRate_productDeliveryId_fkey" FOREIGN KEY ("productDeliveryId") REFERENCES "ProductDelivery"("id") ON DELETE CASCADE ON UPDATE CASCADE;
