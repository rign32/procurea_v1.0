-- AlterTable: Add searchCriteria to Campaign for re-run capability
ALTER TABLE "Campaign" ADD COLUMN "searchCriteria" JSONB;

-- AlterTable: Add campaignId to ApiUsageLog for cost attribution per campaign
ALTER TABLE "ApiUsageLog" ADD COLUMN "campaignId" TEXT;
CREATE INDEX "ApiUsageLog_campaignId_idx" ON "ApiUsageLog"("campaignId");

-- AlterTable: Add severity to Log for filtering without text parsing
ALTER TABLE "Log" ADD COLUMN "severity" TEXT NOT NULL DEFAULT 'info';
CREATE INDEX "Log_campaignId_severity_idx" ON "Log"("campaignId", "severity");

-- CreateTable: CampaignMetrics for pipeline analytics
CREATE TABLE "CampaignMetrics" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "urlsCollected" INTEGER NOT NULL DEFAULT 0,
    "urlsProcessed" INTEGER NOT NULL DEFAULT 0,
    "screenerPassed" INTEGER NOT NULL DEFAULT 0,
    "screenerFallback" INTEGER NOT NULL DEFAULT 0,
    "auditorApproved" INTEGER NOT NULL DEFAULT 0,
    "auditorRejected" INTEGER NOT NULL DEFAULT 0,
    "auditorNeedsReview" INTEGER NOT NULL DEFAULT 0,
    "avgCapabilityScore" DOUBLE PRECISION,
    "avgTrustScore" DOUBLE PRECISION,
    "geminiCalls" INTEGER NOT NULL DEFAULT 0,
    "serperCalls" INTEGER NOT NULL DEFAULT 0,
    "totalCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "costPerSupplier" DOUBLE PRECISION,
    "rejectionReasons" JSONB,
    "totalDurationMs" INTEGER,
    "lowYieldModeUsed" BOOLEAN NOT NULL DEFAULT false,
    "expansionUsed" BOOLEAN NOT NULL DEFAULT false,
    "similarityUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignMetrics_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CampaignMetrics_campaignId_key" ON "CampaignMetrics"("campaignId");
ALTER TABLE "CampaignMetrics" ADD CONSTRAINT "CampaignMetrics_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
