import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/server/auth-utils";
import { createPayload, getStatus, getTitle, logDomainActivity, mapDomainRecord, parsePayload } from "@/lib/api/domain-utils";

const MODULE = "TASKS";
const ENTITY = "Task";
// Trigger TS refresh

export async function listTasks() {
  const ctx = await requireTenant();
  const tasks = await prisma.task.findMany({
    where: { organizationId: ctx.tenantId },
    orderBy: { createdAt: "desc" },
    include: { createdBy: { select: { id: true, name: true, image: true } } },
  });
  return tasks.map((task: any) => mapDomainRecord(task));
}

export async function listCampaignTasks(campaignId: string) {
  const ctx = await requireTenant();
  const tasks = await prisma.task.findMany({
    where: { organizationId: ctx.tenantId, campaignId },
    orderBy: { createdAt: "desc" },
    include: { createdBy: { select: { id: true, name: true, image: true } } },
  });
  return tasks.map((task: any) => mapDomainRecord(task));
}

export async function getTaskById(id: string) {
  const ctx = await requireTenant();
  const task = await prisma.task.findFirst({
    where: { id, organizationId: ctx.tenantId },
    include: { createdBy: { select: { id: true, name: true, image: true } } },
  });
  return task ? mapDomainRecord(task) : null;
}

export async function createTask(data: Record<string, unknown>) {
  const ctx = await requireTenant();
  const title = getTitle(data);
  const task = await prisma.task.create({
    data: {
      id: typeof data.id === "string" && data.id ? data.id : crypto.randomUUID(),
      organizationId: ctx.tenantId,
      campaignId: typeof data.campaignId === "string" ? data.campaignId : undefined,
      title,
      status: getStatus(data),
      payload: createPayload(data),
      createdById: ctx.userId,
      updatedById: ctx.userId,
    },
  });
  logDomainActivity({
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    module: MODULE,
    action: "Created",
    entityType: ENTITY,
    entityId: task.id,
    entityName: title,
    description: typeof data.description === "string" ? data.description : null,
  }).catch(console.error);
  return mapDomainRecord(task, ctx.user);
}

export async function updateTask(id: string, patch: Record<string, unknown>) {
  const ctx = await requireTenant();
  const current = await prisma.task.findUnique({ where: { id } });
  if (!current || current.organizationId !== ctx.tenantId) return null;

  const currentPayload = parsePayload(current.payload);
  const mergedPayload = { ...currentPayload, ...patch };
  
  const updated = await prisma.task.update({
    where: { id },
    data: {
      title: getTitle(patch, current.title ?? "Untitled"),
      status: typeof patch.status === "string" ? patch.status : current.status,
      campaignId: patch.campaignId !== undefined ? (patch.campaignId as string | null) : current.campaignId,
      payload: mergedPayload,
      updatedById: ctx.userId,
    },
    include: { createdBy: { select: { id: true, name: true, image: true } } },
  });

  logDomainActivity({
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    module: MODULE,
    action: "Updated",
    entityType: ENTITY,
    entityId: id,
    entityName: updated.title,
    description: typeof patch.description === "string" ? patch.description : null,
  }).catch(console.error);
  return mapDomainRecord(updated);
}

export async function deleteTask(id: string) {
  const ctx = await requireTenant();
  const current = await prisma.task.findUnique({ where: { id } });
  if (!current || current.organizationId !== ctx.tenantId) return null;

  await prisma.task.delete({ where: { id } });

  logDomainActivity({
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    module: MODULE,
    action: "Deleted",
    entityType: ENTITY,
    entityId: id,
    entityName: current.title,
  }).catch(console.error);
  return { id };
}
