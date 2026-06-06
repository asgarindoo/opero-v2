CREATE TABLE IF NOT EXISTS "user_presence" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL,
    "currentPage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_presence_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_presence_userId_organizationId_key" ON "user_presence"("userId", "organizationId");
CREATE INDEX IF NOT EXISTS "user_presence_organizationId_idx" ON "user_presence"("organizationId");
CREATE INDEX IF NOT EXISTS "user_presence_lastSeenAt_idx" ON "user_presence"("lastSeenAt");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_presence_userId_fkey') THEN
    ALTER TABLE "user_presence" ADD CONSTRAINT "user_presence_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_presence_organizationId_fkey') THEN
    ALTER TABLE "user_presence" ADD CONSTRAINT "user_presence_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
