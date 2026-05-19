import { createDomainCollectionHandlers } from "@/lib/api/domain-route";
import { createDocument, listDocuments } from "@/features/documents/services/documents.server";

const handlers = createDomainCollectionHandlers({ list: listDocuments, create: createDocument });
export const GET = handlers.GET;
export const POST = handlers.POST;
