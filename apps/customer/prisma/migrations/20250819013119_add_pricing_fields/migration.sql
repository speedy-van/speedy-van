-- CreateEnum
CREATE TYPE "public"."DriverApplicationStatus" AS ENUM ('pending', 'approved', 'rejected', 'under_review', 'requires_additional_info');

-- AlterTable
ALTER TABLE "public"."Booking" ADD COLUMN     "itemsCount" INTEGER,
ADD COLUMN     "volumeM3" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastLogin" TIMESTAMP(3),
ADD COLUMN     "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."DriverApplication" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "postcode" TEXT NOT NULL,
    "county" TEXT NOT NULL,
    "nationalInsuranceNumber" TEXT NOT NULL,
    "drivingLicenseNumber" TEXT NOT NULL,
    "drivingLicenseExpiry" TIMESTAMP(3) NOT NULL,
    "drivingLicenseFrontImage" TEXT,
    "drivingLicenseBackImage" TEXT,
    "insuranceProvider" TEXT NOT NULL,
    "insurancePolicyNumber" TEXT NOT NULL,
    "insuranceExpiry" TIMESTAMP(3) NOT NULL,
    "insuranceDocument" TEXT,
    "bankName" TEXT NOT NULL,
    "accountHolderName" TEXT NOT NULL,
    "sortCode" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "rightToWorkShareCode" TEXT NOT NULL,
    "rightToWorkDocument" TEXT,
    "emergencyContactName" TEXT NOT NULL,
    "emergencyContactPhone" TEXT NOT NULL,
    "emergencyContactRelationship" TEXT NOT NULL,
    "agreeToTerms" BOOLEAN NOT NULL,
    "agreeToDataProcessing" BOOLEAN NOT NULL,
    "agreeToBackgroundCheck" BOOLEAN NOT NULL,
    "status" "public"."DriverApplicationStatus" NOT NULL DEFAULT 'pending',
    "applicationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "reviewNotes" TEXT,
    "userId" TEXT,

    CONSTRAINT "DriverApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DriverApplication_email_key" ON "public"."DriverApplication"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DriverApplication_userId_key" ON "public"."DriverApplication"("userId");

-- CreateIndex
CREATE INDEX "DriverApplication_email_idx" ON "public"."DriverApplication"("email");

-- CreateIndex
CREATE INDEX "DriverApplication_status_idx" ON "public"."DriverApplication"("status");

-- CreateIndex
CREATE INDEX "DriverApplication_applicationDate_idx" ON "public"."DriverApplication"("applicationDate");

-- CreateIndex
CREATE INDEX "DriverApplication_nationalInsuranceNumber_idx" ON "public"."DriverApplication"("nationalInsuranceNumber");

-- AddForeignKey
ALTER TABLE "public"."DriverApplication" ADD CONSTRAINT "DriverApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
