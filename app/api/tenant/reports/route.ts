import { createDomainCollectionHandlers } from "@/lib/api/domain-route";
import { createReport, listReports } from "@/features/reports/services/reports.server";

const handlers = createDomainCollectionHandlers({ list: listReports, create: createReport });
export const GET = handlers.GET;
export const POST = handlers.POST;
