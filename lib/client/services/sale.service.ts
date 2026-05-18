import { createDomainItem, deleteDomainItem, listDomainItems, updateDomainItem } from "../api";
const endpoint = "/api/tenant/sales";
export const listSales = <T>() => listDomainItems<T>(endpoint);
export const createSale = <T>(data: T) => createDomainItem<T>(endpoint, data);
export const updateSale = <T>(id: string, data: Partial<T>) => updateDomainItem<T>(`${endpoint}/${id}`, data);
export const deleteSale = (id: string) => deleteDomainItem(`${endpoint}/${id}`);
