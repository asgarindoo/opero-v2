CREATE TABLE IF NOT EXISTS "tenant_record" (
  "id" TEXT PRIMARY KEY,
  "organizationId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "data" JSONB NOT NULL,
  "createdById" TEXT,
  "updatedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "tenant_record_organizationId_type_idx"
  ON "tenant_record"("organizationId", "type");

ALTER TABLE "tenant_record"
  ADD CONSTRAINT "tenant_record_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "organization"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "tenant_record"
  ADD CONSTRAINT "tenant_record_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "user"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "tenant_record"
  ADD CONSTRAINT "tenant_record_updatedById_fkey"
  FOREIGN KEY ("updatedById") REFERENCES "user"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "tenant_activity" (
  "id" TEXT PRIMARY KEY,
  "organizationId" TEXT NOT NULL,
  "module" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "entityId" TEXT,
  "entityType" TEXT,
  "entityName" TEXT,
  "description" TEXT,
  "userId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "tenant_activity_organizationId_module_idx"
  ON "tenant_activity"("organizationId", "module");

ALTER TABLE "tenant_activity"
  ADD CONSTRAINT "tenant_activity_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "organization"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "tenant_activity"
  ADD CONSTRAINT "tenant_activity_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "user"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
