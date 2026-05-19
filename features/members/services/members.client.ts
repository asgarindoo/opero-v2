import { apiRequest } from "@/lib/client/api";

const endpoint = "/api/tenant/roles";

export async function listRoles<T>() {
  const payload = await apiRequest<{ items: T[] }>(endpoint, { method: "GET" });
  return payload.items ?? [];
}

export async function createRole<T>(data: T) {
  const payload = await apiRequest<{ item: T }>(endpoint, {
    method: "POST",
    body: JSON.stringify({ data }),
  });
  return payload.item;
}

export async function updateRole<T>(id: string, data: Partial<T>) {
  const payload = await apiRequest<{ item: T }>(`${endpoint}/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ data }),
  });
  return payload.item;
}