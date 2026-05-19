import { apiRequest } from "@/lib/client/api";

const documentsEndpoint = "/api/tenant/documents";
const foldersEndpoint = "/api/tenant/document-folders";

export async function listDocuments<T>() {
  const payload = await apiRequest<{ items: T[] }>(documentsEndpoint, { method: "GET" });
  return payload.items ?? [];
}

export async function createDocument<T>(data: T) {
  const payload = await apiRequest<{ item: T }>(documentsEndpoint, {
    method: "POST",
    body: JSON.stringify({ data }),
  });
  return payload.item;
}

export async function updateDocument<T>(id: string, data: Partial<T>) {
  const payload = await apiRequest<{ item: T }>(`${documentsEndpoint}/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ data }),
  });
  return payload.item;
}

export async function deleteDocument(id: string) {
  await apiRequest<{ success: boolean }>(`${documentsEndpoint}/${id}`, { method: "DELETE" });
}

export async function listFolders<T>() {
  const payload = await apiRequest<{ items: T[] }>(foldersEndpoint, { method: "GET" });
  return payload.items ?? [];
}

export async function createFolder<T>(data: T) {
  const payload = await apiRequest<{ item: T }>(foldersEndpoint, {
    method: "POST",
    body: JSON.stringify({ data }),
  });
  return payload.item;
}

export async function updateFolder<T>(id: string, data: Partial<T>) {
  const payload = await apiRequest<{ item: T }>(`${foldersEndpoint}/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ data }),
  });
  return payload.item;
}

export async function deleteFolder(id: string) {
  await apiRequest<{ success: boolean }>(`${foldersEndpoint}/${id}`, { method: "DELETE" });
}