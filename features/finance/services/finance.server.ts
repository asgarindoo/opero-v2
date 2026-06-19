import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/server/rbac";
import { decryptField, encryptField, getTenantAesKey } from "@/lib/server/crypto/tenant-crypto";
import { getStatus, getTitle, logDomainActivity, mapDomainRecord } from "@/lib/api/domain-utils";
import { dateValue, numberValue, textValue } from "@/lib/api/feature-records";

const MODULE = "FINANCE";
const ENTITY = "Transaction";

const TRANSACTION_SELECT = {
  id: true,
  organizationId: true,
  type: true,
  title: true,
  amount: true,
  currency: true,
  category: true,
  transactionDate: true,
  paymentMethod: true,
  reference: true,
  sourceType: true,
  sourceId: true,
  status: true,
  contactName: true,
  contactId: true,
  notes: true,
  payload: true,
  createdById: true,
  updatedById: true,
  createdAt: true,
  updatedAt: true,
  createdBy: { select: { id: true, name: true, email: true, image: true } },
} as const;

function encryptNumeric(aesKey: Buffer, value: number): string {
  return encryptField(aesKey, String(value)) ?? "0";
}

function decryptNumeric(aesKey: Buffer, value: unknown, fallback = 0): number {
  if (typeof value !== "string") return typeof value === "number" ? value : fallback;
  const decrypted = decryptField(aesKey, value);
  if (!decrypted) return fallback;
  const parsed = parseFloat(decrypted);
  return isNaN(parsed) ? fallback : parsed;
}

function decryptTransactionRecord(record: any, aesKey: Buffer) {
  return {
    ...record,
    title: typeof record.title === "string" ? decryptField(aesKey, record.title) : record.title,
    amount: decryptNumeric(aesKey, record.amount),
    paymentMethod: typeof record.paymentMethod === "string" ? decryptField(aesKey, record.paymentMethod) : record.paymentMethod,
    reference: typeof record.reference === "string" ? decryptField(aesKey, record.reference) : record.reference,
    contactName: typeof record.contactName === "string" ? decryptField(aesKey, record.contactName) : record.contactName,
    notes: typeof record.notes === "string" ? decryptField(aesKey, record.notes) : record.notes,
  };
}

function mapTransaction(record: any, aesKey: Buffer, fallbackUser?: { id: string; name: string; email?: string | null; image?: string | null }) {
  const decrypted = decryptTransactionRecord(record, aesKey);
  return mapDomainRecord(decrypted, fallbackUser);
}

export async function listTransactions() {
  const ctx = await requirePermission("finance.read");
  const transactions = await prisma.transaction.findMany({
    where: { organizationId: ctx.tenantId },
    orderBy: { createdAt: "desc" },
    select: TRANSACTION_SELECT,
  });
  const aesKey = await getTenantAesKey(ctx.tenantId);
  try {
    return transactions.map((tx) => mapTransaction(tx, aesKey));
  } finally {
    aesKey.fill(0);
  }
}

export async function getTransactionById(id: string) {
  const ctx = await requirePermission("finance.read");
  const transaction = await prisma.transaction.findFirst({
    where: { id, organizationId: ctx.tenantId },
    select: TRANSACTION_SELECT,
  });
  if (!transaction) return null;
  const aesKey = await getTenantAesKey(ctx.tenantId);
  try {
    return mapTransaction(transaction, aesKey);
  } finally {
    aesKey.fill(0);
  }
}

export async function createTransaction(data: Record<string, unknown>) {
  const ctx = await requirePermission("finance.create");
  const title = getTitle(data);
  const amount = numberValue(data.amount) ?? 0;
  const aesKey = await getTenantAesKey(ctx.tenantId);

  try {
    const transaction = await prisma.transaction.create({
      data: {
        id: typeof data.id === "string" && data.id ? data.id : crypto.randomUUID(),
        organizationId: ctx.tenantId,
        type: textValue(data.type) ?? "Expense",
        title: encryptField(aesKey, title),
        amount: encryptNumeric(aesKey, amount) as any,
        currency: textValue(data.currency) ?? "USD",
        category: textValue(data.category) ?? "General",
        transactionDate: dateValue(data.transactionDate),
        paymentMethod: encryptField(aesKey, textValue(data.paymentMethod) ?? null),
        reference: encryptField(aesKey, textValue(data.reference) ?? null),
        sourceType: textValue(data.sourceType) ?? "Manual",
        sourceId: textValue(data.sourceId),
        status: getStatus(data, "Pending"),
        contactName: encryptField(aesKey, textValue(data.contactName) ?? null),
        contactId: textValue(data.contactId),
        notes: encryptField(aesKey, textValue(data.notes) ?? null),
        createdById: ctx.userId,
        updatedById: ctx.userId,
      },
      select: TRANSACTION_SELECT,
    });
    await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Created", entityType: ENTITY, entityId: transaction.id, entityName: title });
    return mapTransaction(transaction, aesKey, ctx.user);
  } finally {
    aesKey.fill(0);
  }
}

export async function updateTransaction(id: string, patch: Record<string, unknown>) {
  const ctx = await requirePermission("finance.update");
  const current = await prisma.transaction.findFirst({ where: { id, organizationId: ctx.tenantId }, select: TRANSACTION_SELECT });
  if (!current) return null;

  const aesKey = await getTenantAesKey(ctx.tenantId);
  try {
    const currentPlain = decryptTransactionRecord(current, aesKey);
    const title = patch.title !== undefined || patch.name !== undefined
      ? getTitle(patch, currentPlain.title ?? "Untitled")
      : (currentPlain.title ?? "Untitled");
    const amount = patch.amount !== undefined ? numberValue(patch.amount) ?? currentPlain.amount : currentPlain.amount;

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        type: patch.type !== undefined ? textValue(patch.type) : current.type,
        title: encryptField(aesKey, title),
        amount: encryptNumeric(aesKey, amount) as any,
        currency: patch.currency !== undefined ? textValue(patch.currency) ?? current.currency : current.currency,
        category: patch.category !== undefined ? textValue(patch.category) : current.category,
        transactionDate: patch.transactionDate !== undefined ? dateValue(patch.transactionDate) : current.transactionDate,
        paymentMethod: patch.paymentMethod !== undefined ? encryptField(aesKey, textValue(patch.paymentMethod) ?? null) : current.paymentMethod,
        reference: patch.reference !== undefined ? encryptField(aesKey, textValue(patch.reference) ?? null) : current.reference,
        sourceType: patch.sourceType !== undefined ? textValue(patch.sourceType) : current.sourceType,
        sourceId: patch.sourceId !== undefined ? textValue(patch.sourceId) : current.sourceId,
        status: typeof patch.status === "string" ? patch.status : current.status,
        contactName: patch.contactName !== undefined ? encryptField(aesKey, textValue(patch.contactName) ?? null) : current.contactName,
        contactId: patch.contactId !== undefined ? textValue(patch.contactId) : current.contactId,
        notes: patch.notes !== undefined ? encryptField(aesKey, textValue(patch.notes) ?? null) : current.notes,
        updatedById: ctx.userId,
      },
      select: TRANSACTION_SELECT,
    });
    await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Updated", entityType: ENTITY, entityId: id, entityName: title });
    return mapTransaction(updated, aesKey);
  } finally {
    aesKey.fill(0);
  }
}

export async function deleteTransaction(id: string) {
  const ctx = await requirePermission("finance.delete");
  const current = await prisma.transaction.findFirst({ where: { id, organizationId: ctx.tenantId }, select: { title: true } });
  if (!current) return null;
  let entityName: string | null = null;
  if (typeof current.title === "string") {
    const aesKey = await getTenantAesKey(ctx.tenantId);
    try {
      entityName = decryptField(aesKey, current.title);
    } finally {
      aesKey.fill(0);
    }
  }
  const result = await prisma.transaction.deleteMany({ where: { id, organizationId: ctx.tenantId } });
  if (result.count === 0) return null;
  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Deleted", entityType: ENTITY, entityId: id, entityName });
  return { id };
}
