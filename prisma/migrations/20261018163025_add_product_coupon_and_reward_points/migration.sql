-- CreateTable
CREATE TABLE "ProductCoupon" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "couponName" TEXT NOT NULL,
    "discount" DECIMAL(12,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductCoupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerReward" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerReward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardPointTransaction" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "customerOrderId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RewardPointTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductCoupon_productId_key" ON "ProductCoupon"("productId");

-- CreateIndex
CREATE INDEX "ProductCoupon_isActive_idx" ON "ProductCoupon"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerReward_customerId_key" ON "CustomerReward"("customerId");

-- CreateIndex
CREATE INDEX "CustomerReward_points_idx" ON "CustomerReward"("points");

-- CreateIndex
CREATE UNIQUE INDEX "RewardPointTransaction_customerOrderId_key" ON "RewardPointTransaction"("customerOrderId");

-- CreateIndex
CREATE INDEX "RewardPointTransaction_customerId_createdAt_idx" ON "RewardPointTransaction"("customerId", "createdAt");

-- AddForeignKey
ALTER TABLE "ProductCoupon" ADD CONSTRAINT "ProductCoupon_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerReward" ADD CONSTRAINT "CustomerReward_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardPointTransaction" ADD CONSTRAINT "RewardPointTransaction_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardPointTransaction" ADD CONSTRAINT "RewardPointTransaction_customerOrderId_fkey" FOREIGN KEY ("customerOrderId") REFERENCES "CustomerOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
