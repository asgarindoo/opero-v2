async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (payload && (payload.error as string)) || "Request failed";
    throw new Error(message);
  }

  return payload as T;
}

export async function listTenantRecords<T>(type: string): Promise<T[]> {
  const payload = await apiRequest<{ items: T[] }>(`/api/tenant/records/${type}`);
  return payload.items ?? [];
}

export async function createTenantRecord<T>(type: string, data: T): Promise<T> {
  const payload = await apiRequest<{ item: T }>(`/api/tenant/records/${type}`, {
    method: "POST",
    body: JSON.stringify({ data }),
  });
  return payload.item;
}

export async function updateTenantRecord<T>(type: string, recordId: string, data: Partial<T>): Promise<T> {
  const payload = await apiRequest<{ item: T }>(`/api/tenant/records/${type}/${recordId}`, {
    method: "PATCH",
    body: JSON.stringify({ data }),
  });
  return payload.item;
}

export async function deleteTenantRecord(type: string, recordId: string): Promise<void> {
  await apiRequest<{ success: boolean }>(`/api/tenant/records/${type}/${recordId}`, {
    method: "DELETE",
  });
}

export async function listTenantActivity(module?: string) {
  const query = module ? `?module=${encodeURIComponent(module)}` : "";
  const payload = await apiRequest<{ activities: any[] }>(`/api/tenant/activity${query}`);
  return payload.activities ?? [];
}

export async function getDashboardSummary() {
  return apiRequest<Record<string, any>>("/api/tenant/dashboard/summary");
}

export async function getProfile() {
  return apiRequest<Record<string, any>>("/api/profile");
}
