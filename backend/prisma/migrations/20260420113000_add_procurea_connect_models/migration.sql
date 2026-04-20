-- Backfills schema drift from commit 73c2195 (landing MVP + Procurea Connect).
-- That commit added Organization fields + 3 Connect models to schema.prisma but
-- only created the Lead migration. Staging DB was synced via `db push`, so prod
-- never got the columns, causing P2022 "Organization.hasConnectAddon does not
-- exist" on every /auth/exchange call.
--
-- Additive only: 3 ADD COLUMN (with defaults, no backfill needed) + 3 CREATE TABLE
-- + FK/index wiring. Safe to run on live prod.

-- Organization: Procurea Connect add-on flags
ALTER TABLE "Organization"
    ADD COLUMN IF NOT EXISTS "hasConnectAddon" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS "connectTrialStartedAt" TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "connectTrialEndsAt" TIMESTAMP(3);

-- IntegrationConnection: one row per customer-connected ERP/CRM
CREATE TABLE IF NOT EXISTS "IntegrationConnection" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "connectedByUserId" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'merge_dev',
    "providerAccountId" TEXT NOT NULL,
    "providerAccountToken" TEXT,
    "integrationCategory" TEXT NOT NULL,
    "platformSlug" TEXT NOT NULL,
    "platformName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'connecting',
    "statusMessage" TEXT,
    "capabilities" JSONB,
    "lastSyncedAt" TIMESTAMP(3),
    "lastSyncSupplierCount" INTEGER NOT NULL DEFAULT 0,
    "nextSyncScheduledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "disconnectedAt" TIMESTAMP(3),

    CONSTRAINT "IntegrationConnection_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "IntegrationConnection_organizationId_providerAccountId_key"
    ON "IntegrationConnection"("organizationId", "providerAccountId");
CREATE INDEX IF NOT EXISTS "IntegrationConnection_organizationId_status_idx"
    ON "IntegrationConnection"("organizationId", "status");
CREATE INDEX IF NOT EXISTS "IntegrationConnection_provider_platformSlug_idx"
    ON "IntegrationConnection"("provider", "platformSlug");

DO $$ BEGIN
    ALTER TABLE "IntegrationConnection"
        ADD CONSTRAINT "IntegrationConnection_organizationId_fkey"
        FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ExternalSupplier: cached suppliers pulled from the ERP
CREATE TABLE IF NOT EXISTS "ExternalSupplier" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "taxNumber" TEXT,
    "website" TEXT,
    "primaryEmail" TEXT,
    "emails" JSONB,
    "phoneNumbers" JSONB,
    "addresses" JSONB,
    "currency" TEXT,
    "isSupplier" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "rawData" JSONB,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalSupplier_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ExternalSupplier_connectionId_externalId_key"
    ON "ExternalSupplier"("connectionId", "externalId");
CREATE INDEX IF NOT EXISTS "ExternalSupplier_connectionId_isActive_idx"
    ON "ExternalSupplier"("connectionId", "isActive");
CREATE INDEX IF NOT EXISTS "ExternalSupplier_taxNumber_idx"
    ON "ExternalSupplier"("taxNumber");
CREATE INDEX IF NOT EXISTS "ExternalSupplier_website_idx"
    ON "ExternalSupplier"("website");
CREATE INDEX IF NOT EXISTS "ExternalSupplier_name_idx"
    ON "ExternalSupplier"("name");

DO $$ BEGIN
    ALTER TABLE "ExternalSupplier"
        ADD CONSTRAINT "ExternalSupplier_connectionId_fkey"
        FOREIGN KEY ("connectionId") REFERENCES "IntegrationConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- SupplierMatch: dedup link between Procurea Supplier and ExternalSupplier
CREATE TABLE IF NOT EXISTS "SupplierMatch" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "externalSupplierId" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "matchType" TEXT NOT NULL,
    "signals" JSONB,
    "status" TEXT NOT NULL DEFAULT 'suggested',
    "confirmedByUserId" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "rejectedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierMatch_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SupplierMatch_supplierId_externalSupplierId_key"
    ON "SupplierMatch"("supplierId", "externalSupplierId");
CREATE INDEX IF NOT EXISTS "SupplierMatch_supplierId_status_idx"
    ON "SupplierMatch"("supplierId", "status");
CREATE INDEX IF NOT EXISTS "SupplierMatch_externalSupplierId_status_idx"
    ON "SupplierMatch"("externalSupplierId", "status");
CREATE INDEX IF NOT EXISTS "SupplierMatch_status_confidence_idx"
    ON "SupplierMatch"("status", "confidence");

DO $$ BEGIN
    ALTER TABLE "SupplierMatch"
        ADD CONSTRAINT "SupplierMatch_supplierId_fkey"
        FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "SupplierMatch"
        ADD CONSTRAINT "SupplierMatch_externalSupplierId_fkey"
        FOREIGN KEY ("externalSupplierId") REFERENCES "ExternalSupplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
