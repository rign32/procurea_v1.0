-- Industry-aware wizard v2: store user-selected industry, sourcing mode and AI-parsed brief
ALTER TABLE "Campaign" ADD COLUMN "industry" TEXT;
ALTER TABLE "Campaign" ADD COLUMN "sourcingMode" TEXT;
ALTER TABLE "Campaign" ADD COLUMN "brief" TEXT;
ALTER TABLE "Campaign" ADD COLUMN "parsedBrief" JSONB;

CREATE INDEX "Campaign_industry_idx" ON "Campaign"("industry");
CREATE INDEX "Campaign_sourcingMode_idx" ON "Campaign"("sourcingMode");
