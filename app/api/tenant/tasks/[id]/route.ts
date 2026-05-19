import { createDomainItemHandlers } from "@/lib/api/domain-route";
import { deleteTask, updateTask } from "@/lib/server/services/task.service";

const handlers = createDomainItemHandlers({ update: updateTask, remove: deleteTask });
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
