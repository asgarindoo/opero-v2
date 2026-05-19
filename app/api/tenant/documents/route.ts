import { createDomainCollectionHandlers } from "@/lib/api/domain-route";
import { createDocument, listDocuments } from "@/lib/server/services/document.service";

const handlers = createDomainCollectionHandlers({ list: listDocuments, create: createDocument });
export const GET = handlers.GET;
export const POST = handlers.POST;
