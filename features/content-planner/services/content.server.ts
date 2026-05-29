import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/server/auth-utils";

export async function listContentPosts() {
  const context = await getTenantContext();
  if (!context) throw new Error("Unauthorized");

  const posts = await prisma.contentPost.findMany({
    where: { organizationId: context.tenant.id },
    orderBy: { createdAt: 'desc' }
  });

  return posts.map((post: any) => ({
    title: post.title || "",
    status: post.status || "Planned",
    ...(typeof post.payload === 'object' && post.payload !== null ? post.payload : {}),
    id: post.id,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  }));
}

export async function createContentPost(data: Record<string, unknown>) {
  const context = await getTenantContext();
  if (!context) throw new Error("Unauthorized");

  const { title, status, id: _tempId, createdAt: _c, updatedAt: _u, ...payload } = data;

  const post = await prisma.contentPost.create({
    data: {
      organizationId: context.tenant.id,
      createdById: context.user.id,
      title: (title as string) || "New Entry",
      status: (status as string) || "Planned",
      payload: (payload as any) || {}
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

  return {
    title: post.title || "",
    status: post.status || "Planned",
    ...(typeof post.payload === 'object' && post.payload !== null ? post.payload : {}),
    id: post.id,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}

export async function updateContentPost(id: string, patch: Record<string, unknown>) {
  const context = await getTenantContext();
  if (!context) throw new Error("Unauthorized");

  const existing = await prisma.contentPost.findUnique({ where: { id } });
  if (!existing || existing.organizationId !== context.tenant.id) {
    throw new Error("Not found or unauthorized");
  }

  const { title, status, id: _tempId, createdAt: _c, updatedAt: _u, ...payloadPatch } = patch;
  const currentPayload = (typeof existing.payload === 'object' && existing.payload !== null) ? existing.payload : {};
  const newPayload = { ...currentPayload, ...payloadPatch };

  const post = await prisma.contentPost.update({
    where: { id },
    data: {
      title: title !== undefined ? (title as string) : existing.title,
      status: status !== undefined ? (status as string) : existing.status,
      payload: newPayload as any,
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

  return {
    title: post.title || "",
    status: post.status || "Planned",
    ...(typeof post.payload === 'object' && post.payload !== null ? post.payload : {}),
    id: post.id,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}

export async function deleteContentPost(id: string) {
  const context = await getTenantContext();
  if (!context) throw new Error("Unauthorized");

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
