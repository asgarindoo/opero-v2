import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/server/rbac";
import { decryptField, encryptField, getTenantAesKey } from "@/lib/server/crypto/tenant-crypto";
import { getStatus, getTitle, logDomainActivity, mapDomainRecord } from "@/lib/api/domain-utils";

const MODULE = "FLOWS";
const ENTITY = "Flow";

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

function decryptFlowRecord(record: any, aesKey: Buffer) {
  return {
    ...record,
    title: typeof record.title === "string" ? decryptField(aesKey, record.title) : record.title,
    name: typeof record.name === "string" ? decryptField(aesKey, record.name) : record.name,
    description: typeof record.description === "string" ? decryptField(aesKey, record.description) : record.description,
    stages: decryptJsonField(aesKey, record.stages, []),
    notes: decryptJsonField(aesKey, record.notes, []),
  };
}

function mapFlow(record: any, aesKey: Buffer, fallbackUser?: { id: string; name: string; email?: string | null; image?: string | null }) {
  const decrypted = decryptFlowRecord(record, aesKey);
  return mapDomainRecord(decrypted, fallbackUser);
}

function parseDate(value: unknown): Date | undefined {
  if (typeof value !== "string" || !value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function normalizeStage(stage: unknown, index: number) {
  const data = stage && typeof stage === "object" ? stage as Record<string, unknown> : {};
  const checklist = Array.isArray(data.checklist)
    ? data.checklist
      .filter((item) => item && typeof item === "object")
      .map((item, itemIndex) => {
        const value = item as Record<string, unknown>;
        return {
          id: typeof value.id === "string" && value.id ? value.id : `item-${index + 1}-${itemIndex + 1}`,
          text: typeof value.text === "string" ? value.text : "",
          isCompleted: Boolean(value.isCompleted),
        };
      })
    : [];

  return {
    id: typeof data.id === "string" && data.id ? data.id : `stage-${index + 1}`,
    name: typeof data.name === "string" && data.name.trim() ? data.name.trim() : `Stage ${index + 1}`,
    description: typeof data.description === "string" ? data.description : undefined,
    isCompleted: typeof data.isCompleted === "boolean" ? data.isCompleted : data.status === "Done",
    checklist,
    order: typeof data.order === "number" ? data.order : index,
  };
}

function normalizeStages(value: unknown) {
  return Array.isArray(value) ? value.map(normalizeStage) : [];
}

function buildFlowColumns(data: Record<string, unknown>, current: Record<string, unknown> = {}) {
  const merged = { ...current, ...data };
  return {
    name: getTitle(merged),
    category: typeof merged.category === "string" && merged.category ? merged.category : "Operations",
    description: typeof merged.description === "string" ? merged.description : null,
    progress: typeof merged.progress === "number" ? merged.progress : 0,
    stages: normalizeStages(merged.stages),
    notes: Array.isArray(merged.notes) ? merged.notes : [],
    dueDate: parseDate(merged.dueDate),
  };
}

export async function listFlows() {
  const ctx = await requirePermission("flows.read");
  const flows = await prisma.flow.findMany({
    where: { organizationId: ctx.tenantId },
    orderBy: { createdAt: "desc" },
    include: { createdBy: { select: { id: true, name: true, email: true, image: true } } },
  });
  const aesKey = await getTenantAesKey(ctx.tenantId);
  try {
    return flows.map((flow) => mapFlow(flow, aesKey));
  } finally {
    aesKey.fill(0);
  }
}

export async function getFlowById(id: string) {
  const ctx = await requirePermission("flows.read");
  const flow = await prisma.flow.findFirst({
    where: { id, organizationId: ctx.tenantId },
    include: { createdBy: { select: { id: true, name: true, email: true, image: true } } },
  });
  if (!flow) return null;
  const aesKey = await getTenantAesKey(ctx.tenantId);
  try {
    return mapFlow(flow, aesKey);
  } finally {
    aesKey.fill(0);
  }
}

export async function createFlow(data: Record<string, unknown>) {
  const ctx = await requirePermission("flows.create");
  const title = getTitle(data);

  if (!title || title.trim() === "" || title.trim() === "Untitled") {
    throw new Error("Flow name is required and cannot be empty.");
  }

  const stages = Array.isArray(data.stages) ? data.stages : [];
  if (stages.length === 0) {
    throw new Error("At least one stage is required.");
  }
  for (let i = 0; i < stages.length; i++) {
    const s = stages[i];
    if (!s || typeof s !== "object" || !s.name || !s.name.trim()) {
      throw new Error(`Stage ${i + 1} name is required.`);
    }
  }

  const columns = buildFlowColumns(data);
  const aesKey = await getTenantAesKey(ctx.tenantId);

  try {
    const flow = await prisma.flow.create({
      data: {
        id: typeof data.id === "string" && data.id ? data.id : crypto.randomUUID(),
        organizationId: ctx.tenantId,
        title: encryptField(aesKey, title),
        name: encryptField(aesKey, columns.name) ?? columns.name,
        status: getStatus(data, "Active"),
        category: columns.category,
        description: encryptField(aesKey, columns.description),
        progress: columns.progress,
        stages: encryptJsonField(aesKey, columns.stages) as any,
        notes: encryptJsonField(aesKey, columns.notes) as any,
        dueDate: columns.dueDate,
        createdById: ctx.userId,
        updatedById: ctx.userId,
      },
    });
    await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Created", entityType: ENTITY, entityId: flow.id, entityName: title, description: typeof data.description === "string" ? data.description : null });
    return mapFlow(flow, aesKey, ctx.user);
  } finally {
    aesKey.fill(0);
  }
}

export async function updateFlow(id: string, patch: Record<string, unknown>) {
  const ctx = await requirePermission("flows.update");
  const current = await prisma.flow.findFirst({ where: { id, organizationId: ctx.tenantId } });
  if (!current) return null;

  if (patch.name !== undefined || patch.title !== undefined) {
    const newTitle = getTitle(patch);
    if (!newTitle || newTitle.trim() === "" || newTitle.trim() === "Untitled") {
      throw new Error("Flow name cannot be empty.");
    }
  }

  if (patch.stages !== undefined) {
    const stages = Array.isArray(patch.stages) ? patch.stages : [];
    if (stages.length === 0) throw new Error("At least one stage is required.");
    for (let i = 0; i < stages.length; i++) {
      const s = stages[i];
      if (!s || typeof s !== "object" || !s.name || !s.name.trim()) {
        throw new Error(`Stage ${i + 1} name is required.`);
      }
    }
  }

  const aesKey = await getTenantAesKey(ctx.tenantId);
  try {
    const currentPlain = decryptFlowRecord(current, aesKey);
    const columns = buildFlowColumns(patch, currentPlain as Record<string, unknown>);
    const title = patch.name !== undefined || patch.title !== undefined
      ? getTitle(patch, currentPlain.title ?? "Untitled")
      : (currentPlain.title ?? "Untitled");

    const result = await prisma.flow.updateMany({
      where: { id, organizationId: ctx.tenantId },
      data: {
        title: encryptField(aesKey, title),
        name: encryptField(aesKey, columns.name) ?? columns.name,
        status: typeof patch.status === "string" ? patch.status : current.status,
        category: columns.category,
        description: encryptField(aesKey, columns.description),
        progress: columns.progress,
        stages: encryptJsonField(aesKey, columns.stages) as any,
        notes: encryptJsonField(aesKey, columns.notes) as any,
        dueDate: columns.dueDate,
        updatedById: ctx.userId,
      },
    });
    if (result.count === 0) return null;
    const updated = await prisma.flow.findFirst({ where: { id, organizationId: ctx.tenantId }, include: { createdBy: { select: { id: true, name: true, email: true, image: true } } } });
    if (!updated) return null;
    await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Updated", entityType: ENTITY, entityId: id, entityName: title, description: typeof patch.description === "string" ? patch.description : null });
    return mapFlow(updated, aesKey);
  } finally {
    aesKey.fill(0);
  }
}

export async function deleteFlow(id: string) {
  const ctx = await requirePermission("flows.delete");
  const current = await prisma.flow.findFirst({ where: { id, organizationId: ctx.tenantId }, select: { title: true } });
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
  const result = await prisma.flow.deleteMany({ where: { id, organizationId: ctx.tenantId } });
  if (result.count === 0) return null;
  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Deleted", entityType: ENTITY, entityId: id, entityName });
  return { id };
}
