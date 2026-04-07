-- CreateTable
CREATE TABLE "MonitoringIncident" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "lastAlertAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "severity" TEXT NOT NULL DEFAULT 'warning',
    "title" TEXT NOT NULL,
    "message" TEXT,
    "metadata" JSONB,

    CONSTRAINT "MonitoringIncident_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MonitoringIncident_serviceId_status_idx" ON "MonitoringIncident"("serviceId", "status");

-- CreateIndex
CREATE INDEX "MonitoringIncident_status_startedAt_idx" ON "MonitoringIncident"("status", "startedAt");
