import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/server/auth-utils";
import { getStatus, getTitle, logDomainActivity, mapDomainRecord } from "@/lib/api/domain-utils";
import { intValue, jsonArray, jsonInputOrDefault, numberValue, textValue } from "@/lib/api/feature-records";

const MODULE = "SALES";
const ENTITY = "Product";

function mapProduct(record: any, fallbackUser?: { id: string; name: string; email?: string | null; image?: string | null }) {
  const mapped = mapDomainRecord(record, fallbackUser) as any;
  return {
    ...mapped,
    sku: mapped.sku ?? "SKU-TBD",
    activities: Array.isArray(mapped.activities) ? mapped.activities : [],
    comments: Array.isArray(mapped.comments) ? mapped.comments : [],
  };
}

function buildProductCreateData(data: Record<string, unknown>) {
  const name = textValue(data.name) ?? getTitle(data);
  const sku = textValue(data.sku);
  const stock = intValue(data.stock) ?? intValue(data.totalQuantity) ?? 0;

  return {
    title: name,
    name,
    sku,
    category: textValue(data.category) ?? "Uncategorized",
    type: textValue(data.type) ?? "Physical",
    price: numberValue(data.price) ?? 0,
    currency: textValue(data.currency) ?? "USD",
    stock,
    totalQuantity: intValue(data.totalQuantity) ?? stock,
    minThreshold: intValue(data.minThreshold) ?? 10,
    status: getStatus(data, "Active"),
    activities: jsonArray(data.activities),
    comments: jsonArray(data.comments),
  };
}

export async function listProducts() {
  const ctx = await requireTenant();
  const products = await prisma.product.findMany({ where: { organizationId: ctx.tenantId }, orderBy: { createdAt: "desc" }, include: { createdBy: { select: { id: true, name: true, email: true, image: true } } } });
  return products.map((product: any) => mapProduct(product));
}

export async function getProductById(id: string) {
  const ctx = await requireTenant();
  const product = await prisma.product.findFirst({ where: { id, organizationId: ctx.tenantId }, include: { createdBy: { select: { id: true, name: true, email: true, image: true } } } });
  return product ? mapProduct(product) : null;
}

export async function createProduct(data: Record<string, unknown>) {
  const ctx = await requireTenant();
  const productData = buildProductCreateData(data);
  const product = await prisma.product.create({
    data: {
      id: typeof data.id === "string" && data.id ? data.id : crypto.randomUUID(),
      organizationId: ctx.tenantId,
      ...productData,
      createdById: ctx.userId,
      updatedById: ctx.userId,
    },
  });
  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Created", entityType: ENTITY, entityId: product.id, entityName: product.name ?? product.title });
  return mapProduct(product, ctx.user);
}

export async function updateProduct(id: string, patch: Record<string, unknown>) {
  const ctx = await requireTenant();
  const current = await prisma.product.findFirst({ where: { id, organizationId: ctx.tenantId } });
  if (!current) return null;
  const name = textValue(patch.name) ?? textValue(patch.title) ?? current.name ?? current.title ?? "Untitled";
  const stock = intValue(patch.stock) ?? intValue(patch.totalQuantity) ?? current.stock;
  const updated = await prisma.product.update({
    where: { id },
    data: {
      title: name,
      name,
      sku: patch.sku !== undefined ? textValue(patch.sku) : current.sku,
      category: patch.category !== undefined ? textValue(patch.category) : current.category,
      type: patch.type !== undefined ? textValue(patch.type) ?? current.type : current.type,
      price: patch.price !== undefined ? numberValue(patch.price) ?? current.price : current.price,
      currency: patch.currency !== undefined ? textValue(patch.currency) ?? current.currency : current.currency,
      stock,
      totalQuantity: intValue(patch.totalQuantity) ?? intValue(patch.stock) ?? current.totalQuantity,
      minThreshold: patch.minThreshold !== undefined ? intValue(patch.minThreshold) ?? current.minThreshold : current.minThreshold,
      status: typeof patch.status === "string" ? patch.status : current.status,
      activities: patch.activities !== undefined ? jsonArray(patch.activities) : jsonInputOrDefault(current.activities, []),
      comments: patch.comments !== undefined ? jsonArray(patch.comments) : jsonInputOrDefault(current.comments, []),
      updatedById: ctx.userId,
    },
    include: { createdBy: { select: { id: true, name: true, email: true, image: true } } },
  });
  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Updated", entityType: ENTITY, entityId: id, entityName: updated.name ?? updated.title });
  return mapProduct(updated);
}

export async function deleteProduct(id: string) {
  const ctx = await requireTenant();
  const current = await prisma.product.findFirst({ where: { id, organizationId: ctx.tenantId } });
  if (!current) return null;
  const result = await prisma.product.deleteMany({ where: { id, organizationId: ctx.tenantId } });
  if (result.count === 0) return null;
  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Deleted", entityType: ENTITY, entityId: id, entityName: current.title });
  return { id };
}
