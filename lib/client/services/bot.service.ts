import { createDomainItem, deleteDomainItem, listDomainItems, updateDomainItem } from "../api";
const endpoint = "/api/tenant/bots";
export const listBots = <T>() => listDomainItems<T>(endpoint);
export const createBot = <T>(data: T) => createDomainItem<T>(endpoint, data);
export const updateBot = <T>(id: string, data: Partial<T>) => updateDomainItem<T>(`${endpoint}/${id}`, data);
export const deleteBot = (id: string) => deleteDomainItem(`${endpoint}/${id}`);
