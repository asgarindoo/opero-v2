import { Channel } from "../context/SocialChannelsContext";

function getTenantSlug() {
  if (typeof window === 'undefined') return '';
  const path = window.location.pathname;
  const match = path.match(/^\/([^\/]+)/);
  return match ? match[1] : '';
}

function getBaseUrl() {
  const slug = getTenantSlug();
  return `/api/tenant/${slug}/social-channels`;
}

export async function fetchChannels(): Promise<Channel[]> {
  const res = await fetch(getBaseUrl());
  if (!res.ok) throw new Error("Failed to fetch channels");
  return res.json();
}

export async function createChannel(data: Partial<Channel>): Promise<Channel> {
  const res = await fetch(getBaseUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to create channel");
  return res.json();
}

export async function updateChannel(id: string, data: Partial<Channel>): Promise<Channel> {
  const res = await fetch(`${getBaseUrl()}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to update channel");
  return res.json();
}

export async function deleteChannel(id: string): Promise<void> {
  const res = await fetch(`${getBaseUrl()}/${id}`, {
    method: "DELETE"
  });
  if (!res.ok) throw new Error("Failed to delete channel");
}

export async function fetchChannelActivities(): Promise<any[]> {
  const res = await fetch(`${getBaseUrl()}/activity`);
  if (!res.ok) throw new Error("Failed to fetch activities");
  return res.json();
}
