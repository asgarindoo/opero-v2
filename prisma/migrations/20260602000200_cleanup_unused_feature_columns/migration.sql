-- DropIndex
DROP INDEX IF EXISTS "goal_ownerId_idx";

-- AlterTable
ALTER TABLE "asset" DROP COLUMN IF EXISTS "assignedTo",
DROP COLUMN IF EXISTS "assignedToId";

-- AlterTable
ALTER TABLE "campaign" DROP COLUMN IF EXISTS "assignedStaff",
DROP COLUMN IF EXISTS "attachments",
DROP COLUMN IF EXISTS "goals",
DROP COLUMN IF EXISTS "notes",
DROP COLUMN IF EXISTS "objective";

-- AlterTable
ALTER TABLE "contact" DROP COLUMN IF EXISTS "assignedStaff",
DROP COLUMN IF EXISTS "description",
DROP COLUMN IF EXISTS "notes",
DROP COLUMN IF EXISTS "tags",
ADD COLUMN IF NOT EXISTS "comments" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "goal" DROP COLUMN IF EXISTS "activities",
DROP COLUMN IF EXISTS "currentValue",
DROP COLUMN IF EXISTS "metric",
DROP COLUMN IF EXISTS "notes",
DROP COLUMN IF EXISTS "ownerId",
DROP COLUMN IF EXISTS "tags",
DROP COLUMN IF EXISTS "targetValue";

-- AlterTable
ALTER TABLE "invoice" DROP COLUMN IF EXISTS "activities",
DROP COLUMN IF EXISTS "attachments",
DROP COLUMN IF EXISTS "notes",
DROP COLUMN IF EXISTS "paidAt",
DROP COLUMN IF EXISTS "paymentReference",
DROP COLUMN IF EXISTS "recipientEmail",
DROP COLUMN IF EXISTS "recipientName",
DROP COLUMN IF EXISTS "saleOrderNumber",
ADD COLUMN IF NOT EXISTS "contactEmail" TEXT;

-- AlterTable
ALTER TABLE "product" DROP COLUMN IF EXISTS "description",
DROP COLUMN IF EXISTS "imageUrl",
DROP COLUMN IF EXISTS "notes",
DROP COLUMN IF EXISTS "variants",
ADD COLUMN IF NOT EXISTS "comments" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "sale" DROP COLUMN IF EXISTS "assignedStaff",
DROP COLUMN IF EXISTS "attachments",
DROP COLUMN IF EXISTS "customerName",
DROP COLUMN IF EXISTS "notes",
DROP COLUMN IF EXISTS "recipientName",
DROP COLUMN IF EXISTS "trackingNumber";

-- AlterTable
ALTER TABLE "social_channel" DROP COLUMN IF EXISTS "lastActiveDate";

-- AlterTable
ALTER TABLE "task" DROP COLUMN IF EXISTS "estimatedHours",
DROP COLUMN IF EXISTS "project",
DROP COLUMN IF EXISTS "reactions",
DROP COLUMN IF EXISTS "relationships",
DROP COLUMN IF EXISTS "reminderDate",
DROP COLUMN IF EXISTS "subtasks",
DROP COLUMN IF EXISTS "watchers";

-- AlterTable
ALTER TABLE "tenant_settings" DROP COLUMN IF EXISTS "brandColor",
DROP COLUMN IF EXISTS "industryType",
DROP COLUMN IF EXISTS "websiteUrl";

-- AlterTable
ALTER TABLE "transaction" DROP COLUMN IF EXISTS "activities",
DROP COLUMN IF EXISTS "attachments";
