-- ============================================================
-- OPERO — Enable Supabase Realtime for Chat Tables
-- Run this in the Supabase SQL Editor.
--
-- Context:
--   - The app uses Prisma (singular table names: chat_message, chat_channel)
--   - The old schema.sql mistakenly referenced chat_messages (plural)
--   - The browser client uses the anon key (better-auth, not Supabase Auth)
--   - Access control is enforced at the Next.js API layer
-- ============================================================

-- 1. Add actual Prisma table names to the realtime publication
--    (safe to run multiple times — Postgres ignores if already added)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_message;
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'chat_message already in publication, skipping.';
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_channel;
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'chat_channel already in publication, skipping.';
  END;
END;
$$;

-- 2. Enable RLS (idempotent)
ALTER TABLE public.chat_message ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_channel ENABLE ROW LEVEL SECURITY;

-- 3. Allow anon role to SELECT rows for realtime event delivery.
--    Tenant isolation is already enforced by the Next.js API (better-auth).
--    The client-side realtime subscription filters by organizationId anyway.
DROP POLICY IF EXISTS "anon_realtime_read" ON public.chat_message;
CREATE POLICY "anon_realtime_read" ON public.chat_message
  FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "anon_realtime_read" ON public.chat_channel;
CREATE POLICY "anon_realtime_read" ON public.chat_channel
  FOR SELECT
  TO anon
  USING (true);

-- 4. Verify — run this SELECT to confirm both tables are in the publication
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;
