/*
  Warnings:

  - A unique constraint covering the columns `[pendingCheckoutId]` on the table `CustomerOrder` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CustomerOrder" ADD COLUMN     "pendingCheckoutId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "CustomerOrder_pendingCheckoutId_key" ON "CustomerOrder"("pendingCheckoutId");

-- AddForeignKey
ALTER TABLE "CustomerOrder" ADD CONSTRAINT "CustomerOrder_pendingCheckoutId_fkey" FOREIGN KEY ("pendingCheckoutId") REFERENCES "PendingCheckout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
