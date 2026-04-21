-- Make validUntil optional (PIPELINE-discovered certs often lack a date)
ALTER TABLE "SupplierCertificate" ALTER COLUMN "validUntil" DROP NOT NULL;

-- Track where the cert was discovered (PIPELINE only)
ALTER TABLE "SupplierCertificate" ADD COLUMN "sourceUrl" TEXT;

-- Evidence tier: EXTRACTED | EVIDENCED | VERIFIED
ALTER TABLE "SupplierCertificate" ADD COLUMN "verificationStatus" TEXT NOT NULL DEFAULT 'EXTRACTED';

-- Mark existing rows as VERIFIED (buyer-authored or portal-uploaded = already reviewed)
UPDATE "SupplierCertificate" SET "verificationStatus" = 'VERIFIED' WHERE "source" IN ('MANUAL', 'PORTAL');

CREATE INDEX "SupplierCertificate_verificationStatus_idx" ON "SupplierCertificate"("verificationStatus");
