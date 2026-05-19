import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/server/auth-utils";
import { createPayload, getStatus, getTitle, logDomainActivity, mapDomainRecord, parsePayload } from "@/lib/api/domain-utils";

const MODULE = "FLOWS";
const ENTITY = "Flow";

function parseDate(value: unknown): Date | undefined {
  if (typeof value !== "string" || !value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function flowColumns(data: Record<string, unknown>, current: Record<string, unknown> = {}) {
  const merged = { ...current, ...data };
  return {
    name: getTitle(merged),
    category: typeof merged.category === "string" && merged.category ? merged.category : "Operations",
    description: typeof merged.description === "string" ? merged.description : null,
    progress: typeof merged.progress === "number" ? merged.progress : 0,
    stages: Array.isArray(merged.stages) ? merged.stages : [],
    notes: Array.isArray(merged.notes) ? merged.notes : [],
    dueDate: parseDate(merged.dueDate),
  };
}

export async function listFlows() {
  const ctx = await requireTenant();
  const flows = await prisma.flow.findMany({
    where: { organizationId: ctx.tenantId },
    orderBy: { createdAt: "desc" },
    include: { createdBy: { select: { id: true, name: true, image: true } } },
  });
  return flows.map((flow) => mapDomainRecord(flow));
}

export async function getFlowById(id: string) {
  const ctx = await requireTenant();
  const flow = await prisma.flow.findFirst({
    where: { id, organizationId: ctx.tenantId },
    include: { createdBy: { select: { id: true, name: true, image: true } } },
  });
  return flow ? mapDomainRecord(flow) : null;
}

export async function createFlow(data: Record<string, unknown>) {
  const ctx = await requireTenant();
  const title = getTitle(data);
  const flow = await prisma.flow.create({
    data: {
      id: typeof data.id === "string" && data.id ? data.id : crypto.randomUUID(),
      organizationId: ctx.tenantId,
      title,
      status: getStatus(data, "Active"),
      payload: createPayload(data),
      ...flowColumns(data),
      createdById: ctx.userId,
      updatedById: ctx.userId,
    },
  });
  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Created", entityType: ENTITY, entityId: flow.id, entityName: title, description: typeof data.description === "string" ? data.description : null });
  return mapDomainRecord(flow, ctx.user);
}

export async function updateFlow(id: string, patch: Record<string, unknown>) {
  const ctx = await requireTenant();
  const current = await prisma.flow.findFirst({ where: { id, organizationId: ctx.tenantId } });
  if (!current) return null;
  const currentPayload = parsePayload(current.payload);
  const mergedPayload = { ...currentPayload, ...patch };
  const result = await prisma.flow.updateMany({
    where: { id, organizationId: ctx.tenantId },
    data: { title: getTitle(patch, current.title ?? "Untitled"), status: typeof patch.status === "string" ? patch.status : current.status, payload: mergedPayload, ...flowColumns(patch, currentPayload), updatedById: ctx.userId },
  });
  if (result.count === 0) return null;
  const updated = await prisma.flow.findFirst({ where: { id, organizationId: ctx.tenantId }, include: { createdBy: { select: { id: true, name: true, image: true } } } });
  if (!updated) return null;
  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Updated", entityType: ENTITY, entityId: id, entityName: updated.title, description: typeof patch.description === "string" ? patch.description : null });
  return mapDomainRecord(updated);
}

export async function deleteFlow(id: string) {
  const ctx = await requireTenant();
  const current = await prisma.flow.findFirst({ where: { id, organizationId: ctx.tenantId } });
  if (!current) return null;
  const result = await prisma.flow.deleteMany({ where: { id, organizationId: ctx.tenantId } });
  if (result.count === 0) return null;
  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Deleted", entityType: ENTITY, entityId: id, entityName: current.title });
  return { id };
}
