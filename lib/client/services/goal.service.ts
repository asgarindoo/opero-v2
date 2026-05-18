import { createDomainItem, deleteDomainItem, listDomainItems, updateDomainItem } from "../api";

const endpoint = "/api/tenant/goals";

export const listGoals = <T>() => listDomainItems<T>(endpoint);
export const createGoal = <T>(data: T) => createDomainItem<T>(endpoint, data);
export const updateGoal = <T>(id: string, data: Partial<T>) => updateDomainItem<T>(`${endpoint}/${id}`, data);
export const deleteGoal = (id: string) => deleteDomainItem(`${endpoint}/${id}`);
