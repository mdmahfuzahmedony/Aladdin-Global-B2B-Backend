/*
  Warnings:

  - You are about to drop the column `customerOrderId` on the `CourierShipment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[vendorOrderId]` on the table `CourierShipment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `vendorOrderId` to the `CourierShipment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CourierShipment" DROP CONSTRAINT "CourierShipment_customerOrderId_fkey";

-- DropIndex
DROP INDEX "CourierShipment_customerOrderId_key";

-- AlterTable
ALTER TABLE "CourierShipment" DROP COLUMN "customerOrderId",
ADD COLUMN     "vendorOrderId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CourierShipment_vendorOrderId_key" ON "CourierShipment"("vendorOrderId");

-- AddForeignKey
ALTER TABLE "CourierShipment" ADD CONSTRAINT "CourierShipment_vendorOrderId_fkey" FOREIGN KEY ("vendorOrderId") REFERENCES "VendorOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
