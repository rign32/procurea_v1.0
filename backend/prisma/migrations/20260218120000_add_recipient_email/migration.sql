-- AlterTable: Add recipientEmail to track which contact received the email
ALTER TABLE "SequenceExecution" ADD COLUMN "recipientEmail" TEXT;

-- DropIndex: Remove old unique constraint (offerId, stepId)
DROP INDEX "SequenceExecution_offerId_stepId_key";

-- CreateIndex: New unique constraint allowing same step to different recipients
CREATE UNIQUE INDEX "SequenceExecution_offerId_stepId_recipientEmail_key" ON "SequenceExecution"("offerId", "stepId", "recipientEmail");
