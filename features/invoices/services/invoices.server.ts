import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/server/auth-utils";
import { createPayload, getStatus, getTitle, logDomainActivity, mapDomainRecord, parsePayload } from "@/lib/api/domain-utils";

const MODULE = "FINANCE";
const ENTITY = "Invoice";

export async function listInvoices() {
  const ctx = await requireTenant();
  const invoices = await prisma.invoice.findMany({
    where: { organizationId: ctx.tenantId },
    orderBy: { createdAt: "desc" },
    include: { createdBy: { select: { id: true, name: true, email: true, image: true } } },
  });
  return invoices.map((invoice) => mapDomainRecord(invoice));
}

export async function getInvoiceById(id: string) {
  const ctx = await requireTenant();
  const invoice = await findInvoiceRecord(ctx.tenantId, id, true);
  return invoice ? mapDomainRecord(invoice) : null;
}

async function findInvoiceRecord(tenantId: string, id: string, includeCreator = false) {
  const include = includeCreator
    ? { createdBy: { select: { id: true, name: true, email: true, image: true } } }
    : undefined;
  const current = await prisma.invoice.findFirst({
    where: { id, organizationId: tenantId },
    include,
  });
  if (current) return current;

  const invoices = await prisma.invoice.findMany({
    where: { organizationId: tenantId },
    include,
  });
  return invoices.find((invoice) => parsePayload(invoice.payload).id === id) ?? null;
}

async function syncFinanceTransaction(ctx: any, invoiceId: string, invoiceStatus: string, mergedPayload: any, updatedTitle: string) {
  // We need to either create an Income transaction or cancel an existing one
  const existingTxList = await prisma.transaction.findMany({
    where: { organizationId: ctx.tenantId }
  });

  // Find matching transaction (since it's JSON, filter manually to be safe across Prisma versions)
  const existingTx = existingTxList.find((tx) => {
    const p = parsePayload(tx.payload);
    return p.sourceType === "Invoice" && p.sourceId === invoiceId;
  });

  if (invoiceStatus === "Paid") {
    if (!existingTx) {
      // Create new Income Transaction
      const amount = typeof mergedPayload.totalAmount === "number" ? mergedPayload.totalAmount : 0;
      const txPayload = {
        title: `Payment received for Invoice ${mergedPayload.invoiceNumber || updatedTitle}`,
        transactionDate: new Date().toISOString().split("T")[0],
        type: "Income",
        category: "Invoice Payment",
        amount,
        currency: mergedPayload.currency || "USD",
        status: "Completed",
        reference: mergedPayload.invoiceNumber || updatedTitle,
        contactName: mergedPayload.customerName || mergedPayload.contactName,
        contactId: mergedPayload.customerId || mergedPayload.contactId,
        paymentMethod: "-",
        notes: "Auto-generated from Invoice payment.",
        activities: [{
          id: "a" + Date.now(),
          type: "status_change",
          description: "Income auto-recorded from invoice",
          timestamp: new Date().toISOString(),
          author: "System"
        }],
        attachments: [],
        sourceType: "Invoice",
        sourceId: invoiceId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await prisma.transaction.create({
        data: {
          id: "tx_" + crypto.randomUUID(),
          organizationId: ctx.tenantId,
          title: txPayload.title,
          status: "Completed",
          payload: txPayload as any,
          createdById: ctx.userId,
          updatedById: ctx.userId,
        }
      });
    } else {
      // Just in case it was cancelled before, restore to Completed
      const p = parsePayload(existingTx.payload);
      await prisma.transaction.update({
        where: { id: existingTx.id },
        data: {
          status: "Completed",
          payload: { ...p, status: "Completed" } as any,
          updatedById: ctx.userId
        }
      });
    }
  } else {
    // Status changed away from Paid (e.g. Unpaid or Cancelled) -> Cancel the transaction if it exists
    if (existingTx) {
      const p = parsePayload(existingTx.payload);
      await prisma.transaction.update({
        where: { id: existingTx.id },
        data: {
          status: "Cancelled",
          payload: { ...p, status: "Cancelled" } as any,
          updatedById: ctx.userId
        }
      });
    }
  }
}

export async function createInvoice(data: Record<string, unknown>) {
  const ctx = await requireTenant();
  const title = getTitle(data);
  const invoiceStatus = getStatus(data, "Unpaid");
  const invoice = await prisma.invoice.create({
    data: {
      id: typeof data.id === "string" && data.id ? data.id : crypto.randomUUID(),
      organizationId: ctx.tenantId,
      title,
      status: invoiceStatus,
      payload: createPayload(data),
      createdById: ctx.userId,
      updatedById: ctx.userId,
    },
  });
  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Created", entityType: ENTITY, entityId: invoice.id, entityName: title, description: typeof data.description === "string" ? data.description : null });

  if (invoiceStatus === "Paid") {
    await syncFinanceTransaction(ctx, invoice.id, invoiceStatus, parsePayload(invoice.payload), title);
  }

  return mapDomainRecord(invoice, ctx.user);
}

export async function updateInvoice(id: string, patch: Record<string, unknown>) {
  const ctx = await requireTenant();
  const current = await findInvoiceRecord(ctx.tenantId, id);
  if (!current) return null;
  const mergedPayload = { ...parsePayload(current.payload), ...patch };
  const result = await prisma.invoice.updateMany({
    where: { id: current.id, organizationId: ctx.tenantId },
    data: { title: getTitle(patch, current.title ?? "Untitled"), status: typeof patch.status === "string" ? patch.status : current.status, payload: mergedPayload, updatedById: ctx.userId },
  });
  if (result.count === 0) return null;
  const updated = await prisma.invoice.findFirst({ where: { id: current.id, organizationId: ctx.tenantId }, include: { createdBy: { select: { id: true, name: true, email: true, image: true } } } });
  if (!updated) return null;
  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Updated", entityType: ENTITY, entityId: current.id, entityName: updated.title, description: typeof patch.description === "string" ? patch.description : null });

  // Post-update hook: Manage Finance Cashflow for Invoices
  if (typeof patch.status === "string" && patch.status !== current.status) {
    await syncFinanceTransaction(ctx, current.id, patch.status, mergedPayload, updated.title ?? "Untitled");
  }

  return mapDomainRecord(updated);
}

export async function deleteInvoice(id: string) {
  const ctx = await requireTenant();
  const current = await findInvoiceRecord(ctx.tenantId, id);
  if (!current) return null;
  const result = await prisma.invoice.deleteMany({ where: { id: current.id, organizationId: ctx.tenantId } });
  if (result.count === 0) return null;
  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Deleted", entityType: ENTITY, entityId: current.id, entityName: current.title });
  return { id: current.id };
}
