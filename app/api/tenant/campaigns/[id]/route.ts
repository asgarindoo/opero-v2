import { createDomainItemHandlers } from "../../_domain-route";
import { deleteCampaign, updateCampaign } from "@/lib/server/services/campaign.service";

const handlers = createDomainItemHandlers({ update: updateCampaign, remove: deleteCampaign });
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
