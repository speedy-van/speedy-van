/*
  Warnings:

  - You are about to drop the column `bookingId` on the `Message` table. All the data in the column will be lost.
  - Added the required column `sessionId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."MessageType" AS ENUM ('text', 'image', 'file', 'location', 'system');

-- CreateEnum
CREATE TYPE "public"."MessageStatus" AS ENUM ('sent', 'delivered', 'read', 'failed');

-- CreateEnum
CREATE TYPE "public"."ChatSessionType" AS ENUM ('customer_driver', 'customer_admin', 'driver_admin', 'guest_admin', 'support');

-- CreateEnum
CREATE TYPE "public"."ChatParticipantRole" AS ENUM ('customer', 'driver', 'admin', 'guest', 'support');

-- DropForeignKey
ALTER TABLE "public"."Message" DROP CONSTRAINT "Message_bookingId_fkey";

-- AlterTable
ALTER TABLE "public"."Message" DROP COLUMN "bookingId",
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "sessionId" TEXT NOT NULL,
ADD COLUMN     "status" "public"."MessageStatus" NOT NULL DEFAULT 'sent',
ADD COLUMN     "type" "public"."MessageType" NOT NULL DEFAULT 'text',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Refund" ADD COLUMN     "notes" TEXT;

-- CreateTable
CREATE TABLE "public"."ChatSession" (
    "id" TEXT NOT NULL,
    "type" "public"."ChatSessionType" NOT NULL,
    "title" TEXT,
    "bookingId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),
    "closedBy" TEXT,
    "createdBy" TEXT,

    CONSTRAINT "ChatSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChatParticipant" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "guestName" TEXT,
    "guestEmail" TEXT,
    "role" "public"."ChatParticipantRole" NOT NULL,
    "lastReadAt" TIMESTAMP(3),
    "isTyping" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PricingSettings" (
    "id" TEXT NOT NULL,
    "customerPriceAdjustment" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "driverRateMultiplier" DECIMAL(5,4) NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "PricingSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatSession_type_idx" ON "public"."ChatSession"("type");

-- CreateIndex
CREATE INDEX "ChatSession_bookingId_idx" ON "public"."ChatSession"("bookingId");

-- CreateIndex
CREATE INDEX "ChatSession_isActive_idx" ON "public"."ChatSession"("isActive");

-- CreateIndex
CREATE INDEX "ChatSession_createdAt_idx" ON "public"."ChatSession"("createdAt");

-- CreateIndex
CREATE INDEX "ChatParticipant_sessionId_idx" ON "public"."ChatParticipant"("sessionId");

-- CreateIndex
CREATE INDEX "ChatParticipant_userId_idx" ON "public"."ChatParticipant"("userId");

-- CreateIndex
CREATE INDEX "ChatParticipant_lastReadAt_idx" ON "public"."ChatParticipant"("lastReadAt");

-- CreateIndex
CREATE UNIQUE INDEX "ChatParticipant_sessionId_userId_key" ON "public"."ChatParticipant"("sessionId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatParticipant_sessionId_guestEmail_key" ON "public"."ChatParticipant"("sessionId", "guestEmail");

-- CreateIndex
CREATE INDEX "PricingSettings_isActive_idx" ON "public"."PricingSettings"("isActive");

-- CreateIndex
CREATE INDEX "PricingSettings_createdAt_idx" ON "public"."PricingSettings"("createdAt");

-- CreateIndex
CREATE INDEX "Booking_customerEmail_scheduledAt_idx" ON "public"."Booking"("customerEmail", "scheduledAt");

-- CreateIndex
CREATE INDEX "Booking_status_createdAt_idx" ON "public"."Booking"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Message_sessionId_idx" ON "public"."Message"("sessionId");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "public"."Message"("senderId");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "public"."Message"("createdAt");

-- CreateIndex
CREATE INDEX "Message_status_idx" ON "public"."Message"("status");

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."ChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatSession" ADD CONSTRAINT "ChatSession_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatSession" ADD CONSTRAINT "ChatSession_closedBy_fkey" FOREIGN KEY ("closedBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatSession" ADD CONSTRAINT "ChatSession_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatParticipant" ADD CONSTRAINT "ChatParticipant_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."ChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatParticipant" ADD CONSTRAINT "ChatParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PricingSettings" ADD CONSTRAINT "PricingSettings_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PricingSettings" ADD CONSTRAINT "PricingSettings_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
