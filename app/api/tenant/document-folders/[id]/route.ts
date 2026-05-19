import { createDomainItemHandlers } from "@/lib/api/domain-route";
import { deleteFolder, updateFolder } from "@/features/documents/services/documents.server";

const handlers = createDomainItemHandlers({ update: updateFolder, remove: deleteFolder });
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
