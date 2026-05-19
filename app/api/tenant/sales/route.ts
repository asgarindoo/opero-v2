import { createDomainCollectionHandlers } from "@/lib/api/domain-route";
import { createSale, listSales } from "@/features/sales/services/sales.server";

const handlers = createDomainCollectionHandlers({ list: listSales, create: createSale });
export const GET = handlers.GET;
export const POST = handlers.POST;
