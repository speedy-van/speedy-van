-- CreateTable
CREATE TABLE "public"."ServiceArea" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "postcodes" TEXT[],
    "polygon" JSONB,
    "capacity" INTEGER NOT NULL DEFAULT 100,
    "status" TEXT NOT NULL DEFAULT 'active',
    "blackoutDates" TEXT[],
    "surgeMultiplier" DECIMAL(5,4) NOT NULL DEFAULT 1.0000,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Promotion" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "minSpend" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "maxDiscount" DECIMAL(10,2) NOT NULL,
    "usageLimit" INTEGER NOT NULL DEFAULT 1000,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "applicableAreas" TEXT[],
    "applicableVans" TEXT[],
    "firstTimeOnly" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "variables" JSONB,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ContentVersion" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "entityId" TEXT,
    "version" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "effectiveAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'draft',
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ContentAuditLog" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "entityId" TEXT,
    "action" TEXT NOT NULL,
    "changes" JSONB,
    "version" INTEGER,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServiceArea_status_idx" ON "public"."ServiceArea"("status");

-- CreateIndex
CREATE INDEX "ServiceArea_createdAt_idx" ON "public"."ServiceArea"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Promotion_code_key" ON "public"."Promotion"("code");

-- CreateIndex
CREATE INDEX "Promotion_code_idx" ON "public"."Promotion"("code");

-- CreateIndex
CREATE INDEX "Promotion_status_idx" ON "public"."Promotion"("status");

-- CreateIndex
CREATE INDEX "Promotion_validFrom_validTo_idx" ON "public"."Promotion"("validFrom", "validTo");

-- CreateIndex
CREATE INDEX "Promotion_createdAt_idx" ON "public"."Promotion"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "EmailTemplate_name_key" ON "public"."EmailTemplate"("name");

-- CreateIndex
CREATE INDEX "EmailTemplate_name_idx" ON "public"."EmailTemplate"("name");

-- CreateIndex
CREATE INDEX "EmailTemplate_category_idx" ON "public"."EmailTemplate"("category");

-- CreateIndex
CREATE INDEX "EmailTemplate_status_idx" ON "public"."EmailTemplate"("status");

-- CreateIndex
CREATE INDEX "EmailTemplate_createdAt_idx" ON "public"."EmailTemplate"("createdAt");

-- CreateIndex
CREATE INDEX "ContentVersion_type_idx" ON "public"."ContentVersion"("type");

-- CreateIndex
CREATE INDEX "ContentVersion_entityId_idx" ON "public"."ContentVersion"("entityId");

-- CreateIndex
CREATE INDEX "ContentVersion_version_idx" ON "public"."ContentVersion"("version");

-- CreateIndex
CREATE INDEX "ContentVersion_effectiveAt_idx" ON "public"."ContentVersion"("effectiveAt");

-- CreateIndex
CREATE INDEX "ContentVersion_status_idx" ON "public"."ContentVersion"("status");

-- CreateIndex
CREATE INDEX "ContentVersion_createdAt_idx" ON "public"."ContentVersion"("createdAt");

-- CreateIndex
CREATE INDEX "ContentAuditLog_type_idx" ON "public"."ContentAuditLog"("type");

-- CreateIndex
CREATE INDEX "ContentAuditLog_entityId_idx" ON "public"."ContentAuditLog"("entityId");

-- CreateIndex
CREATE INDEX "ContentAuditLog_action_idx" ON "public"."ContentAuditLog"("action");

-- CreateIndex
CREATE INDEX "ContentAuditLog_createdAt_idx" ON "public"."ContentAuditLog"("createdAt");
