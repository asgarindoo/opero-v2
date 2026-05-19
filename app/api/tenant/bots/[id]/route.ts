import { createDomainItemHandlers } from "@/lib/api/domain-route";
import { deleteBot, updateBot } from "@/features/bots/services/bots.server";

const handlers = createDomainItemHandlers({ update: updateBot, remove: deleteBot });
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
