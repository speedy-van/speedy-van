-- CreateTable
CREATE TABLE "ConsentLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "country" TEXT,
    "ipHash" TEXT,
    "uaHash" TEXT,
    "value" TEXT NOT NULL,
    "prevValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsentLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingConfig" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "activeFrom" TIMESTAMP(3) NOT NULL,
    "activeTo" TIMESTAMP(3),
    "zoneKey" TEXT NOT NULL,
    "vanRates" JSONB NOT NULL,
    "slotMultipliers" JSONB NOT NULL,
    "dayMultipliers" JSONB NOT NULL,
    "accessFees" JSONB NOT NULL,
    "surcharges" JSONB NOT NULL,
    "minFareFloor" JSONB NOT NULL,
    "surgePolicy" JSONB NOT NULL,
    "vatRate" DECIMAL(5,4) NOT NULL,
    "rounding" JSONB NOT NULL,
    "lockTtlSeconds" INTEGER NOT NULL DEFAULT 900,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PricingConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteSnapshot" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT,
    "pricingVersion" INTEGER NOT NULL,
    "zoneKey" TEXT NOT NULL,
    "inputs" JSONB NOT NULL,
    "breakdown" JSONB NOT NULL,
    "subtotalExVat" DECIMAL(12,2) NOT NULL,
    "vatRate" DECIMAL(5,4) NOT NULL,
    "totalIncVat" DECIMAL(12,2) NOT NULL,
    "hash" TEXT NOT NULL,
    "lockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estimate" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "QuoteSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConsentLog_userId_createdAt_idx" ON "ConsentLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "PricingConfig_zoneKey_activeFrom_idx" ON "PricingConfig"("zoneKey", "activeFrom");

-- CreateIndex
CREATE UNIQUE INDEX "PricingConfig_zoneKey_version_key" ON "PricingConfig"("zoneKey", "version");

-- CreateIndex
CREATE INDEX "QuoteSnapshot_bookingId_idx" ON "QuoteSnapshot"("bookingId");

-- CreateIndex
CREATE INDEX "QuoteSnapshot_zoneKey_createdAt_idx" ON "QuoteSnapshot"("zoneKey", "createdAt");
