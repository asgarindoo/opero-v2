import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/server/auth-utils";
import { normalizeUserAvatarImage } from "@/lib/server/supabase-storage";
import { getUserDisplayName } from "@/lib/user-identity";
import { dateValue, intValue, textValue } from "@/lib/api/feature-records";

function mapChannel(c: any) {
  const accountName = c.accountName || c.title || "";
  const handle = c.handle || "";
  const profileUrl = c.profileUrl || "";

  return {
    name: accountName,
    accountName,
    title: c.title || accountName,
    platform: c.platform || "",
    username: handle, // alias for backward compat
    handle,
    profileLink: profileUrl, // alias for backward compat
    profileUrl,
    status: c.status || "Active",
    followers: c.followers ?? 0,
    postsThisMonth: c.postsThisMonth ?? 0,
    interactions: c.interactions ?? 0,
    monthlyReach: c.monthlyReach,
    averageViews: c.averageViews,
    lastActiveDate: c.lastActiveDate?.toISOString?.() ?? "",
    notes: c.notes ?? "",
    id: c.id,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString()
  };
}

function buildChannelCreateData(data: Record<string, unknown>) {
  const accountName = textValue(data.accountName) ?? textValue(data.name) ?? textValue(data.title) ?? "New Channel";
  const handle = textValue(data.handle) ?? textValue(data.username);
  const profileUrl = textValue(data.profileUrl) ?? textValue(data.profileLink);

  return {
    title: accountName,
    accountName,
    platform: textValue(data.platform),
    handle,
    profileUrl,
    status: textValue(data.status) ?? "Active",
    followers: intValue(data.followers) ?? 0,
    postsThisMonth: intValue(data.postsThisMonth) ?? 0,
    interactions: intValue(data.interactions) ?? 0,
    monthlyReach: intValue(data.monthlyReach),
    averageViews: intValue(data.averageViews),
    lastActiveDate: dateValue(data.lastActiveDate),
    notes: textValue(data.notes),
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

  const channelData = buildChannelCreateData(data);

  const ch = await prisma.socialChannel.create({
    data: {
      organizationId: context.tenant.id,
      createdById: context.user.id,
      ...channelData,
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

  const accountName = textValue(patch.accountName) ?? textValue(patch.name) ?? textValue(patch.title) ?? existing.accountName ?? existing.title ?? "New Channel";
  const handle = patch.handle !== undefined || patch.username !== undefined ? textValue(patch.handle) ?? textValue(patch.username) : existing.handle;
  const profileUrl = patch.profileUrl !== undefined || patch.profileLink !== undefined ? textValue(patch.profileUrl) ?? textValue(patch.profileLink) : existing.profileUrl;

  const ch = await prisma.socialChannel.update({
    where: { id },
    data: {
      title: accountName,
      accountName,
      platform: patch.platform !== undefined ? textValue(patch.platform) : existing.platform,
      handle,
      profileUrl,
      status: patch.status !== undefined ? textValue(patch.status) ?? existing.status : existing.status,
      followers: patch.followers !== undefined ? intValue(patch.followers) ?? existing.followers : existing.followers,
      postsThisMonth: patch.postsThisMonth !== undefined ? intValue(patch.postsThisMonth) ?? existing.postsThisMonth : existing.postsThisMonth,
      interactions: patch.interactions !== undefined ? intValue(patch.interactions) ?? existing.interactions : existing.interactions,
      monthlyReach: patch.monthlyReach !== undefined ? intValue(patch.monthlyReach) : existing.monthlyReach,
      averageViews: patch.averageViews !== undefined ? intValue(patch.averageViews) : existing.averageViews,
      lastActiveDate: patch.lastActiveDate !== undefined ? dateValue(patch.lastActiveDate) : existing.lastActiveDate,
      notes: patch.notes !== undefined ? textValue(patch.notes) : existing.notes,
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
      module: "MARKETING",
      entityType: "SocialChannel",
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
