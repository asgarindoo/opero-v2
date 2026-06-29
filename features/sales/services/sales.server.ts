import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/server/rbac";
import { decryptField, encryptField, getTenantAesKey } from "@/lib/server/crypto/tenant-crypto";
import { getStatus, getTitle, logDomainActivity, mapDomainRecord } from "@/lib/api/domain-utils";
import { jsonArray, jsonInputOrDefault, numberValue, textValue } from "@/lib/api/feature-records";

const MODULE = "SALES";
const ENTITY = "Sale";

const SALE_SELECT = {
  id: true,
  organizationId: true,
  saleNumber: true,
  title: true,
  status: true,
  saleType: true,
  paymentStatus: true,
  contactName: true,
  contactId: true,
  items: true,
  subtotal: true,
  discountAmount: true,
  taxAmount: true,
  grandTotal: true,
  currency: true,
  orderDiscountValue: true,
  orderDiscountType: true,
  discountTotal: true,
  taxPercentage: true,
  activities: true,
  shippingAddress: true,
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


function decryptSaleRecord(record: any, aesKey: Buffer) {
  return {
    ...record,
    title: typeof record.title === "string" ? decryptField(aesKey, record.title) : record.title,
    contactName: typeof record.contactName === "string" ? decryptField(aesKey, record.contactName) : record.contactName,
    shippingAddress: typeof record.shippingAddress === "string" ? decryptField(aesKey, record.shippingAddress) : record.shippingAddress,
    items: decryptJsonField(aesKey, record.items, []),
    subtotal: record.subtotal,
    discountAmount: record.discountAmount,
    taxAmount: record.taxAmount,
    grandTotal: record.grandTotal,
    orderDiscountValue: record.orderDiscountValue,
    discountTotal: record.discountTotal,
  };
}

function mapSale(record: any, aesKey: Buffer, fallbackUser?: { id: string; name: string; email?: string | null; image?: string | null }) {
  const decrypted = decryptSaleRecord(record, aesKey);
  return mapDomainRecord(decrypted, fallbackUser);
}

export async function listSales() {
  const ctx = await requirePermission("sales.read");
  const sales = await prisma.sale.findMany({
    where: { organizationId: ctx.tenantId },
    orderBy: { createdAt: "desc" },
    select: SALE_SELECT,
  });
  const aesKey = await getTenantAesKey(ctx.tenantId);
  try {
    return sales.map((sale) => mapSale(sale, aesKey));
  } finally {
    aesKey.fill(0);
  }
}

export async function getSaleById(id: string) {
  const ctx = await requirePermission("sales.read");
  const sale = await prisma.sale.findFirst({
    where: { id, organizationId: ctx.tenantId },
    select: SALE_SELECT,
  });
  if (!sale) return null;
  const aesKey = await getTenantAesKey(ctx.tenantId);
  try {
    return mapSale(sale, aesKey);
  } finally {
    aesKey.fill(0);
  }
}

export async function createSale(data: Record<string, unknown>) {
  const ctx = await requirePermission("sales.create");
  const title = getTitle(data);
  const saleNumber = textValue(data.saleNumber) ?? textValue(data.orderNumber);
  const discountAmount = numberValue(data.discountAmount) ?? numberValue(data.discountTotal) ?? 0;
  const grandTotal = numberValue(data.grandTotal) ?? numberValue(data.total) ?? 0;
  const aesKey = await getTenantAesKey(ctx.tenantId);

  try {
    const sale = await prisma.sale.create({
      data: {
        organizationId: ctx.tenantId,
        saleNumber,
        title: encryptField(aesKey, title),
        status: getStatus(data),
        saleType: textValue(data.saleType),
        paymentStatus: textValue(data.paymentStatus),
        contactName: encryptField(aesKey, textValue(data.contactName) ?? null),
        contactId: textValue(data.contactId),
        items: encryptJsonField(aesKey, jsonArray(data.items)),
        subtotal: numberValue(data.subtotal) ?? 0,
        discountAmount,
        taxAmount: numberValue(data.taxAmount) ?? 0,
        grandTotal,
        currency: textValue(data.currency) ?? "USD",
        orderDiscountValue: data.orderDiscountValue != null ? (numberValue(data.orderDiscountValue) ?? 0) : undefined,
        orderDiscountType: textValue(data.orderDiscountType),
        discountTotal: numberValue(data.discountTotal) ?? discountAmount,
        taxPercentage: numberValue(data.taxPercentage),
        activities: jsonArray(data.activities),
        shippingAddress: encryptField(aesKey, textValue(data.shippingAddress) ?? null),
        createdById: ctx.userId,
        updatedById: ctx.userId,
      },
      select: SALE_SELECT,
    });
    await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Created", entityType: ENTITY, entityId: sale.id, entityName: title });
    return mapSale(sale, aesKey, ctx.user);
  } finally {
    aesKey.fill(0);
  }
}

export async function updateSale(id: string, patch: Record<string, unknown>) {
  const ctx = await requirePermission("sales.update");
  const current = await prisma.sale.findFirst({ where: { id, organizationId: ctx.tenantId }, select: SALE_SELECT });
  if (!current) return null;

  const aesKey = await getTenantAesKey(ctx.tenantId);
  try {
    const currentPlain = decryptSaleRecord(current, aesKey);
    const discountAmount = patch.discountAmount !== undefined || patch.discountTotal !== undefined
      ? numberValue(patch.discountAmount) ?? numberValue(patch.discountTotal) ?? currentPlain.discountAmount
      : currentPlain.discountAmount;
    const grandTotal = patch.grandTotal !== undefined || patch.total !== undefined
      ? numberValue(patch.grandTotal) ?? numberValue(patch.total) ?? currentPlain.grandTotal
      : currentPlain.grandTotal;
    const title = patch.title !== undefined || patch.name !== undefined
      ? getTitle(patch, currentPlain.title ?? "Untitled")
      : (currentPlain.title ?? "Untitled");

    const updated = await prisma.sale.update({
      where: { id },
      data: {
        saleNumber: patch.saleNumber !== undefined || patch.orderNumber !== undefined ? textValue(patch.saleNumber) ?? textValue(patch.orderNumber) : current.saleNumber,
        title: encryptField(aesKey, title),
        status: typeof patch.status === "string" ? patch.status : current.status,
        saleType: patch.saleType !== undefined ? textValue(patch.saleType) : current.saleType,
        paymentStatus: patch.paymentStatus !== undefined ? textValue(patch.paymentStatus) : current.paymentStatus,
        contactName: patch.contactName !== undefined ? encryptField(aesKey, textValue(patch.contactName) ?? null) : current.contactName,
        contactId: patch.contactId !== undefined ? textValue(patch.contactId) : current.contactId,
        items: patch.items !== undefined ? encryptJsonField(aesKey, jsonArray(patch.items)) as any : current.items,
        subtotal: patch.subtotal !== undefined ? numberValue(patch.subtotal) ?? currentPlain.subtotal : currentPlain.subtotal,
        discountAmount,
        taxAmount: patch.taxAmount !== undefined ? numberValue(patch.taxAmount) ?? currentPlain.taxAmount : currentPlain.taxAmount,
        grandTotal,
        currency: patch.currency !== undefined ? textValue(patch.currency) ?? current.currency : current.currency,
        orderDiscountValue: patch.orderDiscountValue !== undefined ? (numberValue(patch.orderDiscountValue) ?? 0) : current.orderDiscountValue,
        orderDiscountType: patch.orderDiscountType !== undefined ? textValue(patch.orderDiscountType) : current.orderDiscountType,
        discountTotal: patch.discountTotal !== undefined || patch.discountAmount !== undefined ? numberValue(patch.discountTotal) ?? numberValue(patch.discountAmount) ?? currentPlain.discountTotal : currentPlain.discountTotal,
        taxPercentage: patch.taxPercentage !== undefined ? numberValue(patch.taxPercentage) : current.taxPercentage,
        activities: patch.activities !== undefined ? jsonArray(patch.activities) : jsonInputOrDefault(current.activities, []),
        shippingAddress: patch.shippingAddress !== undefined ? encryptField(aesKey, textValue(patch.shippingAddress) ?? null) : current.shippingAddress,
        updatedById: ctx.userId,
      },
      select: SALE_SELECT,
    });
    await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Updated", entityType: ENTITY, entityId: id, entityName: title });
    return mapSale(updated, aesKey);
  } finally {
    aesKey.fill(0);
  }
}

export async function deleteSale(id: string) {
  const ctx = await requirePermission("sales.delete");
  const current = await prisma.sale.findFirst({ where: { id, organizationId: ctx.tenantId }, select: { title: true } });
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
  const result = await prisma.sale.deleteMany({ where: { id, organizationId: ctx.tenantId } });
  if (result.count === 0) return null;
  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Deleted", entityType: ENTITY, entityId: id, entityName });
  return { id };
}
