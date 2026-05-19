import { createDomainItemHandlers } from "@/lib/api/domain-route";
import { deleteFlow, updateFlow } from "@/lib/server/services/flow.service";

const handlers = createDomainItemHandlers({ update: updateFlow, remove: deleteFlow });
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
