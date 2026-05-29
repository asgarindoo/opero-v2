import { createDomainItemHandlers } from "@/lib/api/domain-route";
import { getCampaignById, deleteCampaign, updateCampaign } from "@/features/campaigns/services/campaigns.server";

const handlers = createDomainItemHandlers({ get: getCampaignById, update: updateCampaign, remove: deleteCampaign });
export const GET = handlers.GET;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
