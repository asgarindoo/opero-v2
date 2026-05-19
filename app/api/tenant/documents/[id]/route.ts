import { createDomainItemHandlers } from "@/lib/api/domain-route";
import { deleteDocument, updateDocument } from "@/features/documents/services/documents.server";

const handlers = createDomainItemHandlers({ update: updateDocument, remove: deleteDocument });
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
