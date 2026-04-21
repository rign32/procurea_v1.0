-- Weighted Ranking Matrix for Offer comparison
-- Adds per-RFQ weight configuration + per-Offer computed scores

-- Per-RFQ ranking weights (JSON: { price, leadTime, moq, quality, compliance })
ALTER TABLE "RfqRequest" ADD COLUMN "rankingWeights" JSONB;

-- Per-Offer computed weighted score + breakdown
ALTER TABLE "Offer" ADD COLUMN "weightedRankingScore" DOUBLE PRECISION;
ALTER TABLE "Offer" ADD COLUMN "weightedRankingBreakdown" JSONB;

-- Index for sorting by score
CREATE INDEX "Offer_weightedRankingScore_idx" ON "Offer"("weightedRankingScore");
