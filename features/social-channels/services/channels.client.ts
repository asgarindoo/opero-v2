import { Channel } from "../context/SocialChannelsContext";

function getBaseUrl() {
  return "/api/tenant/social-channels";
}

async function apiError(res: Response, fallback: string) {
  try {
    const body = await res.json();
    return new Error(typeof body?.error === "string" && body.error ? body.error : fallback);
  } catch {
    return new Error(fallback);
  }
}

export async function fetchChannels(): Promise<Channel[]> {
  const res = await fetch(getBaseUrl());
  if (!res.ok) throw await apiError(res, "Failed to fetch channels");
  return res.json();
}

export async function createChannel(data: Partial<Channel>): Promise<Channel> {
  const res = await fetch(getBaseUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw await apiError(res, "Failed to create channel");
  return res.json();
}

export async function updateChannel(id: string, data: Partial<Channel>): Promise<Channel> {
  const res = await fetch(`${getBaseUrl()}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw await apiError(res, "Failed to update channel");
  return res.json();
}

export async function deleteChannel(id: string): Promise<void> {
  const res = await fetch(`${getBaseUrl()}/${id}`, {
    method: "DELETE"
  });
  if (!res.ok) throw await apiError(res, "Failed to delete channel");
}

export async function fetchChannelActivities(): Promise<any[]> {
  const res = await fetch(`${getBaseUrl()}/activity`);
  if (!res.ok) throw await apiError(res, "Failed to fetch activities");
  return res.json();
}
