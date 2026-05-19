import { createDomainCollectionHandlers } from "@/lib/api/domain-route";
import { createCampaign, listCampaigns } from "@/lib/server/services/campaign.service";

const handlers = createDomainCollectionHandlers({ list: listCampaigns, create: createCampaign });
export const GET = handlers.GET;
export const POST = handlers.POST;
