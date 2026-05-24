import { createDomainItemHandlers } from "@/lib/api/domain-route";
import { deleteProduct, updateProduct } from "@/features/products/services/products.server";

const handlers = createDomainItemHandlers({ update: updateProduct, remove: deleteProduct });
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
