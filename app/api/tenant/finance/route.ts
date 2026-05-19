import { createDomainCollectionHandlers } from "@/lib/api/domain-route";
import { createTransaction, listTransactions } from "@/lib/server/services/finance.service";

const handlers = createDomainCollectionHandlers({ list: listTransactions, create: createTransaction });
export const GET = handlers.GET;
export const POST = handlers.POST;
