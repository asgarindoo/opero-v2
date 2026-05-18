import { createDomainItemHandlers } from "../../_domain-route";
import { deleteGoal, getGoalById, updateGoal } from "@/lib/server/services/goal.service";

const handlers = createDomainItemHandlers({ get: getGoalById, update: updateGoal, remove: deleteGoal });
export const GET = handlers.GET;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
