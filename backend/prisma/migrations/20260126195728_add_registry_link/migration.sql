-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
INSERT INTO "new_Supplier" ("analysisReason", "analysisScore", "analystResult", "auditorResult", "campaignId", "certificates", "city", "contactEmails", "country", "deletedAt", "employeeCount", "enrichmentResult", "explorerResult", "id", "metadata", "name", "originCountry", "originLanguage", "sourceAgent", "specialization", "url", "website") SELECT "analysisReason", "analysisScore", "analystResult", "auditorResult", "campaignId", "certificates", "city", "contactEmails", "country", "deletedAt", "employeeCount", "enrichmentResult", "explorerResult", "id", "metadata", "name", "originCountry", "originLanguage", "sourceAgent", "specialization", "url", "website" FROM "Supplier";
DROP TABLE "Supplier";
ALTER TABLE "new_Supplier" RENAME TO "Supplier";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
