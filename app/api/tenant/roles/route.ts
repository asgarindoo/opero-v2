import { createDomainCollectionHandlers } from "@/lib/api/domain-route";
import { createRole, listRoles } from "@/features/members/services/members.server";

const handlers = createDomainCollectionHandlers({ list: listRoles, create: createRole });
export const GET = handlers.GET;
export const POST = handlers.POST;
