import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/server/rbac";
import { decryptField, encryptField, getTenantAesKey } from "@/lib/server/crypto/tenant-crypto";
import { getStatus, getTitle, logDomainActivity, mapDomainRecord } from "@/lib/api/domain-utils";
import { deletePrivateObject, TENANT_FILES_BUCKET } from "@/lib/server/supabase-storage";
import { intValue, jsonArray, jsonInputOrDefault, textValue } from "@/lib/api/feature-records";

const MODULE = "DOCUMENTS";

const DOCUMENT_SELECT = {
  id: true,
  organizationId: true,
  title: true,
  description: true,
  status: true,
  fileName: true,
  fileType: true,
  fileSize: true,
  storagePath: true,
  fileUrl: true,
  downloadUrl: true,
  folderId: true,
  tags: true,
  uploadedById: true,
  payload: true,
  createdById: true,
  updatedById: true,
  createdAt: true,
  updatedAt: true,
  createdBy: { select: { id: true, name: true, email: true, image: true } },
} as const;

const FOLDER_SELECT = {
  id: true,
  organizationId: true,
  title: true,
  name: true,
  description: true,
  status: true,
  parentId: true,
  color: true,
  sortOrder: true,
  tags: true,
  payload: true,
  createdById: true,
  updatedById: true,
  createdAt: true,
  updatedAt: true,
  createdBy: { select: { id: true, name: true, email: true, image: true } },
} as const;

function decryptDocumentRecord(record: any, aesKey: Buffer) {
  return {
    ...record,
    title: typeof record.title === "string" ? decryptField(aesKey, record.title) : record.title,
    description: typeof record.description === "string" ? decryptField(aesKey, record.description) : record.description,
    fileName: typeof record.fileName === "string" ? decryptField(aesKey, record.fileName) : record.fileName,
    storagePath: typeof record.storagePath === "string" ? decryptField(aesKey, record.storagePath) : record.storagePath,
    fileUrl: typeof record.fileUrl === "string" ? decryptField(aesKey, record.fileUrl) : record.fileUrl,
    downloadUrl: typeof record.downloadUrl === "string" ? decryptField(aesKey, record.downloadUrl) : record.downloadUrl,
  };
}

function mapDocument(record: any, aesKey: Buffer, fallbackUser?: { id: string; name: string; email?: string | null; image?: string | null }) {
  const decrypted = decryptDocumentRecord(record, aesKey);
  return mapDomainRecord(decrypted, fallbackUser);
}

async function resolveFolderId(tenantId: string, value: unknown) {
  if (value === null) return null;
  const folderId = textValue(value);
  if (!folderId) return undefined;
  const folder = await prisma.folder.findFirst({ where: { id: folderId, organizationId: tenantId }, select: { id: true } });
  return folder?.id ?? null;
}

async function resolveParentFolderId(tenantId: string, value: unknown, currentId?: string) {
  if (value === null) return null;
  const parentId = textValue(value);
  if (!parentId || parentId === currentId) return null;
  const folder = await prisma.folder.findFirst({ where: { id: parentId, organizationId: tenantId }, select: { id: true } });
  return folder?.id ?? null;
}

export async function listDocuments() {
  const ctx = await requirePermission("documents.read");
  const documents = await prisma.document.findMany({
    where: { organizationId: ctx.tenantId },
    orderBy: { createdAt: "desc" },
    select: DOCUMENT_SELECT,
  });
  const aesKey = await getTenantAesKey(ctx.tenantId);
  try {
    return documents.map((doc) => mapDocument(doc, aesKey));
  } finally {
    aesKey.fill(0);
  }
}

export async function getDocumentById(id: string) {
  const ctx = await requirePermission("documents.read");
  const document = await prisma.document.findFirst({ where: { id, organizationId: ctx.tenantId }, select: DOCUMENT_SELECT });
  if (!document) return null;
  const aesKey = await getTenantAesKey(ctx.tenantId);
  try {
    return mapDocument(document, aesKey);
  } finally {
    aesKey.fill(0);
  }
}

export async function createDocument(data: Record<string, unknown>) {
  const ctx = await requirePermission("documents.create");
  const title = getTitle(data);
  const folderId = await resolveFolderId(ctx.tenantId, data.folderId);
  const aesKey = await getTenantAesKey(ctx.tenantId);

  try {
    const document = await prisma.document.create({
      data: {
        organizationId: ctx.tenantId,
        title: encryptField(aesKey, title),
        description: encryptField(aesKey, textValue(data.description) ?? null),
        status: getStatus(data, "Active"),
        fileName: encryptField(aesKey, textValue(data.fileName) ?? null),
        fileType: textValue(data.fileType),
        fileSize: intValue(data.fileSize),
        storagePath: encryptField(aesKey, textValue(data.storagePath) ?? null),
        fileUrl: encryptField(aesKey, textValue(data.fileUrl) ?? textValue(data.downloadUrl) ?? null),
        downloadUrl: encryptField(aesKey, textValue(data.downloadUrl) ?? textValue(data.fileUrl) ?? null),
        folderId,
        tags: jsonArray(data.tags),
        uploadedById: textValue(data.uploadedById) ?? ctx.userId,
        createdById: ctx.userId,
        updatedById: ctx.userId,
      },
      select: DOCUMENT_SELECT,
    });
    await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Created", entityType: "Document", entityId: document.id, entityName: title, description: typeof data.description === "string" ? data.description : null });
    return mapDocument(document, aesKey, ctx.user);
  } finally {
    aesKey.fill(0);
  }
}

export async function updateDocument(id: string, patch: Record<string, unknown>) {
  const ctx = await requirePermission("documents.update");
  const current = await prisma.document.findFirst({ where: { id, organizationId: ctx.tenantId }, select: DOCUMENT_SELECT });
  if (!current) return null;

  const aesKey = await getTenantAesKey(ctx.tenantId);
  try {
    const currentPlain = decryptDocumentRecord(current, aesKey);
    const folderId = patch.folderId !== undefined ? await resolveFolderId(ctx.tenantId, patch.folderId) : current.folderId;
    const title = patch.title !== undefined ? getTitle(patch, currentPlain.title ?? "Untitled") : (currentPlain.title ?? "Untitled");

    const updated = await prisma.document.update({
      where: { id },
      data: {
        title: encryptField(aesKey, title),
        description: patch.description !== undefined ? encryptField(aesKey, textValue(patch.description) ?? null) : current.description,
        status: typeof patch.status === "string" ? patch.status : current.status,
        fileName: patch.fileName !== undefined ? encryptField(aesKey, textValue(patch.fileName) ?? null) : current.fileName,
        fileType: patch.fileType !== undefined ? textValue(patch.fileType) : current.fileType,
        fileSize: patch.fileSize !== undefined ? intValue(patch.fileSize) : current.fileSize,
        storagePath: patch.storagePath !== undefined ? encryptField(aesKey, textValue(patch.storagePath) ?? null) : current.storagePath,
        fileUrl: patch.fileUrl !== undefined || patch.downloadUrl !== undefined
          ? encryptField(aesKey, textValue(patch.fileUrl) ?? textValue(patch.downloadUrl) ?? null)
          : current.fileUrl,
        downloadUrl: patch.downloadUrl !== undefined || patch.fileUrl !== undefined
          ? encryptField(aesKey, textValue(patch.downloadUrl) ?? textValue(patch.fileUrl) ?? null)
          : current.downloadUrl,
        folderId,
        tags: patch.tags !== undefined ? jsonArray(patch.tags) : jsonInputOrDefault(current.tags, []),
        uploadedById: patch.uploadedById !== undefined ? textValue(patch.uploadedById) : current.uploadedById,
        updatedById: ctx.userId,
      },
      select: DOCUMENT_SELECT,
    });
    await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Updated", entityType: "Document", entityId: id, entityName: title, description: typeof patch.description === "string" ? patch.description : null });
    return mapDocument(updated, aesKey);
  } finally {
    aesKey.fill(0);
  }
}

export async function deleteDocument(id: string) {
  const ctx = await requirePermission("documents.delete");
  const current = await prisma.document.findFirst({ where: { id, organizationId: ctx.tenantId }, select: DOCUMENT_SELECT });
  if (!current) return null;

  // Decrypt storagePath before using it for storage deletion
  let storagePath: string | null = null;
  let entityName: string | null = null;
  if (current.storagePath || current.title) {
    const aesKey = await getTenantAesKey(ctx.tenantId);
    try {
      if (typeof current.storagePath === "string") storagePath = decryptField(aesKey, current.storagePath);
      if (typeof current.title === "string") entityName = decryptField(aesKey, current.title);
    } finally {
      aesKey.fill(0);
    }
  }

  const result = await prisma.document.deleteMany({ where: { id, organizationId: ctx.tenantId } });
  if (result.count === 0) return null;

  if (storagePath) {
    try {
      await deletePrivateObject(TENANT_FILES_BUCKET, storagePath);
    } catch (err) {
      console.error(`Failed to delete storage object for document ${id}:`, err);
    }
  }

  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Deleted", entityType: "Document", entityId: id, entityName });
  return { id };
}

export async function listFolders() {
  const ctx = await requirePermission("documentFolders.read");
  const folders = await prisma.folder.findMany({ where: { organizationId: ctx.tenantId }, orderBy: { createdAt: "desc" }, select: FOLDER_SELECT });
  return folders.map((folder) => mapDomainRecord(folder));
}

export async function getFolderById(id: string) {
  const ctx = await requirePermission("documentFolders.read");
  const folder = await prisma.folder.findFirst({ where: { id, organizationId: ctx.tenantId }, select: FOLDER_SELECT });
  return folder ? mapDomainRecord(folder) : null;
}

export async function createFolder(data: Record<string, unknown>) {
  const ctx = await requirePermission("documentFolders.create");
  const title = getTitle(data);
  const parentId = await resolveParentFolderId(ctx.tenantId, data.parentId);
  const folder = await prisma.folder.create({
    data: {
      organizationId: ctx.tenantId,
      title,
      name: textValue(data.name) ?? title,
      description: textValue(data.description),
      status: getStatus(data, "Active"),
      parentId,
      color: textValue(data.color),
      sortOrder: intValue(data.sortOrder) ?? 0,
      tags: jsonArray(data.tags),
      createdById: ctx.userId,
      updatedById: ctx.userId,
    },
    select: FOLDER_SELECT,
  });
  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Created", entityType: "Folder", entityId: folder.id, entityName: title, description: typeof data.description === "string" ? data.description : null });
  return mapDomainRecord(folder, ctx.user);
}

export async function updateFolder(id: string, patch: Record<string, unknown>) {
  const ctx = await requirePermission("documentFolders.update");
  const current = await prisma.folder.findFirst({ where: { id, organizationId: ctx.tenantId }, select: FOLDER_SELECT });
  if (!current) return null;
  const title = getTitle(patch, current.title ?? "Untitled");
  const parentId = patch.parentId !== undefined ? await resolveParentFolderId(ctx.tenantId, patch.parentId, id) : current.parentId;
  const result = await prisma.folder.updateMany({
    where: { id, organizationId: ctx.tenantId },
    data: {
      title,
      name: patch.name !== undefined ? textValue(patch.name) ?? title : current.name,
      description: patch.description !== undefined ? textValue(patch.description) : current.description,
      status: typeof patch.status === "string" ? patch.status : current.status,
      parentId,
      color: patch.color !== undefined ? textValue(patch.color) : current.color,
      sortOrder: patch.sortOrder !== undefined ? intValue(patch.sortOrder) ?? current.sortOrder : current.sortOrder,
      tags: patch.tags !== undefined ? jsonArray(patch.tags) : jsonInputOrDefault(current.tags, []),
      updatedById: ctx.userId,
    },
  });
  if (result.count === 0) return null;
  const updated = await prisma.folder.findFirst({ where: { id, organizationId: ctx.tenantId }, select: FOLDER_SELECT });
  if (!updated) return null;
  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Updated", entityType: "Folder", entityId: id, entityName: updated.title, description: typeof patch.description === "string" ? patch.description : null });
  return mapDomainRecord(updated);
}

export async function deleteFolder(id: string) {
  const ctx = await requirePermission("documentFolders.delete");
  const current = await prisma.folder.findFirst({ where: { id, organizationId: ctx.tenantId }, select: FOLDER_SELECT });
  if (!current) return null;
  const result = await prisma.folder.deleteMany({ where: { id, organizationId: ctx.tenantId } });
  if (result.count === 0) return null;
  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Deleted", entityType: "Folder", entityId: id, entityName: current.title });
  return { id };
}
