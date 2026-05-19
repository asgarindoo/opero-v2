import { apiRequest } from "@/lib/client/api";

const endpoint = "/api/tenant/finance";

export async function listTransactions<T>() {
  const payload = await apiRequest<{ items: T[] }>(endpoint, { method: "GET" });
  return payload.items ?? [];
}

export async function createTransaction<T>(data: T) {
  const payload = await apiRequest<{ item: T }>(endpoint, {
    method: "POST",
    body: JSON.stringify({ data }),
  });
  return payload.item;
}

export async function updateTransaction<T>(id: string, data: Partial<T>) {
  const payload = await apiRequest<{ item: T }>(`${endpoint}/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ data }),
  });
  return payload.item;
}

export async function deleteTransaction(id: string) {
  await apiRequest<{ success: boolean }>(`${endpoint}/${id}`, { method: "DELETE" });
}