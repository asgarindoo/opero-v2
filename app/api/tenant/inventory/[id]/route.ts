import { createDomainItemHandlers } from "@/lib/api/domain-route";
import { deleteProduct, updateProduct } from "@/features/inventory/services/inventory.server";

const handlers = createDomainItemHandlers({ update: updateProduct, remove: deleteProduct });
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
