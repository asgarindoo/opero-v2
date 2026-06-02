/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { normalizeUserAvatarImage } from "@/lib/server/supabase-storage";
import { getUserDisplayName, type UserIdentity } from "@/lib/user-identity";

export type DomainAction = "Created" | "Updated" | "Deleted";

export function parsePayload(payload: unknown): Record<string, any> {
  if (!payload) return {};
  if (typeof payload === "string") {
    try {
      return JSON.parse(payload);
    } catch {
      return {};
    }
  }
  if (typeof payload !== "object" || Array.isArray(payload)) return {};
  return payload as Record<string, any>;
}

export function getTitle(data: Record<string, unknown>, fallback = "Untitled") {
  return (
    (typeof data.title === "string" && data.title.trim()) ||
    (typeof data.name === "string" && data.name.trim()) ||
    (typeof data.label === "string" && data.label.trim()) ||
    (typeof data.invoiceNumber === "string" && data.invoiceNumber.trim()) ||
    fallback
  );
}

export function getStatus(data: Record<string, unknown>, fallback = "Pending") {
  return typeof data.status === "string" && data.status ? data.status : fallback;
}

export function createPayload(data: Record<string, unknown>) {
  const title = getTitle(data);
  return {
    ...data,
    name: (data.name as string | undefined) ?? title,
  };
}

function normalizeRecordUser(user: UserIdentity | null | undefined, fallback = "System") {
  if (!user) return null;

  const id = user.id ?? user.userId ?? "system";

  return {
    ...user,
    id,
    name: getUserDisplayName(user, fallback),
    email: user.email ?? undefined,
    image: id === "system" ? getUserImageLike(user) : normalizeUserAvatarImage(id, getUserImageLike(user)),
  };
}

function getUserImageLike(user: UserIdentity | null | undefined) {
  return user?.image ?? user?.avatar ?? null;
}

const RECORD_RELATION_KEYS = new Set(["payload", "createdBy", "updatedBy", "organization", "folder", "uploadedBy", "sale", "targetAccount"]);

function serializeRecordValue(value: unknown) {
  if (value instanceof Date) return value.toISOString();
  return value;
}

function explicitRecordData(record: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(record)
      .filter(([key, value]) => !RECORD_RELATION_KEYS.has(key) && value !== null && value !== undefined)
      .map(([key, value]) => [key, serializeRecordValue(value)])
  );
}

function firstDefined(...values: unknown[]) {
  return values.find((value) => value !== undefined && value !== null && value !== "");
}

function isoDateValue(value: unknown) {
  if (value instanceof Date) return value.toISOString();
  return typeof value === "string" && value ? value : undefined;
}

export function mapDomainRecord(record: any, fallbackUser?: { id: string; name: string; email?: string | null; image?: string | null }) {
  const ownerSource = normalizeRecordUser(record.createdBy ?? fallbackUser);
  const explicitData = explicitRecordData(record);
  const dueDate = firstDefined(isoDateValue(record.dueDate));
  const plannedDate = firstDefined(isoDateValue(record.plannedDate));
  const saleNumber = firstDefined(record.saleNumber);
  const invoiceNumber = firstDefined(record.invoiceNumber);
  const grandTotal = firstDefined(record.grandTotal, record.totalAmount);
  const discountAmount = firstDefined(record.discountAmount, record.discountTotal);
  const taxAmount = firstDefined(record.taxAmount, record.taxTotal);

  return {
    ...explicitData,
    id: record.id,
    name: record.name ?? record.accountName ?? record.title ?? "Untitled",
    title: record.title,
    description: record.description ?? "",
    status: record.status,
    category: record.category,
    progress: record.progress,
    stages: record.stages ?? [],
    notes: record.notes ?? [],
    dueDate,
    due: dueDate,
    date: plannedDate,
    plannedDate,
    time: record.plannedTime,
    type: record.type ?? record.contentType,
    contentType: record.contentType ?? record.type,
    orderNumber: saleNumber,
    saleNumber,
    invoiceNumber,
    contactName: record.contactName,
    total: grandTotal,
    grandTotal,
    totalAmount: firstDefined(record.totalAmount, grandTotal),
    discountAmount,
    discountTotal: firstDefined(record.discountTotal, discountAmount),
    taxAmount,
    taxTotal: firstDefined(record.taxTotal, taxAmount),
    createdBy: ownerSource,
    owner: ownerSource
      ? {
          id: ownerSource.id ?? "system",
          name: ownerSource.name,
          email: ownerSource.email ?? undefined,
          avatar: ownerSource.image ?? undefined,
        }
      : { id: "system", name: "System", avatar: undefined },
    updated: record.updatedAt?.toISOString(),
    labels: record.labels ?? [],
    assignees: record.assignees ?? [],
    checklist: record.checklist ?? [],
    attachments: record.attachments ?? [],
    comments: record.comments ?? [],
    activity: record.activity ?? [],
    recordId: record.id,
    recordCreatedAt: record.createdAt?.toISOString(),
    recordUpdatedAt: record.updatedAt?.toISOString(),
  };
}

export async function logDomainActivity(params: {
  tenantId: string;
  userId: string;
  module: string;
  action: DomainAction;
  entityType: string;
  entityId?: string | null;
  entityName?: string | null;
  description?: string | null;
}) {
  await prisma.tenantActivity.create({
    data: {
      organizationId: params.tenantId,
      module: params.module,
      action: params.action,
      entityId: params.entityId ?? null,
      entityType: params.entityType,
      entityName: params.entityName ?? null,
      description: params.description ?? null,
      userId: params.userId,
    },
  });
}
