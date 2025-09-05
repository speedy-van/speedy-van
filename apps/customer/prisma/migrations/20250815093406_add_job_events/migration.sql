-- CreateEnum
CREATE TYPE "public"."JobStep" AS ENUM ('navigate_to_pickup', 'arrived_at_pickup', 'loading_started', 'loading_completed', 'en_route_to_dropoff', 'arrived_at_dropoff', 'unloading_started', 'unloading_completed', 'job_completed', 'customer_signature', 'damage_notes', 'item_count_verification');

-- CreateTable
CREATE TABLE "public"."JobEvent" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "step" "public"."JobStep" NOT NULL,
    "payload" JSONB,
    "mediaUrls" TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "JobEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JobEvent_assignmentId_step_idx" ON "public"."JobEvent"("assignmentId", "step");

-- CreateIndex
CREATE INDEX "JobEvent_createdAt_idx" ON "public"."JobEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."JobEvent" ADD CONSTRAINT "JobEvent_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "public"."Assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
