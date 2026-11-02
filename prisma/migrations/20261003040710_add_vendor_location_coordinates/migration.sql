-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- AlterTable
ALTER TABLE "VendorLocation" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "general_settings" (
    "id" TEXT NOT NULL,
    "siteName" TEXT NOT NULL DEFAULT 'Aladdin B2B',
    "supportEmail" TEXT NOT NULL DEFAULT 'support@aladdin.com.bd',
    "contactNumber" TEXT NOT NULL DEFAULT '+8801700000000',
    "currency" TEXT NOT NULL DEFAULT 'BDT',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Dhaka',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "general_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_settings" (
    "id" TEXT NOT NULL,
    "bkashEnabled" BOOLEAN NOT NULL DEFAULT true,
    "nagadEnabled" BOOLEAN NOT NULL DEFAULT true,
    "sslCommerzEnabled" BOOLEAN NOT NULL DEFAULT true,
    "codEnabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_settings" (
    "id" TEXT NOT NULL,
    "radiusKm" INTEGER NOT NULL DEFAULT 3,
    "standardDeliveryFee" DOUBLE PRECISION NOT NULL DEFAULT 60.0,
    "expressDeliveryFee" DOUBLE PRECISION NOT NULL DEFAULT 120.0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipping_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commission_settings" (
    "id" TEXT NOT NULL,
    "defaultPercentage" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "minPayoutLimit" DOUBLE PRECISION NOT NULL DEFAULT 1000.0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commission_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_settings" (
    "id" TEXT NOT NULL,
    "vatPercentage" DOUBLE PRECISION NOT NULL DEFAULT 7.5,
    "taxIdNumber" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_settings" (
    "id" TEXT NOT NULL,
    "twoFactorAuth" BOOLEAN NOT NULL DEFAULT false,
    "sessionTimeoutMins" INTEGER NOT NULL DEFAULT 30,
    "maxLoginAttempts" INTEGER NOT NULL DEFAULT 5,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "security_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_settings" (
    "id" TEXT NOT NULL,
    "supportEmail" TEXT NOT NULL DEFAULT 'support@aladdin.com.bd',
    "hotline" TEXT NOT NULL DEFAULT '+8801700000000',
    "whatsappNumber" TEXT DEFAULT '+8801800000000',
    "enableLiveChat" BOOLEAN NOT NULL DEFAULT true,
    "autoReplyMessage" TEXT,
    "ticketPriorityDefault" TEXT NOT NULL DEFAULT 'Medium',
    "faqSectionEnabled" BOOLEAN NOT NULL DEFAULT true,
    "disputeWindowDays" INTEGER NOT NULL DEFAULT 3,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "TicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "support_tickets_ticketId_key" ON "support_tickets"("ticketId");
