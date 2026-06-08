import type { PresenceResponse } from "../types";

const PRESENCE_ENDPOINT = "/api/tenant/presence";
const DEBUG_PRESENCE = process.env.NODE_ENV === "development";

function debugPresence(message: string, data?: unknown) {
  if (DEBUG_PRESENCE) console.log(message, data);
}

export async function sendPresenceHeartbeat(currentPage?: string): Promise<PresenceResponse> {
  debugPresence("[presence] sending heartbeat", { currentPage, url: PRESENCE_ENDPOINT });
  const response = await fetch(PRESENCE_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentPage }),
    cache: "no-store",
    credentials: "include",
    keepalive: true,
  });

  if (!response.ok) {
    debugPresence("[presence] heartbeat failed", { status: response.status });
    throw new Error("Unable to update presence");
  }

  const data = await response.json();
  debugPresence("[presence] heartbeat response", data);
  return data;
}

export async function fetchPresence(): Promise<PresenceResponse> {
  debugPresence("[presence] fetching presence", { url: PRESENCE_ENDPOINT });
  const response = await fetch(PRESENCE_ENDPOINT, {
    method: "GET",
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    debugPresence("[presence] fetch failed", { status: response.status });
    throw new Error("Unable to fetch presence");
  }

  const data = await response.json();
  debugPresence("[presence] fetch response", data);
  return data;
}

export async function markPresenceOffline(): Promise<PresenceResponse | null> {
  debugPresence("[presence] deleting presence before logout", { url: PRESENCE_ENDPOINT });

  const response = await fetch(PRESENCE_ENDPOINT, {
    method: "DELETE",
    cache: "no-store",
    credentials: "include",
    keepalive: true,
  });

  if (!response.ok) {
    debugPresence("[presence] logout presence delete failed", { status: response.status });
    return null;
  }

  const data = await response.json();
  debugPresence("[presence] logout presence delete response", data);
  return data;
}
