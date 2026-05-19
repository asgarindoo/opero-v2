import { createDomainItemHandlers } from "@/lib/api/domain-route";
import { deleteDocument, updateDocument } from "@/lib/server/services/document.service";

const handlers = createDomainItemHandlers({ update: updateDocument, remove: deleteDocument });
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
