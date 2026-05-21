import { createClient } from "@supabase/supabase-js";
import type { ChatChannel, ChatMessage } from "../types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let _browserClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase browser client is not configured.");
  }

  if (!_browserClient) {
    _browserClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return _browserClient;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error ?? "Chat request failed");
  }
  return payload as T;
}

export async function listChannels() {
  const response = await fetch("/api/tenant/chat/channels", {
    cache: "no-store",
    credentials: "include",
  });
  return parseResponse<{ channels: ChatChannel[] }>(response);
}

export async function createChannel(input: { name: string; description?: string }) {
  const response = await fetch("/api/tenant/chat/channels", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    cache: "no-store",
    credentials: "include",
  });
  return parseResponse<{ channel: ChatChannel }>(response);
}

export async function listMessages(channelId: string) {
  const response = await fetch(`/api/tenant/chat/channels/${channelId}/messages`, {
    cache: "no-store",
    credentials: "include",
  });
  return parseResponse<{ messages: ChatMessage[] }>(response);
}

export async function sendChannelMessage(channelId: string, content: string) {
  const response = await fetch(`/api/tenant/chat/channels/${channelId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
    cache: "no-store",
    credentials: "include",
  });
  return parseResponse<{ message: ChatMessage }>(response);
}

export async function deleteChannel(channelId: string) {
  const response = await fetch(`/api/tenant/chat/channels/${channelId}`, {
    method: "DELETE",
    cache: "no-store",
    credentials: "include",
  });
  return parseResponse<{ success: true }>(response);
}
