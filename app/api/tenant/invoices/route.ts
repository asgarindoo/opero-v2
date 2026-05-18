import { createDomainCollectionHandlers } from "../_domain-route";
import { createInvoice, listInvoices } from "@/lib/server/services/invoice.service";

const handlers = createDomainCollectionHandlers({ list: listInvoices, create: createInvoice });
export const GET = handlers.GET;
export const POST = handlers.POST;
