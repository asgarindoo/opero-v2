import { createDomainCollectionHandlers } from "@/lib/api/domain-route";
import { createProduct, listProducts } from "@/features/products/services/products.server";

const handlers = createDomainCollectionHandlers({ list: listProducts, create: createProduct });
export const GET = handlers.GET;
export const POST = handlers.POST;
