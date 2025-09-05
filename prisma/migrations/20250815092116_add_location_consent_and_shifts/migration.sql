-- AlterTable
ALTER TABLE "public"."DriverAvailability" ADD COLUMN     "locationConsent" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."DriverShift" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringDays" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverShift_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DriverShift_driverId_startTime_idx" ON "public"."DriverShift"("driverId", "startTime");

-- CreateIndex
CREATE INDEX "DriverShift_isActive_idx" ON "public"."DriverShift"("isActive");

-- AddForeignKey
ALTER TABLE "public"."DriverShift" ADD CONSTRAINT "DriverShift_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
