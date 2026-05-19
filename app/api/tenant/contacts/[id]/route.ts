import { createDomainItemHandlers } from "@/lib/api/domain-route";
import { deleteContact, updateContact } from "@/lib/server/services/contact.service";

const handlers = createDomainItemHandlers({ update: updateContact, remove: deleteContact });
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
