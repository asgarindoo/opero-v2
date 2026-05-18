import { createDomainCollectionHandlers } from "../_domain-route";
import { createReport, listReports } from "@/lib/server/services/report.service";

const handlers = createDomainCollectionHandlers({ list: listReports, create: createReport });
export const GET = handlers.GET;
export const POST = handlers.POST;
