
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
