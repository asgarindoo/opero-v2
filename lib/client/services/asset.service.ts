import { createDomainItem, deleteDomainItem, listDomainItems, updateDomainItem } from "../api";
const endpoint = "/api/tenant/assets";
export const listAssets = <T>() => listDomainItems<T>(endpoint);
export const createAsset = <T>(data: T) => createDomainItem<T>(endpoint, data);
export const updateAsset = <T>(id: string, data: Partial<T>) => updateDomainItem<T>(`${endpoint}/${id}`, data);
export const deleteAsset = (id: string) => deleteDomainItem(`${endpoint}/${id}`);
