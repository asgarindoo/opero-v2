import { createDomainItemHandlers } from "@/lib/api/domain-route";
import { deleteTransaction, updateTransaction } from "@/lib/server/services/finance.service";

const handlers = createDomainItemHandlers({ update: updateTransaction, remove: deleteTransaction });
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
