import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/server/rbac";
import { decryptField, encryptField, getTenantAesKey } from "@/lib/server/crypto/tenant-crypto";
import { getStatus, getTitle, logDomainActivity, mapDomainRecord } from "@/lib/api/domain-utils";
import { dateValue, intValue, jsonArray, jsonInputOrDefault, numberValue, textValue } from "@/lib/api/feature-records";

const MODULE = "DOCUMENTS";
const ENTITY = "Asset";

const ASSET_SELECT = {
  id: true,
  organizationId: true,
  title: true,
  name: true,
  category: true,
  assetCode: true,
  quantity: true,
  status: true,
  location: true,
  purchaseDate: true,
  purchaseValue: true,
  currency: true,
  warrantyExpiry: true,
  supplierName: true,
  imageUrl: true,
  activities: true,
  comments: true,
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


function decryptAssetRecord(record: any, aesKey: Buffer) {
  return {
    ...record,
    location: typeof record.location === "string" ? decryptField(aesKey, record.location) : record.location,
    purchaseValue: record.purchaseValue,
    supplierName: typeof record.supplierName === "string" ? decryptField(aesKey, record.supplierName) : record.supplierName,
    comments: decryptJsonField(aesKey, record.comments, []),
  };
}

function mapAsset(record: any, aesKey: Buffer, fallbackUser?: { id: string; name: string; email?: string | null; image?: string | null }) {
  const decrypted = decryptAssetRecord(record, aesKey);
  const mapped = mapDomainRecord(decrypted, fallbackUser) as any;
  return {
    ...mapped,
    activities: Array.isArray(mapped.activities) ? mapped.activities : [],
    comments: Array.isArray(mapped.comments) ? mapped.comments : [],
  };
}


export async function listAssets() {
  const ctx = await requirePermission("assets.read");
  const assets = await prisma.asset.findMany({
    where: { organizationId: ctx.tenantId },
    orderBy: { createdAt: "desc" },
    select: ASSET_SELECT,
  });
  const aesKey = await getTenantAesKey(ctx.tenantId);
  try {
    return assets.map((asset) => mapAsset(asset, aesKey));
  } finally {
    aesKey.fill(0);
  }
}

export async function getAssetById(id: string) {
  const ctx = await requirePermission("assets.read");
  const asset = await prisma.asset.findFirst({ where: { id, organizationId: ctx.tenantId }, select: ASSET_SELECT });
  if (!asset) return null;
  const aesKey = await getTenantAesKey(ctx.tenantId);
  try {
    return mapAsset(asset, aesKey);
  } finally {
    aesKey.fill(0);
  }
}

export async function createAsset(data: Record<string, unknown>) {
  const ctx = await requirePermission("assets.create");
  const name = textValue(data.name) ?? getTitle(data);
  const purchaseValue = numberValue(data.purchaseValue);
  const aesKey = await getTenantAesKey(ctx.tenantId);

  try {
    const asset = await prisma.asset.create({
      data: {
        organizationId: ctx.tenantId,
        title: name,
        name,
        category: textValue(data.category),
        assetCode: textValue(data.assetCode),
        quantity: intValue(data.quantity) ?? 1,
        status: getStatus(data, "Active"),
        location: encryptField(aesKey, textValue(data.location) ?? null),
        purchaseDate: dateValue(data.purchaseDate),
        purchaseValue: purchaseValue != null ? purchaseValue : undefined,
        currency: textValue(data.currency),
        warrantyExpiry: dateValue(data.warrantyExpiry),
        supplierName: encryptField(aesKey, textValue(data.supplierName) ?? textValue(data.supplier) ?? null),
        imageUrl: textValue(data.imageUrl),
        activities: jsonArray(data.activities),
        comments: encryptJsonField(aesKey, jsonArray(data.comments)) as any,
        createdById: ctx.userId,
        updatedById: ctx.userId,
      },
      select: ASSET_SELECT,
    });
    await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Created", entityType: ENTITY, entityId: asset.id, entityName: name });
    return mapAsset(asset, aesKey, ctx.user);
  } finally {
    aesKey.fill(0);
  }
}

export async function updateAsset(id: string, patch: Record<string, unknown>) {
  const ctx = await requirePermission("assets.update");
  const current = await prisma.asset.findFirst({ where: { id, organizationId: ctx.tenantId }, select: ASSET_SELECT });
  if (!current) return null;

  const aesKey = await getTenantAesKey(ctx.tenantId);
  try {
    const currentPlain = decryptAssetRecord(current, aesKey);
    const name = textValue(patch.name) ?? textValue(patch.title) ?? currentPlain.title ?? currentPlain.name ?? "Untitled";
    const purchaseValue = patch.purchaseValue !== undefined ? numberValue(patch.purchaseValue) : currentPlain.purchaseValue;

    const updated = await prisma.asset.update({
      where: { id },
      data: {
        title: name,
        name,
        category: patch.category !== undefined ? textValue(patch.category) : current.category,
        assetCode: patch.assetCode !== undefined ? textValue(patch.assetCode) : current.assetCode,
        quantity: patch.quantity !== undefined ? intValue(patch.quantity) ?? current.quantity : current.quantity,
        status: typeof patch.status === "string" ? patch.status : current.status,
        location: patch.location !== undefined ? encryptField(aesKey, textValue(patch.location) ?? null) : current.location,
        purchaseDate: patch.purchaseDate !== undefined ? dateValue(patch.purchaseDate) : current.purchaseDate,
        purchaseValue: purchaseValue != null ? purchaseValue : current.purchaseValue,
        currency: patch.currency !== undefined ? textValue(patch.currency) : current.currency,
        warrantyExpiry: patch.warrantyExpiry !== undefined ? dateValue(patch.warrantyExpiry) : current.warrantyExpiry,
        supplierName: patch.supplierName !== undefined || patch.supplier !== undefined
          ? encryptField(aesKey, textValue(patch.supplierName) ?? textValue(patch.supplier) ?? null)
          : current.supplierName,
        imageUrl: patch.imageUrl !== undefined ? textValue(patch.imageUrl) : current.imageUrl,
        activities: patch.activities !== undefined ? jsonArray(patch.activities) : jsonInputOrDefault(current.activities, []),
        comments: patch.comments !== undefined
          ? encryptJsonField(aesKey, jsonArray(patch.comments)) as any
          : current.comments,
        updatedById: ctx.userId,
      },
      select: ASSET_SELECT,
    });
    await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Updated", entityType: ENTITY, entityId: id, entityName: name });
    return mapAsset(updated, aesKey);
  } finally {
    aesKey.fill(0);
  }
}

export async function deleteAsset(id: string) {
  const ctx = await requirePermission("assets.delete");
  const current = await prisma.asset.findFirst({ where: { id, organizationId: ctx.tenantId }, select: { title: true } });
  if (!current) return null;
  const result = await prisma.asset.deleteMany({ where: { id, organizationId: ctx.tenantId } });
  if (result.count === 0) return null;
  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Deleted", entityType: ENTITY, entityId: id, entityName: current.title });
  return { id };
}
