import { createDomainItemHandlers } from "@/lib/api/domain-route";
import { deleteGoal, getGoalById, updateGoal } from "@/features/goals/services/goals.server";

const handlers = createDomainItemHandlers({ get: getGoalById, update: updateGoal, remove: deleteGoal });
export const GET = handlers.GET;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
