-- Buyer approval gate for portal-uploaded certs:
-- MANUAL certs (buyer typed in) stay APPROVED by default; PORTAL certs land as PENDING
-- until the buyer clicks Approve/Reject.

ALTER TABLE "SupplierCertificate"
    ADD COLUMN "reviewStatus" TEXT NOT NULL DEFAULT 'APPROVED',
    ADD COLUMN "reviewedAt" TIMESTAMP(3),
    ADD COLUMN "reviewedById" TEXT,
    ADD COLUMN "reviewNotes" TEXT;

-- Existing portal-uploaded certs (if any) shouldn't silently become approved
UPDATE "SupplierCertificate" SET "reviewStatus" = 'PENDING' WHERE "source" = 'PORTAL';

CREATE INDEX "SupplierCertificate_reviewStatus_idx" ON "SupplierCertificate"("reviewStatus");

ALTER TABLE "SupplierCertificate"
    ADD CONSTRAINT "SupplierCertificate_reviewedById_fkey"
    FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
