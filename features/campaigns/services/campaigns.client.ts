import { createDomainItem, deleteDomainItem, listDomainItems, updateDomainItem } from "@/lib/client/api";
const endpoint = "/api/tenant/campaigns";
export const listCampaigns = <T>() => listDomainItems<T>(endpoint);
export const createCampaign = <T>(data: T) => createDomainItem<T>(endpoint, data);
export const updateCampaign = <T>(id: string, data: Partial<T>) => updateDomainItem<T>(`${endpoint}/${id}`, data);
export const deleteCampaign = (id: string) => deleteDomainItem(`${endpoint}/${id}`);
