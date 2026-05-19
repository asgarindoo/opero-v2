import { createDomainCollectionHandlers } from "@/lib/api/domain-route";
import { createAsset, listAssets } from "@/features/assets/services/assets.server";

const handlers = createDomainCollectionHandlers({ list: listAssets, create: createAsset });
export const GET = handlers.GET;
export const POST = handlers.POST;
