import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/server/auth-utils";
import { createPayload, getStatus, getTitle, logDomainActivity, mapDomainRecord, parsePayload } from "./domain-utils";

const MODULE = "SYSTEM";
const ENTITY = "Product";

export async function listProducts() {
  const ctx = await requireTenant();
  const products = await prisma.product.findMany({ where: { organizationId: ctx.tenantId }, orderBy: { createdAt: "desc" }, include: { createdBy: { select: { id: true, name: true, image: true } } } });
  return products.map((product) => mapDomainRecord(product));
}

export async function getProductById(id: string) {
  const ctx = await requireTenant();
  const product = await prisma.product.findFirst({ where: { id, organizationId: ctx.tenantId }, include: { createdBy: { select: { id: true, name: true, image: true } } } });
  return product ? mapDomainRecord(product) : null;
}

export async function createProduct(data: Record<string, unknown>) {
  const ctx = await requireTenant();
  const title = getTitle(data);
  const product = await prisma.product.create({ data: { id: typeof data.id === "string" && data.id ? data.id : crypto.randomUUID(), organizationId: ctx.tenantId, title, status: getStatus(data, "Active"), payload: createPayload(data), createdById: ctx.userId, updatedById: ctx.userId } });
  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Created", entityType: ENTITY, entityId: product.id, entityName: title, description: typeof data.description === "string" ? data.description : null });
  return mapDomainRecord(product, ctx.user);
}

export async function updateProduct(id: string, patch: Record<string, unknown>) {
  const ctx = await requireTenant();
  const current = await prisma.product.findFirst({ where: { id, organizationId: ctx.tenantId } });
  if (!current) return null;
  const result = await prisma.product.updateMany({ where: { id, organizationId: ctx.tenantId }, data: { title: getTitle(patch, current.title ?? "Untitled"), status: typeof patch.status === "string" ? patch.status : current.status, payload: { ...parsePayload(current.payload), ...patch }, updatedById: ctx.userId } });
  if (result.count === 0) return null;
  const updated = await prisma.product.findFirst({ where: { id, organizationId: ctx.tenantId }, include: { createdBy: { select: { id: true, name: true, image: true } } } });
  if (!updated) return null;
  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Updated", entityType: ENTITY, entityId: id, entityName: updated.title, description: typeof patch.description === "string" ? patch.description : null });
  return mapDomainRecord(updated);
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
