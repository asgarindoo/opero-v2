import { apiRequest } from "@/lib/client/api";

const endpoint = "/api/tenant/campaigns";

export async function listCampaigns<T>() {
  const payload = await apiRequest<{ items: T[] }>(endpoint, { method: "GET" });
  return payload.items ?? [];
}

export async function createCampaign<T>(data: T) {
  const payload = await apiRequest<{ item: T }>(endpoint, {
    method: "POST",
    body: JSON.stringify({ data }),
  });
  return payload.item;
}

export async function updateCampaign<T>(id: string, data: Partial<T>) {
  const payload = await apiRequest<{ item: T }>(`${endpoint}/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ data }),
  });
  return payload.item;
}

export async function deleteCampaign(id: string) {
  await apiRequest<{ success: boolean }>(`${endpoint}/${id}`, { method: "DELETE" });
}