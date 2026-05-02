-- Phase 0 MarketSizeAgent — stores the AI-estimated market size and coverage targets
-- per campaign. Powers the auto-expansion loop's stop condition and the UI's
-- "found N of estimated M (X%)" coverage indicator.

ALTER TABLE "Campaign"
  ADD COLUMN     "marketSize" JSONB,
  ADD COLUMN     "marketSizeEstimatedAt" TIMESTAMP(3);
