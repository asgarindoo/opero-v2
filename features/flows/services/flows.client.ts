import { createDomainItem, deleteDomainItem, listDomainItems, updateDomainItem } from "@/lib/client/api";

const endpoint = "/api/tenant/flows";

export const listFlows = <T>() => listDomainItems<T>(endpoint);
export const createFlow = <T>(data: T) => createDomainItem<T>(endpoint, data);
export const updateFlow = <T>(id: string, data: Partial<T>) => updateDomainItem<T>(`${endpoint}/${id}`, data);
export const deleteFlow = (id: string) => deleteDomainItem(`${endpoint}/${id}`);
