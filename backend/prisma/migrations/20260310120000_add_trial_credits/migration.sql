-- AlterTable: change searchCredits default from 0 to 10
ALTER TABLE "User" ALTER COLUMN "searchCredits" SET DEFAULT 10;

-- AddColumn: trialCreditsUsed
ALTER TABLE "User" ADD COLUMN "trialCreditsUsed" BOOLEAN NOT NULL DEFAULT false;

-- DataMigration: mark all existing users as trial completed
UPDATE "User" SET "trialCreditsUsed" = true WHERE "trialCreditsUsed" = false;
