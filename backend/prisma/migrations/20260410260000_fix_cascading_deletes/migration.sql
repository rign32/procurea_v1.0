-- Fix cascading deletes for User-referencing tables

-- Feedback
ALTER TABLE "Feedback" DROP CONSTRAINT IF EXISTS "Feedback_userId_fkey";
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Comment
ALTER TABLE "Comment" DROP CONSTRAINT IF EXISTS "Comment_userId_fkey";
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ScheduledReport
ALTER TABLE "ScheduledReport" DROP CONSTRAINT IF EXISTS "ScheduledReport_userId_fkey";
ALTER TABLE "ScheduledReport" ADD CONSTRAINT "ScheduledReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ApiKey
ALTER TABLE "ApiKey" DROP CONSTRAINT IF EXISTS "ApiKey_userId_fkey";
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Document
ALTER TABLE "Document" DROP CONSTRAINT IF EXISTS "Document_uploadedById_fkey";
ALTER TABLE "Document" ADD CONSTRAINT "Document_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AuditLog
ALTER TABLE "AuditLog" DROP CONSTRAINT IF EXISTS "AuditLog_userId_fkey";
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- WorkspaceMember
ALTER TABLE "WorkspaceMember" DROP CONSTRAINT IF EXISTS "WorkspaceMember_userId_fkey";
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
