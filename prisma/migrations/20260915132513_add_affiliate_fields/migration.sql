/*
  Warnings:

  - Added the required column `socialPlatform` to the `Affiliate` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AffiliateSocialPlatform" AS ENUM ('FACEBOOK', 'INSTAGRAM', 'YOUTUBE', 'TIKTOK', 'WEBSITE', 'OTHER');

-- CreateEnum
CREATE TYPE "AffiliatePayoutMethod" AS ENUM ('BKASH', 'NAGAD', 'BANK');

-- AlterTable
ALTER TABLE "Affiliate" ADD COLUMN     "payoutAccountName" TEXT,
ADD COLUMN     "payoutAccountNumber" TEXT,
ADD COLUMN     "payoutMethod" "AffiliatePayoutMethod",
ADD COLUMN     "payoutMobileNumber" TEXT,
ADD COLUMN     "socialPlatform" "AffiliateSocialPlatform" NOT NULL;
