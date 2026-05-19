import { createDomainItem, deleteDomainItem, listDomainItems, updateDomainItem } from "@/lib/client/api";

const endpoint = "/api/tenant/tasks";

export const listTasks = <T>() => listDomainItems<T>(endpoint);
export const createTask = <T>(data: T) => createDomainItem<T>(endpoint, data);
export const updateTask = <T>(id: string, data: Partial<T>) => updateDomainItem<T>(`${endpoint}/${id}`, data);
export const deleteTask = (id: string) => deleteDomainItem(`${endpoint}/${id}`);
