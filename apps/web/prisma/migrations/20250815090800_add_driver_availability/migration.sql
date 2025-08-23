-- CreateEnum
CREATE TYPE "public"."DriverStatus" AS ENUM ('applied', 'docs_pending', 'in_review', 'approved', 'suspended', 'removed');

-- CreateEnum
CREATE TYPE "public"."DocumentCategory" AS ENUM ('rtw', 'licence', 'insurance', 'mot', 'v5c', 'dbs', 'other');

-- CreateEnum
CREATE TYPE "public"."DocumentStatus" AS ENUM ('pending', 'verified', 'rejected', 'expired');

-- CreateEnum
CREATE TYPE "public"."RtwMethod" AS ENUM ('manual', 'online');

-- CreateEnum
CREATE TYPE "public"."DbsType" AS ENUM ('basic');

-- AlterTable
ALTER TABLE "public"."Booking" ADD COLUMN     "driverId" TEXT;

-- CreateTable
CREATE TABLE "public"."Driver" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "onboardingStatus" "public"."DriverStatus" NOT NULL DEFAULT 'applied',
    "basePostcode" TEXT,
    "vehicleType" TEXT,
    "rightToWorkType" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DriverVehicle" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "make" TEXT,
    "model" TEXT,
    "reg" TEXT,
    "weightClass" TEXT,
    "motExpiry" TIMESTAMP(3),
    "photos" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverVehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DriverChecks" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "rtwMethod" "public"."RtwMethod",
    "rtwResultRef" TEXT,
    "rtwExpiresAt" TIMESTAMP(3),
    "dvlaCheckRef" TEXT,
    "licenceCategories" TEXT[],
    "points" INTEGER,
    "licenceExpiry" TIMESTAMP(3),
    "dbsType" "public"."DbsType",
    "dbsCheckRef" TEXT,
    "dbsCheckedAt" TIMESTAMP(3),
    "dbsRetentionUntil" TIMESTAMP(3),
    "insurancePolicyNo" TEXT,
    "insurer" TEXT,
    "coverType" TEXT,
    "goodsInTransit" BOOLEAN,
    "publicLiability" BOOLEAN,
    "policyStart" TIMESTAMP(3),
    "policyEnd" TIMESTAMP(3),
    "fileIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverChecks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Document" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "category" "public"."DocumentCategory" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "hash" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "expiresAt" TIMESTAMP(3),
    "status" "public"."DocumentStatus" NOT NULL DEFAULT 'pending',

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Assignment" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'offered',
    "round" INTEGER NOT NULL DEFAULT 1,
    "score" INTEGER,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TrackingPing" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrackingPing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DriverAvailability" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'offline',
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLat" DOUBLE PRECISION,
    "lastLng" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Driver_userId_key" ON "public"."Driver"("userId");

-- CreateIndex
CREATE INDEX "DriverVehicle_driverId_idx" ON "public"."DriverVehicle"("driverId");

-- CreateIndex
CREATE INDEX "DriverVehicle_reg_idx" ON "public"."DriverVehicle"("reg");

-- CreateIndex
CREATE UNIQUE INDEX "DriverChecks_driverId_key" ON "public"."DriverChecks"("driverId");

-- CreateIndex
CREATE INDEX "Document_driverId_category_idx" ON "public"."Document"("driverId", "category");

-- CreateIndex
CREATE INDEX "Document_expiresAt_idx" ON "public"."Document"("expiresAt");

-- CreateIndex
CREATE INDEX "Document_status_idx" ON "public"."Document"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_bookingId_key" ON "public"."Assignment"("bookingId");

-- CreateIndex
CREATE INDEX "Assignment_status_idx" ON "public"."Assignment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "DriverAvailability_driverId_key" ON "public"."DriverAvailability"("driverId");

-- CreateIndex
CREATE INDEX "DriverAvailability_status_idx" ON "public"."DriverAvailability"("status");

-- CreateIndex
CREATE INDEX "Booking_driverId_status_idx" ON "public"."Booking"("driverId", "status");

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Driver" ADD CONSTRAINT "Driver_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverVehicle" ADD CONSTRAINT "DriverVehicle_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverChecks" ADD CONSTRAINT "DriverChecks_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Document" ADD CONSTRAINT "Document_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assignment" ADD CONSTRAINT "Assignment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assignment" ADD CONSTRAINT "Assignment_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TrackingPing" ADD CONSTRAINT "TrackingPing_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TrackingPing" ADD CONSTRAINT "TrackingPing_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverAvailability" ADD CONSTRAINT "DriverAvailability_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
