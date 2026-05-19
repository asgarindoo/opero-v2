import { createDomainCollectionHandlers } from "@/lib/api/domain-route";
import { createContact, listContacts } from "@/features/contacts/services/contacts.server";

const handlers = createDomainCollectionHandlers({ list: listContacts, create: createContact });
export const GET = handlers.GET;
export const POST = handlers.POST;
