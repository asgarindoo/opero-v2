const fs = require('fs');

const file = 'lib/server/tenant-records.ts';
let code = fs.readFileSync(file, 'utf8');

// We map the "types" currently used to the actual Prisma delegate
const mapping = `
function getDelegate(type: string) {
  switch (type) {
    case 'tasks': return prisma.task;
    case 'flows': return prisma.flow;
    case 'campaigns': return prisma.campaign;
    case 'contacts': return prisma.contact;
    case 'roles': return prisma.role;
    case 'goals': return prisma.goal;
    case 'sales': return prisma.sale;
    case 'invoices': return prisma.invoice;
    case 'finance': return prisma.transaction;
    case 'products': return prisma.product;
    case 'assets': return prisma.asset;
    case 'documents': return prisma.document;
    case 'document-folders': return prisma.folder;
    case 'bots': return prisma.bot;
    case 'reports': return prisma.report;
    case 'social-channels': return prisma.socialChannel;
    case 'social-scheduled': return prisma.socialSchedule;
    case 'social-activity': return prisma.socialActivity;
    case 'content-posts': return prisma.contentPost;
    case 'content-assets': return prisma.contentAsset;
    case 'chat-channels': return prisma.chatChannel;
    case 'chat-messages': return prisma.chatMessage;
    default: return null;
  }
}
`;

// Replace listTenantRecords
const newList = `
export async function listTenantRecords(type: string) {
  const ctx = await requireTenant();
  const delegate = getDelegate(type);
  if (!delegate) return [];

  const records = await (delegate as any).findMany({
    where: { organizationId: ctx.tenantId },
    orderBy: { createdAt: "desc" },
  });

  return records.map((record: any) => ({
    ...record,
    ...(record.payload ? (typeof record.payload === 'string' ? JSON.parse(record.payload) : record.payload) : {}),
    recordId: record.id,
    recordCreatedAt: record.createdAt?.toISOString(),
    recordUpdatedAt: record.updatedAt?.toISOString(),
  }));
}
`;

const newCreate = `
export async function createTenantRecord(type: string, data: Record<string, unknown>) {
  const ctx = await requireTenant();
  const delegate = getDelegate(type);
  if (!delegate) throw new Error(\`Unknown record type: \${type}\`);

  const { id, title, name, status, priority, due, ...payload } = data;
  const recordId = id || crypto.randomUUID();

  const record = await (delegate as any).create({
    data: {
      id: recordId,
      organizationId: ctx.tenantId,
      title: (title || name || data.label || data.invoiceNumber || "Untitled") as string,
      status: (status as string) || "Pending",
      payload,
      createdById: ctx.userId,
      updatedById: ctx.userId,
    },
  });

  const entityId = record.id;
  await logTenantActivity({
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    type,
    action: "Created",
    entityId,
    entityName: record.title || getEntityName(data),
    description: typeof data.description === "string" ? data.description : null,
  });

  return {
    ...record,
    ...(record.payload ? (typeof record.payload === 'string' ? JSON.parse(record.payload) : record.payload) : {}),
    recordId: record.id,
  };
}
`;

const newUpdate = `
export async function updateTenantRecord(type: string, recordId: string, patch: Record<string, unknown>) {
  const ctx = await requireTenant();
  const delegate = getDelegate(type);
  if (!delegate) throw new Error(\`Unknown record type: \${type}\`);

  const record = await (delegate as any).findFirst({
    where: { id: recordId, organizationId: ctx.tenantId },
  });

  if (!record) return null;

  const currentPayload = typeof record.payload === 'string' ? JSON.parse(record.payload) : (record.payload || {});
  const { title, status, priority, due, id, ...patchPayload } = patch;
  
  const mergedPayload = { ...currentPayload, ...patchPayload };

  const updated = await (delegate as any).update({
    where: { id: recordId },
    data: {
      title: title !== undefined ? title : record.title,
      status: status !== undefined ? status : record.status,
      payload: mergedPayload,
      updatedById: ctx.userId,
    },
  });

  await logTenantActivity({
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    type,
    action: "Updated",
    entityId: recordId,
    entityName: updated.title || getEntityName(patch),
    description: typeof patch.description === "string" ? patch.description : null,
  });

  return {
    ...updated,
    ...(updated.payload ? (typeof updated.payload === 'string' ? JSON.parse(updated.payload) : updated.payload) : {}),
    recordId: updated.id,
  };
}
`;

const newDelete = `
export async function deleteTenantRecord(type: string, recordId: string) {
  const ctx = await requireTenant();
  const delegate = getDelegate(type);
  if (!delegate) return null;

  const record = await (delegate as any).findFirst({
    where: { id: recordId, organizationId: ctx.tenantId },
  });

  if (!record) return null;

  await (delegate as any).delete({ where: { id: recordId } });

  await logTenantActivity({
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    type,
    action: "Deleted",
    entityId: recordId,
    entityName: record.title || "Untitled",
  });

  return { id: recordId };
}
`;

// Remove old functions
const startIdx = code.indexOf('function toRecordData');
const endIdx = code.indexOf('export async function listTenantActivity');
if (startIdx !== -1 && endIdx !== -1) {
  code = code.substring(0, startIdx) + mapping + newList + newCreate + newUpdate + newDelete + code.substring(endIdx);
}

fs.writeFileSync(file, code);
console.log('tenant-records.ts updated');
