import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/server/rbac";
import { dateValue, jsonArray, jsonInputOrDefault, textValue } from "@/lib/api/feature-records";

async function resolveTargetAccountId(tenantId: string, value: unknown) {
  if (value === null) return null;
  const targetAccountId = textValue(value);
  if (!targetAccountId) return undefined;
  const account = await prisma.socialChannel.findFirst({
    where: { id: targetAccountId, organizationId: tenantId },
    select: { id: true },
  });
  return account?.id ?? null;
}

function mapContentPost(post: any) {
  const plannedDate = post.plannedDate?.toISOString?.() ?? "";
  const plannedTime = post.plannedTime ?? "";
  const contentType = post.contentType ?? "Post";

  return {
    title: post.title || "",
    status: post.status || "Planned",
    plannedDate,
    plannedTime,
    date: plannedDate,
    time: plannedTime,
    contentType,
    type: contentType,
    targetAccountId: post.targetAccountId ?? "",
    tags: post.tags ?? [],
    id: post.id,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}

async function buildContentPostCreateData(tenantId: string, data: Record<string, unknown>) {
  const plannedDate = dateValue(data.plannedDate) ?? dateValue(data.date);
  const plannedTime = textValue(data.plannedTime) ?? textValue(data.time);
  const contentType = textValue(data.contentType) ?? textValue(data.type) ?? "Post";

  return {
    title: textValue(data.title) ?? "New Entry",
    status: textValue(data.status) ?? "Planned",
    plannedDate,
    plannedTime,
    contentType,
    targetAccountId: await resolveTargetAccountId(tenantId, data.targetAccountId),
    tags: jsonArray(data.tags),
  };
}

export async function listContentPosts() {
  const context = await requirePermission("contentPlanner.read");

  const posts = await prisma.contentPost.findMany({
    where: { organizationId: context.tenant.id },
    orderBy: { createdAt: 'desc' }
  });

  return posts.map(mapContentPost);
}

export async function createContentPost(data: Record<string, unknown>) {
  const context = await requirePermission("contentPlanner.create");

  const postData = await buildContentPostCreateData(context.tenant.id, data);

  const post = await prisma.contentPost.create({
    data: {
      organizationId: context.tenant.id,
      createdById: context.user.id,
      ...postData,
    }
  });

  await prisma.tenantActivity.create({
    data: {
      organizationId: context.tenant.id,
      module: "MARKETING",
      action: "Created",
      entityId: post.id,
      entityType: "ContentPost",
      entityName: post.title,
      userId: context.user.id
    }
  });

  return mapContentPost(post);
}

export async function updateContentPost(id: string, patch: Record<string, unknown>) {
  const context = await requirePermission("contentPlanner.update");

  const existing = await prisma.contentPost.findUnique({ where: { id } });
  if (!existing || existing.organizationId !== context.tenant.id) {
    throw new Error("Not found or unauthorized");
  }

  const targetAccountId = patch.targetAccountId !== undefined
    ? await resolveTargetAccountId(context.tenant.id, patch.targetAccountId)
    : existing.targetAccountId;

  const post = await prisma.contentPost.update({
    where: { id },
    data: {
      title: patch.title !== undefined ? textValue(patch.title) ?? existing.title : existing.title,
      status: patch.status !== undefined ? textValue(patch.status) ?? existing.status : existing.status,
      plannedDate: patch.plannedDate !== undefined || patch.date !== undefined ? dateValue(patch.plannedDate) ?? dateValue(patch.date) : existing.plannedDate,
      plannedTime: patch.plannedTime !== undefined || patch.time !== undefined ? textValue(patch.plannedTime) ?? textValue(patch.time) : existing.plannedTime,
      contentType: patch.contentType !== undefined || patch.type !== undefined ? textValue(patch.contentType) ?? textValue(patch.type) : existing.contentType,
      targetAccountId,
      tags: patch.tags !== undefined ? jsonArray(patch.tags) : jsonInputOrDefault(existing.tags, []),
      updatedById: context.user.id,
    }
  });

  await prisma.tenantActivity.create({
    data: {
      organizationId: context.tenant.id,
      module: "MARKETING",
      action: "Updated",
      entityId: post.id,
      entityType: "ContentPost",
      entityName: post.title,
      userId: context.user.id
    }
  });

  return mapContentPost(post);
}

export async function deleteContentPost(id: string) {
  const context = await requirePermission("contentPlanner.delete");

  const existing = await prisma.contentPost.findUnique({ where: { id } });
  if (!existing || existing.organizationId !== context.tenant.id) {
    return { success: true };
  }

  await prisma.contentPost.delete({ where: { id } });

  await prisma.tenantActivity.create({
    data: {
      organizationId: context.tenant.id,
      module: "MARKETING",
      action: "Deleted",
      entityId: id,
      entityType: "ContentPost",
      entityName: existing.title,
      userId: context.user.id
    }
  });
  return { success: true };
}
