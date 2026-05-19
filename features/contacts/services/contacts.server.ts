import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/server/auth-utils";
import { createPayload, getStatus, getTitle, logDomainActivity, mapDomainRecord, parsePayload } from "@/lib/api/domain-utils";

const MODULE = "TEAM";
const ENTITY = "Contact";

export async function listContacts() {
  const ctx = await requireTenant();
  const contacts = await prisma.contact.findMany({ where: { organizationId: ctx.tenantId }, orderBy: { createdAt: "desc" }, include: { createdBy: { select: { id: true, name: true, image: true } } } });
  return contacts.map((contact) => mapDomainRecord(contact));
}

export async function getContactById(id: string) {
  const ctx = await requireTenant();
  const contact = await prisma.contact.findFirst({ where: { id, organizationId: ctx.tenantId }, include: { createdBy: { select: { id: true, name: true, image: true } } } });
  return contact ? mapDomainRecord(contact) : null;
}

export async function createContact(data: Record<string, unknown>) {
  const ctx = await requireTenant();
  const title = getTitle(data);
  const contact = await prisma.contact.create({ data: { id: typeof data.id === "string" && data.id ? data.id : crypto.randomUUID(), organizationId: ctx.tenantId, title, status: getStatus(data), payload: createPayload(data), createdById: ctx.userId, updatedById: ctx.userId } });
  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Created", entityType: ENTITY, entityId: contact.id, entityName: title, description: typeof data.description === "string" ? data.description : null });
  return mapDomainRecord(contact, ctx.user);
}

export async function updateContact(id: string, patch: Record<string, unknown>) {
  const ctx = await requireTenant();
  const current = await prisma.contact.findFirst({ where: { id, organizationId: ctx.tenantId } });
  if (!current) return null;
  const result = await prisma.contact.updateMany({ where: { id, organizationId: ctx.tenantId }, data: { title: getTitle(patch, current.title ?? "Untitled"), status: typeof patch.status === "string" ? patch.status : current.status, payload: { ...parsePayload(current.payload), ...patch }, updatedById: ctx.userId } });
  if (result.count === 0) return null;
  const updated = await prisma.contact.findFirst({ where: { id, organizationId: ctx.tenantId }, include: { createdBy: { select: { id: true, name: true, image: true } } } });
  if (!updated) return null;
  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Updated", entityType: ENTITY, entityId: id, entityName: updated.title, description: typeof patch.description === "string" ? patch.description : null });
  return mapDomainRecord(updated);
}

export async function deleteContact(id: string) {
  const ctx = await requireTenant();
  const current = await prisma.contact.findFirst({ where: { id, organizationId: ctx.tenantId } });
  if (!current) return null;
  const result = await prisma.contact.deleteMany({ where: { id, organizationId: ctx.tenantId } });
  if (result.count === 0) return null;
  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Deleted", entityType: ENTITY, entityId: id, entityName: current.title });
  return { id };
}
