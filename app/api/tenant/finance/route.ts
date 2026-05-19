import { createDomainCollectionHandlers } from "@/lib/api/domain-route";
import { createTransaction, listTransactions } from "@/features/finance/services/finance.server";

const handlers = createDomainCollectionHandlers({ list: listTransactions, create: createTransaction });
export const GET = handlers.GET;
export const POST = handlers.POST;
