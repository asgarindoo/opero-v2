ALTER TABLE "chat_channel"
  ADD COLUMN IF NOT EXISTS "name" TEXT,
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "type" TEXT NOT NULL DEFAULT 'public';

ALTER TABLE "chat_message"
  ADD COLUMN IF NOT EXISTS "channelId" TEXT,
  ADD COLUMN IF NOT EXISTS "senderId" TEXT,
  ADD COLUMN IF NOT EXISTS "content" TEXT,
  ADD COLUMN IF NOT EXISTS "type" TEXT NOT NULL DEFAULT 'text';

CREATE INDEX IF NOT EXISTS "chat_message_organizationId_channelId_idx" ON "chat_message"("organizationId", "channelId");
CREATE INDEX IF NOT EXISTS "chat_message_channelId_createdAt_idx" ON "chat_message"("channelId", "createdAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chat_message_channelId_fkey'
  ) THEN
    ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_channelId_fkey"
    FOREIGN KEY ("channelId") REFERENCES "chat_channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chat_message_senderId_fkey'
  ) THEN
    ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_senderId_fkey"
    FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'chat_message'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE "chat_message";
  END IF;
END $$;
