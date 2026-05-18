import { createDomainCollectionHandlers } from "../_domain-route";
import { createProduct, listProducts } from "@/lib/server/services/product.service";

const handlers = createDomainCollectionHandlers({ list: listProducts, create: createProduct });
export const GET = handlers.GET;
export const POST = handlers.POST;
