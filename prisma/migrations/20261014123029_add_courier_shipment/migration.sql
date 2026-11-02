-- CreateTable
CREATE TABLE "CourierShipment" (
    "id" TEXT NOT NULL,
    "customerOrderId" TEXT NOT NULL,
    "courier" TEXT NOT NULL DEFAULT 'STEADFAST',
    "consignmentId" TEXT,
    "trackingCode" TEXT,
    "deliveryStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "bookingStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "codAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "deliveryCharge" DECIMAL(12,2),
    "bookingResponse" JSONB,
    "bookedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourierShipment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CourierShipment_customerOrderId_key" ON "CourierShipment"("customerOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "CourierShipment_consignmentId_key" ON "CourierShipment"("consignmentId");

-- CreateIndex
CREATE UNIQUE INDEX "CourierShipment_trackingCode_key" ON "CourierShipment"("trackingCode");

-- CreateIndex
CREATE INDEX "CourierShipment_bookingStatus_idx" ON "CourierShipment"("bookingStatus");

-- CreateIndex
CREATE INDEX "CourierShipment_deliveryStatus_idx" ON "CourierShipment"("deliveryStatus");

-- AddForeignKey
ALTER TABLE "CourierShipment" ADD CONSTRAINT "CourierShipment_customerOrderId_fkey" FOREIGN KEY ("customerOrderId") REFERENCES "CustomerOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
