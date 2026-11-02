-- AlterTable
ALTER TABLE "VendorOrder" ADD COLUMN     "customerOrderId" TEXT;

-- CreateIndex
CREATE INDEX "VendorOrder_customerOrderId_idx" ON "VendorOrder"("customerOrderId");

-- AddForeignKey
ALTER TABLE "VendorOrder" ADD CONSTRAINT "VendorOrder_customerOrderId_fkey" FOREIGN KEY ("customerOrderId") REFERENCES "CustomerOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
