import { createDomainCollectionHandlers } from "@/lib/api/domain-route";
import { createBot, listBots } from "@/features/bots/services/bots.server";

const handlers = createDomainCollectionHandlers({ list: listBots, create: createBot });
export const GET = handlers.GET;
export const POST = handlers.POST;
