import { apiRequest } from "@/lib/client/api";

const endpoint = "/api/tenant/contacts";

export async function listContacts<T>() {
  const payload = await apiRequest<{ items: T[] }>(endpoint, { method: "GET" });
  return payload.items ?? [];
}

export async function createContact<T>(data: T) {
  const payload = await apiRequest<{ item: T }>(endpoint, {
    method: "POST",
    body: JSON.stringify({ data }),
  });
  return payload.item;
}

export async function updateContact<T>(id: string, data: Partial<T>) {
  const payload = await apiRequest<{ item: T }>(`${endpoint}/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ data }),
  });
  return payload.item;
}

export async function deleteContact(id: string) {
  await apiRequest<{ success: boolean }>(`${endpoint}/${id}`, { method: "DELETE" });
}