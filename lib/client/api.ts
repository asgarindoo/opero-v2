function getFetchUrl(url: string) {
  if (typeof window === "undefined" || !url.startsWith("/")) return url;
  return new URL(url, window.location.origin).toString();
}

export async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const init: RequestInit = {
    ...options,
    credentials: options?.credentials ?? "include",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  };

  let res: Response;
  const fetchUrl = getFetchUrl(url);
  if (process.env.NODE_ENV === "development") {
    console.log(`[apiRequest] ${options?.method ?? "GET"} ${fetchUrl}`);
  }

  try {
    res = await fetch(fetchUrl, init);
  } catch (err) {
    console.error(`[apiRequest] fetch failed ${options?.method ?? "GET"} ${fetchUrl}`, err);
    throw err;
  }

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (payload && (payload.error as string)) || "Request failed";
    throw new Error(message);
  }

  return payload as T;
}

type ProfileResponse = {
  user: { id: string; name?: string | null; email?: string | null } | null;
  tenant?: unknown;
  role?: unknown;
};

export async function getProfile() {
  return apiRequest<ProfileResponse>("/api/profile");
}

export async function getDashboardSummary() {
  return apiRequest<Record<string, unknown>>("/api/tenant/dashboard/summary");
}
