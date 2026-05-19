import { apiRequest } from "@/lib/client/api";

const endpoint = "/api/tenant/bots";

export async function listBots<T>() {
  const payload = await apiRequest<{ items: T[] }>(endpoint, { method: "GET" });
  return payload.items ?? [];
}

export async function createBot<T>(data: T) {
  const payload = await apiRequest<{ item: T }>(endpoint, {
    method: "POST",
    body: JSON.stringify({ data }),
  });
  return payload.item;
}

export async function updateBot<T>(id: string, data: Partial<T>) {
  const payload = await apiRequest<{ item: T }>(`${endpoint}/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ data }),
  });
  return payload.item;
}

export async function deleteBot(id: string) {
  await apiRequest<{ success: boolean }>(`${endpoint}/${id}`, { method: "DELETE" });
}