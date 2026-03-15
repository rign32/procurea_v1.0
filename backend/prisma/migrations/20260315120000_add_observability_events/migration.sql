-- CreateTable
CREATE TABLE "ObservabilityEvent" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "userId" TEXT,
    "userEmail" TEXT,
    "campaignId" TEXT,
    "title" TEXT NOT NULL,
    "message" TEXT,
    "metadata" JSONB,
    "slackSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ObservabilityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ObservabilityEvent_category_createdAt_idx" ON "ObservabilityEvent"("category", "createdAt");

-- CreateIndex
CREATE INDEX "ObservabilityEvent_userId_idx" ON "ObservabilityEvent"("userId");

-- CreateIndex
CREATE INDEX "ObservabilityEvent_severity_createdAt_idx" ON "ObservabilityEvent"("severity", "createdAt");

-- CreateIndex
CREATE INDEX "ObservabilityEvent_type_createdAt_idx" ON "ObservabilityEvent"("type", "createdAt");
