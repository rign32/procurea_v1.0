-- RfqLineItem: multi-SKU / BOQ line items per RFQ (Sprint #4)

CREATE TABLE "RfqLineItem" (
    "id" TEXT NOT NULL,
    "rfqRequestId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "sku" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "material" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'pcs',
    "targetPrice" DOUBLE PRECISION,
    "requiredCerts" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RfqLineItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "RfqLineItem_rfqRequestId_idx" ON "RfqLineItem"("rfqRequestId");
CREATE INDEX "RfqLineItem_rfqRequestId_sortOrder_idx" ON "RfqLineItem"("rfqRequestId", "sortOrder");

ALTER TABLE "RfqLineItem" ADD CONSTRAINT "RfqLineItem_rfqRequestId_fkey"
    FOREIGN KEY ("rfqRequestId") REFERENCES "RfqRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
