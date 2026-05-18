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

function getDelegate(type: string) {
  switch (type) {
    case 'tasks': return prisma.task;
    case 'flows': return prisma.flow;
    case 'campaigns': return prisma.campaign;
    case 'contacts': return prisma.contact;
    case 'roles': return prisma.role;
    case 'goals': return prisma.goal;
    case 'sales': return prisma.sale;
    case 'invoices': return prisma.invoice;
    case 'finance': return prisma.transaction;
    case 'inventory': return prisma.product;
    case 'assets': return prisma.asset;
    case 'documents': return prisma.document;
    case 'document-folders': return prisma.folder;
    case 'bots': return prisma.bot;
    case 'reports': return prisma.report;
    case 'social-channels': return prisma.socialChannel;
    case 'social-scheduled': return prisma.socialSchedule;
    case 'social-activity': return prisma.socialActivity;
    case 'content-posts': return prisma.contentPost;
    case 'content-assets': return prisma.contentAsset;
    case 'chat-channels': return prisma.chatChannel;
    case 'chat-messages': return prisma.chatMessage;
    default: return null;
  }
}

export async function listTenantRecords(type: string) {
  const ctx = await requireTenant();
  const delegate = getDelegate(type);
  if (!delegate) return [];

  const records = await (delegate as any).findMany({
    where: { organizationId: ctx.tenantId },
    orderBy: { createdAt: "desc" },
  });

  return records.map((record: any) => {
    const payloadData = record.payload
      ? (typeof record.payload === 'string' ? JSON.parse(record.payload) : record.payload)
      : {};
    return {
      ...record,
      ...payloadData,
      // Ensure array fields are never null
      labels:    payloadData.labels    ?? record.labels    ?? [],
      assignees: payloadData.assignees ?? record.assignees ?? [],
      checklist: payloadData.checklist ?? record.checklist ?? [],
      attachments: payloadData.attachments ?? record.attachments ?? [],
      comments:  payloadData.comments  ?? record.comments  ?? [],
      activity:  payloadData.activity  ?? record.activity  ?? [],
      recordId: record.id,
      recordCreatedAt: record.createdAt?.toISOString(),
      recordUpdatedAt: record.updatedAt?.toISOString(),
    };
  });
}

export async function createTenantRecord(type: string, data: Record<string, unknown>) {
  const ctx = await requireTenant();
  const delegate = getDelegate(type);
  if (!delegate) throw new Error(`Unknown record type: ${type}`);

  const { title, name, status, ...payload } = data;

  const record = await (delegate as any).create({
    data: {
      organizationId: ctx.tenantId,
      title: (title || name || data.label || data.invoiceNumber || "Untitled") as string,
      status: (status as string) || "Pending",
      payload,
      createdById: ctx.userId,
      updatedById: ctx.userId,
    },
  });

  const entityId = record.id;
  await logTenantActivity({
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    type,
    action: "Created",
    entityId,
    entityName: record.title || getEntityName(data),
    description: typeof data.description === "string" ? data.description : null,
  });

  return {
    ...record,
    ...(record.payload ? (typeof record.payload === 'string' ? JSON.parse(record.payload) : record.payload) : {}),
    recordId: record.id,
  };
}

export async function updateTenantRecord(type: string, recordId: string, patch: Record<string, unknown>) {
  const ctx = await requireTenant();
  const delegate = getDelegate(type);
  if (!delegate) throw new Error(`Unknown record type: ${type}`);

  const record = await (delegate as any).findFirst({
    where: { id: recordId, organizationId: ctx.tenantId },
  });

  if (!record) return null;

  const currentPayload = typeof record.payload === 'string' ? JSON.parse(record.payload) : (record.payload || {});
  const { title, status, id, ...patchPayload } = patch;
  
  const mergedPayload = { ...currentPayload, ...patchPayload };

  const updated = await (delegate as any).update({
    where: { id: recordId },
    data: {
      title: title !== undefined ? title : record.title,
      status: status !== undefined ? status : record.status,
      payload: mergedPayload,
      updatedById: ctx.userId,
    },
  });

  await logTenantActivity({
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    type,
    action: "Updated",
    entityId: recordId,
    entityName: updated.title || getEntityName(patch),
    description: typeof patch.description === "string" ? patch.description : null,
  });

  return {
    ...updated,
    ...(updated.payload ? (typeof updated.payload === 'string' ? JSON.parse(updated.payload) : updated.payload) : {}),
    recordId: updated.id,
  };
}

export async function deleteTenantRecord(type: string, recordId: string) {
  const ctx = await requireTenant();
  const delegate = getDelegate(type);
  if (!delegate) return null;

  const record = await (delegate as any).findFirst({
    where: { id: recordId, organizationId: ctx.tenantId },
  });

  if (!record) return null;

  await (delegate as any).delete({ where: { id: recordId } });

  await logTenantActivity({
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    type,
    action: "Deleted",
    entityId: recordId,
    entityName: record.title || "Untitled",
  });

  return { id: recordId };
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
