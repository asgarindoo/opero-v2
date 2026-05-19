import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/server/auth-utils";
import { createPayload, getStatus, getTitle, logDomainActivity, mapDomainRecord, parsePayload } from "@/lib/api/domain-utils";

const MODULE = "FINANCE";
const ENTITY = "Transaction";

export async function listTransactions() {
  const ctx = await requireTenant();
  const transactions = await prisma.transaction.findMany({ where: { organizationId: ctx.tenantId }, orderBy: { createdAt: "desc" }, include: { createdBy: { select: { id: true, name: true, image: true } } } });
  return transactions.map((transaction) => mapDomainRecord(transaction));
}

export async function getTransactionById(id: string) {
  const ctx = await requireTenant();
  const transaction = await prisma.transaction.findFirst({ where: { id, organizationId: ctx.tenantId }, include: { createdBy: { select: { id: true, name: true, image: true } } } });
  return transaction ? mapDomainRecord(transaction) : null;
}

export async function createTransaction(data: Record<string, unknown>) {
  const ctx = await requireTenant();
  const title = getTitle(data);
  const transaction = await prisma.transaction.create({ data: { id: typeof data.id === "string" && data.id ? data.id : crypto.randomUUID(), organizationId: ctx.tenantId, title, status: getStatus(data, "Pending"), payload: createPayload(data), createdById: ctx.userId, updatedById: ctx.userId } });
  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Created", entityType: ENTITY, entityId: transaction.id, entityName: title, description: typeof data.description === "string" ? data.description : null });
  return mapDomainRecord(transaction, ctx.user);
}

export async function updateTransaction(id: string, patch: Record<string, unknown>) {
  const ctx = await requireTenant();
  const current = await prisma.transaction.findFirst({ where: { id, organizationId: ctx.tenantId } });
  if (!current) return null;
  const result = await prisma.transaction.updateMany({ where: { id, organizationId: ctx.tenantId }, data: { title: getTitle(patch, current.title ?? "Untitled"), status: typeof patch.status === "string" ? patch.status : current.status, payload: { ...parsePayload(current.payload), ...patch }, updatedById: ctx.userId } });
  if (result.count === 0) return null;
  const updated = await prisma.transaction.findFirst({ where: { id, organizationId: ctx.tenantId }, include: { createdBy: { select: { id: true, name: true, image: true } } } });
  if (!updated) return null;
  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Updated", entityType: ENTITY, entityId: id, entityName: updated.title, description: typeof patch.description === "string" ? patch.description : null });
  return mapDomainRecord(updated);
}

export async function deleteTransaction(id: string) {
  const ctx = await requireTenant();
  const current = await prisma.transaction.findFirst({ where: { id, organizationId: ctx.tenantId } });
  if (!current) return null;
  const result = await prisma.transaction.deleteMany({ where: { id, organizationId: ctx.tenantId } });
  if (result.count === 0) return null;
  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Deleted", entityType: ENTITY, entityId: id, entityName: current.title });
  return { id };
}
