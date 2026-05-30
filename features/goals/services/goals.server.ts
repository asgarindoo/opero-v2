import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/server/auth-utils";
import { createPayload, getStatus, getTitle, logDomainActivity, mapDomainRecord, parsePayload } from "@/lib/api/domain-utils";

const MODULE = "GOALS";
const ENTITY = "Goal";

export async function listGoals() {
  const ctx = await requireTenant();
  const goals = await prisma.goal.findMany({ where: { organizationId: ctx.tenantId }, orderBy: { createdAt: "desc" }, include: { createdBy: { select: { id: true, name: true, email: true, image: true } } } });
  return goals.map((goal) => mapDomainRecord(goal));
}

export async function getGoalById(id: string) {
  const ctx = await requireTenant();
  const goal = await prisma.goal.findFirst({ where: { id, organizationId: ctx.tenantId }, include: { createdBy: { select: { id: true, name: true, email: true, image: true } } } });
  return goal ? mapDomainRecord(goal) : null;
}

export async function createGoal(data: Record<string, unknown>) {
  const ctx = await requireTenant();
  const title = getTitle(data);

  if (!title || title.trim() === "" || title.trim() === "Untitled") {
    throw new Error("Goal title is required and cannot be empty.");
  }

  const targetOutcome = typeof data.targetOutcome === "string" ? data.targetOutcome.trim() : "";
  if (!targetOutcome) {
    throw new Error("Target outcome is required and cannot be empty.");
  }

  const status = typeof data.status === "string" ? data.status.trim() : "";
  if (!status) {
    throw new Error("Planning status is required.");
  }

  const goal = await prisma.goal.create({ data: { id: typeof data.id === "string" && data.id ? data.id : crypto.randomUUID(), organizationId: ctx.tenantId, title, status: getStatus(data), payload: createPayload(data), createdById: ctx.userId, updatedById: ctx.userId } });
  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Created", entityType: ENTITY, entityId: goal.id, entityName: title, description: typeof data.description === "string" ? data.description : null });
  return mapDomainRecord(goal, ctx.user);
}

export async function updateGoal(id: string, patch: Record<string, unknown>) {
  const ctx = await requireTenant();
  const current = await prisma.goal.findFirst({ where: { id, organizationId: ctx.tenantId } });
  if (!current) return null;

  if (patch.title !== undefined || patch.name !== undefined) {
    const newTitle = getTitle(patch);
    if (!newTitle || newTitle.trim() === "" || newTitle.trim() === "Untitled") {
      throw new Error("Goal title cannot be empty.");
    }
  }

  if (patch.targetOutcome !== undefined) {
    const targetOutcome = typeof patch.targetOutcome === "string" ? patch.targetOutcome.trim() : "";
    if (!targetOutcome) {
      throw new Error("Target outcome cannot be empty.");
    }
  }

  if (patch.status !== undefined) {
    const status = typeof patch.status === "string" ? patch.status.trim() : "";
    if (!status) {
      throw new Error("Planning status cannot be empty.");
    }
  }

  const result = await prisma.goal.updateMany({ where: { id, organizationId: ctx.tenantId }, data: { title: getTitle(patch, current.title ?? "Untitled"), status: typeof patch.status === "string" ? patch.status : current.status, payload: { ...parsePayload(current.payload), ...patch }, updatedById: ctx.userId } });
  if (result.count === 0) return null;
  const updated = await prisma.goal.findFirst({ where: { id, organizationId: ctx.tenantId }, include: { createdBy: { select: { id: true, name: true, email: true, image: true } } } });
  if (!updated) return null;
  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Updated", entityType: ENTITY, entityId: id, entityName: updated.title, description: typeof patch.description === "string" ? patch.description : null });
  return mapDomainRecord(updated);
}

export async function deleteGoal(id: string) {
  const ctx = await requireTenant();
  const current = await prisma.goal.findFirst({ where: { id, organizationId: ctx.tenantId } });
  if (!current) return null;
  const result = await prisma.goal.deleteMany({ where: { id, organizationId: ctx.tenantId } });
  if (result.count === 0) return null;
  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Deleted", entityType: ENTITY, entityId: id, entityName: current.title });
  return { id };
}
