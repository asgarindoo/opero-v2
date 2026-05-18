import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/server/auth-utils";
import type { Prisma } from "@prisma/client";

const MODULE_BY_TYPE: Record<string, string> = {
  tasks: "TASKS",
  flows: "FLOWS",
  campaigns: "CAMPAIGNS",
  contacts: "TEAM",
  members: "TEAM",
  roles: "TEAM",
  goals: "GOALS",
  sales: "SALES",
  invoices: "FINANCE",
  finance: "FINANCE",
  inventory: "SYSTEM",
  assets: "DOCUMENTS",
  documents: "DOCUMENTS",
  "document-folders": "DOCUMENTS",
  bots: "SYSTEM",
  reports: "SYSTEM",
  "social-channels": "MARKETING",
  "social-scheduled": "MARKETING",
  "social-activity": "MARKETING",
  "content-posts": "MARKETING",
  "content-assets": "MARKETING",
  "chat-channels": "SYSTEM",
  "chat-messages": "SYSTEM",
};

const ENTITY_BY_TYPE: Record<string, string> = {
  tasks: "Task",
  flows: "Flow",
  campaigns: "Campaign",
  contacts: "Contact",
  roles: "Role",
  goals: "Goal",
  sales: "Sale",
  invoices: "Invoice",
  finance: "Transaction",
  inventory: "Product",
  assets: "Asset",
  documents: "Document",
  "document-folders": "Folder",
  bots: "Bot",
  reports: "Report",
  "social-channels": "Social Channel",
  "social-scheduled": "Schedule",
  "social-activity": "Social Activity",
  "content-posts": "Content Post",
  "content-assets": "Content Asset",
  "chat-channels": "Chat Channel",
  "chat-messages": "Chat Message",
};

const ACTION_CATEGORY: Record<string, string> = {
  Created: "INFO",
  Updated: "UPDATE",
  Deleted: "WARNING",
};

function toRecordData(record: { id: string; data: Prisma.JsonValue; createdAt?: Date; updatedAt?: Date }) {
  const data = (record.data ?? {}) as Prisma.JsonObject;
  return {
    ...data,
    recordId: record.id,
    recordCreatedAt: record.createdAt?.toISOString(),
    recordUpdatedAt: record.updatedAt?.toISOString(),
  } as Record<string, unknown>;
}

function getEntityName(data: Record<string, unknown>): string {
  const name =
    (typeof data.name === "string" && data.name) ||
    (typeof data.title === "string" && data.title) ||
    (typeof data.invoiceNumber === "string" && data.invoiceNumber) ||
    (typeof data.orderNumber === "string" && data.orderNumber) ||
    (typeof data.label === "string" && data.label) ||
    "Untitled";
  return name;
}

async function logTenantActivity(params: {
  tenantId: string;
  userId: string;
  type: string;
  action: "Created" | "Updated" | "Deleted";
  entityId?: string | null;
  entityName?: string | null;
  description?: string | null;
}) {
  const module = MODULE_BY_TYPE[params.type] ?? "SYSTEM";
  const entityType = ENTITY_BY_TYPE[params.type] ?? "Record";

  await prisma.tenantActivity.create({
    data: {
      organizationId: params.tenantId,
      module,
      action: params.action,
      entityId: params.entityId ?? null,
      entityType,
      entityName: params.entityName ?? null,
      description: params.description ?? null,
      userId: params.userId,
    },
  });
}

export async function listTenantRecords(type: string) {
  const ctx = await requireTenant();

  const records = await prisma.tenantRecord.findMany({
    where: { organizationId: ctx.tenantId, type },
    orderBy: { createdAt: "desc" },
  });

  return records.map(toRecordData);
}

export async function createTenantRecord(type: string, data: Record<string, unknown>) {
  const ctx = await requireTenant();
  const recordId = crypto.randomUUID();

  const record = await prisma.tenantRecord.create({
    data: {
      id: recordId,
      organizationId: ctx.tenantId,
      type,
      data,
      createdById: ctx.userId,
      updatedById: ctx.userId,
    },
  });

  const entityId = typeof data.id === "string" ? data.id : recordId;
  await logTenantActivity({
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    type,
    action: "Created",
    entityId,
    entityName: getEntityName(data),
    description: typeof data.description === "string" ? data.description : null,
  });

  return toRecordData(record);
}

export async function updateTenantRecord(type: string, recordId: string, patch: Record<string, unknown>) {
  const ctx = await requireTenant();
  const record = await prisma.tenantRecord.findFirst({
    where: { id: recordId, organizationId: ctx.tenantId, type },
  });

  if (!record) {
    return null;
  }

  const current = (record.data ?? {}) as Prisma.JsonObject;
  const merged = { ...current, ...patch } as Prisma.JsonObject;

  const updated = await prisma.tenantRecord.update({
    where: { id: recordId },
    data: {
      data: merged,
      updatedById: ctx.userId,
    },
  });

  const entityId = typeof merged.id === "string" ? (merged.id as string) : recordId;
  await logTenantActivity({
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    type,
    action: "Updated",
    entityId,
    entityName: getEntityName(merged as Record<string, unknown>),
    description: typeof merged.description === "string" ? (merged.description as string) : null,
  });

  return toRecordData(updated);
}

export async function deleteTenantRecord(type: string, recordId: string) {
  const ctx = await requireTenant();
  const record = await prisma.tenantRecord.findFirst({
    where: { id: recordId, organizationId: ctx.tenantId, type },
  });

  if (!record) {
    return null;
  }

  const data = (record.data ?? {}) as Prisma.JsonObject;
  await prisma.tenantRecord.delete({ where: { id: recordId } });

  const entityId = typeof data.id === "string" ? (data.id as string) : recordId;
  await logTenantActivity({
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    type,
    action: "Deleted",
    entityId,
    entityName: getEntityName(data as Record<string, unknown>),
    description: typeof data.description === "string" ? (data.description as string) : null,
  });

  return toRecordData({
    id: recordId,
    data,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  } as { id: string; data: Prisma.JsonValue; createdAt?: Date; updatedAt?: Date });
}

export async function listTenantActivity(moduleFilter?: string) {
  const ctx = await requireTenant();
  const module = moduleFilter && moduleFilter !== "All" ? moduleFilter : undefined;

  const logs = await prisma.tenantActivity.findMany({
    where: {
      organizationId: ctx.tenantId,
      ...(module ? { module } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  });

  const userIds = logs.map((log) => log.userId).filter(Boolean) as string[];
  const memberRoles = userIds.length
    ? await prisma.member.findMany({
        where: { organizationId: ctx.tenantId, userId: { in: userIds } },
        select: { userId: true, role: true },
      })
    : [];

  const roleMap = new Map(memberRoles.map((m) => [m.userId, m.role]));

  return logs.map((log) => ({
    id: log.id,
    category: ACTION_CATEGORY[log.action] ?? "UPDATE",
    module: log.module,
    action: log.action,
    entityName: log.entityName ?? "Untitled",
    entityType: log.entityType ?? "Record",
    entityId: log.entityId ?? log.id,
    user: {
      id: log.user?.id ?? log.userId ?? "system",
      name: log.user?.name ?? log.user?.email ?? "System",
      role: roleMap.get(log.userId ?? "") ?? "System",
      avatar: log.user?.image ?? undefined,
    },
    timestamp: log.createdAt.toISOString(),
    description: log.description ?? undefined,
  }));
}
