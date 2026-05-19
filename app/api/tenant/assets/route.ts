import { createDomainCollectionHandlers } from "@/lib/api/domain-route";
import { createAsset, listAssets } from "@/lib/server/services/asset.service";

const handlers = createDomainCollectionHandlers({ list: listAssets, create: createAsset });
export const GET = handlers.GET;
export const POST = handlers.POST;
