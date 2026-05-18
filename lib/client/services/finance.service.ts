import { createDomainItem, deleteDomainItem, listDomainItems, updateDomainItem } from "../api";
const endpoint = "/api/tenant/finance";
export const listTransactions = <T>() => listDomainItems<T>(endpoint);
export const createTransaction = <T>(data: T) => createDomainItem<T>(endpoint, data);
export const updateTransaction = <T>(id: string, data: Partial<T>) => updateDomainItem<T>(`${endpoint}/${id}`, data);
export const deleteTransaction = (id: string) => deleteDomainItem(`${endpoint}/${id}`);
