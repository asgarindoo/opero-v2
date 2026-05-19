import { createDomainItemHandlers } from "@/lib/api/domain-route";
import { deleteReport, updateReport } from "@/lib/server/services/report.service";

const handlers = createDomainItemHandlers({ update: updateReport, remove: deleteReport });
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
