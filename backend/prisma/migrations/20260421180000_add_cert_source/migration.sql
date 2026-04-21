-- Track how a cert was added: MANUAL (buyer typed it in) vs PORTAL (supplier uploaded via token)
ALTER TABLE "SupplierCertificate"
    ADD COLUMN "source" TEXT NOT NULL DEFAULT 'MANUAL';

CREATE INDEX "SupplierCertificate_source_idx" ON "SupplierCertificate"("source");
