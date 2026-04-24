-- Sprint 2 B2: backfill industry + sourcingMode on pre-existing campaigns
-- so analytics per-industry queries don't exclude them from aggregates.
UPDATE "Campaign" SET "industry" = 'other' WHERE "industry" IS NULL;
UPDATE "Campaign" SET "sourcingMode" = 'product' WHERE "sourcingMode" IS NULL;
