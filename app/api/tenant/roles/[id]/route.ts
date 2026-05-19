import { createDomainItemHandlers } from "@/lib/api/domain-route";
import { deleteRole, updateRole } from "@/features/members/services/members.server";

const handlers = createDomainItemHandlers({ update: updateRole, remove: deleteRole });
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
