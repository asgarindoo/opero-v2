ALTER TABLE "organization"
  ADD COLUMN IF NOT EXISTS "publicKey" TEXT,
  ADD COLUMN IF NOT EXISTS "encryptedDataKey" TEXT;
