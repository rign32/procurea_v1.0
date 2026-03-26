-- Add Apollo enrichment fields to Contact model
ALTER TABLE "Contact" ADD COLUMN IF NOT EXISTS "apolloId" TEXT;
ALTER TABLE "Contact" ADD COLUMN IF NOT EXISTS "linkedinUrl" TEXT;
ALTER TABLE "Contact" ADD COLUMN IF NOT EXISTS "department" TEXT;
ALTER TABLE "Contact" ADD COLUMN IF NOT EXISTS "seniority" TEXT;
ALTER TABLE "Contact" ADD COLUMN IF NOT EXISTS "emailStatus" TEXT;
ALTER TABLE "Contact" ADD COLUMN IF NOT EXISTS "enrichedAt" TIMESTAMP(3);

-- Add Apollo enrichment status to Campaign model
ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "apolloEnrichmentStatus" TEXT;
