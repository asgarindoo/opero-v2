import { createDomainCollectionHandlers } from "@/lib/api/domain-route";
import { createInvoice, listInvoices } from "@/features/invoices/services/invoices.server";

const handlers = createDomainCollectionHandlers({ list: listInvoices, create: createInvoice });
export const GET = handlers.GET;
export const POST = handlers.POST;
