import { createDomainCollectionHandlers } from "../_domain-route";
import { createGoal, listGoals } from "@/lib/server/services/goal.service";

const handlers = createDomainCollectionHandlers({ list: listGoals, create: createGoal });
export const GET = handlers.GET;
export const POST = handlers.POST;
