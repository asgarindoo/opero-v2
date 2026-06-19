import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/server/rbac";
import { decryptField, encryptField, getTenantAesKey } from "@/lib/server/crypto/tenant-crypto";
import { getStatus, getTitle, logDomainActivity, mapDomainRecord, parsePayload } from "@/lib/api/domain-utils";
import { dateValue, jsonArray, jsonInputOrDefault, jsonObjectOrUndefined, numberValue, textValue } from "@/lib/api/feature-records";

const MODULE = "FINANCE";
const ENTITY = "Invoice";

const INVOICE_SELECT = {
  id: true,
  organizationId: true,
  invoiceNumber: true,
  title: true,
  status: true,
  contactName: true,
  contactId: true,
  contactEmail: true,
  issueDate: true,
  dueDate: true,
  items: true,
  subtotal: true,
  discountAmount: true,
  discountRate: true,
  discountTotal: true,
  taxRate: true,
  taxAmount: true,
  taxTotal: true,
  totalAmount: true,
  currency: true,
  paymentStatus: true,
  paymentMethod: true,
  saleId: true,
  payload: true,
  createdById: true,
  updatedById: true,
  createdAt: true,
  updatedAt: true,
  createdBy: { select: { id: true, name: true, email: true, image: true } },
} as const;

function encryptJsonField(aesKey: Buffer, value: unknown): string {
  return encryptField(aesKey, JSON.stringify(value ?? null)) ?? "";
}

function decryptJsonField(aesKey: Buffer, value: unknown, fallback: unknown) {
  if (typeof value !== "string") return value ?? fallback;
  const decrypted = decryptField(aesKey, value);
  if (!decrypted) return fallback;
  try {
    return JSON.parse(decrypted);
  } catch {
    return fallback;
  }
}

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

function decryptInvoiceRecord(record: any, aesKey: Buffer) {
  return {
    ...record,
    title: typeof record.title === "string" ? decryptField(aesKey, record.title) : record.title,
    contactName: typeof record.contactName === "string" ? decryptField(aesKey, record.contactName) : record.contactName,
    contactEmail: typeof record.contactEmail === "string" ? decryptField(aesKey, record.contactEmail) : record.contactEmail,
    paymentMethod: typeof record.paymentMethod === "string" ? decryptField(aesKey, record.paymentMethod) : record.paymentMethod,
    items: decryptJsonField(aesKey, record.items, []),
    subtotal: decryptNumeric(aesKey, record.subtotal),
    discountAmount: decryptNumeric(aesKey, record.discountAmount),
    discountTotal: decryptNumeric(aesKey, record.discountTotal),
    taxAmount: decryptNumeric(aesKey, record.taxAmount),
    taxTotal: decryptNumeric(aesKey, record.taxTotal),
    totalAmount: decryptNumeric(aesKey, record.totalAmount),
  };
}

function invoicePayload(data: Record<string, unknown>, currentPayload?: unknown) {
  const payload = { ...parsePayload(currentPayload), ...parsePayload(data.payload) };
  delete payload.contactEmail;
  delete payload.recipientEmail;
  if (data.recipientName !== undefined) payload.recipientName = textValue(data.recipientName);
  return jsonObjectOrUndefined(payload) ?? {};
}

function mapInvoice(record: any, aesKey: Buffer, fallbackUser?: { id: string; name: string; email?: string | null; image?: string | null }) {
  const decrypted = decryptInvoiceRecord(record, aesKey);
  const mapped = mapDomainRecord(decrypted, fallbackUser) as any;
  const payload = parsePayload(decrypted.payload);
  return {
    ...mapped,
    contactName: mapped.contactName ?? mapped.recipientName ?? payload.contactName ?? payload.recipientName,
    contactEmail: mapped.contactEmail,
    grandTotal: mapped.grandTotal ?? mapped.totalAmount,
  };
}

async function findInvoiceRecord(tenantId: string, id: string) {
  return prisma.invoice.findFirst({
    where: { id, organizationId: tenantId },
    select: INVOICE_SELECT,
  });
}

async function resolveSaleId(tenantId: string, value: unknown) {
  if (value === null) return null;
  const saleId = textValue(value);
  if (!saleId) return undefined;
  const sale = await prisma.sale.findFirst({ where: { id: saleId, organizationId: tenantId }, select: { id: true } });
  return sale?.id ?? null;
}

function buildInvoiceTotals(data: Record<string, unknown>) {
  const discountAmount = numberValue(data.discountAmount) ?? numberValue(data.discountTotal) ?? 0;
  const taxAmount = numberValue(data.taxAmount) ?? numberValue(data.taxTotal) ?? 0;
  const grandTotal = numberValue(data.grandTotal) ?? numberValue(data.totalAmount) ?? 0;
  return { discountAmount, taxAmount, grandTotal };
}

// ── syncFinanceTransaction — creates an encrypted Transaction on Invoice Paid ─

async function syncFinanceTransaction(ctx: any, invoiceId: string, invoiceStatus: string, invoiceData: Record<string, unknown>, updatedTitle: string) {
  const existingTx = await prisma.transaction.findFirst({
    where: { organizationId: ctx.tenantId, sourceType: "Invoice", sourceId: invoiceId },
  });

  if (invoiceStatus === "Paid") {
    if (!existingTx) {
      const amount = numberValue(invoiceData.totalAmount) ?? numberValue(invoiceData.grandTotal) ?? 0;
      const invoiceNumber = textValue(invoiceData.invoiceNumber) ?? updatedTitle;
      const aesKey = await getTenantAesKey(ctx.tenantId);
      try {
        await prisma.transaction.create({
          data: {
            id: "tx_" + crypto.randomUUID(),
            organizationId: ctx.tenantId,
            title: encryptField(aesKey, `Payment received for Invoice ${invoiceNumber}`),
            type: "Income",
            amount: encryptField(aesKey, String(amount)) as any,
            currency: textValue(invoiceData.currency) ?? "USD",
            category: "Invoice Payment",
            transactionDate: new Date(),
            paymentMethod: encryptField(aesKey, "-"),
            reference: encryptField(aesKey, invoiceNumber),
            sourceType: "Invoice",
            sourceId: invoiceId,
            contactName: encryptField(aesKey, textValue(invoiceData.contactName) ?? null),
            contactId: textValue(invoiceData.contactId),
            notes: encryptField(aesKey, "Auto-generated from Invoice payment."),
            status: "Completed",
            createdById: ctx.userId,
            updatedById: ctx.userId,
          },
        });
      } finally {
        aesKey.fill(0);
      }
    } else {
      await prisma.transaction.update({
        where: { id: existingTx.id },
        data: { status: "Completed", sourceType: existingTx.sourceType ?? "Invoice", sourceId: existingTx.sourceId ?? invoiceId, updatedById: ctx.userId },
      });
    }
  } else {
    if (existingTx) {
      await prisma.transaction.update({
        where: { id: existingTx.id },
        data: { status: "Cancelled", updatedById: ctx.userId },
      });
    }
  }
}

export async function listInvoices() {
  const ctx = await requirePermission("invoices.read");
  const invoices = await prisma.invoice.findMany({
    where: { organizationId: ctx.tenantId },
    orderBy: { createdAt: "desc" },
    select: INVOICE_SELECT,
  });
  const aesKey = await getTenantAesKey(ctx.tenantId);
  try {
    return invoices.map((invoice) => mapInvoice(invoice, aesKey));
  } finally {
    aesKey.fill(0);
  }
}

export async function getInvoiceById(id: string) {
  const ctx = await requirePermission("invoices.read");
  const invoice = await findInvoiceRecord(ctx.tenantId, id);
  if (!invoice) return null;
  const aesKey = await getTenantAesKey(ctx.tenantId);
  try {
    return mapInvoice(invoice, aesKey);
  } finally {
    aesKey.fill(0);
  }
}

export async function createInvoice(data: Record<string, unknown>) {
  const ctx = await requirePermission("invoices.create");
  const invoiceNumber = textValue(data.invoiceNumber);
  const title = invoiceNumber ?? getTitle(data);
  const status = getStatus(data, "Unpaid");
  const { discountAmount, taxAmount, grandTotal } = buildInvoiceTotals(data);
  const saleId = await resolveSaleId(ctx.tenantId, data.saleId);
  const aesKey = await getTenantAesKey(ctx.tenantId);

  try {
    const invoice = await prisma.invoice.create({
      data: {
        id: typeof data.id === "string" && data.id ? data.id : crypto.randomUUID(),
        organizationId: ctx.tenantId,
        invoiceNumber,
        title: encryptField(aesKey, title),
        status,
        contactName: encryptField(aesKey, textValue(data.contactName) ?? null),
        contactId: textValue(data.contactId),
        contactEmail: encryptField(aesKey, textValue(data.contactEmail) ?? textValue(data.recipientEmail) ?? null),
        payload: invoicePayload(data),
        issueDate: dateValue(data.issueDate),
        dueDate: dateValue(data.dueDate),
        items: encryptJsonField(aesKey, jsonArray(data.items)) as any,
        subtotal: encryptNumeric(aesKey, numberValue(data.subtotal) ?? 0) as any,
        discountAmount: encryptNumeric(aesKey, discountAmount) as any,
        discountRate: numberValue(data.discountRate),
        discountTotal: encryptNumeric(aesKey, numberValue(data.discountTotal) ?? discountAmount) as any,
        taxRate: numberValue(data.taxRate),
        taxAmount: encryptNumeric(aesKey, taxAmount) as any,
        taxTotal: encryptNumeric(aesKey, numberValue(data.taxTotal) ?? taxAmount) as any,
        totalAmount: encryptNumeric(aesKey, numberValue(data.totalAmount) ?? grandTotal) as any,
        currency: textValue(data.currency) ?? "USD",
        paymentStatus: textValue(data.paymentStatus) ?? status,
        paymentMethod: encryptField(aesKey, textValue(data.paymentMethod) ?? null),
        saleId,
        createdById: ctx.userId,
        updatedById: ctx.userId,
      },
      select: INVOICE_SELECT,
    });
    await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Created", entityType: ENTITY, entityId: invoice.id, entityName: invoiceNumber ?? title });

    if (status === "Paid") {
      const mapped = mapInvoice(invoice, aesKey);
      await syncFinanceTransaction(ctx, invoice.id, status, mapped as any, title);
    }

    return mapInvoice(invoice, aesKey, ctx.user);
  } finally {
    aesKey.fill(0);
  }
}

export async function updateInvoice(id: string, patch: Record<string, unknown>) {
  const ctx = await requirePermission("invoices.update");
  const current = await findInvoiceRecord(ctx.tenantId, id);
  if (!current) return null;

  const aesKey = await getTenantAesKey(ctx.tenantId);
  try {
    const currentPlain = decryptInvoiceRecord(current, aesKey);
    const { discountAmount, taxAmount, grandTotal } = buildInvoiceTotals(patch);
    const saleId = patch.saleId !== undefined ? await resolveSaleId(ctx.tenantId, patch.saleId) : current.saleId;
    const invoiceNumber = patch.invoiceNumber !== undefined ? textValue(patch.invoiceNumber) : current.invoiceNumber;
    const title = patch.invoiceNumber !== undefined || patch.title !== undefined
      ? textValue(patch.invoiceNumber) ?? getTitle(patch, currentPlain.title ?? "Untitled")
      : (currentPlain.title ?? "Untitled");

    const updated = await prisma.invoice.update({
      where: { id: current.id },
      data: {
        invoiceNumber,
        title: encryptField(aesKey, title),
        status: typeof patch.status === "string" ? patch.status : current.status,
        contactName: patch.contactName !== undefined ? encryptField(aesKey, textValue(patch.contactName) ?? null) : current.contactName,
        contactId: patch.contactId !== undefined ? textValue(patch.contactId) : current.contactId,
        contactEmail: patch.contactEmail !== undefined || patch.recipientEmail !== undefined
          ? encryptField(aesKey, textValue(patch.contactEmail) ?? textValue(patch.recipientEmail) ?? null)
          : current.contactEmail,
        payload: invoicePayload(patch, current.payload),
        issueDate: patch.issueDate !== undefined ? dateValue(patch.issueDate) : current.issueDate,
        dueDate: patch.dueDate !== undefined ? dateValue(patch.dueDate) : current.dueDate,
        items: patch.items !== undefined ? encryptJsonField(aesKey, jsonArray(patch.items)) as any : current.items,
        subtotal: encryptNumeric(aesKey, patch.subtotal !== undefined ? numberValue(patch.subtotal) ?? currentPlain.subtotal : currentPlain.subtotal) as any,
        discountAmount: patch.discountAmount !== undefined || patch.discountTotal !== undefined ? encryptNumeric(aesKey, discountAmount) as any : current.discountAmount,
        discountRate: patch.discountRate !== undefined ? numberValue(patch.discountRate) : current.discountRate,
        discountTotal: patch.discountTotal !== undefined || patch.discountAmount !== undefined
          ? encryptNumeric(aesKey, numberValue(patch.discountTotal) ?? numberValue(patch.discountAmount) ?? currentPlain.discountTotal) as any
          : current.discountTotal,
        taxRate: patch.taxRate !== undefined ? numberValue(patch.taxRate) : current.taxRate,
        taxAmount: patch.taxAmount !== undefined || patch.taxTotal !== undefined ? encryptNumeric(aesKey, taxAmount) as any : current.taxAmount,
        taxTotal: patch.taxTotal !== undefined || patch.taxAmount !== undefined
          ? encryptNumeric(aesKey, numberValue(patch.taxTotal) ?? numberValue(patch.taxAmount) ?? currentPlain.taxTotal) as any
          : current.taxTotal,
        totalAmount: patch.totalAmount !== undefined || patch.grandTotal !== undefined
          ? encryptNumeric(aesKey, numberValue(patch.totalAmount) ?? grandTotal) as any
          : current.totalAmount,
        currency: patch.currency !== undefined ? textValue(patch.currency) ?? current.currency : current.currency,
        paymentStatus: patch.paymentStatus !== undefined || patch.status !== undefined
          ? textValue(patch.paymentStatus) ?? textValue(patch.status)
          : current.paymentStatus,
        paymentMethod: patch.paymentMethod !== undefined ? encryptField(aesKey, textValue(patch.paymentMethod) ?? null) : current.paymentMethod,
        saleId,
        updatedById: ctx.userId,
      },
      select: INVOICE_SELECT,
    });
    await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Updated", entityType: ENTITY, entityId: current.id, entityName: invoiceNumber ?? title });

    if (typeof patch.status === "string" && patch.status !== current.status) {
      const mapped = mapInvoice(updated, aesKey);
      await syncFinanceTransaction(ctx, current.id, patch.status, mapped as any, title);
    }

    return mapInvoice(updated, aesKey);
  } finally {
    aesKey.fill(0);
  }
}

export async function deleteInvoice(id: string) {
  const ctx = await requirePermission("invoices.delete");
  const current = await findInvoiceRecord(ctx.tenantId, id);
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
  const result = await prisma.invoice.deleteMany({ where: { id: current.id, organizationId: ctx.tenantId } });
  if (result.count === 0) return null;
  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Deleted", entityType: ENTITY, entityId: current.id, entityName });
  return { id: current.id };
}
