import { createDomainItemHandlers } from "../../_domain-route";
import { deleteAsset, updateAsset } from "@/lib/server/services/asset.service";

const handlers = createDomainItemHandlers({ update: updateAsset, remove: deleteAsset });
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
