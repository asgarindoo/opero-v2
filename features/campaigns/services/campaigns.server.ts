import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/server/rbac";
import { decryptField, encryptField, getTenantAesKey } from "@/lib/server/crypto/tenant-crypto";
import { getStatus, getTitle, logDomainActivity, mapDomainRecord } from "@/lib/api/domain-utils";
import { dateValue, jsonArray, jsonInputOrDefault, numberValue, textValue } from "@/lib/api/feature-records";

const MODULE = "MARKETING";
const ENTITY = "Campaign";

const CAMPAIGN_SELECT = {
  id: true,
  organizationId: true,
  title: true,
  name: true,
  description: true,
  status: true,
  priority: true,
  startDate: true,
  endDate: true,
  budget: true,
  currency: true,
  tags: true,
  campaignAccounts: true,
  activities: true,
  payload: true,
  createdById: true,
  updatedById: true,
  createdAt: true,
  updatedAt: true,
  createdBy: { select: { id: true, name: true, email: true, image: true } },
} as const;

function encryptJsonField(aesKey: Buffer, value: unknown): string {
  return encryptField(aesKey, JSON.stringify(value ?? null)) ?? "";
}

function decryptJsonField(aesKey: Buffer, value: unknown, fallback: unknown) {
  if (typeof value !== "string") return value ?? fallback;
  const decrypted = decryptField(aesKey, value);
  if (!decrypted) return fallback;
  try {
    return JSON.parse(decrypted);
  } catch {
    return fallback;
  }
}

function encryptNumeric(aesKey: Buffer, value: number): string {
  return encryptField(aesKey, String(value)) ?? "0";
}

function decryptNumeric(aesKey: Buffer, value: unknown, fallback = 0): number {
  if (typeof value !== "string") return typeof value === "number" ? value : fallback;
  const decrypted = decryptField(aesKey, value);
  if (!decrypted) return fallback;
  const parsed = parseFloat(decrypted);
  return isNaN(parsed) ? fallback : parsed;
}

function decryptCampaignRecord(record: any, aesKey: Buffer) {
  return {
    ...record,
    title: typeof record.title === "string" ? decryptField(aesKey, record.title) : record.title,
    name: typeof record.name === "string" ? decryptField(aesKey, record.name) : record.name,
    description: typeof record.description === "string" ? decryptField(aesKey, record.description) : record.description,
    budget: record.budget != null ? decryptNumeric(aesKey, record.budget) : null,
    campaignAccounts: decryptJsonField(aesKey, record.campaignAccounts, []),
  };
}

function mapCampaign(record: any, aesKey: Buffer, fallbackUser?: { id: string; name: string; email?: string | null; image?: string | null }) {
  const decrypted = decryptCampaignRecord(record, aesKey);
  return mapDomainRecord(decrypted, fallbackUser);
}

export async function listCampaigns() {
  const ctx = await requirePermission("campaigns.read");
  const campaigns = await prisma.campaign.findMany({
    where: { organizationId: ctx.tenantId },
    orderBy: { createdAt: "desc" },
    select: CAMPAIGN_SELECT,
  });
  const aesKey = await getTenantAesKey(ctx.tenantId);
  try {
    return campaigns.map((campaign) => mapCampaign(campaign, aesKey));
  } finally {
    aesKey.fill(0);
  }
}

export async function getCampaignById(id: string) {
  const ctx = await requirePermission("campaigns.read");
  const campaign = await prisma.campaign.findFirst({ where: { id, organizationId: ctx.tenantId }, select: CAMPAIGN_SELECT });
  if (!campaign) return null;
  const aesKey = await getTenantAesKey(ctx.tenantId);
  try {
    return mapCampaign(campaign, aesKey);
  } finally {
    aesKey.fill(0);
  }
}

export async function createCampaign(data: Record<string, unknown>) {
  const ctx = await requirePermission("campaigns.create");
  const name = textValue(data.name) ?? getTitle(data);
  const budget = numberValue(data.budget);
  const aesKey = await getTenantAesKey(ctx.tenantId);

  try {
    const campaign = await prisma.campaign.create({
      data: {
        organizationId: ctx.tenantId,
        title: encryptField(aesKey, name),
        name: encryptField(aesKey, name),
        description: encryptField(aesKey, textValue(data.description) ?? null),
        status: getStatus(data),
        priority: textValue(data.priority),
        startDate: dateValue(data.startDate),
        endDate: dateValue(data.endDate),
        budget: budget != null ? encryptNumeric(aesKey, budget) as any : undefined,
        currency: textValue(data.currency),
        tags: jsonArray(data.tags),
        campaignAccounts: encryptJsonField(aesKey, jsonArray(data.campaignAccounts)) as any,
        activities: jsonArray(data.activities),
        createdById: ctx.userId,
        updatedById: ctx.userId,
      },
      select: CAMPAIGN_SELECT,
    });
    await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Created", entityType: ENTITY, entityId: campaign.id, entityName: name, description: typeof data.description === "string" ? data.description : null });
    return mapCampaign(campaign, aesKey, ctx.user);
  } finally {
    aesKey.fill(0);
  }
}

export async function updateCampaign(id: string, patch: Record<string, unknown>) {
  const ctx = await requirePermission("campaigns.update");
  const current = await prisma.campaign.findFirst({ where: { id, organizationId: ctx.tenantId }, select: CAMPAIGN_SELECT });
  if (!current) return null;

  const aesKey = await getTenantAesKey(ctx.tenantId);
  try {
    const currentPlain = decryptCampaignRecord(current, aesKey);
    const name = textValue(patch.name) ?? textValue(patch.title) ?? currentPlain.name ?? currentPlain.title ?? "Untitled";
    const budget = patch.budget !== undefined ? numberValue(patch.budget) : currentPlain.budget;

    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        title: encryptField(aesKey, name),
        name: encryptField(aesKey, name),
        description: patch.description !== undefined ? encryptField(aesKey, textValue(patch.description) ?? null) : current.description,
        status: typeof patch.status === "string" ? patch.status : current.status,
        priority: patch.priority !== undefined ? textValue(patch.priority) : current.priority,
        startDate: patch.startDate !== undefined ? dateValue(patch.startDate) : current.startDate,
        endDate: patch.endDate !== undefined ? dateValue(patch.endDate) : current.endDate,
        budget: budget != null ? encryptNumeric(aesKey, budget) as any : current.budget,
        currency: patch.currency !== undefined ? textValue(patch.currency) : current.currency,
        tags: patch.tags !== undefined ? jsonArray(patch.tags) : jsonInputOrDefault(current.tags, []),
        campaignAccounts: patch.campaignAccounts !== undefined
          ? encryptJsonField(aesKey, jsonArray(patch.campaignAccounts)) as any
          : current.campaignAccounts,
        activities: patch.activities !== undefined ? jsonArray(patch.activities) : jsonInputOrDefault(current.activities, []),
        updatedById: ctx.userId,
      },
      select: CAMPAIGN_SELECT,
    });
    await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Updated", entityType: ENTITY, entityId: id, entityName: name, description: typeof patch.description === "string" ? patch.description : null });
    return mapCampaign(updated, aesKey);
  } finally {
    aesKey.fill(0);
  }
}

export async function deleteCampaign(id: string) {
  const ctx = await requirePermission("campaigns.delete");
  const current = await prisma.campaign.findFirst({ where: { id, organizationId: ctx.tenantId }, select: { title: true } });
  if (!current) return null;
  let entityName: string | null = null;
  if (typeof current.title === "string") {
    const aesKey = await getTenantAesKey(ctx.tenantId);
    try {
      entityName = decryptField(aesKey, current.title);
    } finally {
      aesKey.fill(0);
    }
  }
  const result = await prisma.campaign.deleteMany({ where: { id, organizationId: ctx.tenantId } });
  if (result.count === 0) return null;
  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Deleted", entityType: ENTITY, entityId: id, entityName });
  return { id };
}
