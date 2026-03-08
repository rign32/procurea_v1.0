-- AlterTable
ALTER TABLE "Offer" ADD COLUMN     "altDescription" TEXT,
ADD COLUMN     "altMaterial" TEXT,
ADD COLUMN     "parentOfferId" TEXT,
ADD COLUMN     "submissionLanguage" TEXT;

-- CreateTable
CREATE TABLE "OfferPriceTier" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "minQty" INTEGER NOT NULL,
    "maxQty" INTEGER,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OfferPriceTier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OfferPriceTier_offerId_idx" ON "OfferPriceTier"("offerId");

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_parentOfferId_fkey" FOREIGN KEY ("parentOfferId") REFERENCES "Offer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferPriceTier" ADD CONSTRAINT "OfferPriceTier_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
