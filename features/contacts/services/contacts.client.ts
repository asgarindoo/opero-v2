import { createDomainItem, deleteDomainItem, listDomainItems, updateDomainItem } from "@/lib/client/api";
const endpoint = "/api/tenant/contacts";
export const listContacts = <T>() => listDomainItems<T>(endpoint);
export const createContact = <T>(data: T) => createDomainItem<T>(endpoint, data);
export const updateContact = <T>(id: string, data: Partial<T>) => updateDomainItem<T>(`${endpoint}/${id}`, data);
export const deleteContact = (id: string) => deleteDomainItem(`${endpoint}/${id}`);
