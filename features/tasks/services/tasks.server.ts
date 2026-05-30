import { prisma } from "@/lib/prisma";
import { requireTenant, type TenantContext } from "@/lib/server/auth-utils";
import { normalizeUserAvatarImage } from "@/lib/server/supabase-storage";
import { getUserDisplayName, getUserInitials, type UserIdentity } from "@/lib/user-identity";
import { createPayload, getStatus, getTitle, logDomainActivity, mapDomainRecord, parsePayload } from "@/lib/api/domain-utils";

const MODULE = "TASKS";
const ENTITY = "Task";
// Trigger TS refresh

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

export async function listTasks() {
  const ctx = await requireTenant();
  const tasks = await prisma.task.findMany({
    where: { organizationId: ctx.tenantId },
    orderBy: { createdAt: "desc" },
    include: { createdBy: { select: { id: true, name: true, email: true, image: true } } },
  });
  return mapTaskRecords(ctx, tasks);
}

export async function listCampaignTasks(campaignId: string) {
  const ctx = await requireTenant();
  const tasks = await prisma.task.findMany({
    where: { organizationId: ctx.tenantId, campaignId },
    orderBy: { createdAt: "desc" },
    include: { createdBy: { select: { id: true, name: true, email: true, image: true } } },
  });
  return mapTaskRecords(ctx, tasks);
}

export async function getTaskById(id: string) {
  const ctx = await requireTenant();
  const task = await prisma.task.findFirst({
    where: { id, organizationId: ctx.tenantId },
    include: { createdBy: { select: { id: true, name: true, email: true, image: true } } },
  });
  if (!task) return null;
  const [mappedTask] = await mapTaskRecords(ctx, [task]);
  return mappedTask;
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
  const identities = await getMemberIdentityMap(ctx);
  return hydrateTaskIdentity(mapDomainRecord(task, ctx.user), identities);
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
