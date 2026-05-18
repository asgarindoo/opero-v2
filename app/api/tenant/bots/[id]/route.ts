import { createDomainItemHandlers } from "../../_domain-route";
import { deleteBot, updateBot } from "@/lib/server/services/bot.service";

const handlers = createDomainItemHandlers({ update: updateBot, remove: deleteBot });
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
