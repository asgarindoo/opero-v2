import { createDomainCollectionHandlers } from "@/lib/api/domain-route";
import { createFolder, listFolders } from "@/features/documents/services/documents.server";

const handlers = createDomainCollectionHandlers({ list: listFolders, create: createFolder });
export const GET = handlers.GET;
export const POST = handlers.POST;
