import { createDomainCollectionHandlers } from "@/lib/api/domain-route";
import { createFolder, listFolders } from "@/lib/server/services/document.service";

const handlers = createDomainCollectionHandlers({ list: listFolders, create: createFolder });
export const GET = handlers.GET;
export const POST = handlers.POST;
