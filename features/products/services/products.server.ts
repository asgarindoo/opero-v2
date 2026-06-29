import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/server/rbac";
import { decryptField, encryptField, getTenantAesKey } from "@/lib/server/crypto/tenant-crypto";
import { getStatus, getTitle, logDomainActivity, mapDomainRecord, parsePayload } from "@/lib/api/domain-utils";
import { intValue, jsonArray, jsonInputOrDefault, jsonObjectOrUndefined, numberValue, textValue } from "@/lib/api/feature-records";

const MODULE = "SALES";
const ENTITY = "Product";

const PRODUCT_SELECT = {
  id: true,
  organizationId: true,
  title: true,
  name: true,
  sku: true,
  category: true,
  type: true,
  price: true,
  currency: true,
  stock: true,
  totalQuantity: true,
  minThreshold: true,
  status: true,
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


function decryptProductRecord(record: any, aesKey: Buffer) {
  return {
    ...record,
    title: typeof record.title === "string" ? decryptField(aesKey, record.title) : record.title,
    name: typeof record.name === "string" ? decryptField(aesKey, record.name) : record.name,
    price: record.price,
    comments: decryptJsonField(aesKey, record.comments, []),
  };
}

function productPayload(data: Record<string, unknown>, currentPayload?: unknown) {
  const payload = { ...parsePayload(currentPayload), ...parsePayload(data.payload) };
  delete payload.comments;
  return jsonObjectOrUndefined(payload) ?? {};
}

function mapProduct(record: any, aesKey: Buffer, fallbackUser?: { id: string; name: string; email?: string | null; image?: string | null }) {
  const decrypted = decryptProductRecord(record, aesKey);
  const mapped = mapDomainRecord(decrypted, fallbackUser) as any;
  return {
    ...mapped,
    sku: mapped.sku ?? "SKU-TBD",
    activities: Array.isArray(mapped.activities) ? mapped.activities : [],
    comments: Array.isArray(mapped.comments) ? mapped.comments : [],
  };
}

export async function listProducts() {
  const ctx = await requirePermission("products.read");
  const products = await prisma.product.findMany({
    where: { organizationId: ctx.tenantId },
    orderBy: { createdAt: "desc" },
    select: PRODUCT_SELECT,
  });
  const aesKey = await getTenantAesKey(ctx.tenantId);
  try {
    return products.map((product) => mapProduct(product, aesKey));
  } finally {
    aesKey.fill(0);
  }
}

export async function getProductById(id: string) {
  const ctx = await requirePermission("products.read");
  const product = await prisma.product.findFirst({ where: { id, organizationId: ctx.tenantId }, select: PRODUCT_SELECT });
  if (!product) return null;
  const aesKey = await getTenantAesKey(ctx.tenantId);
  try {
    return mapProduct(product, aesKey);
  } finally {
    aesKey.fill(0);
  }
}

export async function createProduct(data: Record<string, unknown>) {
  const ctx = await requirePermission("products.create");
  const name = textValue(data.name) ?? getTitle(data);
  const sku = textValue(data.sku);
  const stock = intValue(data.stock) ?? intValue(data.totalQuantity) ?? 0;
  const price = numberValue(data.price) ?? 0;
  const aesKey = await getTenantAesKey(ctx.tenantId);

  try {
    const product = await prisma.product.create({
      data: {
        organizationId: ctx.tenantId,
        title: encryptField(aesKey, name),
        name: encryptField(aesKey, name),
        sku,
        category: textValue(data.category) ?? "Uncategorized",
        type: textValue(data.type) ?? "Physical",
        price,
        currency: textValue(data.currency) ?? "USD",
        stock,
        totalQuantity: intValue(data.totalQuantity) ?? stock,
        minThreshold: intValue(data.minThreshold) ?? 10,
        status: getStatus(data, "Active"),
        activities: jsonArray(data.activities),
        comments: encryptJsonField(aesKey, jsonArray(data.comments)) as any,
        payload: productPayload(data),
        createdById: ctx.userId,
        updatedById: ctx.userId,
      },
      select: PRODUCT_SELECT,
    });
    await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Created", entityType: ENTITY, entityId: product.id, entityName: name });
    return mapProduct(product, aesKey, ctx.user);
  } finally {
    aesKey.fill(0);
  }
}

export async function updateProduct(id: string, patch: Record<string, unknown>) {
  const ctx = await requirePermission("products.update");
  const current = await prisma.product.findFirst({ where: { id, organizationId: ctx.tenantId }, select: PRODUCT_SELECT });
  if (!current) return null;

  const aesKey = await getTenantAesKey(ctx.tenantId);
  try {
    const currentPlain = decryptProductRecord(current, aesKey);
    const name = textValue(patch.name) ?? textValue(patch.title) ?? currentPlain.name ?? currentPlain.title ?? "Untitled";
    const stock = intValue(patch.stock) ?? intValue(patch.totalQuantity) ?? current.stock;
    const price = patch.price !== undefined ? numberValue(patch.price) ?? currentPlain.price : currentPlain.price;

    const updated = await prisma.product.update({
      where: { id },
      data: {
        title: encryptField(aesKey, name),
        name: encryptField(aesKey, name),
        sku: patch.sku !== undefined ? textValue(patch.sku) : current.sku,
        category: patch.category !== undefined ? textValue(patch.category) : current.category,
        type: patch.type !== undefined ? textValue(patch.type) ?? current.type : current.type,
        price,
        currency: patch.currency !== undefined ? textValue(patch.currency) ?? current.currency : current.currency,
        stock,
        totalQuantity: intValue(patch.totalQuantity) ?? intValue(patch.stock) ?? current.totalQuantity,
        minThreshold: patch.minThreshold !== undefined ? intValue(patch.minThreshold) ?? current.minThreshold : current.minThreshold,
        status: typeof patch.status === "string" ? patch.status : current.status,
        activities: patch.activities !== undefined ? jsonArray(patch.activities) : jsonInputOrDefault(current.activities, []),
        comments: patch.comments !== undefined
          ? encryptJsonField(aesKey, jsonArray(patch.comments)) as any
          : current.comments,
        payload: productPayload(patch, current.payload),
        updatedById: ctx.userId,
      },
      select: PRODUCT_SELECT,
    });
    await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Updated", entityType: ENTITY, entityId: id, entityName: name });
    return mapProduct(updated, aesKey);
  } finally {
    aesKey.fill(0);
  }
}

export async function deleteProduct(id: string) {
  const ctx = await requirePermission("products.delete");
  const current = await prisma.product.findFirst({ where: { id, organizationId: ctx.tenantId }, select: { title: true } });
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
  const result = await prisma.product.deleteMany({ where: { id, organizationId: ctx.tenantId } });
  if (result.count === 0) return null;
  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Deleted", entityType: ENTITY, entityId: id, entityName });
  return { id };
}
