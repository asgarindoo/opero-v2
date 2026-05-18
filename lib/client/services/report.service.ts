import { createDomainItem, listDomainItems, updateDomainItem } from "../api";
const endpoint = "/api/tenant/reports";
export const listReports = <T>() => listDomainItems<T>(endpoint);
export const createReport = <T>(data: T) => createDomainItem<T>(endpoint, data);
export const updateReport = <T>(id: string, data: Partial<T>) => updateDomainItem<T>(`${endpoint}/${id}`, data);
