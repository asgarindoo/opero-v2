CREATE TABLE IF NOT EXISTS "chat_reads" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "organizationId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "channelId" TEXT NOT NULL,
  "lastReadMessageId" TEXT,
  "lastReadAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "chat_reads_organizationId_userId_channelId_key"
  ON "chat_reads"("organizationId", "userId", "channelId");

CREATE INDEX IF NOT EXISTS "chat_reads_organizationId_userId_idx"
  ON "chat_reads"("organizationId", "userId");

CREATE INDEX IF NOT EXISTS "chat_reads_channelId_idx"
  ON "chat_reads"("channelId");

CREATE INDEX IF NOT EXISTS "chat_message_unread_idx"
  ON "chat_message"("organizationId", "channelId", "createdAt", "senderId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chat_reads_organizationId_fkey'
  ) THEN
    ALTER TABLE "chat_reads" ADD CONSTRAINT "chat_reads_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "organization"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chat_reads_userId_fkey'
  ) THEN
    ALTER TABLE "chat_reads" ADD CONSTRAINT "chat_reads_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "user"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chat_reads_channelId_fkey'
  ) THEN
    ALTER TABLE "chat_reads" ADD CONSTRAINT "chat_reads_channelId_fkey"
    FOREIGN KEY ("channelId") REFERENCES "chat_channel"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chat_reads_lastReadMessageId_fkey'
  ) THEN
    ALTER TABLE "chat_reads" ADD CONSTRAINT "chat_reads_lastReadMessageId_fkey"
    FOREIGN KEY ("lastReadMessageId") REFERENCES "chat_message"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'chat_channel'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE "chat_channel";
  END IF;
END $$;
