-- AlterTable
ALTER TABLE "Supplier" ADD COLUMN     "companyType" TEXT DEFAULT 'NIEJASNY',
ADD COLUMN     "companyTypeConfidence" INTEGER DEFAULT 0,
ADD COLUMN     "needsManualClassification" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sourceType" TEXT DEFAULT 'SEARCH';
