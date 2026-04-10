
import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);

    constructor() {
        const url = process.env.DATABASE_URL;
        super({
            datasources: {
                db: {
                    url: url ? `${url}${url.includes('?') ? '&' : '?'}connection_limit=15&pool_timeout=20` : undefined,
                },
            },
        });
    }

    async onModuleInit() {
        try {
            await this.$connect();
            this.logger.log('Database connected');
        } catch (error) {
            this.logger.warn(`Database connection failed: ${error.message}. Will retry on first query.`);
        }

        // Run schema check regardless of $connect result — Prisma will auto-connect on first query
        await this.ensureSchemaUpToDate();
    }

    /**
     * Ensure critical columns/tables exist — runs safe idempotent DDL.
     * This handles cases where Prisma migrations haven't been applied to the production DB.
     */
    private async ensureSchemaUpToDate() {
        const migrations = [
            // 20260218120000_add_recipient_email
            `ALTER TABLE "SequenceExecution" ADD COLUMN IF NOT EXISTS "recipientEmail" TEXT`,
            // 20260220164312_add_price_tiers_and_alternatives
            `ALTER TABLE "Offer" ADD COLUMN IF NOT EXISTS "altDescription" TEXT`,
            `ALTER TABLE "Offer" ADD COLUMN IF NOT EXISTS "altMaterial" TEXT`,
            `ALTER TABLE "Offer" ADD COLUMN IF NOT EXISTS "parentOfferId" TEXT`,
            `ALTER TABLE "Offer" ADD COLUMN IF NOT EXISTS "submissionLanguage" TEXT`,
            `CREATE TABLE IF NOT EXISTS "OfferPriceTier" (
                "id" TEXT NOT NULL,
                "offerId" TEXT NOT NULL,
                "minQty" INTEGER NOT NULL,
                "maxQty" INTEGER,
                "unitPrice" DOUBLE PRECISION NOT NULL,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "OfferPriceTier_pkey" PRIMARY KEY ("id")
            )`,
            `CREATE INDEX IF NOT EXISTS "OfferPriceTier_offerId_idx" ON "OfferPriceTier"("offerId")`,
            // 20260223184922_add_offer_deadline
            `ALTER TABLE "RfqRequest" ADD COLUMN IF NOT EXISTS "offerDeadline" TIMESTAMP(3)`,
            // 20260223185052_add_payment_terms
            `ALTER TABLE "RfqRequest" ADD COLUMN IF NOT EXISTS "paymentTerms" TEXT`,
            // 20260225114840_add_sequence_execution_created_at
            `ALTER TABLE "SequenceExecution" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP`,
            // 20260226211330_add_campaign_access
            `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "campaignAccess" TEXT NOT NULL DEFAULT 'own'`,
            // 20260303160346_add_currency_conversion
            `ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "baseCurrency" TEXT NOT NULL DEFAULT 'PLN'`,
            `CREATE TABLE IF NOT EXISTS "CurrencyExchangeRate" (
                "id" TEXT NOT NULL,
                "currencyCode" TEXT NOT NULL,
                "currencyName" TEXT NOT NULL,
                "rateToPln" DOUBLE PRECISION NOT NULL,
                "effectiveDate" TIMESTAMP(3) NOT NULL,
                "tableNumber" TEXT,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "CurrencyExchangeRate_pkey" PRIMARY KEY ("id")
            )`,
            // 20260303174422_add_user_plan_field
            `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "plan" TEXT NOT NULL DEFAULT 'research'`,
            // 20260308123615_add_company_type_fields
            `ALTER TABLE "Supplier" ADD COLUMN IF NOT EXISTS "companyType" TEXT DEFAULT 'NIEJASNY'`,
            `ALTER TABLE "Supplier" ADD COLUMN IF NOT EXISTS "companyTypeConfidence" INTEGER DEFAULT 0`,
            `ALTER TABLE "Supplier" ADD COLUMN IF NOT EXISTS "needsManualClassification" BOOLEAN NOT NULL DEFAULT false`,
            `ALTER TABLE "Supplier" ADD COLUMN IF NOT EXISTS "sourceType" TEXT DEFAULT 'SEARCH'`,
            // 20260308_add_ai_summary
            `ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "aiSummary" TEXT`,
            `ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "aiSummaryGeneratedAt" TIMESTAMP(3)`,
            // 20260310_add_billing_credits
            `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "searchCredits" INTEGER NOT NULL DEFAULT 0`,
            `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT`,
            `CREATE UNIQUE INDEX IF NOT EXISTS "User_stripeCustomerId_key" ON "User"("stripeCustomerId")`,
            `CREATE TABLE IF NOT EXISTS "CreditTransaction" (
                "id" TEXT NOT NULL,
                "userId" TEXT NOT NULL,
                "amount" INTEGER NOT NULL,
                "type" TEXT NOT NULL,
                "description" TEXT,
                "stripeSessionId" TEXT,
                "campaignId" TEXT,
                "balanceAfter" INTEGER NOT NULL,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "CreditTransaction_pkey" PRIMARY KEY ("id")
            )`,
            `CREATE INDEX IF NOT EXISTS "CreditTransaction_userId_createdAt_idx" ON "CreditTransaction"("userId", "createdAt")`,
            `CREATE INDEX IF NOT EXISTS "CreditTransaction_stripeSessionId_idx" ON "CreditTransaction"("stripeSessionId")`,
            // 20260310120000_add_trial_credits
            `ALTER TABLE "User" ALTER COLUMN "searchCredits" SET DEFAULT 10`,
            `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "trialCreditsUsed" BOOLEAN NOT NULL DEFAULT false`,
            // 20260308200000_add_feedback_email_sent_at
            `ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "feedbackEmailSentAt" TIMESTAMP(3)`,
            // 20260313_add_stripe_subscription_fields (User)
            `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT`,
            `CREATE UNIQUE INDEX IF NOT EXISTS "User_stripeSubscriptionId_key" ON "User"("stripeSubscriptionId")`,
            `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "subscriptionCancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false`,
            // 20260313120000_org_credits_sharing — Organization billing fields
            `ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "searchCredits" INTEGER NOT NULL DEFAULT 10`,
            `ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "trialCreditsUsed" BOOLEAN NOT NULL DEFAULT false`,
            `ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "plan" TEXT NOT NULL DEFAULT 'research'`,
            `ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT`,
            `CREATE UNIQUE INDEX IF NOT EXISTS "Organization_stripeCustomerId_key" ON "Organization"("stripeCustomerId")`,
            `ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT`,
            `CREATE UNIQUE INDEX IF NOT EXISTS "Organization_stripeSubscriptionId_key" ON "Organization"("stripeSubscriptionId")`,
            `ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "subscriptionCancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false`,
            // 20260313120000_org_credits_sharing — OrgCreditTransaction table
            `CREATE TABLE IF NOT EXISTS "OrgCreditTransaction" (
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
            )`,
            `CREATE INDEX IF NOT EXISTS "OrgCreditTransaction_organizationId_createdAt_idx" ON "OrgCreditTransaction"("organizationId", "createdAt")`,
            `CREATE INDEX IF NOT EXISTS "OrgCreditTransaction_stripeSessionId_idx" ON "OrgCreditTransaction"("stripeSessionId")`,
            // 20260313120000_org_credits_sharing — UserSharingPreference table
            `CREATE TABLE IF NOT EXISTS "UserSharingPreference" (
                "id" TEXT NOT NULL,
                "fromUserId" TEXT NOT NULL,
                "toUserId" TEXT NOT NULL,
                "enabled" BOOLEAN NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "UserSharingPreference_pkey" PRIMARY KEY ("id")
            )`,
            `CREATE INDEX IF NOT EXISTS "UserSharingPreference_fromUserId_idx" ON "UserSharingPreference"("fromUserId")`,
            `CREATE INDEX IF NOT EXISTS "UserSharingPreference_toUserId_idx" ON "UserSharingPreference"("toUserId")`,
            `CREATE UNIQUE INDEX IF NOT EXISTS "UserSharingPreference_fromUserId_toUserId_key" ON "UserSharingPreference"("fromUserId", "toUserId")`,
            // 20260410210000_add_documents
            `CREATE TABLE IF NOT EXISTS "Document" (
                "id" TEXT NOT NULL,
                "uploadedById" TEXT NOT NULL,
                "organizationId" TEXT,
                "filename" TEXT NOT NULL,
                "originalName" TEXT NOT NULL,
                "mimeType" TEXT NOT NULL,
                "sizeBytes" INTEGER NOT NULL,
                "url" TEXT NOT NULL,
                "category" TEXT,
                "tags" JSONB,
                "description" TEXT,
                "entityType" TEXT,
                "entityId" TEXT,
                "version" INTEGER NOT NULL DEFAULT 1,
                "parentId" TEXT,
                "isLatest" BOOLEAN NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
            )`,
            `CREATE INDEX IF NOT EXISTS "Document_uploadedById_idx" ON "Document"("uploadedById")`,
            `CREATE INDEX IF NOT EXISTS "Document_organizationId_idx" ON "Document"("organizationId")`,
            `CREATE INDEX IF NOT EXISTS "Document_entityType_entityId_idx" ON "Document"("entityType", "entityId")`,
            `CREATE INDEX IF NOT EXISTS "Document_category_idx" ON "Document"("category")`,
        ];

        let applied = 0;
        for (const sql of migrations) {
            try {
                await this.$executeRawUnsafe(sql);
                applied++;
            } catch (error) {
                this.logger.warn(`Auto-migration skipped: ${error.message}`);
            }
        }
        this.logger.log(`Schema check complete (${applied}/${migrations.length} statements applied)`);
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
