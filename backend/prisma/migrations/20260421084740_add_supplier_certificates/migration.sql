-- SupplierCertificate: structured certs with expiry tracking (Sprint #2)

CREATE TABLE "SupplierCertificate" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "issuer" TEXT,
    "certNumber" TEXT,
    "issuedAt" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3) NOT NULL,
    "documentId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "lastAlertedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierCertificate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SupplierCertificate_supplierId_type_code_key" ON "SupplierCertificate"("supplierId", "type", "code");
CREATE INDEX "SupplierCertificate_supplierId_idx" ON "SupplierCertificate"("supplierId");
CREATE INDEX "SupplierCertificate_validUntil_idx" ON "SupplierCertificate"("validUntil");
CREATE INDEX "SupplierCertificate_status_idx" ON "SupplierCertificate"("status");

ALTER TABLE "SupplierCertificate" ADD CONSTRAINT "SupplierCertificate_supplierId_fkey"
    FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SupplierCertificate" ADD CONSTRAINT "SupplierCertificate_documentId_fkey"
    FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;
