import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/server/auth-utils";
import { createPayload, getStatus, getTitle, logDomainActivity, mapDomainRecord, parsePayload } from "@/lib/api/domain-utils";

const MODULE = "DOCUMENTS";

export async function listDocuments() {
  const ctx = await requireTenant();
  const documents = await prisma.document.findMany({ where: { organizationId: ctx.tenantId }, orderBy: { createdAt: "desc" }, include: { createdBy: { select: { id: true, name: true, image: true } } } });
  return documents.map((document) => mapDomainRecord(document));
}

export async function getDocumentById(id: string) {
  const ctx = await requireTenant();
  const document = await prisma.document.findFirst({ where: { id, organizationId: ctx.tenantId }, include: { createdBy: { select: { id: true, name: true, image: true } } } });
  return document ? mapDomainRecord(document) : null;
}

export async function createDocument(data: Record<string, unknown>) {
  const ctx = await requireTenant();
  const title = getTitle(data);
  const document = await prisma.document.create({ data: { id: typeof data.id === "string" && data.id ? data.id : crypto.randomUUID(), organizationId: ctx.tenantId, title, status: getStatus(data, "Active"), payload: createPayload(data), createdById: ctx.userId, updatedById: ctx.userId } });
  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Created", entityType: "Document", entityId: document.id, entityName: title, description: typeof data.description === "string" ? data.description : null });
  return mapDomainRecord(document, ctx.user);
}

export async function updateDocument(id: string, patch: Record<string, unknown>) {
  const ctx = await requireTenant();
  const current = await prisma.document.findFirst({ where: { id, organizationId: ctx.tenantId } });
  if (!current) return null;
  const result = await prisma.document.updateMany({ where: { id, organizationId: ctx.tenantId }, data: { title: getTitle(patch, current.title ?? "Untitled"), status: typeof patch.status === "string" ? patch.status : current.status, payload: { ...parsePayload(current.payload), ...patch }, updatedById: ctx.userId } });
  if (result.count === 0) return null;
  const updated = await prisma.document.findFirst({ where: { id, organizationId: ctx.tenantId }, include: { createdBy: { select: { id: true, name: true, image: true } } } });
  if (!updated) return null;
  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Updated", entityType: "Document", entityId: id, entityName: updated.title, description: typeof patch.description === "string" ? patch.description : null });
  return mapDomainRecord(updated);
}

export async function deleteDocument(id: string) {
  const ctx = await requireTenant();
  const current = await prisma.document.findFirst({ where: { id, organizationId: ctx.tenantId } });
  if (!current) return null;
  const result = await prisma.document.deleteMany({ where: { id, organizationId: ctx.tenantId } });
  if (result.count === 0) return null;
  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Deleted", entityType: "Document", entityId: id, entityName: current.title });
  return { id };
}

export async function listFolders() {
  const ctx = await requireTenant();
  const folders = await prisma.folder.findMany({ where: { organizationId: ctx.tenantId }, orderBy: { createdAt: "desc" }, include: { createdBy: { select: { id: true, name: true, image: true } } } });
  return folders.map((folder) => mapDomainRecord(folder));
}

export async function getFolderById(id: string) {
  const ctx = await requireTenant();
  const folder = await prisma.folder.findFirst({ where: { id, organizationId: ctx.tenantId }, include: { createdBy: { select: { id: true, name: true, image: true } } } });
  return folder ? mapDomainRecord(folder) : null;
}

export async function createFolder(data: Record<string, unknown>) {
  const ctx = await requireTenant();
  const title = getTitle(data);
  const folder = await prisma.folder.create({ data: { id: typeof data.id === "string" && data.id ? data.id : crypto.randomUUID(), organizationId: ctx.tenantId, title, status: getStatus(data, "Active"), payload: createPayload(data), createdById: ctx.userId, updatedById: ctx.userId } });
  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Created", entityType: "Folder", entityId: folder.id, entityName: title, description: typeof data.description === "string" ? data.description : null });
  return mapDomainRecord(folder, ctx.user);
}

export async function updateFolder(id: string, patch: Record<string, unknown>) {
  const ctx = await requireTenant();
  const current = await prisma.folder.findFirst({ where: { id, organizationId: ctx.tenantId } });
  if (!current) return null;
  const result = await prisma.folder.updateMany({ where: { id, organizationId: ctx.tenantId }, data: { title: getTitle(patch, current.title ?? "Untitled"), status: typeof patch.status === "string" ? patch.status : current.status, payload: { ...parsePayload(current.payload), ...patch }, updatedById: ctx.userId } });
  if (result.count === 0) return null;
  const updated = await prisma.folder.findFirst({ where: { id, organizationId: ctx.tenantId }, include: { createdBy: { select: { id: true, name: true, image: true } } } });
  if (!updated) return null;
  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Updated", entityType: "Folder", entityId: id, entityName: updated.title, description: typeof patch.description === "string" ? patch.description : null });
  return mapDomainRecord(updated);
}

export async function deleteFolder(id: string) {
  const ctx = await requireTenant();
  const current = await prisma.folder.findFirst({ where: { id, organizationId: ctx.tenantId } });
  if (!current) return null;
  const result = await prisma.folder.deleteMany({ where: { id, organizationId: ctx.tenantId } });
  if (result.count === 0) return null;
  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Deleted", entityType: "Folder", entityId: id, entityName: current.title });
  return { id };
}
