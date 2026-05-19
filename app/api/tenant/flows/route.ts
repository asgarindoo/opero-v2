import { createDomainCollectionHandlers } from "@/lib/api/domain-route";
import { createFlow, listFlows } from "@/lib/server/services/flow.service";

const handlers = createDomainCollectionHandlers({ list: listFlows, create: createFlow });
export const GET = handlers.GET;
export const POST = handlers.POST;
