import { createDomainItem, listDomainItems, updateDomainItem } from "../api";
const endpoint = "/api/tenant/roles";
export const listRoles = <T>() => listDomainItems<T>(endpoint);
export const createRole = <T>(data: T) => createDomainItem<T>(endpoint, data);
export const updateRole = <T>(id: string, data: Partial<T>) => updateDomainItem<T>(`${endpoint}/${id}`, data);
