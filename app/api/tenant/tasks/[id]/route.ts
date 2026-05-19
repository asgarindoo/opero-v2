import { createDomainItemHandlers } from "@/lib/api/domain-route";
import { deleteTask, updateTask } from "@/features/tasks/services/tasks.server";

const handlers = createDomainItemHandlers({ update: updateTask, remove: deleteTask });
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
