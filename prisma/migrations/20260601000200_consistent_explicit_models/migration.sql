-- Make remaining active generic feature models explicit and clear legacy payload data.

ALTER TABLE IF EXISTS "contact"
  ADD COLUMN IF NOT EXISTS "name" TEXT,
  ADD COLUMN IF NOT EXISTS "relationshipType" TEXT,
  ADD COLUMN IF NOT EXISTS "industry" TEXT,
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "persons" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS "tags" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS "assignedStaff" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS "notes" TEXT;

UPDATE "contact"
SET
  "name" = COALESCE("name", payload->>'name', "title"),
  "relationshipType" = COALESCE("relationshipType", payload->>'relationshipType'),
  "industry" = COALESCE("industry", payload->>'industry'),
  "description" = COALESCE("description", payload->>'description'),
  "persons" = CASE WHEN "persons" = '[]'::jsonb AND payload ? 'persons' THEN payload->'persons' ELSE "persons" END,
  "tags" = CASE WHEN "tags" = '[]'::jsonb AND payload ? 'tags' THEN payload->'tags' ELSE "tags" END,
  "assignedStaff" = CASE WHEN "assignedStaff" = '[]'::jsonb AND payload ? 'assignedStaff' THEN payload->'assignedStaff' ELSE "assignedStaff" END,
  "notes" = COALESCE("notes", payload->>'notes')
WHERE payload IS NOT NULL;

ALTER TABLE IF EXISTS "role"
  ADD COLUMN IF NOT EXISTS "name" TEXT,
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "permissions" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS "memberCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "color" TEXT,
  ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER NOT NULL DEFAULT 0;

UPDATE "role"
SET
  "name" = COALESCE("name", payload->>'name', "title"),
  "description" = COALESCE("description", payload->>'description'),
  "permissions" = CASE WHEN "permissions" = '[]'::jsonb AND payload ? 'permissions' THEN payload->'permissions' ELSE "permissions" END,
  "memberCount" = COALESCE("memberCount", NULLIF(payload->>'memberCount', '')::integer, 0),
  "color" = COALESCE("color", payload->>'color'),
  "sortOrder" = COALESCE("sortOrder", NULLIF(payload->>'sortOrder', '')::integer, 0)
WHERE payload IS NOT NULL;

ALTER TABLE IF EXISTS "goal"
  ADD COLUMN IF NOT EXISTS "targetOutcome" TEXT,
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "priority" TEXT,
  ADD COLUMN IF NOT EXISTS "metric" TEXT,
  ADD COLUMN IF NOT EXISTS "targetValue" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "currentValue" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "progress" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "startDate" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "dueDate" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "ownerId" TEXT,
  ADD COLUMN IF NOT EXISTS "tags" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS "activities" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS "notes" TEXT;

UPDATE "goal"
SET
  "targetOutcome" = COALESCE("targetOutcome", payload->>'targetOutcome'),
  "description" = COALESCE("description", payload->>'description'),
  "priority" = COALESCE("priority", payload->>'priority'),
  "metric" = COALESCE("metric", payload->>'metric'),
  "targetValue" = COALESCE("targetValue", NULLIF(payload->>'targetValue', '')::double precision),
  "currentValue" = COALESCE("currentValue", NULLIF(payload->>'currentValue', '')::double precision),
  "progress" = COALESCE("progress", NULLIF(payload->>'progress', '')::integer, 0),
  "startDate" = COALESCE("startDate", NULLIF(payload->>'startDate', '')::timestamp),
  "dueDate" = COALESCE("dueDate", NULLIF(payload->>'dueDate', '')::timestamp),
  "ownerId" = COALESCE("ownerId", payload->>'ownerId'),
  "tags" = CASE WHEN "tags" = '[]'::jsonb AND payload ? 'tags' THEN payload->'tags' ELSE "tags" END,
  "activities" = CASE WHEN "activities" = '[]'::jsonb AND payload ? 'activities' THEN payload->'activities' ELSE "activities" END,
  "notes" = COALESCE("notes", payload->>'notes')
WHERE payload IS NOT NULL;

ALTER TABLE IF EXISTS "folder"
  ADD COLUMN IF NOT EXISTS "name" TEXT,
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "parentId" TEXT,
  ADD COLUMN IF NOT EXISTS "color" TEXT,
  ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "tags" JSONB NOT NULL DEFAULT '[]';

UPDATE "folder"
SET
  "name" = COALESCE("name", payload->>'name', "title"),
  "description" = COALESCE("description", payload->>'description'),
  "parentId" = COALESCE("parentId", payload->>'parentId'),
  "color" = COALESCE("color", payload->>'color'),
  "sortOrder" = COALESCE("sortOrder", NULLIF(payload->>'sortOrder', '')::integer, 0),
  "tags" = CASE WHEN "tags" = '[]'::jsonb AND payload ? 'tags' THEN payload->'tags' ELSE "tags" END
WHERE payload IS NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'folder_parentId_fkey'
  ) THEN
    ALTER TABLE "folder"
      ADD CONSTRAINT "folder_parentId_fkey"
      FOREIGN KEY ("parentId") REFERENCES "folder"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "contact_organizationId_status_idx" ON "contact"("organizationId", "status");
CREATE INDEX IF NOT EXISTS "contact_organizationId_relationshipType_idx" ON "contact"("organizationId", "relationshipType");
CREATE INDEX IF NOT EXISTS "role_organizationId_status_idx" ON "role"("organizationId", "status");
CREATE INDEX IF NOT EXISTS "goal_organizationId_status_idx" ON "goal"("organizationId", "status");
CREATE INDEX IF NOT EXISTS "goal_organizationId_dueDate_idx" ON "goal"("organizationId", "dueDate");
CREATE INDEX IF NOT EXISTS "goal_ownerId_idx" ON "goal"("ownerId");
CREATE INDEX IF NOT EXISTS "folder_organizationId_parentId_idx" ON "folder"("organizationId", "parentId");

-- The project now treats payload as optional metadata only. Existing legacy payload
-- has already been copied into explicit columns, so clear it to avoid dual sources.
UPDATE "task" SET payload = NULL;
UPDATE "flow" SET payload = NULL;
UPDATE "campaign" SET payload = NULL;
UPDATE "contact" SET payload = NULL;
UPDATE "role" SET payload = NULL;
UPDATE "goal" SET payload = NULL;
UPDATE "sale" SET payload = NULL;
UPDATE "invoice" SET payload = NULL;
UPDATE "transaction" SET payload = NULL;
UPDATE "product" SET payload = NULL;
UPDATE "asset" SET payload = NULL;
UPDATE "document" SET payload = NULL;
UPDATE "folder" SET payload = NULL;
UPDATE "social_channel" SET payload = NULL;
UPDATE "content_post" SET payload = NULL;
