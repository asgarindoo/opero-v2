import { createDomainItemHandlers } from "@/lib/api/domain-route";
import { deleteRole, updateRole } from "@/lib/server/services/role.service";

const handlers = createDomainItemHandlers({ update: updateRole, remove: deleteRole });
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
