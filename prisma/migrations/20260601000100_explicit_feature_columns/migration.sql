CREATE OR REPLACE FUNCTION pg_temp.opero_to_double(value text)
RETURNS double precision
LANGUAGE plpgsql
AS $$
BEGIN
  IF value IS NULL OR btrim(value) = '' THEN
    RETURN NULL;
  END IF;

  RETURN value::double precision;
EXCEPTION WHEN others THEN
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION pg_temp.opero_to_int(value text)
RETURNS integer
LANGUAGE plpgsql
AS $$
BEGIN
  IF value IS NULL OR btrim(value) = '' THEN
    RETURN NULL;
  END IF;

  RETURN value::integer;
EXCEPTION WHEN others THEN
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION pg_temp.opero_to_timestamp(value text)
RETURNS timestamp(3)
LANGUAGE plpgsql
AS $$
BEGIN
  IF value IS NULL OR btrim(value) = '' THEN
    RETURN NULL;
  END IF;

  RETURN value::timestamp(3);
EXCEPTION WHEN others THEN
  RETURN NULL;
END;
$$;

ALTER TABLE IF EXISTS "task"
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "priority" TEXT,
  ADD COLUMN IF NOT EXISTS "dueDate" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "startDate" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "reminderDate" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "estimatedHours" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "assigneeId" TEXT,
  ADD COLUMN IF NOT EXISTS "labels" JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "assignees" JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "checklist" JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "subtasks" JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "relationships" JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "externalLinks" JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "comments" JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "reactions" JSONB,
  ADD COLUMN IF NOT EXISTS "activity" JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "attachments" JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "watchers" JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "project" TEXT;

UPDATE "task"
SET
  "description" = COALESCE("description", payload->>'description'),
  "priority" = COALESCE("priority", payload->>'priority'),
  "status" = COALESCE("status", payload->>'status'),
  "dueDate" = COALESCE("dueDate", pg_temp.opero_to_timestamp(payload->>'dueDate'), pg_temp.opero_to_timestamp(payload->>'due')),
  "startDate" = COALESCE("startDate", pg_temp.opero_to_timestamp(payload->>'startDate')),
  "reminderDate" = COALESCE("reminderDate", pg_temp.opero_to_timestamp(payload->>'reminderDate')),
  "estimatedHours" = COALESCE("estimatedHours", pg_temp.opero_to_double(payload->>'estimatedHours')),
  "assigneeId" = COALESCE("assigneeId", payload->>'assigneeId', payload->'assignees'->0->>'id'),
  "labels" = CASE WHEN "labels" = '[]'::jsonb AND payload ? 'labels' THEN payload->'labels' ELSE "labels" END,
  "assignees" = CASE WHEN "assignees" = '[]'::jsonb AND payload ? 'assignees' THEN payload->'assignees' ELSE "assignees" END,
  "checklist" = CASE WHEN "checklist" = '[]'::jsonb AND payload ? 'checklist' THEN payload->'checklist' ELSE "checklist" END,
  "subtasks" = CASE WHEN "subtasks" = '[]'::jsonb AND payload ? 'subtasks' THEN payload->'subtasks' ELSE "subtasks" END,
  "relationships" = CASE WHEN "relationships" = '[]'::jsonb AND payload ? 'relationships' THEN payload->'relationships' ELSE "relationships" END,
  "externalLinks" = CASE WHEN "externalLinks" = '[]'::jsonb AND payload ? 'externalLinks' THEN payload->'externalLinks' ELSE "externalLinks" END,
  "comments" = CASE WHEN "comments" = '[]'::jsonb AND payload ? 'comments' THEN payload->'comments' ELSE "comments" END,
  "reactions" = COALESCE("reactions", payload->'reactions'),
  "activity" = CASE WHEN "activity" = '[]'::jsonb AND payload ? 'activity' THEN payload->'activity' ELSE "activity" END,
  "attachments" = CASE WHEN "attachments" = '[]'::jsonb AND payload ? 'attachments' THEN payload->'attachments' ELSE "attachments" END,
  "watchers" = CASE WHEN "watchers" = '[]'::jsonb AND payload ? 'watchers' THEN payload->'watchers' ELSE "watchers" END,
  "project" = COALESCE("project", payload->>'project')
WHERE payload IS NOT NULL;

ALTER TABLE IF EXISTS "campaign"
  ADD COLUMN IF NOT EXISTS "name" TEXT,
  ADD COLUMN IF NOT EXISTS "objective" TEXT,
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "priority" TEXT,
  ADD COLUMN IF NOT EXISTS "startDate" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "endDate" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "budget" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "currency" TEXT,
  ADD COLUMN IF NOT EXISTS "tags" JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "assignedStaff" JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "campaignAccounts" JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "goals" JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "activities" JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "attachments" JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "notes" TEXT;

UPDATE "campaign"
SET
  "name" = COALESCE("name", payload->>'name', "title"),
  "objective" = COALESCE("objective", payload->>'objective'),
  "description" = COALESCE("description", payload->>'description'),
  "status" = COALESCE("status", payload->>'status'),
  "priority" = COALESCE("priority", payload->>'priority'),
  "startDate" = COALESCE("startDate", pg_temp.opero_to_timestamp(payload->>'startDate')),
  "endDate" = COALESCE("endDate", pg_temp.opero_to_timestamp(payload->>'endDate')),
  "budget" = COALESCE("budget", pg_temp.opero_to_double(payload->>'budget')),
  "currency" = COALESCE("currency", payload->>'currency'),
  "tags" = CASE WHEN "tags" = '[]'::jsonb AND payload ? 'tags' THEN payload->'tags' ELSE "tags" END,
  "assignedStaff" = CASE WHEN "assignedStaff" = '[]'::jsonb AND payload ? 'assignedStaff' THEN payload->'assignedStaff' ELSE "assignedStaff" END,
  "campaignAccounts" = CASE WHEN "campaignAccounts" = '[]'::jsonb AND payload ? 'campaignAccounts' THEN payload->'campaignAccounts' ELSE "campaignAccounts" END,
  "goals" = CASE WHEN "goals" = '[]'::jsonb AND payload ? 'goals' THEN payload->'goals' ELSE "goals" END,
  "activities" = CASE WHEN "activities" = '[]'::jsonb AND payload ? 'activities' THEN payload->'activities' ELSE "activities" END,
  "attachments" = CASE WHEN "attachments" = '[]'::jsonb AND payload ? 'attachments' THEN payload->'attachments' ELSE "attachments" END,
  "notes" = COALESCE("notes", payload->>'notes')
WHERE payload IS NOT NULL;

ALTER TABLE IF EXISTS "product"
  ADD COLUMN IF NOT EXISTS "name" TEXT,
  ADD COLUMN IF NOT EXISTS "sku" TEXT,
  ADD COLUMN IF NOT EXISTS "category" TEXT,
  ADD COLUMN IF NOT EXISTS "type" TEXT NOT NULL DEFAULT 'Physical',
  ADD COLUMN IF NOT EXISTS "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS "stock" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "totalQuantity" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "minThreshold" INTEGER NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "imageUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "variants" JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "activities" JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "notes" TEXT;

UPDATE "product"
SET
  "name" = COALESCE("name", payload->>'name', "title"),
  "sku" = COALESCE("sku", payload->>'sku'),
  "category" = COALESCE("category", payload->>'category'),
  "type" = COALESCE(NULLIF("type", ''), payload->>'type', 'Physical'),
  "price" = COALESCE(NULLIF("price", 0), pg_temp.opero_to_double(payload->>'price'), 0),
  "currency" = COALESCE(NULLIF("currency", ''), payload->>'currency', 'USD'),
  "stock" = COALESCE(NULLIF("stock", 0), pg_temp.opero_to_int(payload->>'stock'), pg_temp.opero_to_int(payload->>'totalQuantity'), 0),
  "totalQuantity" = COALESCE(NULLIF("totalQuantity", 0), pg_temp.opero_to_int(payload->>'totalQuantity'), pg_temp.opero_to_int(payload->>'stock'), 0),
  "minThreshold" = COALESCE(NULLIF("minThreshold", 10), pg_temp.opero_to_int(payload->>'minThreshold'), 10),
  "status" = COALESCE("status", payload->>'status'),
  "description" = COALESCE("description", payload->>'description'),
  "imageUrl" = COALESCE("imageUrl", payload->>'imageUrl'),
  "variants" = CASE WHEN "variants" = '[]'::jsonb AND payload ? 'variants' THEN payload->'variants' ELSE "variants" END,
  "activities" = CASE WHEN "activities" = '[]'::jsonb AND payload ? 'activities' THEN payload->'activities' ELSE "activities" END,
  "notes" = COALESCE("notes", payload->>'notes')
WHERE payload IS NOT NULL;

ALTER TABLE IF EXISTS "sale"
  ADD COLUMN IF NOT EXISTS "saleNumber" TEXT,
  ADD COLUMN IF NOT EXISTS "saleType" TEXT,
  ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT,
  ADD COLUMN IF NOT EXISTS "customerName" TEXT,
  ADD COLUMN IF NOT EXISTS "recipientName" TEXT,
  ADD COLUMN IF NOT EXISTS "contactName" TEXT,
  ADD COLUMN IF NOT EXISTS "contactId" TEXT,
  ADD COLUMN IF NOT EXISTS "items" JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "grandTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS "orderDiscountValue" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "orderDiscountType" TEXT,
  ADD COLUMN IF NOT EXISTS "discountTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "taxPercentage" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "notes" TEXT,
  ADD COLUMN IF NOT EXISTS "assignedStaff" JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "activities" JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "attachments" JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "shippingAddress" TEXT,
  ADD COLUMN IF NOT EXISTS "trackingNumber" TEXT;

UPDATE "sale"
SET
  "saleNumber" = COALESCE("saleNumber", payload->>'saleNumber', payload->>'orderNumber'),
  "saleType" = COALESCE("saleType", payload->>'saleType'),
  "status" = COALESCE("status", payload->>'status'),
  "paymentStatus" = COALESCE("paymentStatus", payload->>'paymentStatus'),
  "customerName" = COALESCE("customerName", payload->>'customerName', payload->>'contactName'),
  "recipientName" = COALESCE("recipientName", payload->>'recipientName'),
  "contactName" = COALESCE("contactName", payload->>'contactName', payload->>'customerName', payload->>'recipientName'),
  "contactId" = COALESCE("contactId", payload->>'contactId'),
  "items" = CASE WHEN "items" = '[]'::jsonb AND payload ? 'items' THEN payload->'items' ELSE "items" END,
  "subtotal" = COALESCE(NULLIF("subtotal", 0), pg_temp.opero_to_double(payload->>'subtotal'), 0),
  "discountAmount" = COALESCE(NULLIF("discountAmount", 0), pg_temp.opero_to_double(payload->>'discountAmount'), pg_temp.opero_to_double(payload->>'discountTotal'), 0),
  "taxAmount" = COALESCE(NULLIF("taxAmount", 0), pg_temp.opero_to_double(payload->>'taxAmount'), 0),
  "grandTotal" = COALESCE(NULLIF("grandTotal", 0), pg_temp.opero_to_double(payload->>'grandTotal'), pg_temp.opero_to_double(payload->>'total'), 0),
  "currency" = COALESCE(NULLIF("currency", ''), payload->>'currency', 'USD'),
  "orderDiscountValue" = COALESCE("orderDiscountValue", pg_temp.opero_to_double(payload->>'orderDiscountValue')),
  "orderDiscountType" = COALESCE("orderDiscountType", payload->>'orderDiscountType'),
  "discountTotal" = COALESCE(NULLIF("discountTotal", 0), pg_temp.opero_to_double(payload->>'discountTotal'), pg_temp.opero_to_double(payload->>'discountAmount'), 0),
  "taxPercentage" = COALESCE("taxPercentage", pg_temp.opero_to_double(payload->>'taxPercentage')),
  "notes" = COALESCE("notes", payload->>'notes'),
  "assignedStaff" = CASE WHEN "assignedStaff" = '[]'::jsonb AND payload ? 'assignedStaff' THEN payload->'assignedStaff' ELSE "assignedStaff" END,
  "activities" = CASE WHEN "activities" = '[]'::jsonb AND payload ? 'activities' THEN payload->'activities' ELSE "activities" END,
  "attachments" = CASE WHEN "attachments" = '[]'::jsonb AND payload ? 'attachments' THEN payload->'attachments' ELSE "attachments" END,
  "shippingAddress" = COALESCE("shippingAddress", payload->>'shippingAddress'),
  "trackingNumber" = COALESCE("trackingNumber", payload->>'trackingNumber')
WHERE payload IS NOT NULL;

ALTER TABLE IF EXISTS "invoice"
  ADD COLUMN IF NOT EXISTS "invoiceNumber" TEXT,
  ADD COLUMN IF NOT EXISTS "recipientName" TEXT,
  ADD COLUMN IF NOT EXISTS "recipientEmail" TEXT,
  ADD COLUMN IF NOT EXISTS "contactName" TEXT,
  ADD COLUMN IF NOT EXISTS "contactId" TEXT,
  ADD COLUMN IF NOT EXISTS "issueDate" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "dueDate" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "items" JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "discountRate" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "discountTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "taxRate" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "taxTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "grandTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT,
  ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT,
  ADD COLUMN IF NOT EXISTS "paidAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "paymentReference" TEXT,
  ADD COLUMN IF NOT EXISTS "saleId" TEXT,
  ADD COLUMN IF NOT EXISTS "saleOrderNumber" TEXT,
  ADD COLUMN IF NOT EXISTS "notes" TEXT,
  ADD COLUMN IF NOT EXISTS "activities" JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "attachments" JSONB NOT NULL DEFAULT '[]'::jsonb;

UPDATE "invoice" i
SET
  "invoiceNumber" = COALESCE(i."invoiceNumber", i.payload->>'invoiceNumber'),
  "status" = COALESCE(i."status", i.payload->>'status'),
  "recipientName" = COALESCE(i."recipientName", i.payload->>'recipientName', i.payload->>'contactName'),
  "recipientEmail" = COALESCE(i."recipientEmail", i.payload->>'recipientEmail'),
  "contactName" = COALESCE(i."contactName", i.payload->>'contactName', i.payload->>'recipientName'),
  "contactId" = COALESCE(i."contactId", i.payload->>'contactId'),
  "issueDate" = COALESCE(i."issueDate", pg_temp.opero_to_timestamp(i.payload->>'issueDate')),
  "dueDate" = COALESCE(i."dueDate", pg_temp.opero_to_timestamp(i.payload->>'dueDate')),
  "items" = CASE WHEN i."items" = '[]'::jsonb AND i.payload ? 'items' THEN i.payload->'items' ELSE i."items" END,
  "subtotal" = COALESCE(NULLIF(i."subtotal", 0), pg_temp.opero_to_double(i.payload->>'subtotal'), 0),
  "discountAmount" = COALESCE(NULLIF(i."discountAmount", 0), pg_temp.opero_to_double(i.payload->>'discountAmount'), pg_temp.opero_to_double(i.payload->>'discountTotal'), 0),
  "discountRate" = COALESCE(i."discountRate", pg_temp.opero_to_double(i.payload->>'discountRate')),
  "discountTotal" = COALESCE(NULLIF(i."discountTotal", 0), pg_temp.opero_to_double(i.payload->>'discountTotal'), pg_temp.opero_to_double(i.payload->>'discountAmount'), 0),
  "taxRate" = COALESCE(i."taxRate", pg_temp.opero_to_double(i.payload->>'taxRate')),
  "taxAmount" = COALESCE(NULLIF(i."taxAmount", 0), pg_temp.opero_to_double(i.payload->>'taxAmount'), pg_temp.opero_to_double(i.payload->>'taxTotal'), 0),
  "taxTotal" = COALESCE(NULLIF(i."taxTotal", 0), pg_temp.opero_to_double(i.payload->>'taxTotal'), pg_temp.opero_to_double(i.payload->>'taxAmount'), 0),
  "grandTotal" = COALESCE(NULLIF(i."grandTotal", 0), pg_temp.opero_to_double(i.payload->>'grandTotal'), pg_temp.opero_to_double(i.payload->>'totalAmount'), 0),
  "totalAmount" = COALESCE(NULLIF(i."totalAmount", 0), pg_temp.opero_to_double(i.payload->>'totalAmount'), pg_temp.opero_to_double(i.payload->>'grandTotal'), 0),
  "currency" = COALESCE(NULLIF(i."currency", ''), i.payload->>'currency', 'USD'),
  "paymentStatus" = COALESCE(i."paymentStatus", i.payload->>'paymentStatus', i.payload->>'status'),
  "paymentMethod" = COALESCE(i."paymentMethod", i.payload->>'paymentMethod'),
  "paidAt" = COALESCE(i."paidAt", pg_temp.opero_to_timestamp(i.payload->>'paidAt')),
  "paymentReference" = COALESCE(i."paymentReference", i.payload->>'paymentReference'),
  "saleId" = COALESCE(i."saleId", (
    SELECT s.id
    FROM "sale" s
    WHERE s.id = i.payload->>'saleId'
      AND s."organizationId" = i."organizationId"
    LIMIT 1
  )),
  "saleOrderNumber" = COALESCE(i."saleOrderNumber", i.payload->>'saleOrderNumber'),
  "notes" = COALESCE(i."notes", i.payload->>'notes'),
  "activities" = CASE WHEN i."activities" = '[]'::jsonb AND i.payload ? 'activities' THEN i.payload->'activities' ELSE i."activities" END,
  "attachments" = CASE WHEN i."attachments" = '[]'::jsonb AND i.payload ? 'attachments' THEN i.payload->'attachments' ELSE i."attachments" END
WHERE i.payload IS NOT NULL;

ALTER TABLE IF EXISTS "transaction"
  ADD COLUMN IF NOT EXISTS "type" TEXT,
  ADD COLUMN IF NOT EXISTS "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS "category" TEXT,
  ADD COLUMN IF NOT EXISTS "transactionDate" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT,
  ADD COLUMN IF NOT EXISTS "reference" TEXT,
  ADD COLUMN IF NOT EXISTS "sourceType" TEXT,
  ADD COLUMN IF NOT EXISTS "sourceId" TEXT,
  ADD COLUMN IF NOT EXISTS "contactName" TEXT,
  ADD COLUMN IF NOT EXISTS "contactId" TEXT,
  ADD COLUMN IF NOT EXISTS "notes" TEXT,
  ADD COLUMN IF NOT EXISTS "activities" JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "attachments" JSONB NOT NULL DEFAULT '[]'::jsonb;

UPDATE "transaction"
SET
  "type" = COALESCE("type", payload->>'type'),
  "title" = COALESCE("title", payload->>'title'),
  "amount" = COALESCE(NULLIF("amount", 0), pg_temp.opero_to_double(payload->>'amount'), 0),
  "currency" = COALESCE(NULLIF("currency", ''), payload->>'currency', 'USD'),
  "category" = COALESCE("category", payload->>'category'),
  "transactionDate" = COALESCE("transactionDate", pg_temp.opero_to_timestamp(payload->>'transactionDate')),
  "paymentMethod" = COALESCE("paymentMethod", payload->>'paymentMethod'),
  "reference" = COALESCE("reference", payload->>'reference'),
  "sourceType" = COALESCE("sourceType", payload->>'sourceType'),
  "sourceId" = COALESCE("sourceId", payload->>'sourceId'),
  "status" = COALESCE("status", payload->>'status'),
  "contactName" = COALESCE("contactName", payload->>'contactName'),
  "contactId" = COALESCE("contactId", payload->>'contactId'),
  "notes" = COALESCE("notes", payload->>'notes'),
  "activities" = CASE WHEN "activities" = '[]'::jsonb AND payload ? 'activities' THEN payload->'activities' ELSE "activities" END,
  "attachments" = CASE WHEN "attachments" = '[]'::jsonb AND payload ? 'attachments' THEN payload->'attachments' ELSE "attachments" END
WHERE payload IS NOT NULL;

ALTER TABLE IF EXISTS "asset"
  ADD COLUMN IF NOT EXISTS "name" TEXT,
  ADD COLUMN IF NOT EXISTS "category" TEXT,
  ADD COLUMN IF NOT EXISTS "assetCode" TEXT,
  ADD COLUMN IF NOT EXISTS "quantity" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "assignedTo" JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "assignedToId" TEXT,
  ADD COLUMN IF NOT EXISTS "location" TEXT,
  ADD COLUMN IF NOT EXISTS "purchaseDate" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "purchaseValue" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "currency" TEXT,
  ADD COLUMN IF NOT EXISTS "warrantyExpiry" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "supplier" TEXT,
  ADD COLUMN IF NOT EXISTS "supplierName" TEXT,
  ADD COLUMN IF NOT EXISTS "imageUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "activities" JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "comments" JSONB NOT NULL DEFAULT '[]'::jsonb;

UPDATE "asset"
SET
  "name" = COALESCE("name", payload->>'name', "title"),
  "category" = COALESCE("category", payload->>'category'),
  "assetCode" = COALESCE("assetCode", payload->>'assetCode'),
  "quantity" = COALESCE(NULLIF("quantity", 1), pg_temp.opero_to_int(payload->>'quantity'), 1),
  "status" = COALESCE("status", payload->>'status'),
  "assignedTo" = CASE WHEN "assignedTo" = '[]'::jsonb AND payload ? 'assignedTo' THEN payload->'assignedTo' ELSE "assignedTo" END,
  "assignedToId" = COALESCE("assignedToId", payload->>'assignedToId'),
  "location" = COALESCE("location", payload->>'location'),
  "purchaseDate" = COALESCE("purchaseDate", pg_temp.opero_to_timestamp(payload->>'purchaseDate')),
  "purchaseValue" = COALESCE("purchaseValue", pg_temp.opero_to_double(payload->>'purchaseValue')),
  "currency" = COALESCE("currency", payload->>'currency'),
  "warrantyExpiry" = COALESCE("warrantyExpiry", pg_temp.opero_to_timestamp(payload->>'warrantyExpiry')),
  "supplier" = COALESCE("supplier", payload->>'supplier', payload->>'supplierName'),
  "supplierName" = COALESCE("supplierName", payload->>'supplierName', payload->>'supplier'),
  "imageUrl" = COALESCE("imageUrl", payload->>'imageUrl'),
  "activities" = CASE WHEN "activities" = '[]'::jsonb AND payload ? 'activities' THEN payload->'activities' ELSE "activities" END,
  "comments" = CASE WHEN "comments" = '[]'::jsonb AND payload ? 'comments' THEN payload->'comments' ELSE "comments" END
WHERE payload IS NOT NULL;

ALTER TABLE IF EXISTS "document"
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "fileName" TEXT,
  ADD COLUMN IF NOT EXISTS "fileType" TEXT,
  ADD COLUMN IF NOT EXISTS "fileSize" INTEGER,
  ADD COLUMN IF NOT EXISTS "storagePath" TEXT,
  ADD COLUMN IF NOT EXISTS "fileUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "downloadUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "folderId" TEXT,
  ADD COLUMN IF NOT EXISTS "tags" JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "uploadedById" TEXT;

UPDATE "document" d
SET
  "description" = COALESCE(d."description", d.payload->>'description'),
  "status" = COALESCE(d."status", d.payload->>'status'),
  "fileName" = COALESCE(d."fileName", d.payload->>'fileName'),
  "fileType" = COALESCE(d."fileType", d.payload->>'fileType'),
  "fileSize" = COALESCE(d."fileSize", pg_temp.opero_to_int(d.payload->>'fileSize')),
  "storagePath" = COALESCE(d."storagePath", d.payload->>'storagePath'),
  "fileUrl" = COALESCE(d."fileUrl", d.payload->>'fileUrl', d.payload->>'downloadUrl'),
  "downloadUrl" = COALESCE(d."downloadUrl", d.payload->>'downloadUrl', d.payload->>'fileUrl'),
  "folderId" = COALESCE(d."folderId", (
    SELECT f.id
    FROM "folder" f
    WHERE f.id = d.payload->>'folderId'
      AND f."organizationId" = d."organizationId"
    LIMIT 1
  )),
  "tags" = CASE WHEN d."tags" = '[]'::jsonb AND d.payload ? 'tags' THEN d.payload->'tags' ELSE d."tags" END,
  "uploadedById" = COALESCE(d."uploadedById", d.payload->>'uploadedById', d."createdById")
WHERE d.payload IS NOT NULL;

ALTER TABLE IF EXISTS "social_channel"
  ADD COLUMN IF NOT EXISTS "platform" TEXT,
  ADD COLUMN IF NOT EXISTS "accountName" TEXT,
  ADD COLUMN IF NOT EXISTS "handle" TEXT,
  ADD COLUMN IF NOT EXISTS "username" TEXT,
  ADD COLUMN IF NOT EXISTS "profileUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "profileLink" TEXT,
  ADD COLUMN IF NOT EXISTS "followers" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "postsThisMonth" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "interactions" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "monthlyReach" INTEGER,
  ADD COLUMN IF NOT EXISTS "averageViews" INTEGER,
  ADD COLUMN IF NOT EXISTS "lastActiveDate" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "notes" TEXT;

UPDATE "social_channel"
SET
  "platform" = COALESCE("platform", payload->>'platform'),
  "accountName" = COALESCE("accountName", payload->>'accountName', payload->>'name', "title"),
  "handle" = COALESCE("handle", payload->>'handle', payload->>'username'),
  "username" = COALESCE("username", payload->>'username', payload->>'handle'),
  "profileUrl" = COALESCE("profileUrl", payload->>'profileUrl', payload->>'profileLink'),
  "profileLink" = COALESCE("profileLink", payload->>'profileLink', payload->>'profileUrl'),
  "status" = COALESCE("status", payload->>'status'),
  "followers" = COALESCE(NULLIF("followers", 0), pg_temp.opero_to_int(payload->>'followers'), 0),
  "postsThisMonth" = COALESCE(NULLIF("postsThisMonth", 0), pg_temp.opero_to_int(payload->>'postsThisMonth'), 0),
  "interactions" = COALESCE(NULLIF("interactions", 0), pg_temp.opero_to_int(payload->>'interactions'), 0),
  "monthlyReach" = COALESCE("monthlyReach", pg_temp.opero_to_int(payload->>'monthlyReach')),
  "averageViews" = COALESCE("averageViews", pg_temp.opero_to_int(payload->>'averageViews')),
  "lastActiveDate" = COALESCE("lastActiveDate", pg_temp.opero_to_timestamp(payload->>'lastActiveDate')),
  "notes" = COALESCE("notes", payload->>'notes')
WHERE payload IS NOT NULL;

ALTER TABLE IF EXISTS "content_post"
  ADD COLUMN IF NOT EXISTS "plannedDate" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "plannedTime" TEXT,
  ADD COLUMN IF NOT EXISTS "contentType" TEXT,
  ADD COLUMN IF NOT EXISTS "targetAccountId" TEXT,
  ADD COLUMN IF NOT EXISTS "tags" JSONB NOT NULL DEFAULT '[]'::jsonb;

UPDATE "content_post" cp
SET
  "status" = COALESCE(cp."status", cp.payload->>'status'),
  "plannedDate" = COALESCE(cp."plannedDate", pg_temp.opero_to_timestamp(cp.payload->>'plannedDate'), pg_temp.opero_to_timestamp(cp.payload->>'date'), pg_temp.opero_to_timestamp(cp.payload->>'postDate'), pg_temp.opero_to_timestamp(cp.payload->>'publishDate')),
  "plannedTime" = COALESCE(cp."plannedTime", cp.payload->>'plannedTime', cp.payload->>'time'),
  "contentType" = COALESCE(cp."contentType", cp.payload->>'contentType', cp.payload->>'type'),
  "targetAccountId" = COALESCE(cp."targetAccountId", (
    SELECT sc.id
    FROM "social_channel" sc
    WHERE sc.id = cp.payload->>'targetAccountId'
      AND sc."organizationId" = cp."organizationId"
    LIMIT 1
  )),
  "tags" = CASE WHEN cp."tags" = '[]'::jsonb AND cp.payload ? 'tags' THEN cp.payload->'tags' ELSE cp."tags" END
WHERE cp.payload IS NOT NULL;

CREATE INDEX IF NOT EXISTS "task_organizationId_status_idx" ON "task"("organizationId", "status");
CREATE INDEX IF NOT EXISTS "task_organizationId_dueDate_idx" ON "task"("organizationId", "dueDate");
CREATE INDEX IF NOT EXISTS "task_organizationId_campaignId_idx" ON "task"("organizationId", "campaignId");
CREATE INDEX IF NOT EXISTS "task_assigneeId_idx" ON "task"("assigneeId");
CREATE INDEX IF NOT EXISTS "campaign_organizationId_status_idx" ON "campaign"("organizationId", "status");
CREATE INDEX IF NOT EXISTS "campaign_organizationId_startDate_idx" ON "campaign"("organizationId", "startDate");
CREATE INDEX IF NOT EXISTS "product_organizationId_status_idx" ON "product"("organizationId", "status");
CREATE INDEX IF NOT EXISTS "product_organizationId_sku_idx" ON "product"("organizationId", "sku");
CREATE INDEX IF NOT EXISTS "product_organizationId_category_idx" ON "product"("organizationId", "category");
CREATE INDEX IF NOT EXISTS "sale_organizationId_status_idx" ON "sale"("organizationId", "status");
CREATE INDEX IF NOT EXISTS "sale_organizationId_saleNumber_idx" ON "sale"("organizationId", "saleNumber");
CREATE INDEX IF NOT EXISTS "invoice_organizationId_status_idx" ON "invoice"("organizationId", "status");
CREATE INDEX IF NOT EXISTS "invoice_organizationId_invoiceNumber_idx" ON "invoice"("organizationId", "invoiceNumber");
CREATE INDEX IF NOT EXISTS "invoice_organizationId_dueDate_idx" ON "invoice"("organizationId", "dueDate");
CREATE INDEX IF NOT EXISTS "invoice_saleId_idx" ON "invoice"("saleId");
CREATE INDEX IF NOT EXISTS "transaction_organizationId_type_idx" ON "transaction"("organizationId", "type");
CREATE INDEX IF NOT EXISTS "transaction_organizationId_status_idx" ON "transaction"("organizationId", "status");
CREATE INDEX IF NOT EXISTS "transaction_organizationId_transactionDate_idx" ON "transaction"("organizationId", "transactionDate");
CREATE INDEX IF NOT EXISTS "transaction_organizationId_sourceType_sourceId_idx" ON "transaction"("organizationId", "sourceType", "sourceId");
CREATE INDEX IF NOT EXISTS "asset_organizationId_status_idx" ON "asset"("organizationId", "status");
CREATE INDEX IF NOT EXISTS "asset_organizationId_assetCode_idx" ON "asset"("organizationId", "assetCode");
CREATE INDEX IF NOT EXISTS "asset_organizationId_category_idx" ON "asset"("organizationId", "category");
CREATE INDEX IF NOT EXISTS "document_organizationId_status_idx" ON "document"("organizationId", "status");
CREATE INDEX IF NOT EXISTS "document_organizationId_folderId_idx" ON "document"("organizationId", "folderId");
CREATE INDEX IF NOT EXISTS "document_uploadedById_idx" ON "document"("uploadedById");
CREATE INDEX IF NOT EXISTS "social_channel_organizationId_status_idx" ON "social_channel"("organizationId", "status");
CREATE INDEX IF NOT EXISTS "social_channel_organizationId_platform_idx" ON "social_channel"("organizationId", "platform");
CREATE INDEX IF NOT EXISTS "content_post_organizationId_status_idx" ON "content_post"("organizationId", "status");
CREATE INDEX IF NOT EXISTS "content_post_organizationId_plannedDate_idx" ON "content_post"("organizationId", "plannedDate");
CREATE INDEX IF NOT EXISTS "content_post_targetAccountId_idx" ON "content_post"("targetAccountId");

DO $$
BEGIN
  IF to_regclass('public.task') IS NOT NULL
     AND to_regclass('public.user') IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'task_assigneeId_fkey') THEN
    ALTER TABLE "task" ADD CONSTRAINT "task_assigneeId_fkey"
    FOREIGN KEY ("assigneeId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF to_regclass('public.invoice') IS NOT NULL
     AND to_regclass('public.sale') IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'invoice_saleId_fkey') THEN
    ALTER TABLE "invoice" ADD CONSTRAINT "invoice_saleId_fkey"
    FOREIGN KEY ("saleId") REFERENCES "sale"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF to_regclass('public.document') IS NOT NULL
     AND to_regclass('public.folder') IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'document_folderId_fkey') THEN
    ALTER TABLE "document" ADD CONSTRAINT "document_folderId_fkey"
    FOREIGN KEY ("folderId") REFERENCES "folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF to_regclass('public.document') IS NOT NULL
     AND to_regclass('public.user') IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'document_uploadedById_fkey') THEN
    ALTER TABLE "document" ADD CONSTRAINT "document_uploadedById_fkey"
    FOREIGN KEY ("uploadedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF to_regclass('public.content_post') IS NOT NULL
     AND to_regclass('public.social_channel') IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'content_post_targetAccountId_fkey') THEN
    ALTER TABLE "content_post" ADD CONSTRAINT "content_post_targetAccountId_fkey"
    FOREIGN KEY ("targetAccountId") REFERENCES "social_channel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DROP TABLE IF EXISTS "bot" CASCADE;
DROP TABLE IF EXISTS "report" CASCADE;
DROP TABLE IF EXISTS "social_schedule" CASCADE;
DROP TABLE IF EXISTS "social_activity" CASCADE;
DROP TABLE IF EXISTS "content_asset" CASCADE;
