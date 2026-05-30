import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/server/auth-utils";
import { normalizeUserAvatarImage } from "@/lib/server/supabase-storage";
import { getUserDisplayName } from "@/lib/user-identity";

function mapChannel(c: any) {
  return {
    name: c.title || "",
    status: c.status || "Active",
    ...(typeof c.payload === 'object' && c.payload !== null ? c.payload : {}),
    id: c.id,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString()
  };
}

export async function listChannels() {
  const context = await getTenantContext();
  if (!context) throw new Error("Unauthorized");

  const channels = await prisma.socialChannel.findMany({
    where: { organizationId: context.tenant.id },
    orderBy: { createdAt: 'desc' }
  });

  return channels.map(mapChannel);
}

export async function createChannel(data: Record<string, unknown>) {
  const context = await getTenantContext();
  if (!context) throw new Error("Unauthorized");

  const { name, status, id: _tempId, createdAt: _c, updatedAt: _u, ...payload } = data;

  const ch = await prisma.socialChannel.create({
    data: {
      organizationId: context.tenant.id,
      createdById: context.user.id,
      title: (name as string) || "New Channel",
      status: (status as string) || "Active",
      payload: (payload as any) || {}
    }
  });

  await prisma.tenantActivity.create({
    data: {
      organizationId: context.tenant.id,
      module: "MARKETING",
      action: "Added Channel",
      entityId: ch.id,
      entityType: "SocialChannel",
      entityName: ch.title,
      userId: context.user.id
    }
  });

  return mapChannel(ch);
}

export async function updateChannel(id: string, patch: Record<string, unknown>) {
  const context = await getTenantContext();
  if (!context) throw new Error("Unauthorized");

  const existing = await prisma.socialChannel.findUnique({ where: { id } });
  if (!existing || existing.organizationId !== context.tenant.id) {
    throw new Error("Not found or unauthorized");
  }

  const { name, status, id: _tempId, createdAt: _c, updatedAt: _u, ...payloadPatch } = patch;
  const currentPayload = (typeof existing.payload === 'object' && existing.payload !== null) ? existing.payload : {};
  const newPayload = { ...currentPayload, ...payloadPatch };

  const ch = await prisma.socialChannel.update({
    where: { id },
    data: {
      title: name !== undefined ? (name as string) : existing.title,
      status: status !== undefined ? (status as string) : existing.status,
      payload: newPayload as any,
      updatedById: context.user.id,
    }
  });

  await prisma.tenantActivity.create({
    data: {
      organizationId: context.tenant.id,
      module: "MARKETING",
      action: "Updated Channel",
      entityId: ch.id,
      entityType: "SocialChannel",
      entityName: ch.title,
      userId: context.user.id
    }
  });

  return mapChannel(ch);
}

export async function deleteChannel(id: string) {
  const context = await getTenantContext();
  if (!context) throw new Error("Unauthorized");

  const existing = await prisma.socialChannel.findUnique({ where: { id } });
  if (!existing || existing.organizationId !== context.tenant.id) {
    return { success: true };
  }

  await prisma.socialChannel.delete({ where: { id } });

  await prisma.tenantActivity.create({
    data: {
      organizationId: context.tenant.id,
      module: "MARKETING",
      action: "Deleted Channel",
      entityId: id,
      entityType: "SocialChannel",
      entityName: existing.title,
      userId: context.user.id
    }
  });

  return { success: true };
}

export async function listChannelActivities() {
  const context = await getTenantContext();
  if (!context) throw new Error("Unauthorized");

  const acts = await prisma.tenantActivity.findMany({
    where: { 
      organizationId: context.tenant.id,
      module: "SocialChannels"
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: { user: true }
  });

  return acts.map((act: any) => ({
    id: act.id,
    action: act.action,
    channel: act.entityName || "Unknown",
    user: getUserDisplayName(act.user, "System"),
    userEmail: act.user?.email ?? undefined,
    userImage: act.user?.id ? normalizeUserAvatarImage(act.user.id, act.user.image) : undefined,
    time: act.createdAt.toISOString()
  }));
}
