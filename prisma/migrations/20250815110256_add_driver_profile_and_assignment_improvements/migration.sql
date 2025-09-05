/*
  Warnings:

  - The `status` column on the `Assignment` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."AssignmentStatus" AS ENUM ('invited', 'claimed', 'accepted', 'declined', 'completed', 'cancelled');

-- AlterTable
ALTER TABLE "public"."Assignment" ADD COLUMN     "claimedAt" TIMESTAMP(3),
DROP COLUMN "status",
ADD COLUMN     "status" "public"."AssignmentStatus" NOT NULL DEFAULT 'invited';

-- AlterTable
ALTER TABLE "public"."Driver" ADD COLUMN     "rating" DOUBLE PRECISION DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."DriverProfile" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "dob" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DriverProfile_driverId_key" ON "public"."DriverProfile"("driverId");

-- CreateIndex
CREATE INDEX "DriverProfile_driverId_idx" ON "public"."DriverProfile"("driverId");

-- CreateIndex
CREATE INDEX "Assignment_status_idx" ON "public"."Assignment"("status");

-- AddForeignKey
ALTER TABLE "public"."DriverProfile" ADD CONSTRAINT "DriverProfile_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;
