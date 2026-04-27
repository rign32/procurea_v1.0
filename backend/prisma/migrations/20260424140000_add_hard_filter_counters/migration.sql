-- Sprint 3: track which deterministic post-Auditor filter dropped each supplier.
-- Used by the campaign UI to show "Found 134 → passed 87 (47 dropped: missing CE)".
ALTER TABLE "CampaignMetrics" ADD COLUMN "hardFilteredCerts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "CampaignMetrics" ADD COLUMN "hardFilteredMoq" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "CampaignMetrics" ADD COLUMN "hardFilteredLeadTime" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "CampaignMetrics" ADD COLUMN "hardFilteredGeography" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "CampaignMetrics" ADD COLUMN "hardFilteredVoivodeship" INTEGER NOT NULL DEFAULT 0;
