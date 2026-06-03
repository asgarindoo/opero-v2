import { prisma } from "@/lib/prisma";
import type { TenantContext } from "@/lib/server/auth-utils";
import { requirePermission } from "@/lib/server/rbac";
import { normalizeUserAvatarImage } from "@/lib/server/supabase-storage";
import { getUserDisplayName, getUserInitials, type UserIdentity } from "@/lib/user-identity";
import { getStatus, getTitle, logDomainActivity, mapDomainRecord } from "@/lib/api/domain-utils";
import { dateValue, firstStringFromArray, jsonArray, jsonInputOrDefault, textValue } from "@/lib/api/feature-records";

const MODULE = "TASKS";
const ENTITY = "Task";

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

async function mapTaskRecords(ctx: TenantContext, records: any[]) {
  const identities = await getMemberIdentityMap(ctx);
  return records.map((task) => hydrateTaskIdentity(mapDomainRecord(task), identities));
}

async function resolveCampaignId(ctx: TenantContext, value: unknown) {
  if (value === null) return null;
  const campaignId = textValue(value);
  if (!campaignId) return undefined;
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, organizationId: ctx.tenantId },
    select: { id: true },
  });
  return campaign?.id ?? null;
}

async function resolveAssigneeId(ctx: TenantContext, data: Record<string, unknown>) {
  const assigneeId = textValue(data.assigneeId) ?? firstStringFromArray(data.assignees);
  if (!assigneeId) return undefined;
  const member = await prisma.member.findFirst({
    where: { organizationId: ctx.tenantId, userId: assigneeId },
    select: { userId: true },
  });
  return member?.userId ?? null;
}

async function buildTaskCreateData(ctx: TenantContext, data: Record<string, unknown>) {
  const title = getTitle(data);
  return {
    title,
    description: textValue(data.description),
    status: getStatus(data),
    priority: textValue(data.priority),
    dueDate: dateValue(data.dueDate) ?? dateValue(data.due),
    startDate: dateValue(data.startDate),
    assigneeId: await resolveAssigneeId(ctx, data),
    campaignId: await resolveCampaignId(ctx, data.campaignId),
    labels: jsonArray(data.labels),
    assignees: jsonArray(data.assignees),
    checklist: jsonArray(data.checklist),
    externalLinks: jsonArray(data.externalLinks),
    comments: jsonArray(data.comments),
    activity: jsonArray(data.activity),
    attachments: jsonArray(data.attachments),
  };
}

export async function listTasks() {
  const ctx = await requirePermission("tasks.read");
  const tasks = await prisma.task.findMany({
    where: { organizationId: ctx.tenantId },
    orderBy: { createdAt: "desc" },
    include: { createdBy: { select: { id: true, name: true, email: true, image: true } } },
  });
  return mapTaskRecords(ctx, tasks);
}

export async function listCampaignTasks(campaignId: string) {
  const ctx = await requirePermission("tasks.read");
  const tasks = await prisma.task.findMany({
    where: { organizationId: ctx.tenantId, campaignId },
    orderBy: { createdAt: "desc" },
    include: { createdBy: { select: { id: true, name: true, email: true, image: true } } },
  });
  return mapTaskRecords(ctx, tasks);
}

export async function getTaskById(id: string) {
  const ctx = await requirePermission("tasks.read");
  const task = await prisma.task.findFirst({
    where: { id, organizationId: ctx.tenantId },
    include: { createdBy: { select: { id: true, name: true, email: true, image: true } } },
  });
  if (!task) return null;
  const [mappedTask] = await mapTaskRecords(ctx, [task]);
  return mappedTask;
}

export async function createTask(data: Record<string, unknown>) {
  const ctx = await requirePermission("tasks.create");
  const taskData = await buildTaskCreateData(ctx, data);
  const task = await prisma.task.create({
    data: {
      id: typeof data.id === "string" && data.id ? data.id : crypto.randomUUID(),
      organizationId: ctx.tenantId,
      ...taskData,
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
    entityName: task.title,
    description: task.description,
  }).catch(console.error);
  const identities = await getMemberIdentityMap(ctx);
  return hydrateTaskIdentity(mapDomainRecord(task, ctx.user), identities);
}

export async function updateTask(id: string, patch: Record<string, unknown>) {
  const ctx = await requirePermission("tasks.update");
  const current = await prisma.task.findUnique({ where: { id } });
  if (!current || current.organizationId !== ctx.tenantId) return null;

  const campaignId = patch.campaignId !== undefined ? await resolveCampaignId(ctx, patch.campaignId) : current.campaignId;
  const assigneeId = patch.assigneeId !== undefined || patch.assignees !== undefined ? await resolveAssigneeId(ctx, patch) : current.assigneeId;
  const updated = await prisma.task.update({
    where: { id },
    data: {
      title: getTitle(patch, current.title ?? "Untitled"),
      description: patch.description !== undefined ? textValue(patch.description) : current.description,
      status: typeof patch.status === "string" ? patch.status : current.status,
      priority: patch.priority !== undefined ? textValue(patch.priority) : current.priority,
      dueDate: patch.dueDate !== undefined || patch.due !== undefined ? dateValue(patch.dueDate) ?? dateValue(patch.due) : current.dueDate,
      startDate: patch.startDate !== undefined ? dateValue(patch.startDate) : current.startDate,
      assigneeId,
      campaignId,
      labels: patch.labels !== undefined ? jsonArray(patch.labels) : jsonInputOrDefault(current.labels, []),
      assignees: patch.assignees !== undefined ? jsonArray(patch.assignees) : jsonInputOrDefault(current.assignees, []),
      checklist: patch.checklist !== undefined ? jsonArray(patch.checklist) : jsonInputOrDefault(current.checklist, []),
      externalLinks: patch.externalLinks !== undefined ? jsonArray(patch.externalLinks) : jsonInputOrDefault(current.externalLinks, []),
      comments: patch.comments !== undefined ? jsonArray(patch.comments) : jsonInputOrDefault(current.comments, []),
      activity: patch.activity !== undefined ? jsonArray(patch.activity) : jsonInputOrDefault(current.activity, []),
      attachments: patch.attachments !== undefined ? jsonArray(patch.attachments) : jsonInputOrDefault(current.attachments, []),
      updatedById: ctx.userId,
    },
    include: { createdBy: { select: { id: true, name: true, email: true, image: true } } },
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
  const [mappedTask] = await mapTaskRecords(ctx, [updated]);
  return mappedTask ?? mapDomainRecord(updated);
}

export async function deleteTask(id: string) {
  const ctx = await requirePermission("tasks.delete");
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
