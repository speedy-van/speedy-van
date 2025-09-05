/*
  Warnings:

  - A unique constraint covering the columns `[reference]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."NoteType" AS ENUM ('general', 'special_instructions', 'access_notes', 'customer_request', 'driver_note', 'system_note');

-- CreateEnum
CREATE TYPE "public"."StepStatus" AS ENUM ('pending', 'in_progress', 'completed', 'skipped', 'failed');

-- CreateEnum
CREATE TYPE "public"."BookingStep" AS ENUM ('pickup_navigation', 'pickup_arrival', 'loading_started', 'loading_completed', 'dropoff_navigation', 'dropoff_arrival', 'unloading_started', 'unloading_completed', 'job_completed', 'customer_signature', 'damage_assessment', 'item_verification');

-- AlterTable
ALTER TABLE "public"."Booking" ADD COLUMN     "basePrice" DECIMAL(10,2),
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "confirmedAt" TIMESTAMP(3),
ADD COLUMN     "crewMultiplier" DECIMAL(5,4),
ADD COLUMN     "customerName" TEXT,
ADD COLUMN     "customerPhone" TEXT,
ADD COLUMN     "distanceSurcharge" DECIMAL(10,2),
ADD COLUMN     "dropoffCity" TEXT,
ADD COLUMN     "dropoffFloor" INTEGER,
ADD COLUMN     "dropoffHasLift" BOOLEAN,
ADD COLUMN     "dropoffLine1" TEXT,
ADD COLUMN     "dropoffPostcode" TEXT,
ADD COLUMN     "dropoffPropertyType" TEXT,
ADD COLUMN     "estimatedDuration" INTEGER,
ADD COLUMN     "floorSurcharge" DECIMAL(10,2),
ADD COLUMN     "moveDate" TIMESTAMP(3),
ADD COLUMN     "moveTime" TEXT,
ADD COLUMN     "pickupCity" TEXT,
ADD COLUMN     "pickupFloor" INTEGER,
ADD COLUMN     "pickupHasLift" BOOLEAN,
ADD COLUMN     "pickupLine1" TEXT,
ADD COLUMN     "pickupPostcode" TEXT,
ADD COLUMN     "pickupPropertyType" TEXT,
ADD COLUMN     "reference" TEXT,
ADD COLUMN     "totalPrice" DECIMAL(10,2),
ADD COLUMN     "weatherSurcharge" DECIMAL(10,2),
ADD COLUMN     "weatherWarning" BOOLEAN;

-- CreateTable
CREATE TABLE "public"."BookingItem" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "itemKey" TEXT,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "customDescription" TEXT,
    "estimatedVolume" DOUBLE PRECISION,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BookingNote" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "type" "public"."NoteType" NOT NULL DEFAULT 'general',
    "content" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BookingTimeline" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "step" "public"."BookingStep" NOT NULL,
    "status" "public"."StepStatus" NOT NULL DEFAULT 'pending',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "driverId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingTimeline_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookingItem_bookingId_idx" ON "public"."BookingItem"("bookingId");

-- CreateIndex
CREATE INDEX "BookingItem_itemKey_idx" ON "public"."BookingItem"("itemKey");

-- CreateIndex
CREATE INDEX "BookingNote_bookingId_idx" ON "public"."BookingNote"("bookingId");

-- CreateIndex
CREATE INDEX "BookingNote_type_idx" ON "public"."BookingNote"("type");

-- CreateIndex
CREATE INDEX "BookingNote_createdAt_idx" ON "public"."BookingNote"("createdAt");

-- CreateIndex
CREATE INDEX "BookingTimeline_bookingId_idx" ON "public"."BookingTimeline"("bookingId");

-- CreateIndex
CREATE INDEX "BookingTimeline_step_idx" ON "public"."BookingTimeline"("step");

-- CreateIndex
CREATE INDEX "BookingTimeline_status_idx" ON "public"."BookingTimeline"("status");

-- CreateIndex
CREATE INDEX "BookingTimeline_driverId_idx" ON "public"."BookingTimeline"("driverId");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_reference_key" ON "public"."Booking"("reference");

-- AddForeignKey
ALTER TABLE "public"."BookingItem" ADD CONSTRAINT "BookingItem_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BookingNote" ADD CONSTRAINT "BookingNote_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BookingTimeline" ADD CONSTRAINT "BookingTimeline_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BookingTimeline" ADD CONSTRAINT "BookingTimeline_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;
