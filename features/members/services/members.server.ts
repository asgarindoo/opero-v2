import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/server/auth-utils";
import { getStatus, getTitle, logDomainActivity, mapDomainRecord } from "@/lib/api/domain-utils";
import { intValue, jsonArray, jsonInputOrDefault, textValue } from "@/lib/api/feature-records";

const MODULE = "TEAM";
const ENTITY = "Role";

export async function listRoles() {
  const ctx = await requireTenant();
  const roles = await prisma.role.findMany({ where: { organizationId: ctx.tenantId }, orderBy: { createdAt: "desc" }, include: { createdBy: { select: { id: true, name: true, email: true, image: true } } } });
  return roles.map((role) => mapDomainRecord(role));
}

export async function getRoleById(id: string) {
  const ctx = await requireTenant();
  const role = await prisma.role.findFirst({ where: { id, organizationId: ctx.tenantId }, include: { createdBy: { select: { id: true, name: true, email: true, image: true } } } });
  return role ? mapDomainRecord(role) : null;
}

export async function createRole(data: Record<string, unknown>) {
  const ctx = await requireTenant();
  const title = getTitle(data);
  const role = await prisma.role.create({
    data: {
      id: typeof data.id === "string" && data.id ? data.id : crypto.randomUUID(),
      organizationId: ctx.tenantId,
      title,
      name: textValue(data.name) ?? title,
      description: textValue(data.description),
      status: getStatus(data, "Active"),
      permissions: jsonArray(data.permissions),
      color: textValue(data.color),
      sortOrder: intValue(data.sortOrder) ?? 0,
      createdById: ctx.userId,
      updatedById: ctx.userId,
    },
  });
  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Created", entityType: ENTITY, entityId: role.id, entityName: title, description: typeof data.description === "string" ? data.description : null });
  return mapDomainRecord(role, ctx.user);
}

export async function updateRole(id: string, patch: Record<string, unknown>) {
  const ctx = await requireTenant();
  const current = await prisma.role.findFirst({ where: { id, organizationId: ctx.tenantId } });
  if (!current) return null;
  const title = getTitle(patch, current.title ?? "Untitled");
  const result = await prisma.role.updateMany({
    where: { id, organizationId: ctx.tenantId },
    data: {
      title,
      name: patch.name !== undefined ? textValue(patch.name) ?? title : current.name,
      description: patch.description !== undefined ? textValue(patch.description) : current.description,
      status: typeof patch.status === "string" ? patch.status : current.status,
      permissions: patch.permissions !== undefined ? jsonArray(patch.permissions) : jsonInputOrDefault(current.permissions, []),
      color: patch.color !== undefined ? textValue(patch.color) : current.color,
      sortOrder: patch.sortOrder !== undefined ? intValue(patch.sortOrder) ?? current.sortOrder : current.sortOrder,
      updatedById: ctx.userId,
    },
  });
  if (result.count === 0) return null;
  const updated = await prisma.role.findFirst({ where: { id, organizationId: ctx.tenantId }, include: { createdBy: { select: { id: true, name: true, email: true, image: true } } } });
  if (!updated) return null;
  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Updated", entityType: ENTITY, entityId: id, entityName: updated.title, description: typeof patch.description === "string" ? patch.description : null });
  return mapDomainRecord(updated);
}

export async function deleteRole(id: string) {
  const ctx = await requireTenant();
  const current = await prisma.role.findFirst({ where: { id, organizationId: ctx.tenantId } });
  if (!current) return null;
  const result = await prisma.role.deleteMany({ where: { id, organizationId: ctx.tenantId } });
  if (result.count === 0) return null;
  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Deleted", entityType: ENTITY, entityId: id, entityName: current.title });
  return { id };
}
