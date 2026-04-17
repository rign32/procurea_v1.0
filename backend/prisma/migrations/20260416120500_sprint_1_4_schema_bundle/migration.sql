-- Sprint 1-4 Schema Bundle
-- Adds: OfferReply + Offer.resendEmailId (Sprint 1 — inbound email via Resend)
--       ResendEventLog (Sprint 1 — webhook dedup)
--       PurchaseOrder + PurchaseOrderLine (Sprint 4 — PO module)
--       Supplier.qualityScore + index (Sprint 3 — supplier quality score)
-- Contract table already exists (from enterprise-saas-roadmap migration), only adds back-relations here via PurchaseOrder FK.

-- =========================================================================
-- AlterTable: Offer — add resendEmailId for matching inbound replies
-- =========================================================================
ALTER TABLE "Offer" ADD COLUMN "resendEmailId" TEXT;
CREATE UNIQUE INDEX "Offer_resendEmailId_key" ON "Offer"("resendEmailId");

-- =========================================================================
-- AlterTable: Supplier — add qualityScore (Sprint 3)
-- =========================================================================
ALTER TABLE "Supplier" ADD COLUMN "qualityScore" DOUBLE PRECISION;
CREATE INDEX "Supplier_qualityScore_idx" ON "Supplier"("qualityScore");

-- =========================================================================
-- CreateTable: OfferReply — captures inbound email replies via Resend
-- =========================================================================
CREATE TABLE "OfferReply" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "resendEmailId" TEXT NOT NULL,
    "fromAddress" TEXT NOT NULL,
    "fromName" TEXT,
    "subject" TEXT NOT NULL,
    "textBody" TEXT,
    "htmlBody" TEXT,
    "headers" JSONB NOT NULL,
    "attachments" JSONB,
    "category" TEXT NOT NULL,
    "aiAnalysis" JSONB NOT NULL,
    "forwardedAt" TIMESTAMP(3),
    "forwardedTo" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OfferReply_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OfferReply_resendEmailId_key" ON "OfferReply"("resendEmailId");
CREATE INDEX "OfferReply_offerId_idx" ON "OfferReply"("offerId");
CREATE INDEX "OfferReply_category_idx" ON "OfferReply"("category");
CREATE INDEX "OfferReply_receivedAt_idx" ON "OfferReply"("receivedAt");

ALTER TABLE "OfferReply" ADD CONSTRAINT "OfferReply_offerId_fkey"
    FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- =========================================================================
-- CreateTable: ResendEventLog — webhook event dedup (mirrors StripeEventLog)
-- =========================================================================
CREATE TABLE "ResendEventLog" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResendEventLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ResendEventLog_eventId_key" ON "ResendEventLog"("eventId");
CREATE INDEX "ResendEventLog_eventType_idx" ON "ResendEventLog"("eventType");

-- =========================================================================
-- CreateTable: PurchaseOrder — generated from signed Contract, synced to ERP
-- =========================================================================
CREATE TABLE "PurchaseOrder" (
    "id" TEXT NOT NULL,
    "poNumber" TEXT,
    "contractId" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "totalAmount" DOUBLE PRECISION,
    "currency" TEXT,
    "deliveryDate" TIMESTAMP(3),
    "notes" TEXT,
    "externalId" TEXT,
    "externalSystem" TEXT,
    "syncedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseOrder_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PurchaseOrder_poNumber_key" ON "PurchaseOrder"("poNumber");
CREATE INDEX "PurchaseOrder_contractId_idx" ON "PurchaseOrder"("contractId");
CREATE INDEX "PurchaseOrder_offerId_idx" ON "PurchaseOrder"("offerId");
CREATE INDEX "PurchaseOrder_organizationId_idx" ON "PurchaseOrder"("organizationId");
CREATE INDEX "PurchaseOrder_status_idx" ON "PurchaseOrder"("status");
CREATE INDEX "PurchaseOrder_createdById_idx" ON "PurchaseOrder"("createdById");

ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_contractId_fkey"
    FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_offerId_fkey"
    FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- =========================================================================
-- CreateTable: PurchaseOrderLine
-- =========================================================================
CREATE TABLE "PurchaseOrderLine" (
    "id" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "deliveryDate" TIMESTAMP(3),
    "notes" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PurchaseOrderLine_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PurchaseOrderLine_purchaseOrderId_idx" ON "PurchaseOrderLine"("purchaseOrderId");

ALTER TABLE "PurchaseOrderLine" ADD CONSTRAINT "PurchaseOrderLine_purchaseOrderId_fkey"
    FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
