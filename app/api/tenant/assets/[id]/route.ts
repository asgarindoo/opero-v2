import { createDomainItemHandlers } from "@/lib/api/domain-route";
import { deleteAsset, updateAsset } from "@/features/assets/services/assets.server";

const handlers = createDomainItemHandlers({ update: updateAsset, remove: deleteAsset });
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
