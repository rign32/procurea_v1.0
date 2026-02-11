/*
  Warnings:

  - You are about to drop the column `marketplaceId` on the `Offer` table. All the data in the column will be lost.
  - You are about to drop the column `productImage` on the `Offer` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Supplier` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Offer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "price" REAL,
    "currency" TEXT DEFAULT 'EUR',
    "moq" INTEGER,
    "leadTime" INTEGER,
    "validityDate" DATETIME,
    "incotermsConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "specsConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "comments" TEXT,
    "rfqRequestId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "tokenExpiresAt" DATETIME,
    "viewedAt" DATETIME,
    "submittedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Offer_rfqRequestId_fkey" FOREIGN KEY ("rfqRequestId") REFERENCES "RfqRequest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Offer_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Offer" ("accessToken", "comments", "createdAt", "currency", "id", "incotermsConfirmed", "leadTime", "moq", "price", "rfqRequestId", "specsConfirmed", "status", "submittedAt", "supplierId", "tokenExpiresAt", "updatedAt", "validityDate", "viewedAt") SELECT "accessToken", "comments", "createdAt", "currency", "id", "incotermsConfirmed", "leadTime", "moq", "price", "rfqRequestId", "specsConfirmed", "status", "submittedAt", "supplierId", "tokenExpiresAt", "updatedAt", "validityDate", "viewedAt" FROM "Offer";
DROP TABLE "Offer";
ALTER TABLE "new_Offer" RENAME TO "Offer";
CREATE UNIQUE INDEX "Offer_accessToken_key" ON "Offer"("accessToken");
CREATE TABLE "new_Supplier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT,
    "country" TEXT,
    "city" TEXT,
    "website" TEXT,
    "explorerResult" TEXT,
    "analystResult" TEXT,
    "enrichmentResult" TEXT,
    "auditorResult" TEXT,
    "analysisScore" REAL,
    "analysisReason" TEXT,
    "specialization" TEXT,
    "certificates" TEXT,
    "employeeCount" TEXT,
    "contactEmails" TEXT,
    "metadata" TEXT,
    "originLanguage" TEXT DEFAULT 'en',
    "originCountry" TEXT DEFAULT 'Global',
    "sourceAgent" TEXT DEFAULT 'SourcingPipeline',
    "registryId" TEXT,
    "deletedAt" DATETIME,
    CONSTRAINT "Supplier_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Supplier_registryId_fkey" FOREIGN KEY ("registryId") REFERENCES "CompanyRegistry" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Supplier" ("analysisReason", "analysisScore", "analystResult", "auditorResult", "campaignId", "certificates", "city", "contactEmails", "country", "deletedAt", "employeeCount", "enrichmentResult", "explorerResult", "id", "metadata", "name", "originCountry", "originLanguage", "registryId", "sourceAgent", "specialization", "url", "website") SELECT "analysisReason", "analysisScore", "analystResult", "auditorResult", "campaignId", "certificates", "city", "contactEmails", "country", "deletedAt", "employeeCount", "enrichmentResult", "explorerResult", "id", "metadata", "name", "originCountry", "originLanguage", "registryId", "sourceAgent", "specialization", "url", "website" FROM "Supplier";
DROP TABLE "Supplier";
ALTER TABLE "new_Supplier" RENAME TO "Supplier";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
