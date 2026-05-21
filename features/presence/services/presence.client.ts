import type { PresenceResponse } from "../types";

const PRESENCE_ENDPOINT = "/api/tenant/presence";

export async function sendPresenceHeartbeat(currentPage?: string): Promise<PresenceResponse> {
  console.log("[presence] sending heartbeat", { currentPage, url: PRESENCE_ENDPOINT });
  const response = await fetch(PRESENCE_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentPage }),
    cache: "no-store",
    credentials: "include",
    keepalive: true,
  });

  if (!response.ok) {
    console.log("[presence] heartbeat failed", { status: response.status });
    throw new Error("Unable to update presence");
  }

  const data = await response.json();
  console.log("[presence] heartbeat response", data);
  return data;
}

export async function fetchPresence(): Promise<PresenceResponse> {
  console.log("[presence] fetching presence", { url: PRESENCE_ENDPOINT });
  const response = await fetch(PRESENCE_ENDPOINT, {
    method: "GET",
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    console.log("[presence] fetch failed", { status: response.status });
    throw new Error("Unable to fetch presence");
  }

  const data = await response.json();
  console.log("[presence] fetch response", data);
  return data;
}

export async function markPresenceOffline(): Promise<PresenceResponse | null> {
  console.log("[presence] deleting presence before logout", { url: PRESENCE_ENDPOINT });

  const response = await fetch(PRESENCE_ENDPOINT, {
    method: "DELETE",
    cache: "no-store",
    credentials: "include",
    keepalive: true,
  });

  if (!response.ok) {
    console.log("[presence] logout presence delete failed", { status: response.status });
    return null;
  }

  const data = await response.json();
  console.log("[presence] logout presence delete response", data);
  return data;
}
