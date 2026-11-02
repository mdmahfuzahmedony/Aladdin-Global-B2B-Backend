-- CreateEnum
CREATE TYPE "DeliveryPaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "CheckoutStatus" AS ENUM ('PENDING', 'PAYMENT_PENDING', 'PAYMENT_PAID', 'COMPLETED', 'CANCELLED', 'EXPIRED');

-- AlterTable
ALTER TABLE "CustomerOrder" ADD COLUMN     "deliveryPaymentStatus" "DeliveryPaymentStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "customerOrderId" TEXT,
ALTER COLUMN "vendorOrderId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "PendingCheckout" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "status" "CheckoutStatus" NOT NULL DEFAULT 'PENDING',
    "subtotal" DECIMAL(12,2) NOT NULL,
    "deliveryCharge" DECIMAL(12,2) NOT NULL,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "checkoutData" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PendingCheckout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PendingCheckout_customerId_status_idx" ON "PendingCheckout"("customerId", "status");

-- CreateIndex
CREATE INDEX "PendingCheckout_expiresAt_idx" ON "PendingCheckout"("expiresAt");

-- CreateIndex
CREATE INDEX "CustomerOrder_deliveryPaymentStatus_idx" ON "CustomerOrder"("deliveryPaymentStatus");

-- CreateIndex
CREATE INDEX "Payment_customerOrderId_status_idx" ON "Payment"("customerOrderId", "status");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_customerOrderId_fkey" FOREIGN KEY ("customerOrderId") REFERENCES "CustomerOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendingCheckout" ADD CONSTRAINT "PendingCheckout_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
