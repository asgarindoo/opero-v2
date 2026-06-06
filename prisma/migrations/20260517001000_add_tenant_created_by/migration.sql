ALTER TABLE IF EXISTS "organization"
ADD COLUMN IF NOT EXISTS "createdById" TEXT;

CREATE INDEX IF NOT EXISTS "organization_createdById_idx"
ON "organization"("createdById");
