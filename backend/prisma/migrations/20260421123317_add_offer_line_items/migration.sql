-- OfferLineItem: per-line quotes for multi-SKU / BOQ RFQs (Faza 2B)

CREATE TABLE "OfferLineItem" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "rfqLineItemId" TEXT NOT NULL,
    "unitPrice" DOUBLE PRECISION,
    "currency" TEXT DEFAULT 'EUR',
    "moq" INTEGER,
    "leadTime" INTEGER,
    "altDescription" TEXT,
    "altMaterial" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfferLineItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OfferLineItem_offerId_rfqLineItemId_key" ON "OfferLineItem"("offerId", "rfqLineItemId");
CREATE INDEX "OfferLineItem_offerId_idx" ON "OfferLineItem"("offerId");
CREATE INDEX "OfferLineItem_rfqLineItemId_idx" ON "OfferLineItem"("rfqLineItemId");

ALTER TABLE "OfferLineItem" ADD CONSTRAINT "OfferLineItem_offerId_fkey"
    FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OfferLineItem" ADD CONSTRAINT "OfferLineItem_rfqLineItemId_fkey"
    FOREIGN KEY ("rfqLineItemId") REFERENCES "RfqLineItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
