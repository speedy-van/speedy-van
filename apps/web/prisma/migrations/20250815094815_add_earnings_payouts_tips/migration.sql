-- CreateEnum
CREATE TYPE "public"."PayoutStatus" AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "public"."TipMethod" AS ENUM ('cash', 'card', 'qr_code', 'bank_transfer', 'other');

-- CreateEnum
CREATE TYPE "public"."TipStatus" AS ENUM ('pending', 'confirmed', 'reconciled', 'disputed');

-- CreateTable
CREATE TABLE "public"."DriverEarnings" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "baseAmountPence" INTEGER NOT NULL DEFAULT 0,
    "surgeAmountPence" INTEGER NOT NULL DEFAULT 0,
    "tipAmountPence" INTEGER NOT NULL DEFAULT 0,
    "feeAmountPence" INTEGER NOT NULL DEFAULT 0,
    "netAmountPence" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'gbp',
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidOut" BOOLEAN NOT NULL DEFAULT false,
    "payoutId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverEarnings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DriverPayout" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "totalAmountPence" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'gbp',
    "status" "public"."PayoutStatus" NOT NULL DEFAULT 'pending',
    "processedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "stripeTransferId" TEXT,
    "bankAccountId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverPayout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DriverPayoutSettings" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "accountName" TEXT,
    "accountNumber" TEXT,
    "sortCode" TEXT,
    "stripeAccountId" TEXT,
    "autoPayout" BOOLEAN NOT NULL DEFAULT false,
    "minPayoutAmountPence" INTEGER NOT NULL DEFAULT 5000,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverPayoutSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DriverTip" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "amountPence" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'gbp',
    "method" "public"."TipMethod" NOT NULL,
    "reference" TEXT,
    "status" "public"."TipStatus" NOT NULL DEFAULT 'pending',
    "reconciledAt" TIMESTAMP(3),
    "reconciledBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverTip_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DriverEarnings_driverId_calculatedAt_idx" ON "public"."DriverEarnings"("driverId", "calculatedAt");

-- CreateIndex
CREATE INDEX "DriverEarnings_assignmentId_idx" ON "public"."DriverEarnings"("assignmentId");

-- CreateIndex
CREATE INDEX "DriverEarnings_paidOut_idx" ON "public"."DriverEarnings"("paidOut");

-- CreateIndex
CREATE INDEX "DriverPayout_driverId_status_idx" ON "public"."DriverPayout"("driverId", "status");

-- CreateIndex
CREATE INDEX "DriverPayout_status_createdAt_idx" ON "public"."DriverPayout"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DriverPayoutSettings_driverId_key" ON "public"."DriverPayoutSettings"("driverId");

-- CreateIndex
CREATE INDEX "DriverTip_driverId_createdAt_idx" ON "public"."DriverTip"("driverId", "createdAt");

-- CreateIndex
CREATE INDEX "DriverTip_assignmentId_idx" ON "public"."DriverTip"("assignmentId");

-- CreateIndex
CREATE INDEX "DriverTip_status_idx" ON "public"."DriverTip"("status");

-- AddForeignKey
ALTER TABLE "public"."DriverEarnings" ADD CONSTRAINT "DriverEarnings_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverEarnings" ADD CONSTRAINT "DriverEarnings_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "public"."Assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverEarnings" ADD CONSTRAINT "DriverEarnings_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "public"."DriverPayout"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverPayout" ADD CONSTRAINT "DriverPayout_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverPayoutSettings" ADD CONSTRAINT "DriverPayoutSettings_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverTip" ADD CONSTRAINT "DriverTip_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverTip" ADD CONSTRAINT "DriverTip_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "public"."Assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
