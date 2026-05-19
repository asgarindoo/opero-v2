import { apiRequest } from "@/lib/client/api";

const endpoint = "/api/tenant/flows";

export async function listFlows<T>() {
  const payload = await apiRequest<{ items: T[] }>(endpoint, { method: "GET" });
  return payload.items ?? [];
}

export async function createFlow<T>(data: T) {
  const payload = await apiRequest<{ item: T }>(endpoint, {
    method: "POST",
    body: JSON.stringify({ data }),
  });
  return payload.item;
}

export async function updateFlow<T>(id: string, data: Partial<T>) {
  const payload = await apiRequest<{ item: T }>(`${endpoint}/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ data }),
  });
  return payload.item;
}

export async function deleteFlow(id: string) {
  await apiRequest<{ success: boolean }>(`${endpoint}/${id}`, { method: "DELETE" });
}