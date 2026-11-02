-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "pendingCheckoutId" TEXT;

-- CreateIndex
CREATE INDEX "Payment_pendingCheckoutId_status_idx" ON "Payment"("pendingCheckoutId", "status");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_pendingCheckoutId_fkey" FOREIGN KEY ("pendingCheckoutId") REFERENCES "PendingCheckout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
