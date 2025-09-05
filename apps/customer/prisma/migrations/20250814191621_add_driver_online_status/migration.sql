-- CreateTable
CREATE TABLE "DriverOnlineStatus" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "online" BOOLEAN NOT NULL DEFAULT false,
    "lastPingAt" TIMESTAMP(3),
    "lastLat" DOUBLE PRECISION,
    "lastLng" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverOnlineStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DriverOnlineStatus_driverId_key" ON "DriverOnlineStatus"("driverId");

-- CreateIndex
CREATE INDEX "DriverOnlineStatus_online_idx" ON "DriverOnlineStatus"("online");

-- CreateIndex
CREATE INDEX "DriverOnlineStatus_lastPingAt_idx" ON "DriverOnlineStatus"("lastPingAt");

-- AddForeignKey
ALTER TABLE "DriverOnlineStatus" ADD CONSTRAINT "DriverOnlineStatus_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
