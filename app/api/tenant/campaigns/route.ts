import { createDomainCollectionHandlers } from "@/lib/api/domain-route";
import { createCampaign, listCampaigns } from "@/features/campaigns/services/campaigns.server";

const handlers = createDomainCollectionHandlers({ list: listCampaigns, create: createCampaign });
export const GET = handlers.GET;
export const POST = handlers.POST;
