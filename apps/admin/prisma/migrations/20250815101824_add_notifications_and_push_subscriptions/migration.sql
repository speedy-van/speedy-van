-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('job_offer', 'job_update', 'job_cancelled', 'job_completed', 'message_received', 'schedule_change', 'payout_processed', 'payout_failed', 'document_expiry', 'system_alert', 'performance_update', 'incident_reported');

-- CreateTable
CREATE TABLE "public"."PushSubscription" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DriverNotification" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DriverNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DriverNotificationPreferences" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "pushJobOffers" BOOLEAN NOT NULL DEFAULT true,
    "pushJobUpdates" BOOLEAN NOT NULL DEFAULT true,
    "pushMessages" BOOLEAN NOT NULL DEFAULT true,
    "pushScheduleChanges" BOOLEAN NOT NULL DEFAULT true,
    "pushPayoutEvents" BOOLEAN NOT NULL DEFAULT true,
    "pushSystemAlerts" BOOLEAN NOT NULL DEFAULT true,
    "emailJobOffers" BOOLEAN NOT NULL DEFAULT false,
    "emailJobUpdates" BOOLEAN NOT NULL DEFAULT false,
    "emailMessages" BOOLEAN NOT NULL DEFAULT false,
    "emailScheduleChanges" BOOLEAN NOT NULL DEFAULT false,
    "emailPayoutEvents" BOOLEAN NOT NULL DEFAULT true,
    "emailSystemAlerts" BOOLEAN NOT NULL DEFAULT true,
    "smsJobOffers" BOOLEAN NOT NULL DEFAULT false,
    "smsJobUpdates" BOOLEAN NOT NULL DEFAULT false,
    "smsMessages" BOOLEAN NOT NULL DEFAULT false,
    "smsScheduleChanges" BOOLEAN NOT NULL DEFAULT false,
    "smsPayoutEvents" BOOLEAN NOT NULL DEFAULT false,
    "smsSystemAlerts" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverNotificationPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "public"."PushSubscription"("endpoint");

-- CreateIndex
CREATE INDEX "PushSubscription_driverId_idx" ON "public"."PushSubscription"("driverId");

-- CreateIndex
CREATE INDEX "DriverNotification_driverId_createdAt_idx" ON "public"."DriverNotification"("driverId", "createdAt");

-- CreateIndex
CREATE INDEX "DriverNotification_driverId_read_idx" ON "public"."DriverNotification"("driverId", "read");

-- CreateIndex
CREATE INDEX "DriverNotification_type_idx" ON "public"."DriverNotification"("type");

-- CreateIndex
CREATE UNIQUE INDEX "DriverNotificationPreferences_driverId_key" ON "public"."DriverNotificationPreferences"("driverId");

-- AddForeignKey
ALTER TABLE "public"."PushSubscription" ADD CONSTRAINT "PushSubscription_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverNotification" ADD CONSTRAINT "DriverNotification_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverNotificationPreferences" ADD CONSTRAINT "DriverNotificationPreferences_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;
