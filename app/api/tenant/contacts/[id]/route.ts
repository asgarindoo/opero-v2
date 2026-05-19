import { createDomainItemHandlers } from "@/lib/api/domain-route";
import { deleteContact, updateContact } from "@/features/contacts/services/contacts.server";

const handlers = createDomainItemHandlers({ update: updateContact, remove: deleteContact });
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
