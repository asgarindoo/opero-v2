import { createDomainItemHandlers } from "@/lib/api/domain-route";
import { deleteCampaign, updateCampaign } from "@/features/campaigns/services/campaigns.server";

const handlers = createDomainItemHandlers({ update: updateCampaign, remove: deleteCampaign });
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
