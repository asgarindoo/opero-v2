/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { normalizeUserAvatarImage } from "@/lib/server/supabase-storage";
import { getUserDisplayName, type UserIdentity } from "@/lib/user-identity";

export type DomainAction = "Created" | "Updated" | "Deleted";

export function parsePayload(payload: unknown): Record<string, any> {
  if (!payload) return {};
  if (typeof payload === "string") return JSON.parse(payload);
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

export function mapDomainRecord(record: any, fallbackUser?: { id: string; name: string; email?: string | null; image?: string | null }) {
  const payloadData = parsePayload(record.payload);
  const ownerSource = normalizeRecordUser(record.createdBy ?? fallbackUser);

  return {
    ...record,
    ...payloadData,
    id: record.id,
    name: record.name ?? payloadData.name ?? record.title ?? "Untitled",
    title: record.title,
    description: record.description ?? payloadData.description ?? "",
    status: record.status ?? payloadData.status,
    category: record.category ?? payloadData.category,
    progress: record.progress ?? payloadData.progress,
    stages: record.stages ?? payloadData.stages ?? [],
    notes: record.notes ?? payloadData.notes ?? [],
    dueDate: record.dueDate?.toISOString?.() ?? payloadData.dueDate,
    createdBy: ownerSource,
    owner: ownerSource
      ? {
          id: ownerSource.id ?? "system",
          name: ownerSource.name,
          email: ownerSource.email ?? undefined,
          avatar: ownerSource.image ?? undefined,
        }
      : payloadData.owner ?? { id: "system", name: "System", avatar: undefined },
    updated: payloadData.updated ?? record.updatedAt?.toISOString(),
    labels: payloadData.labels ?? record.labels ?? [],
    assignees: payloadData.assignees ?? record.assignees ?? [],
    checklist: payloadData.checklist ?? record.checklist ?? [],
    attachments: payloadData.attachments ?? record.attachments ?? [],
    comments: payloadData.comments ?? record.comments ?? [],
    activity: payloadData.activity ?? record.activity ?? [],
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
