import { createDomainCollectionHandlers } from "@/lib/api/domain-route";
import { createRole, listRoles } from "@/lib/server/services/role.service";

const handlers = createDomainCollectionHandlers({ list: listRoles, create: createRole });
export const GET = handlers.GET;
export const POST = handlers.POST;
