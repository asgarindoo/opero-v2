import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { TenantContext } from "@/lib/server/auth-utils";
import { requirePermission } from "@/lib/server/rbac";
import { decryptField, encryptField, getTenantAesKey } from "@/lib/server/crypto/tenant-crypto";
import { tenantRls } from "@/lib/server/tenant-rls";
import { normalizeUserAvatarImage } from "@/lib/server/supabase-storage";
import { getUserDisplayName, getUserInitials, type UserIdentity } from "@/lib/user-identity";
import { getStatus, getTitle, logDomainActivity, mapDomainRecord } from "@/lib/api/domain-utils";
import { dateValue, firstStringFromArray, jsonArray, jsonInputOrDefault, textValue } from "@/lib/api/feature-records";

const MODULE = "TASKS";
const ENTITY = "Task";

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

function decryptTaskRecord(record: any, aesKey: Buffer) {
  return {
    ...record,
    title: typeof record.title === "string" ? decryptField(aesKey, record.title) : record.title,
    description: typeof record.description === "string" ? decryptField(aesKey, record.description) : record.description,
    checklist: decryptJsonField(aesKey, record.checklist, []),
    comments: decryptJsonField(aesKey, record.comments, []),
  };
}

async function getMemberIdentityMap(ctx: TenantContext) {
  const members = await prisma.member.findMany({
    where: { organizationId: ctx.tenantId, status: "active" },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  });

  return new Map(
    members.map((member) => {
      const user = {
        id: member.userId,
        name: getUserDisplayName(member.user, "Member"),
        email: member.user.email,
        image: normalizeUserAvatarImage(member.userId, member.user.image),
      };
      return [member.userId, user];
    })
  );
}

function resolveTaskMember(snapshot: UserIdentity, identities: Map<string, UserIdentity>) {
  const userId = snapshot.id ?? snapshot.userId ?? "";
  const current = userId ? identities.get(userId) : undefined;
  const identity = current ?? {
    id: userId,
    name: getUserDisplayName(snapshot, "Member"),
    email: snapshot.email ?? null,
    image: userId ? normalizeUserAvatarImage(userId, snapshot.image ?? snapshot.avatar ?? null) : snapshot.image ?? snapshot.avatar ?? null,
  };

  return {
    ...snapshot,
    id: identity.id ?? userId,
    name: getUserDisplayName(identity, "Member"),
    email: identity.email ?? undefined,
    image: identity.image ?? null,
    initials: getUserInitials(identity),
  };
}

function hydrateTaskIdentity(task: any, identities: Map<string, UserIdentity>) {
  const assignees = Array.isArray(task.assignees)
    ? task.assignees.map((assignee: UserIdentity) => resolveTaskMember(assignee, identities))
    : [];

  const comments = Array.isArray(task.comments)
    ? task.comments.map((comment: any) => {
      const userId = typeof comment.userId === "string" ? comment.userId : "";
      const identity = userId ? identities.get(userId) : null;

      if (!identity) return comment;

      return {
        ...comment,
        author: getUserDisplayName(identity, comment.author ?? "Member"),
        email: identity.email ?? comment.email,
        avatar: identity.image ?? comment.avatar ?? null,
        initials: getUserInitials(identity),
      };
    })
    : [];

  return {
    ...task,
    assignees,
    comments,
  };
}

async function mapTaskRecords(ctx: TenantContext, records: any[], aesKey: Buffer) {
  const identities = await getMemberIdentityMap(ctx);
  return records.map((task) => {
    const decrypted = decryptTaskRecord(task, aesKey);
    return hydrateTaskIdentity(mapDomainRecord(decrypted), identities);
  });
}

type TaskLookupClient = Pick<Prisma.TransactionClient, "campaign" | "member">;

async function resolveCampaignId(db: TaskLookupClient, ctx: TenantContext, value: unknown) {
  if (value === null) return null;
  const campaignId = textValue(value);
  if (!campaignId) return undefined;
  const campaign = await db.campaign.findFirst({
    where: { id: campaignId, organizationId: ctx.tenantId },
    select: { id: true },
  });
  return campaign?.id ?? null;
}

async function resolveAssigneeId(db: TaskLookupClient, ctx: TenantContext, data: Record<string, unknown>) {
  const assigneeId = textValue(data.assigneeId) ?? firstStringFromArray(data.assignees);
  if (!assigneeId) return undefined;
  const member = await db.member.findFirst({
    where: { organizationId: ctx.tenantId, userId: assigneeId },
    select: { userId: true },
  });
  return member?.userId ?? null;
}

export async function listTasks() {
  const ctx = await requirePermission("tasks.read");
  const tasks = await tenantRls(ctx, (tx) =>
    tx.task.findMany({
      where: { organizationId: ctx.tenantId },
      orderBy: { createdAt: "desc" },
      include: { createdBy: { select: { id: true, name: true, email: true, image: true } } },
    })
  );
  const aesKey = await getTenantAesKey(ctx.tenantId);
  try {
    return mapTaskRecords(ctx, tasks, aesKey);
  } finally {
    aesKey.fill(0);
  }
}

export async function listCampaignTasks(campaignId: string) {
  const ctx = await requirePermission("tasks.read");
  const tasks = await tenantRls(ctx, (tx) =>
    tx.task.findMany({
      where: { organizationId: ctx.tenantId, campaignId },
      orderBy: { createdAt: "desc" },
      include: { createdBy: { select: { id: true, name: true, email: true, image: true } } },
    })
  );
  const aesKey = await getTenantAesKey(ctx.tenantId);
  try {
    return mapTaskRecords(ctx, tasks, aesKey);
  } finally {
    aesKey.fill(0);
  }
}

export async function getTaskById(id: string) {
  const ctx = await requirePermission("tasks.read");
  const task = await tenantRls(ctx, (tx) =>
    tx.task.findFirst({
      where: { id, organizationId: ctx.tenantId },
      include: { createdBy: { select: { id: true, name: true, email: true, image: true } } },
    })
  );
  if (!task) return null;
  const aesKey = await getTenantAesKey(ctx.tenantId);
  try {
    const [mappedTask] = await mapTaskRecords(ctx, [task], aesKey);
    return mappedTask;
  } finally {
    aesKey.fill(0);
  }
}

export async function createTask(data: Record<string, unknown>) {
  const ctx = await requirePermission("tasks.create");
  const title = getTitle(data);
  const aesKey = await getTenantAesKey(ctx.tenantId);

  try {
    const task = await tenantRls(ctx, async (tx) => {
      const campaignId = await resolveCampaignId(tx, ctx, data.campaignId);
      const assigneeId = await resolveAssigneeId(tx, ctx, data);
      return tx.task.create({
        data: {
          id: typeof data.id === "string" && data.id ? data.id : crypto.randomUUID(),
          organizationId: ctx.tenantId,
          title: encryptField(aesKey, title),
          description: encryptField(aesKey, textValue(data.description) ?? null),
          status: getStatus(data),
          priority: textValue(data.priority),
          dueDate: dateValue(data.dueDate) ?? dateValue(data.due),
          startDate: dateValue(data.startDate),
          assigneeId,
          campaignId,
          labels: jsonArray(data.labels),
          assignees: jsonArray(data.assignees),
          checklist: encryptJsonField(aesKey, jsonArray(data.checklist)) as any,
          externalLinks: jsonArray(data.externalLinks),
          comments: encryptJsonField(aesKey, jsonArray(data.comments)) as any,
          activity: jsonArray(data.activity),
          attachments: jsonArray(data.attachments),
          createdById: ctx.userId,
          updatedById: ctx.userId,
        },
      });
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

    const identities = await getMemberIdentityMap(ctx);
    const decrypted = decryptTaskRecord(task, aesKey);
    return hydrateTaskIdentity(mapDomainRecord(decrypted, ctx.user), identities);
  } finally {
    aesKey.fill(0);
  }
}

export async function updateTask(id: string, patch: Record<string, unknown>) {
  const ctx = await requirePermission("tasks.update");
  const aesKey = await getTenantAesKey(ctx.tenantId);

  try {
    const updated = await tenantRls(ctx, async (tx) => {
      const current = await tx.task.findFirst({ where: { id, organizationId: ctx.tenantId } });
      if (!current) return null;

      const currentPlain = decryptTaskRecord(current, aesKey);
      const campaignId = patch.campaignId !== undefined ? await resolveCampaignId(tx, ctx, patch.campaignId) : current.campaignId;
      const assigneeId = patch.assigneeId !== undefined || patch.assignees !== undefined ? await resolveAssigneeId(tx, ctx, patch) : current.assigneeId;
      const title = patch.title !== undefined || patch.name !== undefined
        ? getTitle(patch, currentPlain.title ?? "Untitled")
        : (currentPlain.title ?? "Untitled");

      return tx.task.update({
        where: { id },
        data: {
          title: encryptField(aesKey, title),
          description: patch.description !== undefined
            ? encryptField(aesKey, textValue(patch.description) ?? null)
            : current.description,
          status: typeof patch.status === "string" ? patch.status : current.status,
          priority: patch.priority !== undefined ? textValue(patch.priority) : current.priority,
          dueDate: patch.dueDate !== undefined || patch.due !== undefined ? dateValue(patch.dueDate) ?? dateValue(patch.due) : current.dueDate,
          startDate: patch.startDate !== undefined ? dateValue(patch.startDate) : current.startDate,
          assigneeId,
          campaignId,
          labels: patch.labels !== undefined ? jsonArray(patch.labels) : jsonInputOrDefault(current.labels, []),
          assignees: patch.assignees !== undefined ? jsonArray(patch.assignees) : jsonInputOrDefault(current.assignees, []),
          checklist: patch.checklist !== undefined
            ? encryptJsonField(aesKey, jsonArray(patch.checklist)) as any
            : current.checklist,
          externalLinks: patch.externalLinks !== undefined ? jsonArray(patch.externalLinks) : jsonInputOrDefault(current.externalLinks, []),
          comments: patch.comments !== undefined
            ? encryptJsonField(aesKey, jsonArray(patch.comments)) as any
            : current.comments,
          activity: patch.activity !== undefined ? jsonArray(patch.activity) : jsonInputOrDefault(current.activity, []),
          attachments: patch.attachments !== undefined ? jsonArray(patch.attachments) : jsonInputOrDefault(current.attachments, []),
          updatedById: ctx.userId,
        },
        include: { createdBy: { select: { id: true, name: true, email: true, image: true } } },
      });
    });

    if (!updated) return null;

    const decrypted = decryptTaskRecord(updated, aesKey);
    const title = decrypted.title ?? "Untitled";
    logDomainActivity({
      tenantId: ctx.tenantId,
      userId: ctx.userId,
      module: MODULE,
      action: "Updated",
      entityType: ENTITY,
      entityId: id,
      entityName: title,
      description: typeof patch.description === "string" ? patch.description : null,
    }).catch(console.error);

    const identities = await getMemberIdentityMap(ctx);
    return hydrateTaskIdentity(mapDomainRecord(decrypted), identities) ?? mapDomainRecord(decrypted);
  } finally {
    aesKey.fill(0);
  }
}

export async function deleteTask(id: string) {
  const ctx = await requirePermission("tasks.delete");
  const current = await tenantRls(ctx, async (tx) => {
    const current = await tx.task.findFirst({ where: { id, organizationId: ctx.tenantId } });
    if (!current) return null;
    const result = await tx.task.deleteMany({ where: { id, organizationId: ctx.tenantId } });
    return result.count === 0 ? null : current;
  });
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

  logDomainActivity({
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    module: MODULE,
    action: "Deleted",
    entityType: ENTITY,
    entityId: id,
    entityName,
  }).catch(console.error);
  return { id };
}
