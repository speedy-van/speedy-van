-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'driver', 'customer');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('superadmin', 'ops', 'support', 'reviewer', 'finance', 'read_only');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('unpaid', 'requires_action', 'paid', 'refunded');

-- CreateEnum
CREATE TYPE "DriverStatus" AS ENUM ('applied', 'docs_pending', 'in_review', 'approved', 'suspended', 'removed');

-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('rtw', 'licence', 'insurance', 'mot', 'v5c', 'dbs', 'other');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('pending', 'verified', 'rejected', 'expired');

-- CreateEnum
CREATE TYPE "RtwMethod" AS ENUM ('manual', 'online');

-- CreateEnum
CREATE TYPE "DbsType" AS ENUM ('basic');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'customer',
    "adminRole" "AdminRole",
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Driver" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "onboardingStatus" "DriverStatus" NOT NULL DEFAULT 'applied',
    "basePostcode" TEXT,
    "vehicleType" TEXT,
    "rightToWorkType" TEXT,
    "approvedAt" TIMESTAMP(3),

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "driverId" TEXT,
    "pickupAddress" TEXT,
    "dropoffAddress" TEXT,
    "pickupLat" DOUBLE PRECISION,
    "pickupLng" DOUBLE PRECISION,
    "dropoffLat" DOUBLE PRECISION,
    "dropoffLng" DOUBLE PRECISION,
    "distanceMeters" INTEGER,
    "durationSeconds" INTEGER,
    "preferredDate" TIMESTAMP(3),
    "timeSlot" TEXT,
    "isFlexible" BOOLEAN,
    "vanSize" TEXT,
    "crewSize" INTEGER,
    "stairsFloors" INTEGER,
    "assembly" BOOLEAN,
    "packingMaterials" BOOLEAN,
    "heavyItems" BOOLEAN,
    "promoCode" TEXT,
    "discountPence" INTEGER,
    "priceBreakdown" JSONB,
    "promoNormalized" TEXT,
    "quoteHash" TEXT,
    "extras" JSONB,
    "amountPence" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'gbp',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'unpaid',
    "stripeSessionId" TEXT,
    "paymentIntentId" TEXT,
    "paidAt" TIMESTAMP(3),
    "invoiceNumber" TEXT,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "phoneVerified" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "deviceType" TEXT,
    "serviceAreaOk" BOOLEAN,
    "serviceAreaStatus" TEXT,
    "etaSource" TEXT,
    "regionKey" TEXT,
    "source" TEXT,
    "buildingType" TEXT,
    "hasElevator" BOOLEAN,
    "parkingNotes" TEXT,
    "doorCodes" TEXT,
    "specialInstructions" TEXT,
    "photos" JSONB,
    "lockedAmountPence" INTEGER,
    "lockedAt" TIMESTAMP(3),
    "lockExpiresAt" TIMESTAMP(3),
    "slotKey" TEXT,
    "slotHoldStartedAt" TIMESTAMP(3),
    "slotHoldTtlSeconds" INTEGER,
    "otpCode" TEXT,
    "otpChannel" TEXT,
    "otpExpiresAt" TIMESTAMP(3),
    "otpLastSentAt" TIMESTAMP(3),
    "otpSendCount" INTEGER DEFAULT 0,
    "riskFlags" JSONB,
    "riskScore" INTEGER,
    "timeline" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment" (
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
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverVehicle" (
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
CREATE TABLE "DriverChecks" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "rtwMethod" "RtwMethod",
    "rtwResultRef" TEXT,
    "rtwExpiresAt" TIMESTAMP(3),
    "dvlaCheckRef" TEXT,
    "licenceCategories" TEXT[],
    "points" INTEGER,
    "licenceExpiry" TIMESTAMP(3),
    "dbsType" "DbsType",
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
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "category" "DocumentCategory" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "hash" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "expiresAt" TIMESTAMP(3),
    "status" "DocumentStatus" NOT NULL DEFAULT 'pending',

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackingPing" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrackingPing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorRole" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "before" JSONB,
    "after" JSONB,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_userId_key" ON "Driver"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_code_key" ON "Booking"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_invoiceNumber_key" ON "Booking"("invoiceNumber");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- CreateIndex
CREATE INDEX "Booking_driverId_status_idx" ON "Booking"("driverId", "status");

-- CreateIndex
CREATE INDEX "Booking_status_createdAt_idx" ON "Booking"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Booking_regionKey_timeSlot_idx" ON "Booking"("regionKey", "timeSlot");

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_bookingId_key" ON "Assignment"("bookingId");

-- CreateIndex
CREATE INDEX "Assignment_status_idx" ON "Assignment"("status");

-- CreateIndex
CREATE INDEX "DriverVehicle_driverId_idx" ON "DriverVehicle"("driverId");

-- CreateIndex
CREATE INDEX "DriverVehicle_reg_idx" ON "DriverVehicle"("reg");

-- CreateIndex
CREATE UNIQUE INDEX "DriverChecks_driverId_key" ON "DriverChecks"("driverId");

-- CreateIndex
CREATE INDEX "Document_driverId_category_idx" ON "Document"("driverId", "category");

-- CreateIndex
CREATE INDEX "Document_expiresAt_idx" ON "Document"("expiresAt");

-- CreateIndex
CREATE INDEX "Document_status_idx" ON "Document"("status");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt");

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverVehicle" ADD CONSTRAINT "DriverVehicle_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverChecks" ADD CONSTRAINT "DriverChecks_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackingPing" ADD CONSTRAINT "TrackingPing_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
