-- Promote fields that are used by the app from payload metadata into real columns.
-- This keeps existing notes/email data, then removes the duplicated payload keys.

ALTER TABLE IF EXISTS "contact"
ADD COLUMN IF NOT EXISTS "comments" JSONB NOT NULL DEFAULT '[]';

UPDATE "contact"
SET "comments" = payload->'comments'
WHERE payload IS NOT NULL
  AND jsonb_typeof(payload) = 'object'
  AND payload ? 'comments'
  AND jsonb_typeof(payload->'comments') = 'array'
  AND "comments" = '[]'::jsonb;

UPDATE "contact"
SET payload = NULLIF(payload - 'comments', '{}'::jsonb)
WHERE payload IS NOT NULL
  AND jsonb_typeof(payload) = 'object'
  AND payload ? 'comments';

ALTER TABLE IF EXISTS "product"
ADD COLUMN IF NOT EXISTS "comments" JSONB NOT NULL DEFAULT '[]';

UPDATE "product"
SET "comments" = payload->'comments'
WHERE payload IS NOT NULL
  AND jsonb_typeof(payload) = 'object'
  AND payload ? 'comments'
  AND jsonb_typeof(payload->'comments') = 'array'
  AND "comments" = '[]'::jsonb;

UPDATE "product"
SET payload = NULLIF(payload - 'comments', '{}'::jsonb)
WHERE payload IS NOT NULL
  AND jsonb_typeof(payload) = 'object'
  AND payload ? 'comments';

ALTER TABLE IF EXISTS "invoice"
ADD COLUMN IF NOT EXISTS "contactEmail" TEXT;

UPDATE "invoice"
SET "contactEmail" = COALESCE(NULLIF(payload->>'contactEmail', ''), NULLIF(payload->>'recipientEmail', ''))
WHERE payload IS NOT NULL
  AND jsonb_typeof(payload) = 'object'
  AND (payload ? 'contactEmail' OR payload ? 'recipientEmail')
  AND ("contactEmail" IS NULL OR btrim("contactEmail") = '');

UPDATE "invoice"
SET payload = NULLIF(payload - 'contactEmail' - 'recipientEmail', '{}'::jsonb)
WHERE payload IS NOT NULL
  AND jsonb_typeof(payload) = 'object'
  AND (payload ? 'contactEmail' OR payload ? 'recipientEmail');
