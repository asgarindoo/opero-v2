import { createDomainCollectionHandlers } from "../_domain-route";
import { createBot, listBots } from "@/lib/server/services/bot.service";

const handlers = createDomainCollectionHandlers({ list: listBots, create: createBot });
export const GET = handlers.GET;
export const POST = handlers.POST;
