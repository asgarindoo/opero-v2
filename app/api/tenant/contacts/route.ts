import { createDomainCollectionHandlers } from "@/lib/api/domain-route";
import { createContact, listContacts } from "@/lib/server/services/contact.service";

const handlers = createDomainCollectionHandlers({ list: listContacts, create: createContact });
export const GET = handlers.GET;
export const POST = handlers.POST;
