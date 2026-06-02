-- DropIndex
DROP INDEX "goal_ownerId_idx";

-- AlterTable
ALTER TABLE "asset" DROP COLUMN "assignedTo",
DROP COLUMN "assignedToId";

-- AlterTable
ALTER TABLE "campaign" DROP COLUMN "assignedStaff",
DROP COLUMN "attachments",
DROP COLUMN "goals",
DROP COLUMN "notes",
DROP COLUMN "objective";

-- AlterTable
ALTER TABLE "contact" DROP COLUMN "assignedStaff",
DROP COLUMN "description",
DROP COLUMN "notes",
DROP COLUMN "tags",
ADD COLUMN     "comments" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "goal" DROP COLUMN "activities",
DROP COLUMN "currentValue",
DROP COLUMN "metric",
DROP COLUMN "notes",
DROP COLUMN "ownerId",
DROP COLUMN "tags",
DROP COLUMN "targetValue";

-- AlterTable
ALTER TABLE "invoice" DROP COLUMN "activities",
DROP COLUMN "attachments",
DROP COLUMN "notes",
DROP COLUMN "paidAt",
DROP COLUMN "paymentReference",
DROP COLUMN "recipientEmail",
DROP COLUMN "recipientName",
DROP COLUMN "saleOrderNumber",
ADD COLUMN     "contactEmail" TEXT;

-- AlterTable
ALTER TABLE "product" DROP COLUMN "description",
DROP COLUMN "imageUrl",
DROP COLUMN "notes",
DROP COLUMN "variants",
ADD COLUMN     "comments" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "sale" DROP COLUMN "assignedStaff",
DROP COLUMN "attachments",
DROP COLUMN "customerName",
DROP COLUMN "notes",
DROP COLUMN "recipientName",
DROP COLUMN "trackingNumber";

-- AlterTable
ALTER TABLE "social_channel" DROP COLUMN "lastActiveDate";

-- AlterTable
ALTER TABLE "task" DROP COLUMN "estimatedHours",
DROP COLUMN "project",
DROP COLUMN "reactions",
DROP COLUMN "relationships",
DROP COLUMN "reminderDate",
DROP COLUMN "subtasks",
DROP COLUMN "watchers";

-- AlterTable
ALTER TABLE "tenant_settings" DROP COLUMN "brandColor",
DROP COLUMN "industryType",
DROP COLUMN "websiteUrl";

-- AlterTable
ALTER TABLE "transaction" DROP COLUMN "activities",
DROP COLUMN "attachments";
