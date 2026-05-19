import { createDomainCollectionHandlers } from "@/lib/api/domain-route";
import { createFlow, listFlows } from "@/features/flows/services/flows.server";

const handlers = createDomainCollectionHandlers({ list: listFlows, create: createFlow });
export const GET = handlers.GET;
export const POST = handlers.POST;
