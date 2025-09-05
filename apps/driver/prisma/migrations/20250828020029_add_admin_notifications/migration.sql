/*
  Warnings:

  - The values [applied,docs_pending,in_review] on the enum `DriverStatus` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[unifiedBookingId]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.
  - Made the column `approvedAt` on table `Driver` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."DriverStatus_new" AS ENUM ('pending', 'approved', 'rejected', 'suspended', 'removed');
ALTER TABLE "public"."Driver" ALTER COLUMN "onboardingStatus" DROP DEFAULT;
ALTER TABLE "public"."User" ALTER COLUMN "driverStatus" TYPE "public"."DriverStatus_new" USING ("driverStatus"::text::"public"."DriverStatus_new");
ALTER TABLE "public"."Driver" ALTER COLUMN "onboardingStatus" TYPE "public"."DriverStatus_new" USING ("onboardingStatus"::text::"public"."DriverStatus_new");
ALTER TABLE "public"."DriverApprovalHistory" ALTER COLUMN "previousStatus" TYPE "public"."DriverStatus_new" USING ("previousStatus"::text::"public"."DriverStatus_new");
ALTER TABLE "public"."DriverApprovalHistory" ALTER COLUMN "newStatus" TYPE "public"."DriverStatus_new" USING ("newStatus"::text::"public"."DriverStatus_new");
ALTER TABLE "public"."DriverStatusChange" ALTER COLUMN "requestedStatus" TYPE "public"."DriverStatus_new" USING ("requestedStatus"::text::"public"."DriverStatus_new");
ALTER TYPE "public"."DriverStatus" RENAME TO "DriverStatus_old";
ALTER TYPE "public"."DriverStatus_new" RENAME TO "DriverStatus";
DROP TYPE "public"."DriverStatus_old";
ALTER TABLE "public"."Driver" ALTER COLUMN "onboardingStatus" SET DEFAULT 'approved';
COMMIT;

-- AlterTable
ALTER TABLE "public"."Booking" ADD COLUMN     "unifiedBookingId" TEXT;

-- AlterTable
ALTER TABLE "public"."Driver" ALTER COLUMN "onboardingStatus" SET DEFAULT 'approved',
ALTER COLUMN "approvedAt" SET NOT NULL,
ALTER COLUMN "approvedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "driverApprovedAt" TIMESTAMP(3),
ADD COLUMN     "driverApprovedBy" TEXT,
ADD COLUMN     "driverStatus" "public"."DriverStatus";

-- CreateTable
CREATE TABLE "public"."DriverApprovalHistory" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "previousStatus" "public"."DriverStatus" NOT NULL,
    "newStatus" "public"."DriverStatus" NOT NULL,
    "changedBy" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,
    "notes" TEXT,

    CONSTRAINT "DriverApprovalHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DriverStatusChange" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "requestedStatus" "public"."DriverStatus" NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reason" TEXT,
    "notes" TEXT,

    CONSTRAINT "DriverStatusChange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Invoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "pickupAddress" TEXT NOT NULL,
    "dropoffAddress" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "crewSize" TEXT NOT NULL,
    "baseDistanceMiles" DOUBLE PRECISION NOT NULL,
    "distanceCostGBP" INTEGER NOT NULL,
    "accessSurchargeGBP" INTEGER NOT NULL,
    "weatherSurchargeGBP" INTEGER NOT NULL,
    "itemsSurchargeGBP" INTEGER NOT NULL,
    "crewMultiplierPercent" INTEGER NOT NULL,
    "availabilityMultiplierPercent" INTEGER NOT NULL,
    "totalGBP" INTEGER NOT NULL,
    "stripePaymentIntentId" TEXT,
    "paidAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'paid',
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pdfUrl" TEXT,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AdminNotification" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "data" JSONB,
    "actionUrl" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "actorId" TEXT,
    "actorRole" TEXT,

    CONSTRAINT "AdminNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DriverApprovalHistory_driverId_idx" ON "public"."DriverApprovalHistory"("driverId");

-- CreateIndex
CREATE INDEX "DriverApprovalHistory_changedAt_idx" ON "public"."DriverApprovalHistory"("changedAt");

-- CreateIndex
CREATE INDEX "DriverApprovalHistory_newStatus_idx" ON "public"."DriverApprovalHistory"("newStatus");

-- CreateIndex
CREATE INDEX "DriverStatusChange_driverId_idx" ON "public"."DriverStatusChange"("driverId");

-- CreateIndex
CREATE INDEX "DriverStatusChange_requestedAt_idx" ON "public"."DriverStatusChange"("requestedAt");

-- CreateIndex
CREATE INDEX "DriverStatusChange_status_idx" ON "public"."DriverStatusChange"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "public"."Invoice"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_bookingId_key" ON "public"."Invoice"("bookingId");

-- CreateIndex
CREATE INDEX "Invoice_customerEmail_idx" ON "public"."Invoice"("customerEmail");

-- CreateIndex
CREATE INDEX "Invoice_paidAt_idx" ON "public"."Invoice"("paidAt");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "public"."Invoice"("status");

-- CreateIndex
CREATE INDEX "Invoice_generatedAt_idx" ON "public"."Invoice"("generatedAt");

-- CreateIndex
CREATE INDEX "AdminNotification_type_idx" ON "public"."AdminNotification"("type");

-- CreateIndex
CREATE INDEX "AdminNotification_priority_idx" ON "public"."AdminNotification"("priority");

-- CreateIndex
CREATE INDEX "AdminNotification_isRead_idx" ON "public"."AdminNotification"("isRead");

-- CreateIndex
CREATE INDEX "AdminNotification_createdAt_idx" ON "public"."AdminNotification"("createdAt");

-- CreateIndex
CREATE INDEX "AdminNotification_actorId_idx" ON "public"."AdminNotification"("actorId");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_unifiedBookingId_key" ON "public"."Booking"("unifiedBookingId");

-- CreateIndex
CREATE INDEX "Driver_userId_idx" ON "public"."Driver"("userId");

-- CreateIndex
CREATE INDEX "Driver_onboardingStatus_idx" ON "public"."Driver"("onboardingStatus");

-- CreateIndex
CREATE INDEX "Driver_status_idx" ON "public"."Driver"("status");

-- CreateIndex
CREATE INDEX "Driver_approvedAt_idx" ON "public"."Driver"("approvedAt");

-- CreateIndex
CREATE INDEX "DriverApplication_userId_idx" ON "public"."DriverApplication"("userId");

-- CreateIndex
CREATE INDEX "User_driverStatus_idx" ON "public"."User"("driverStatus");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "public"."User"("isActive");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "public"."User"("email");

-- AddForeignKey
ALTER TABLE "public"."DriverApprovalHistory" ADD CONSTRAINT "DriverApprovalHistory_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverApprovalHistory" ADD CONSTRAINT "DriverApprovalHistory_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverStatusChange" ADD CONSTRAINT "DriverStatusChange_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverStatusChange" ADD CONSTRAINT "DriverStatusChange_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverStatusChange" ADD CONSTRAINT "DriverStatusChange_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invoice" ADD CONSTRAINT "Invoice_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
