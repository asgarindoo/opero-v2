import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/server/auth-utils";
import { createPayload, getStatus, getTitle, logDomainActivity, mapDomainRecord, parsePayload } from "@/lib/api/domain-utils";

const MODULE = "FINANCE";
const ENTITY = "Invoice";

export async function listInvoices() {
  const ctx = await requireTenant();
  const invoices = await prisma.invoice.findMany({
    where: { organizationId: ctx.tenantId },
    orderBy: { createdAt: "desc" },
    include: { createdBy: { select: { id: true, name: true, image: true } } },
  });
  return invoices.map((invoice) => mapDomainRecord(invoice));
}

export async function getInvoiceById(id: string) {
  const ctx = await requireTenant();
  const invoice = await prisma.invoice.findFirst({
    where: { id, organizationId: ctx.tenantId },
    include: { createdBy: { select: { id: true, name: true, image: true } } },
  });
  return invoice ? mapDomainRecord(invoice) : null;
}

export async function createInvoice(data: Record<string, unknown>) {
  const ctx = await requireTenant();
  const title = getTitle(data);
  const invoice = await prisma.invoice.create({
    data: {
      id: typeof data.id === "string" && data.id ? data.id : crypto.randomUUID(),
      organizationId: ctx.tenantId,
      title,
      status: getStatus(data, "Draft"),
      payload: createPayload(data),
      createdById: ctx.userId,
      updatedById: ctx.userId,
    },
  });
  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Created", entityType: ENTITY, entityId: invoice.id, entityName: title, description: typeof data.description === "string" ? data.description : null });
  return mapDomainRecord(invoice, ctx.user);
}

export async function updateInvoice(id: string, patch: Record<string, unknown>) {
  const ctx = await requireTenant();
  const current = await prisma.invoice.findFirst({ where: { id, organizationId: ctx.tenantId } });
  if (!current) return null;
  const mergedPayload = { ...parsePayload(current.payload), ...patch };
  const result = await prisma.invoice.updateMany({
    where: { id, organizationId: ctx.tenantId },
    data: { title: getTitle(patch, current.title ?? "Untitled"), status: typeof patch.status === "string" ? patch.status : current.status, payload: mergedPayload, updatedById: ctx.userId },
  });
  if (result.count === 0) return null;
  const updated = await prisma.invoice.findFirst({ where: { id, organizationId: ctx.tenantId }, include: { createdBy: { select: { id: true, name: true, image: true } } } });
  if (!updated) return null;
  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Updated", entityType: ENTITY, entityId: id, entityName: updated.title, description: typeof patch.description === "string" ? patch.description : null });
  return mapDomainRecord(updated);
}

export async function deleteInvoice(id: string) {
  const ctx = await requireTenant();
  const current = await prisma.invoice.findFirst({ where: { id, organizationId: ctx.tenantId } });
  if (!current) return null;
  const result = await prisma.invoice.deleteMany({ where: { id, organizationId: ctx.tenantId } });
  if (result.count === 0) return null;
  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Deleted", entityType: ENTITY, entityId: id, entityName: current.title });
  return { id };
}
