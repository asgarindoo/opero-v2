CREATE TABLE "user_presence" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL,
    "currentPage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_presence_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_presence_userId_organizationId_key" ON "user_presence"("userId", "organizationId");
CREATE INDEX "user_presence_organizationId_idx" ON "user_presence"("organizationId");
CREATE INDEX "user_presence_lastSeenAt_idx" ON "user_presence"("lastSeenAt");

ALTER TABLE "user_presence" ADD CONSTRAINT "user_presence_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_presence" ADD CONSTRAINT "user_presence_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
