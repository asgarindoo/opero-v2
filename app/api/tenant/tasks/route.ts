import { createDomainCollectionHandlers } from "@/lib/api/domain-route";
import { createTask, listTasks } from "@/features/tasks/services/tasks.server";

const handlers = createDomainCollectionHandlers({ list: listTasks, create: createTask });
export const GET = handlers.GET;
export const POST = handlers.POST;
