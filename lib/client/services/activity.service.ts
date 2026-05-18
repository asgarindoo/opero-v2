import { apiRequest } from "../api";

export async function listActivities(module?: string) {
  const query = module ? `?module=${encodeURIComponent(module)}` : "";
  const payload = await apiRequest<{ activities: any[] }>(`/api/tenant/activity${query}`);
  return payload.activities ?? [];
}
