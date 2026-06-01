import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/server/auth-utils";
import { getStatus, getTitle, logDomainActivity, mapDomainRecord } from "@/lib/api/domain-utils";
import { jsonArray, jsonInputOrDefault, textValue } from "@/lib/api/feature-records";
import { contactSchema } from "../validators";

const MODULE = "TEAM";
const ENTITY = "Contact";

function mapContact(record: any, fallbackUser?: { id: string; name: string; email?: string | null; image?: string | null }) {
  const mapped = mapDomainRecord(record, fallbackUser) as any;
  return {
    ...mapped,
    relationshipType: mapped.relationshipType ?? "Lead",
    status: mapped.status ?? "New",
    industry: mapped.industry ?? "Unspecified",
    contextData: mapped.contextData && typeof mapped.contextData === "object" && !Array.isArray(mapped.contextData) ? mapped.contextData : {},
    persons: Array.isArray(mapped.persons) ? mapped.persons : [],
    tags: Array.isArray(mapped.tags) ? mapped.tags : [],
    activities: Array.isArray(mapped.activities) ? mapped.activities : [],
    assignedStaff: Array.isArray(mapped.assignedStaff) ? mapped.assignedStaff : [],
    isArchived: mapped.isArchived ?? mapped.status === "Archived",
    createdAt: mapped.createdAt ?? mapped.recordCreatedAt ?? "",
    lastContacted: mapped.lastContacted ?? mapped.recordUpdatedAt ?? mapped.recordCreatedAt ?? "",
  };
}

function sanitizePersons(value: unknown) {
  if (!Array.isArray(value)) return undefined;
  return value
    .filter((person) => person && typeof person === "object")
    .map((person, index) => {
      const data = person as Record<string, unknown>;
      const name = textValue(data.name) ?? "Contact Person";
      return {
        id: textValue(data.id) ?? `person-${Date.now()}-${index}`,
        name,
        email: textValue(data.email) ?? "",
        phone: textValue(data.phone) ?? "",
        role: textValue(data.role) ?? "Contact Person",
        isPrimary: Boolean(data.isPrimary),
      };
    });
}

export async function listContacts() {
  const ctx = await requireTenant();
  const contacts = await prisma.contact.findMany({ where: { organizationId: ctx.tenantId }, orderBy: { createdAt: "desc" }, include: { createdBy: { select: { id: true, name: true, email: true, image: true } } } });
  return contacts.map((contact) => mapContact(contact));
}

export async function getContactById(id: string) {
  const ctx = await requireTenant();
  const contact = await prisma.contact.findFirst({ where: { id, organizationId: ctx.tenantId }, include: { createdBy: { select: { id: true, name: true, email: true, image: true } } } });
  return contact ? mapContact(contact) : null;
}

export async function createContact(data: Record<string, unknown>) {
  const ctx = await requireTenant();
  const parsed = contactSchema.parse(data);
  const title = getTitle(parsed);
  const contact = await prisma.contact.create({
    data: {
      id: typeof parsed.id === "string" && parsed.id ? parsed.id : crypto.randomUUID(),
      organizationId: ctx.tenantId,
      title,
      name: textValue(parsed.name) ?? title,
      relationshipType: textValue(parsed.relationshipType),
      status: getStatus(parsed),
      industry: textValue(parsed.industry),
      description: textValue(parsed.description),
      persons: jsonArray(sanitizePersons(parsed.persons) ?? parsed.persons),
      tags: jsonArray(parsed.tags),
      assignedStaff: jsonArray(parsed.assignedStaff),
      notes: textValue(parsed.notes),
      createdById: ctx.userId,
      updatedById: ctx.userId,
    },
  });
  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Created", entityType: ENTITY, entityId: contact.id, entityName: title, description: typeof parsed.description === "string" ? parsed.description : null });
  return mapContact(contact, ctx.user);
}

export async function updateContact(id: string, patch: Record<string, unknown>) {
  const ctx = await requireTenant();
  const current = await prisma.contact.findFirst({ where: { id, organizationId: ctx.tenantId } });
  if (!current) return null;

  const parsed = contactSchema.partial().parse(patch);
  const title = getTitle(parsed, current.title ?? "Untitled");
  const result = await prisma.contact.updateMany({
    where: { id, organizationId: ctx.tenantId },
    data: {
      title,
      name: parsed.name !== undefined ? textValue(parsed.name) ?? title : current.name,
      relationshipType: parsed.relationshipType !== undefined ? textValue(parsed.relationshipType) : current.relationshipType,
      status: parsed.status !== undefined ? getStatus(parsed, current.status ?? "Active") : current.status,
      industry: parsed.industry !== undefined ? textValue(parsed.industry) : current.industry,
      description: parsed.description !== undefined ? textValue(parsed.description) : current.description,
      persons: parsed.persons !== undefined ? jsonArray(sanitizePersons(parsed.persons) ?? parsed.persons) : jsonInputOrDefault(current.persons, []),
      tags: parsed.tags !== undefined ? jsonArray(parsed.tags) : jsonInputOrDefault(current.tags, []),
      assignedStaff: parsed.assignedStaff !== undefined ? jsonArray(parsed.assignedStaff) : jsonInputOrDefault(current.assignedStaff, []),
      notes: parsed.notes !== undefined ? textValue(parsed.notes) : current.notes,
      updatedById: ctx.userId,
    },
  });
  if (result.count === 0) return null;
  const updated = await prisma.contact.findFirst({ where: { id, organizationId: ctx.tenantId }, include: { createdBy: { select: { id: true, name: true, email: true, image: true } } } });
  if (!updated) return null;
  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Updated", entityType: ENTITY, entityId: id, entityName: updated.title, description: typeof parsed.description === "string" ? parsed.description : null });
  return mapContact(updated);
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
