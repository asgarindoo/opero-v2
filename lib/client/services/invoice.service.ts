import { createDomainItem, deleteDomainItem, listDomainItems, updateDomainItem } from "../api";
const endpoint = "/api/tenant/invoices";
export const listInvoices = <T>() => listDomainItems<T>(endpoint);
export const createInvoice = <T>(data: T) => createDomainItem<T>(endpoint, data);
export const updateInvoice = <T>(id: string, data: Partial<T>) => updateDomainItem<T>(`${endpoint}/${id}`, data);
export const deleteInvoice = (id: string) => deleteDomainItem(`${endpoint}/${id}`);
