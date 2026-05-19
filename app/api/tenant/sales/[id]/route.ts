import { createDomainItemHandlers } from "@/lib/api/domain-route";
import { deleteSale, updateSale } from "@/features/sales/services/sales.server";

const handlers = createDomainItemHandlers({ update: updateSale, remove: deleteSale });
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
