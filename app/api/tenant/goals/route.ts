import { createDomainCollectionHandlers } from "@/lib/api/domain-route";
import { createGoal, listGoals } from "@/features/goals/services/goals.server";

const handlers = createDomainCollectionHandlers({ list: listGoals, create: createGoal });
export const GET = handlers.GET;
export const POST = handlers.POST;
