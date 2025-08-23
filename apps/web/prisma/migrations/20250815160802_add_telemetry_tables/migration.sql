-- CreateTable
CREATE TABLE "public"."TelemetryEvent" (
    "id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "properties" JSONB,
    "userId" TEXT,
    "sessionId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "environment" TEXT NOT NULL DEFAULT 'development',
    "userAgent" TEXT,
    "ipAddress" TEXT,

    CONSTRAINT "TelemetryEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PerformanceMetric" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT,
    "tags" JSONB,
    "userId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "environment" TEXT NOT NULL DEFAULT 'development',

    CONSTRAINT "PerformanceMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BusinessMetric" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "tags" JSONB,
    "userId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "environment" TEXT NOT NULL DEFAULT 'development',

    CONSTRAINT "BusinessMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TelemetryEvent_event_idx" ON "public"."TelemetryEvent"("event");

-- CreateIndex
CREATE INDEX "TelemetryEvent_userId_idx" ON "public"."TelemetryEvent"("userId");

-- CreateIndex
CREATE INDEX "TelemetryEvent_sessionId_idx" ON "public"."TelemetryEvent"("sessionId");

-- CreateIndex
CREATE INDEX "TelemetryEvent_timestamp_idx" ON "public"."TelemetryEvent"("timestamp");

-- CreateIndex
CREATE INDEX "TelemetryEvent_environment_idx" ON "public"."TelemetryEvent"("environment");

-- CreateIndex
CREATE INDEX "PerformanceMetric_name_idx" ON "public"."PerformanceMetric"("name");

-- CreateIndex
CREATE INDEX "PerformanceMetric_userId_idx" ON "public"."PerformanceMetric"("userId");

-- CreateIndex
CREATE INDEX "PerformanceMetric_timestamp_idx" ON "public"."PerformanceMetric"("timestamp");

-- CreateIndex
CREATE INDEX "PerformanceMetric_environment_idx" ON "public"."PerformanceMetric"("environment");

-- CreateIndex
CREATE INDEX "BusinessMetric_name_idx" ON "public"."BusinessMetric"("name");

-- CreateIndex
CREATE INDEX "BusinessMetric_category_idx" ON "public"."BusinessMetric"("category");

-- CreateIndex
CREATE INDEX "BusinessMetric_userId_idx" ON "public"."BusinessMetric"("userId");

-- CreateIndex
CREATE INDEX "BusinessMetric_timestamp_idx" ON "public"."BusinessMetric"("timestamp");

-- CreateIndex
CREATE INDEX "BusinessMetric_environment_idx" ON "public"."BusinessMetric"("environment");
