-- Add trial ended acknowledgment timestamp per user
ALTER TABLE "User" ADD COLUMN "trialEndedAcknowledgedAt" TIMESTAMP(3);
