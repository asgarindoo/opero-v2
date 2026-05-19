import { createDomainItem, deleteDomainItem, listDomainItems, updateDomainItem } from "@/lib/client/api";

const endpoint = "/api/tenant/inventory";

export const listProducts = <T>() => listDomainItems<T>(endpoint);
export const createProduct = <T>(data: T) => createDomainItem<T>(endpoint, data);
export const updateProduct = <T>(id: string, data: Partial<T>) => updateDomainItem<T>(`${endpoint}/${id}`, data);
export const deleteProduct = (id: string) => deleteDomainItem(`${endpoint}/${id}`);
