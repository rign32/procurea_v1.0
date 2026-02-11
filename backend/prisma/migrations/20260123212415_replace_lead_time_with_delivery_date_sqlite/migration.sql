-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "name" TEXT,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "ssoProvider" TEXT,
    "ssoId" TEXT,
    "pendingPhone" TEXT,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneVerifiedAt" DATETIME,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "companyName" TEXT,
    "jobTitle" TEXT,
    "language" TEXT NOT NULL DEFAULT 'pl',
    "notificationPreferences" TEXT,
    "organizationId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastLoginAt" DATETIME,
    CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "footerText" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "OrganizationLocation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "organizationId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OrganizationLocation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT 'My Strategy Campaign',
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "stage" TEXT NOT NULL DEFAULT 'STRATEGY',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME
);

-- CreateTable
CREATE TABLE "Supplier" (
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
    "deletedAt" DATETIME,
    CONSTRAINT "Supplier_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Log_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DocumentChunk" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "vector" TEXT,
    "sourceUrl" TEXT,
    "supplierId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DocumentChunk_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AiInteraction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "campaignId" TEXT,
    "prompt" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "modelUsed" TEXT NOT NULL,
    "tokensUsed" INTEGER,
    "feedback" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AiInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SearchQueryCache" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "queryHash" TEXT NOT NULL,
    "queryText" TEXT NOT NULL,
    "results" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CompanyRegistry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "domain" TEXT NOT NULL,
    "name" TEXT,
    "country" TEXT,
    "city" TEXT,
    "specialization" TEXT,
    "certificates" TEXT,
    "employeeCount" TEXT,
    "contactEmails" TEXT,
    "primaryEmail" TEXT,
    "explorerResult" TEXT,
    "analystResult" TEXT,
    "enrichmentResult" TEXT,
    "auditorResult" TEXT,
    "lastAnalysisScore" REAL,
    "dataQualityScore" REAL,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "campaignsCount" INTEGER NOT NULL DEFAULT 0,
    "rfqsSent" INTEGER NOT NULL DEFAULT 0,
    "rfqsResponded" INTEGER NOT NULL DEFAULT 0,
    "lastContactedAt" DATETIME,
    "lastResponseAt" DATETIME,
    "responseRate" REAL,
    "avgResponseTime" REAL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isBlacklisted" BOOLEAN NOT NULL DEFAULT false,
    "blacklistReason" TEXT,
    "vectorId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastProcessedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdatedAt" DATETIME NOT NULL,
    "keywords" TEXT
);

-- CreateTable
CREATE TABLE "RfqRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    "publicId" TEXT,
    "productName" TEXT NOT NULL,
    "partNumber" TEXT,
    "category" TEXT,
    "material" TEXT,
    "description" TEXT,
    "targetPrice" REAL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "quantity" INTEGER NOT NULL,
    "eau" INTEGER,
    "unit" TEXT NOT NULL DEFAULT 'pcs',
    "incoterms" TEXT,
    "deliveryAddress" TEXT,
    "deliveryLocationId" TEXT,
    "desiredDeliveryDate" DATETIME,
    "attachments" TEXT,
    "campaignId" TEXT,
    "ownerId" TEXT,
    CONSTRAINT "RfqRequest_deliveryLocationId_fkey" FOREIGN KEY ("deliveryLocationId") REFERENCES "OrganizationLocation" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "RfqRequest_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "RfqRequest_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "price" REAL,
    "currency" TEXT DEFAULT 'EUR',
    "moq" INTEGER,
    "leadTime" INTEGER,
    "validityDate" DATETIME,
    "incotermsConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "specsConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "comments" TEXT,
    "rfqRequestId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "tokenExpiresAt" DATETIME,
    "viewedAt" DATETIME,
    "submittedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Offer_rfqRequestId_fkey" FOREIGN KEY ("rfqRequestId") REFERENCES "RfqRequest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Offer_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "changes" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SequenceTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SequenceStep" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dayOffset" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "bodySnippet" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    CONSTRAINT "SequenceStep_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "SequenceTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "SearchQueryCache_queryHash_key" ON "SearchQueryCache"("queryHash");

-- CreateIndex
CREATE INDEX "SearchQueryCache_queryHash_idx" ON "SearchQueryCache"("queryHash");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyRegistry_domain_key" ON "CompanyRegistry"("domain");

-- CreateIndex
CREATE INDEX "CompanyRegistry_domain_idx" ON "CompanyRegistry"("domain");

-- CreateIndex
CREATE INDEX "CompanyRegistry_name_idx" ON "CompanyRegistry"("name");

-- CreateIndex
CREATE INDEX "CompanyRegistry_country_idx" ON "CompanyRegistry"("country");

-- CreateIndex
CREATE INDEX "CompanyRegistry_isActive_usageCount_idx" ON "CompanyRegistry"("isActive", "usageCount");

-- CreateIndex
CREATE UNIQUE INDEX "RfqRequest_campaignId_key" ON "RfqRequest"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "Offer_accessToken_key" ON "Offer"("accessToken");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");
