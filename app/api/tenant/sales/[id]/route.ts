import { createDomainItemHandlers } from "@/lib/api/domain-route";
import { deleteSale, updateSale } from "@/lib/server/services/sale.service";

const handlers = createDomainItemHandlers({ update: updateSale, remove: deleteSale });
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
