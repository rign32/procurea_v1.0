-- Organization: add shared credit pool and billing fields
ALTER TABLE "Organization" ADD COLUMN "searchCredits" INTEGER NOT NULL DEFAULT 10;
ALTER TABLE "Organization" ADD COLUMN "trialCreditsUsed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Organization" ADD COLUMN "plan" TEXT NOT NULL DEFAULT 'research';
ALTER TABLE "Organization" ADD COLUMN "stripeCustomerId" TEXT;
ALTER TABLE "Organization" ADD COLUMN "stripeSubscriptionId" TEXT;
ALTER TABLE "Organization" ADD COLUMN "subscriptionCancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false;

-- Unique constraints for Stripe fields on Organization
CREATE UNIQUE INDEX "Organization_stripeCustomerId_key" ON "Organization"("stripeCustomerId");
CREATE UNIQUE INDEX "Organization_stripeSubscriptionId_key" ON "Organization"("stripeSubscriptionId");

-- OrgCreditTransaction: organization-level credit audit trail
CREATE TABLE "OrgCreditTransaction" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT,
    "amount" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "stripeSessionId" TEXT,
    "campaignId" TEXT,
    "balanceAfter" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrgCreditTransaction_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OrgCreditTransaction_organizationId_createdAt_idx" ON "OrgCreditTransaction"("organizationId", "createdAt");
CREATE INDEX "OrgCreditTransaction_stripeSessionId_idx" ON "OrgCreditTransaction"("stripeSessionId");

ALTER TABLE "OrgCreditTransaction" ADD CONSTRAINT "OrgCreditTransaction_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- UserSharingPreference: per-pair sharing (democratic team model)
CREATE TABLE "UserSharingPreference" (
    "id" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSharingPreference_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "UserSharingPreference_fromUserId_idx" ON "UserSharingPreference"("fromUserId");
CREATE INDEX "UserSharingPreference_toUserId_idx" ON "UserSharingPreference"("toUserId");
CREATE UNIQUE INDEX "UserSharingPreference_fromUserId_toUserId_key" ON "UserSharingPreference"("fromUserId", "toUserId");

ALTER TABLE "UserSharingPreference" ADD CONSTRAINT "UserSharingPreference_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserSharingPreference" ADD CONSTRAINT "UserSharingPreference_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Data migration: transfer existing user credits to org pool
-- Use MAX credits from users in each org as the org's balance
UPDATE "Organization" o SET
  "searchCredits" = COALESCE((
    SELECT MAX(u."searchCredits") FROM "User" u WHERE u."organizationId" = o."id"
  ), 10),
  "plan" = COALESCE(
    (SELECT u."plan" FROM "User" u WHERE u."organizationId" = o."id" AND u."plan" = 'unlimited' LIMIT 1),
    (SELECT u."plan" FROM "User" u WHERE u."organizationId" = o."id" AND u."plan" = 'pay_as_you_go' LIMIT 1),
    'research'
  ),
  "stripeCustomerId" = (
    SELECT u."stripeCustomerId" FROM "User" u
    WHERE u."organizationId" = o."id" AND u."stripeCustomerId" IS NOT NULL LIMIT 1
  ),
  "stripeSubscriptionId" = (
    SELECT u."stripeSubscriptionId" FROM "User" u
    WHERE u."organizationId" = o."id" AND u."stripeSubscriptionId" IS NOT NULL LIMIT 1
  ),
  "trialCreditsUsed" = COALESCE((
    SELECT bool_or(u."trialCreditsUsed") FROM "User" u WHERE u."organizationId" = o."id"
  ), false);

-- Set domain on existing orgs from user emails (if not already set)
UPDATE "Organization" o SET "domain" = (
  SELECT SPLIT_PART(u."email", '@', 2) FROM "User" u
  WHERE u."organizationId" = o."id" LIMIT 1
) WHERE o."domain" IS NULL;

-- Create sharing preferences (disabled) for existing org members
INSERT INTO "UserSharingPreference" ("id", "fromUserId", "toUserId", "enabled", "createdAt", "updatedAt")
SELECT gen_random_uuid(), u1."id", u2."id", false, NOW(), NOW()
FROM "User" u1 JOIN "User" u2
  ON u1."organizationId" = u2."organizationId" AND u1."id" != u2."id"
WHERE u1."organizationId" IS NOT NULL;
