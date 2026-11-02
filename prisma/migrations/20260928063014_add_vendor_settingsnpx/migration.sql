/*
  Warnings:

  - You are about to drop the column `bankAccountHolder` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `bankAccountNumber` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `bankName` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `businessAddress` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `mobileBankingNumber` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `payoutMethod` on the `Vendor` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ProductFieldType" AS ENUM ('TEXT', 'NUMBER', 'SELECT', 'MULTI_SELECT', 'TEXTAREA', 'DATE', 'BOOLEAN');

-- CreateEnum
CREATE TYPE "AffiliateCommissionType" AS ENUM ('PERCENTAGE', 'FIXED');

-- CreateEnum
CREATE TYPE "CustomerOrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURNED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "WholesalerOrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURNED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "DropshipOrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURNED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "AffiliateOrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "OrderPaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'PARTIAL', 'REFUNDED');

-- CreateEnum
CREATE TYPE "FulfillmentStatus" AS ENUM ('PENDING', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED');

-- CreateEnum
CREATE TYPE "CommissionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PAYABLE', 'PAID');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'FAILED');

-- CreateEnum
CREATE TYPE "ShippingStatus" AS ENUM ('PENDING', 'READY', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'RETURNED');

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "address" TEXT,
ADD COLUMN     "area" TEXT,
ADD COLUMN     "district" TEXT,
ADD COLUMN     "division" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "upazila" TEXT;

-- AlterTable
ALTER TABLE "Vendor" DROP COLUMN "bankAccountHolder",
DROP COLUMN "bankAccountNumber",
DROP COLUMN "bankName",
DROP COLUMN "businessAddress",
DROP COLUMN "mobileBankingNumber",
DROP COLUMN "payoutMethod";

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductField" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" "ProductFieldType" NOT NULL,
    "placeholder" TEXT,
    "description" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductFieldOption" (
    "id" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductFieldOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductPricing" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "customerRegularPrice" DOUBLE PRECISION NOT NULL,
    "customerSalePrice" DOUBLE PRECISION,
    "sellerRegularPrice" DOUBLE PRECISION,
    "sellerSalePrice" DOUBLE PRECISION,
    "wholesalerRegularPrice" DOUBLE PRECISION,
    "wholesalerSalePrice" DOUBLE PRECISION,
    "dropshipPrice" DOUBLE PRECISION,
    "affiliateCommissionType" "AffiliateCommissionType",
    "affiliateCommissionValue" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductPricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductReview" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT DEFAULT 'general',
    "fieldsConfig" JSONB,
    "image" TEXT,
    "icon" TEXT,
    "parentId" TEXT,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewArrivalAttribute" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "badgeText" TEXT,
    "displayOrder" INTEGER,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewArrivalAttribute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlashSaleAttribute" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "flashSalePrice" DOUBLE PRECISION NOT NULL,
    "flashSaleStock" INTEGER NOT NULL,
    "soldCount" INTEGER NOT NULL DEFAULT 0,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "discountBadge" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlashSaleAttribute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeaturedAttribute" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "featuredBadgeText" TEXT,
    "bannerImage" TEXT,
    "displayOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeaturedAttribute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopSellerAttribute" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "unitsSold" INTEGER NOT NULL DEFAULT 0,
    "salesBadge" TEXT,
    "isExpressEligible" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TopSellerAttribute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopRatedAttribute" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "reviewSnippet" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TopRatedAttribute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrustedAttribute" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "trustBadgeText" TEXT,
    "warrantyInfo" TEXT,
    "officialStore" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrustedAttribute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortDescription" TEXT,
    "description" TEXT,
    "stockQuantity" INTEGER NOT NULL,
    "categoryId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "brandId" TEXT,
    "attributes" JSONB,
    "customFields" JSONB,
    "images" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorLocation" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "division" TEXT,
    "district" TEXT,
    "upazila" TEXT,
    "area" TEXT,
    "fullAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorPayout" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "payoutMethod" "PayoutMethod" NOT NULL,
    "bankName" TEXT,
    "bankAccountNumber" TEXT,
    "bankAccountHolder" TEXT,
    "mobileBankingNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorPayout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorSettings" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "description" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "logoUrl" TEXT,
    "bannerUrl" TEXT,
    "deliveryAvailable" BOOLEAN NOT NULL DEFAULT true,
    "cityDeliveryCharge" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "outsideDeliveryCharge" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "freeDeliveryThreshold" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "deliveryTime" TEXT,
    "acceptOrders" BOOLEAN NOT NULL DEFAULT true,
    "autoConfirm" BOOLEAN NOT NULL DEFAULT false,
    "minimumOrder" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "cashOnDelivery" BOOLEAN NOT NULL DEFAULT true,
    "onlinePayment" BOOLEAN NOT NULL DEFAULT false,
    "storeActive" BOOLEAN NOT NULL DEFAULT true,
    "vacationMode" BOOLEAN NOT NULL DEFAULT false,
    "vacationStart" TIMESTAMP(3),
    "vacationEnd" TIMESTAMP(3),
    "showPhone" BOOLEAN NOT NULL DEFAULT true,
    "showEmail" BOOLEAN NOT NULL DEFAULT true,
    "showAddress" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorOpeningHour" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "open" TEXT,
    "close" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorOpeningHour_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Brand_slug_key" ON "Brand"("slug");

-- CreateIndex
CREATE INDEX "Brand_status_idx" ON "Brand"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ProductField_key_key" ON "ProductField"("key");

-- CreateIndex
CREATE INDEX "ProductField_type_idx" ON "ProductField"("type");

-- CreateIndex
CREATE INDEX "ProductField_isActive_idx" ON "ProductField"("isActive");

-- CreateIndex
CREATE INDEX "ProductFieldOption_fieldId_idx" ON "ProductFieldOption"("fieldId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductFieldOption_fieldId_value_key" ON "ProductFieldOption"("fieldId", "value");

-- CreateIndex
CREATE UNIQUE INDEX "ProductPricing_productId_key" ON "ProductPricing"("productId");

-- CreateIndex
CREATE INDEX "ProductReview_productId_idx" ON "ProductReview"("productId");

-- CreateIndex
CREATE INDEX "ProductReview_userId_idx" ON "ProductReview"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "NewArrivalAttribute_productId_key" ON "NewArrivalAttribute"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "FlashSaleAttribute_productId_key" ON "FlashSaleAttribute"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "FeaturedAttribute_productId_key" ON "FeaturedAttribute"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "TopSellerAttribute_productId_key" ON "TopSellerAttribute"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "TopRatedAttribute_productId_key" ON "TopRatedAttribute"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "TrustedAttribute_productId_key" ON "TrustedAttribute"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- CreateIndex
CREATE INDEX "Product_vendorId_idx" ON "Product"("vendorId");

-- CreateIndex
CREATE INDEX "Product_brandId_idx" ON "Product"("brandId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorLocation_vendorId_key" ON "VendorLocation"("vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorPayout_vendorId_key" ON "VendorPayout"("vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorSettings_vendorId_key" ON "VendorSettings"("vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorOpeningHour_vendorId_dayOfWeek_key" ON "VendorOpeningHour"("vendorId", "dayOfWeek");

-- AddForeignKey
ALTER TABLE "ProductFieldOption" ADD CONSTRAINT "ProductFieldOption_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "ProductField"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPricing" ADD CONSTRAINT "ProductPricing_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductReview" ADD CONSTRAINT "ProductReview_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductReview" ADD CONSTRAINT "ProductReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "NewArrivalAttribute" ADD CONSTRAINT "NewArrivalAttribute_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlashSaleAttribute" ADD CONSTRAINT "FlashSaleAttribute_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeaturedAttribute" ADD CONSTRAINT "FeaturedAttribute_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopSellerAttribute" ADD CONSTRAINT "TopSellerAttribute_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopRatedAttribute" ADD CONSTRAINT "TopRatedAttribute_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrustedAttribute" ADD CONSTRAINT "TrustedAttribute_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorLocation" ADD CONSTRAINT "VendorLocation_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorPayout" ADD CONSTRAINT "VendorPayout_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorSettings" ADD CONSTRAINT "VendorSettings_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorOpeningHour" ADD CONSTRAINT "VendorOpeningHour_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
