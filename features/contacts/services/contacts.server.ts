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

import { contactSchema } from "../validators";

export async function createContact(data: Record<string, unknown>) {
  const ctx = await requireTenant();
  
  // Validate using Zod
  const parsed = contactSchema.parse(data);
  
  const title = getTitle(parsed);
  const contact = await prisma.contact.create({ data: { id: typeof parsed.id === "string" && parsed.id ? parsed.id : crypto.randomUUID(), organizationId: ctx.tenantId, title, status: getStatus(parsed), payload: createPayload(parsed), createdById: ctx.userId, updatedById: ctx.userId } });
  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Created", entityType: ENTITY, entityId: contact.id, entityName: title, description: typeof parsed.description === "string" ? parsed.description : null });
  return mapDomainRecord(contact, ctx.user);
}

export async function updateContact(id: string, patch: Record<string, unknown>) {
  const ctx = await requireTenant();
  const current = await prisma.contact.findFirst({ where: { id, organizationId: ctx.tenantId } });
  if (!current) return null;
  
  // Merge and validate using Zod
  const merged = { ...parsePayload(current.payload), ...patch };
  // Only parse the fields that are present or parse the whole thing if we're sure it's complete
  // For safety on updates, we can use partial parsing or just parse the merged payload
  const parsed = contactSchema.parse(merged);

  const result = await prisma.contact.updateMany({ where: { id, organizationId: ctx.tenantId }, data: { title: getTitle(parsed, current.title ?? "Untitled"), status: getStatus(parsed) || current.status, payload: createPayload(parsed), updatedById: ctx.userId } });
  if (result.count === 0) return null;
  const updated = await prisma.contact.findFirst({ where: { id, organizationId: ctx.tenantId }, include: { createdBy: { select: { id: true, name: true, image: true } } } });
  if (!updated) return null;
  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Updated", entityType: ENTITY, entityId: id, entityName: updated.title, description: typeof parsed.description === "string" ? parsed.description : null });
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
