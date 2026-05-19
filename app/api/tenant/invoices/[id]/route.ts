import { createDomainItemHandlers } from "@/lib/api/domain-route";
import { deleteInvoice, updateInvoice } from "@/features/invoices/services/invoices.server";

const handlers = createDomainItemHandlers({ update: updateInvoice, remove: deleteInvoice });
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
