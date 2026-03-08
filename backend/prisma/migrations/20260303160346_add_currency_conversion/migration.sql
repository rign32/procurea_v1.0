-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "baseCurrency" TEXT NOT NULL DEFAULT 'PLN';

-- CreateTable
CREATE TABLE "CurrencyExchangeRate" (
    "id" TEXT NOT NULL,
    "currencyCode" TEXT NOT NULL,
    "currencyName" TEXT NOT NULL,
    "rateToPln" DOUBLE PRECISION NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "tableNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CurrencyExchangeRate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CurrencyExchangeRate_effectiveDate_idx" ON "CurrencyExchangeRate"("effectiveDate");

-- CreateIndex
CREATE INDEX "CurrencyExchangeRate_currencyCode_idx" ON "CurrencyExchangeRate"("currencyCode");

-- CreateIndex
CREATE UNIQUE INDEX "CurrencyExchangeRate_currencyCode_effectiveDate_key" ON "CurrencyExchangeRate"("currencyCode", "effectiveDate");
