/*
  Warnings:

  - You are about to drop the column `driverId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the `Assignment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Document` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Driver` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DriverChecks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DriverOnlineStatus` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DriverVehicle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TrackingPing` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Assignment" DROP CONSTRAINT "Assignment_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Assignment" DROP CONSTRAINT "Assignment_driverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Booking" DROP CONSTRAINT "Booking_driverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Document" DROP CONSTRAINT "Document_driverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Driver" DROP CONSTRAINT "Driver_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DriverChecks" DROP CONSTRAINT "DriverChecks_driverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DriverOnlineStatus" DROP CONSTRAINT "DriverOnlineStatus_driverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DriverVehicle" DROP CONSTRAINT "DriverVehicle_driverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TrackingPing" DROP CONSTRAINT "TrackingPing_bookingId_fkey";

-- DropIndex
DROP INDEX "public"."Booking_driverId_status_idx";

-- AlterTable
ALTER TABLE "public"."Booking" DROP COLUMN "driverId";

-- DropTable
DROP TABLE "public"."Assignment";

-- DropTable
DROP TABLE "public"."Document";

-- DropTable
DROP TABLE "public"."Driver";

-- DropTable
DROP TABLE "public"."DriverChecks";

-- DropTable
DROP TABLE "public"."DriverOnlineStatus";

-- DropTable
DROP TABLE "public"."DriverVehicle";

-- DropTable
DROP TABLE "public"."TrackingPing";

-- DropEnum
DROP TYPE "public"."DbsType";

-- DropEnum
DROP TYPE "public"."DocumentCategory";

-- DropEnum
DROP TYPE "public"."DocumentStatus";

-- DropEnum
DROP TYPE "public"."DriverStatus";

-- DropEnum
DROP TYPE "public"."RtwMethod";
