import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/server/rbac";
import { normalizeUserAvatarImage } from "@/lib/server/supabase-storage";
import { getUserDisplayName } from "@/lib/user-identity";

const ACTION_CATEGORY: Record<string, string> = {
  Created: "INFO",
  Updated: "UPDATE",
  Deleted: "WARNING",
};

export async function listActivities(moduleFilter?: string) {
  const ctx = await requirePermission("activity.read");
  const activityModule = moduleFilter && moduleFilter !== "All" && moduleFilter !== "SYSTEM" ? moduleFilter : undefined;

  const logs = await prisma.tenantActivity.findMany({
    where: {
      organizationId: ctx.tenantId,
      module: activityModule ?? { not: "SYSTEM" },
      ...(activityModule ? { module: activityModule } : {}),
    },
    orderBy: { createdAt: "desc" },
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
      id: log.user?.id ?? log.userId ?? "workspace",
      name: getUserDisplayName(log.user, "Workspace"),
      email: log.user?.email ?? undefined,
      role: roleMap.get(log.userId ?? "") ?? "Workspace",
      avatar: log.user?.id ? normalizeUserAvatarImage(log.user.id, log.user.image) ?? undefined : undefined,
    },
    timestamp: log.createdAt.toISOString(),
    description: log.description ?? undefined,
  }));
}
