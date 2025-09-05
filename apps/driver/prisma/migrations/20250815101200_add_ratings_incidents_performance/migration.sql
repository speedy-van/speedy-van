-- CreateEnum
CREATE TYPE "public"."RatingCategory" AS ENUM ('overall', 'communication', 'punctuality', 'care', 'professionalism');

-- CreateEnum
CREATE TYPE "public"."RatingStatus" AS ENUM ('active', 'hidden', 'removed');

-- CreateEnum
CREATE TYPE "public"."IncidentType" AS ENUM ('vehicle_breakdown', 'traffic_accident', 'customer_dispute', 'property_damage', 'theft', 'weather_related', 'medical_emergency', 'technical_issue', 'other');

-- CreateEnum
CREATE TYPE "public"."IncidentSeverity" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "public"."IncidentStatus" AS ENUM ('reported', 'under_review', 'resolved', 'closed', 'escalated');

-- CreateTable
CREATE TABLE "public"."DriverRating" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "review" TEXT,
    "category" "public"."RatingCategory" NOT NULL,
    "customerId" TEXT,
    "status" "public"."RatingStatus" NOT NULL DEFAULT 'active',
    "moderatedAt" TIMESTAMP(3),
    "moderatedBy" TEXT,
    "moderationNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DriverIncident" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "assignmentId" TEXT,
    "type" "public"."IncidentType" NOT NULL,
    "severity" "public"."IncidentSeverity" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "photoUrls" TEXT[],
    "status" "public"."IncidentStatus" NOT NULL DEFAULT 'reported',
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "reviewNotes" TEXT,
    "resolution" TEXT,
    "customerImpact" BOOLEAN NOT NULL DEFAULT false,
    "propertyDamage" BOOLEAN NOT NULL DEFAULT false,
    "injuryInvolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverIncident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DriverPerformance" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalRatings" INTEGER NOT NULL DEFAULT 0,
    "completionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "acceptanceRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "onTimeRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cancellationRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalJobs" INTEGER NOT NULL DEFAULT 0,
    "completedJobs" INTEGER NOT NULL DEFAULT 0,
    "cancelledJobs" INTEGER NOT NULL DEFAULT 0,
    "lateJobs" INTEGER NOT NULL DEFAULT 0,
    "lastCalculated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "monthlyRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "monthlyCompletionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "monthlyOnTimeRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverPerformance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DriverRating_driverId_createdAt_idx" ON "public"."DriverRating"("driverId", "createdAt");

-- CreateIndex
CREATE INDEX "DriverRating_assignmentId_idx" ON "public"."DriverRating"("assignmentId");

-- CreateIndex
CREATE INDEX "DriverRating_rating_idx" ON "public"."DriverRating"("rating");

-- CreateIndex
CREATE INDEX "DriverRating_status_idx" ON "public"."DriverRating"("status");

-- CreateIndex
CREATE INDEX "DriverIncident_driverId_createdAt_idx" ON "public"."DriverIncident"("driverId", "createdAt");

-- CreateIndex
CREATE INDEX "DriverIncident_assignmentId_idx" ON "public"."DriverIncident"("assignmentId");

-- CreateIndex
CREATE INDEX "DriverIncident_type_idx" ON "public"."DriverIncident"("type");

-- CreateIndex
CREATE INDEX "DriverIncident_severity_idx" ON "public"."DriverIncident"("severity");

-- CreateIndex
CREATE INDEX "DriverIncident_status_idx" ON "public"."DriverIncident"("status");

-- CreateIndex
CREATE UNIQUE INDEX "DriverPerformance_driverId_key" ON "public"."DriverPerformance"("driverId");

-- AddForeignKey
ALTER TABLE "public"."DriverRating" ADD CONSTRAINT "DriverRating_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverRating" ADD CONSTRAINT "DriverRating_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "public"."Assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverIncident" ADD CONSTRAINT "DriverIncident_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverIncident" ADD CONSTRAINT "DriverIncident_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "public"."Assignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverPerformance" ADD CONSTRAINT "DriverPerformance_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
