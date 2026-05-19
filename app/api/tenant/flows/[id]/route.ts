import { createDomainItemHandlers } from "@/lib/api/domain-route";
import { deleteFlow, updateFlow } from "@/features/flows/services/flows.server";

const handlers = createDomainItemHandlers({ update: updateFlow, remove: deleteFlow });
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
