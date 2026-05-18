import { createDomainCollectionHandlers } from "../_domain-route";
import { createSale, listSales } from "@/lib/server/services/sale.service";

const handlers = createDomainCollectionHandlers({ list: listSales, create: createSale });
export const GET = handlers.GET;
export const POST = handlers.POST;
