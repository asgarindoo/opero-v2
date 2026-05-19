import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/server/auth-utils";

const ACTION_CATEGORY: Record<string, string> = {
  Created: "INFO",
  Updated: "UPDATE",
  Deleted: "WARNING",
};

export async function listActivities(moduleFilter?: string) {
  const ctx = await requireTenant();
  const activityModule = moduleFilter && moduleFilter !== "All" ? moduleFilter : undefined;

  const logs = await prisma.tenantActivity.findMany({
    where: {
      organizationId: ctx.tenantId,
      ...(activityModule ? { module: activityModule } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
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
      id: log.user?.id ?? log.userId ?? "system",
      name: log.user?.name ?? log.user?.email ?? "System",
      role: roleMap.get(log.userId ?? "") ?? "System",
      avatar: log.user?.image ?? undefined,
    },
    timestamp: log.createdAt.toISOString(),
    description: log.description ?? undefined,
  }));
}
