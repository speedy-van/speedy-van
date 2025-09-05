-- CreateTable
CREATE TABLE "public"."CustomerNotificationPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emailBookingConfirmation" BOOLEAN NOT NULL DEFAULT true,
    "emailBookingUpdates" BOOLEAN NOT NULL DEFAULT true,
    "emailPaymentReceipts" BOOLEAN NOT NULL DEFAULT true,
    "emailServiceAlerts" BOOLEAN NOT NULL DEFAULT true,
    "emailMarketing" BOOLEAN NOT NULL DEFAULT false,
    "smsBookingConfirmation" BOOLEAN NOT NULL DEFAULT false,
    "smsBookingUpdates" BOOLEAN NOT NULL DEFAULT false,
    "smsDriverUpdates" BOOLEAN NOT NULL DEFAULT false,
    "smsServiceAlerts" BOOLEAN NOT NULL DEFAULT false,
    "pushBookingUpdates" BOOLEAN NOT NULL DEFAULT true,
    "pushDriverUpdates" BOOLEAN NOT NULL DEFAULT true,
    "pushServiceAlerts" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerNotificationPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomerNotificationPreferences_userId_key" ON "public"."CustomerNotificationPreferences"("userId");

-- AddForeignKey
ALTER TABLE "public"."CustomerNotificationPreferences" ADD CONSTRAINT "CustomerNotificationPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
