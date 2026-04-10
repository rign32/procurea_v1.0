-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "permissions" JSONB NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "organizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- AddColumn: RBAC role reference on User
ALTER TABLE "User" ADD COLUMN "rbacRoleId" TEXT;

-- CreateIndex
CREATE INDEX "Role_organizationId_idx" ON "Role"("organizationId");

-- CreateIndex (unique composite: name + organizationId)
CREATE UNIQUE INDEX "Role_name_organizationId_key" ON "Role"("name", "organizationId");

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_rbacRoleId_fkey" FOREIGN KEY ("rbacRoleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed system roles (global, no organizationId)
INSERT INTO "Role" ("id", "name", "displayName", "permissions", "isSystem", "organizationId", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'owner', 'Owner',
   '["campaigns.create","campaigns.view_all","campaigns.delete","rfqs.create","rfqs.approve","rfqs.send","suppliers.export","suppliers.blacklist","billing.manage","billing.view","team.manage","team.invite","settings.manage","reports.view","reports.schedule"]',
   true, NULL, NOW(), NOW()),
  (gen_random_uuid(), 'admin', 'Admin',
   '["campaigns.create","campaigns.view_all","campaigns.delete","rfqs.create","rfqs.approve","rfqs.send","suppliers.export","suppliers.blacklist","billing.view","team.manage","team.invite","settings.manage","reports.view","reports.schedule"]',
   true, NULL, NOW(), NOW()),
  (gen_random_uuid(), 'manager', 'Manager',
   '["campaigns.create","campaigns.view_all","rfqs.create","rfqs.approve","rfqs.send","suppliers.export","reports.view","reports.schedule"]',
   true, NULL, NOW(), NOW()),
  (gen_random_uuid(), 'member', 'Member',
   '["campaigns.create","rfqs.create","rfqs.send","suppliers.export","reports.view"]',
   true, NULL, NOW(), NOW()),
  (gen_random_uuid(), 'viewer', 'Viewer',
   '["reports.view"]',
   true, NULL, NOW(), NOW());
