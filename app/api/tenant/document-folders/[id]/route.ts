import { createDomainItemHandlers } from "../../_domain-route";
import { deleteFolder, updateFolder } from "@/lib/server/services/document.service";

const handlers = createDomainItemHandlers({ update: updateFolder, remove: deleteFolder });
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
