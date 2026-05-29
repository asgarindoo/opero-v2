"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import type { ChatChannel, ChatMessage, ChatMessageType } from "@/features/chat";
import {
  createChannel as createChannelRequest,
  deleteChannel as deleteChannelRequest,
  getSupabaseBrowserClient,
  listChannels,
  listMessages,
  markChannelRead,
  sendChannelMessage,
} from "@/features/chat/services/chat.client";

interface ChatContextType {
  channels: ChatChannel[];
  messages: Record<string, ChatMessage[]>;
  unreadCounts: Record<string, number>;
  totalUnreadCount: number;
  initialLoadingChannels: Record<string, boolean>;
  refetchingChannels: Record<string, boolean>;
  hasLoadedChannels: Record<string, boolean>;
  loadingChannels: boolean;
  loadingMessages: boolean;
  error: string | null;
  currentUserId: string | null;
  organizationId: string | null;
  activeChannelId: string | null;
  setActiveChannel: (channelId: string | null) => void;
  loadMessages: (channelId: string, options?: { silent?: boolean }) => Promise<void>;
  markChannelAsRead: (channelId: string) => Promise<void>;
  sendMessage: (channelId: string, content: string) => Promise<void>;
  createChannel: (name: string, description: string) => Promise<string>;
  deleteChannel: (channelId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

function activeChannelIdFromPath(pathname: string | null) {
  const prefix = "/dashboard/chat/";
  if (!pathname?.startsWith(prefix)) return null;
  return pathname.slice(prefix.length).split("/")[0] || null;
}

function isChatIndexPath(pathname: string | null) {
  return pathname === "/dashboard/chat";
}

function messageTime(message: ChatMessage) {
  const createdAt = new Date(message.createdAt).getTime();
  return Number.isFinite(createdAt) ? createdAt : 0;
}

function sortMessages(list: ChatMessage[]) {
  return [...list].sort((a, b) => {
    const diff = messageTime(a) - messageTime(b);
    if (diff !== 0) return diff;
    return (a.clientId ?? a.id).localeCompare(b.clientId ?? b.id);
  });
}

function isMatchingOptimistic(pending: ChatMessage, saved: ChatMessage) {
  return Boolean(
    pending.isPending &&
    pending.channelId === saved.channelId &&
    pending.senderId === saved.senderId &&
    pending.content === saved.content
  );
}

function reconcileMessage(list: ChatMessage[], incoming: ChatMessage) {
  const existingIndex = list.findIndex((message) => message.id === incoming.id);
  if (existingIndex >= 0) return { list, changed: false };

  const pendingIndex = list.findIndex((message) => isMatchingOptimistic(message, incoming));
  if (pendingIndex >= 0) {
    const next = [...list];
    const pending = next[pendingIndex];
    next[pendingIndex] = {
      ...incoming,
      clientId: pending.clientId,
      isPending: false,
    };
    return { list: sortMessages(next), changed: true };
  }

  return { list: sortMessages([...list, incoming]), changed: true };
}

function reconcileFetchedMessages(current: ChatMessage[], fetched: ChatMessage[]) {
  let next = current;
  let changed = false;

  fetched.forEach((message) => {
    const reconciled = reconcileMessage(next, message);
    if (reconciled.changed) {
      changed = true;
      next = reconciled.list;
    }
  });

  const pending = next.filter((message) => message.isPending);
  const fetchedIds = new Set(fetched.map((message) => message.id));
  const confirmed = next.filter((message) => !message.isPending && fetchedIds.has(message.id));

  if (!changed && pending.length === 0 && confirmed.length === fetched.length && next.length === fetched.length) {
    return { list: current, changed: false };
  }

  return { list: sortMessages(next), changed: changed || next !== current };
}

function textValue(value: unknown) {
  return typeof value === "string" ? value : null;
}

function normalizedTimestamp(value: unknown) {
  if (value instanceof Date) return value.toISOString();
  if (typeof value !== "string" || !value.trim()) return new Date().toISOString();

  const raw = value.trim();
  const withTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(raw);
  const isoLike = raw.includes("T") ? raw : raw.replace(" ", "T");
  const normalized = withTimezone ? isoLike : `${isoLike}Z`;
  const date = new Date(normalized);

  return Number.isFinite(date.getTime()) ? date.toISOString() : new Date().toISOString();
}

// Supabase Realtime WAL events may deliver column names in the original
// Postgres casing (camelCase when created with quoted identifiers, e.g.
// "organizationId") OR as lowercase depending on the Postgres version and
// publication settings. We try both to be safe.
function coalesce(record: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) return record[key];
  }
  return undefined;
}

function realtimePayloadValue(record: Record<string, unknown>, key: string) {
  const payload = coalesce(record, "payload");
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  return textValue((payload as Record<string, unknown>)[key]);
}

function mapRealtimeMessage(record: Record<string, unknown>): ChatMessage | null {
  const id = textValue(coalesce(record, "id"));
  // Try camelCase first (Prisma convention), then snake_case fallback
  const organizationId = textValue(coalesce(record, "organizationId", "organization_id"));
  const channelId = textValue(coalesce(record, "channelId", "channel_id"));
  if (!id || !organizationId || !channelId) return null;

  const senderId = textValue(coalesce(record, "senderId", "sender_id"));
  const type: ChatMessageType = coalesce(record, "type") === "system" ? "system" : "text";
  const senderName = realtimePayloadValue(record, "senderName") ?? "Team member";
  const senderEmail = realtimePayloadValue(record, "senderEmail") ?? undefined;
  const senderImage = realtimePayloadValue(record, "senderImage");
  const createdAt = normalizedTimestamp(coalesce(record, "createdAt", "created_at"));
  const updatedAt = normalizedTimestamp(coalesce(record, "updatedAt", "updated_at"));

  return {
    id,
    organizationId,
    channelId,
    senderId,
    content: String(coalesce(record, "content") ?? ""),
    type,
    createdAt,
    updatedAt,
    sender: senderId ? { id: senderId, name: senderName, email: senderEmail, image: senderImage } : null,
  };
}

function mapRealtimeChannel(record: Record<string, unknown>): ChatChannel | null {
  const id = textValue(record.id);
  const organizationId = textValue(record.organizationId);
  if (!id || !organizationId) return null;

  return {
    id,
    organizationId,
    name: textValue(record.name) ?? "general",
    description: textValue(record.description),
    type: "public",
    createdById: textValue(record.createdById),
    createdAt: String(record.createdAt),
    updatedAt: String(record.updatedAt),
  };
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const sessionUserId = session?.user?.id ?? null;
  const sessionUserName = session?.user?.name ?? "You";
  const routeChannelId = activeChannelIdFromPath(pathname);

  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [registeredActiveChannelId, setRegisteredActiveChannelId] = useState<string | null>(null);
  const activeChannelId = registeredActiveChannelId ?? routeChannelId;
  const activeUnreadCount = activeChannelId ? unreadCounts[activeChannelId] ?? 0 : 0;
  const [initialLoadingChannels, setInitialLoadingChannels] = useState<Record<string, boolean>>({});
  const [refetchingChannels, setRefetchingChannels] = useState<Record<string, boolean>>({});
  const [hasLoadedChannels, setHasLoadedChannels] = useState<Record<string, boolean>>({});
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(sessionUserId);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  const activeChannelIdRef = useRef<string | null>(activeChannelId);
  const currentUserIdRef = useRef<string | null>(sessionUserId);
  const organizationIdRef = useRef<string | null>(null);
  const channelsRef = useRef(channels);
  const messagesRef = useRef(messages);
  const unreadCountsRef = useRef(unreadCounts);
  const hasLoadedChannelsRef = useRef(hasLoadedChannels);
  const loadingMessagesRef = useRef<Set<string>>(new Set());
  const markingReadRef = useRef<Set<string>>(new Set());
  const refreshingChannelsRef = useRef(false);
  const lastSessionUserIdRef = useRef<string | null>(null);
  const lastVisibleRefreshAtRef = useRef(0);
  const syncTimeoutsRef = useRef<Record<string, number>>({});

  useEffect(() => {
    activeChannelIdRef.current = activeChannelId;
  }, [activeChannelId]);

  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  useEffect(() => {
    organizationIdRef.current = organizationId;
  }, [organizationId]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    channelsRef.current = channels;
  }, [channels]);

  useEffect(() => {
    unreadCountsRef.current = unreadCounts;
  }, [unreadCounts]);

  useEffect(() => {
    hasLoadedChannelsRef.current = hasLoadedChannels;
  }, [hasLoadedChannels]);

  const resetChatState = useCallback((nextUserId: string | null) => {
    setChannels([]);
    setMessages({});
    setUnreadCounts({});
    setInitialLoadingChannels({});
    setRefetchingChannels({});
    setHasLoadedChannels({});
    setLoadingChannels(false);
    setLoadingMessages(false);
    setOrganizationId(null);
    setRegisteredActiveChannelId(null);
    setError(null);
    setCurrentUserId(nextUserId);
  }, []);

  const setActiveChannel = useCallback((channelId: string | null) => {
    setRegisteredActiveChannelId(channelId);
  }, []);

  useEffect(() => {
    if (lastSessionUserIdRef.current === sessionUserId) return;
    lastSessionUserIdRef.current = sessionUserId;
    resetChatState(sessionUserId);
  }, [resetChatState, sessionUserId]);

  const markChannelAsRead = useCallback(async (channelId: string) => {
    if (markingReadRef.current.has(channelId)) return;
    markingReadRef.current.add(channelId);
    setUnreadCounts((current) => {
      if ((current[channelId] ?? 0) === 0) return current;
      return { ...current, [channelId]: 0 };
    });
    try {
      await markChannelRead(channelId);
    } catch (err) {
      console.error("[chat] failed to mark channel read", err);
    } finally {
      markingReadRef.current.delete(channelId);
    }
  }, []);

  const refreshChannels = useCallback(async (options?: { redirect?: boolean; silent?: boolean }) => {
    if (!sessionUserId || refreshingChannelsRef.current) return;

    refreshingChannelsRef.current = true;
    const showLoading = !options?.silent && channelsRef.current.length === 0;
    if (showLoading) setLoadingChannels(true);
    setError(null);

    try {
      const payload = await listChannels();
      if (organizationIdRef.current && organizationIdRef.current !== payload.organizationId) {
        setMessages({});
        setInitialLoadingChannels({});
        setRefetchingChannels({});
        setHasLoadedChannels({});
      }
      setChannels(payload.channels);
      setUnreadCounts(payload.unreadCounts);
      setOrganizationId(payload.organizationId);
      setCurrentUserId(payload.currentUserId);

      if (options?.redirect && isChatIndexPath(pathname) && payload.channels[0]) {
        router.replace(`/dashboard/chat/${payload.channels[0].id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load chat channels.");
    } finally {
      refreshingChannelsRef.current = false;
      if (showLoading) setLoadingChannels(false);
    }
  }, [pathname, router, sessionUserId]);

  useEffect(() => {
    if (!sessionUserId) return;

    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      if (!cancelled) void refreshChannels({ redirect: true });
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [refreshChannels, sessionUserId]);

  const loadMessages = useCallback(async (channelId: string, options?: { silent?: boolean }) => {
    if (loadingMessagesRef.current.has(channelId)) return;

    loadingMessagesRef.current.add(channelId);
    const hasCached = messagesRef.current[channelId] !== undefined;
    const isSilent = Boolean(options?.silent || hasCached);

    if (isSilent) {
      setRefetchingChannels((current) => ({ ...current, [channelId]: true }));
    } else {
      setInitialLoadingChannels((current) => ({ ...current, [channelId]: true }));
    }
    if (!options?.silent) setLoadingMessages(true);
    setError(null);

    try {
      const payload = await listMessages(channelId);
      setMessages((current) => {
        const currentMessages = current[channelId] ?? [];
        const reconciled = reconcileFetchedMessages(currentMessages, payload.messages);
        if (!reconciled.changed && reconciled.list === currentMessages) return current;
        return { ...current, [channelId]: reconciled.list };
      });
      setHasLoadedChannels((current) => ({ ...current, [channelId]: true }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages.");
    } finally {
      loadingMessagesRef.current.delete(channelId);
      if (isSilent) {
        setRefetchingChannels((current) => ({ ...current, [channelId]: false }));
      } else {
        setInitialLoadingChannels((current) => ({ ...current, [channelId]: false }));
      }
      if (!options?.silent) setLoadingMessages(false);
    }
  }, []);

  const scheduleMessageSync = useCallback((channelId: string, delay = 250) => {
    const existingTimeout = syncTimeoutsRef.current[channelId];
    if (existingTimeout) window.clearTimeout(existingTimeout);

    syncTimeoutsRef.current[channelId] = window.setTimeout(() => {
      delete syncTimeoutsRef.current[channelId];
      void loadMessages(channelId, { silent: true });
    }, delay);
  }, [loadMessages]);

  useEffect(() => {
    return () => {
      Object.values(syncTimeoutsRef.current).forEach((timeoutId) => window.clearTimeout(timeoutId));
      syncTimeoutsRef.current = {};
    };
  }, []);

  useEffect(() => {
    if (!activeChannelId || loadingChannels) return;
    if (channels.length === 0) {
      if (isChatIndexPath(pathname)) router.replace("/dashboard/chat");
      return;
    }

    if (!channels.some((channel) => channel.id === activeChannelId)) {
      router.replace(`/dashboard/chat/${channels[0].id}`);
      return;
    }

    const cachedMessages = messagesRef.current[activeChannelId];
    const hasCachedMessages = cachedMessages !== undefined;
    const hasLoadedFromServer = hasLoadedChannelsRef.current[activeChannelId] ?? false;
    const hasUnreadMessages = activeUnreadCount > 0;

    if (!hasCachedMessages || !hasLoadedFromServer || hasUnreadMessages) {
      void loadMessages(activeChannelId, { silent: hasCachedMessages });
      if (hasUnreadMessages) scheduleMessageSync(activeChannelId, 500);
    }

    const timeoutId = hasUnreadMessages
      ? window.setTimeout(() => {
          void markChannelAsRead(activeChannelId);
        }, 0)
      : null;

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [activeChannelId, activeUnreadCount, channels, loadMessages, loadingChannels, markChannelAsRead, pathname, router, scheduleMessageSync]);

  useEffect(() => {
    function handleVisible() {
      if (document.visibilityState !== "visible") return;

      const now = Date.now();
      if (now - lastVisibleRefreshAtRef.current < 10_000) return;
      lastVisibleRefreshAtRef.current = now;

      void refreshChannels({ redirect: false, silent: true });
      const channelId = activeChannelIdRef.current;
      if (channelId) void loadMessages(channelId, { silent: true });
    }

    window.addEventListener("focus", handleVisible);
    document.addEventListener("visibilitychange", handleVisible);
    return () => {
      window.removeEventListener("focus", handleVisible);
      document.removeEventListener("visibilitychange", handleVisible);
    };
  }, [loadMessages, refreshChannels]);

  useEffect(() => {
    if (!organizationId) return;

    const supabase = getSupabaseBrowserClient();
    const subscription = supabase
      .channel(`tenant-chat:${organizationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_message",
          filter: `organizationId=eq.${organizationId}`,
        },
        (payload) => {
          console.log("[chat-realtime] INSERT chat_message raw", payload.new);
          const record = payload.new as Record<string, unknown>;
          const message = mapRealtimeMessage(record);

          if (!message) {
            console.warn("[chat-realtime] mapRealtimeMessage returned null — keys:", Object.keys(record));
            return;
          }
          if (message.organizationId !== organizationIdRef.current) {
            console.warn("[chat-realtime] organizationId mismatch — event:", message.organizationId, "local:", organizationIdRef.current);
            return;
          }

          console.log("[chat-realtime] mapped message", {
            id: message.id,
            channelId: message.channelId,
            content: message.content,
            createdAt: message.createdAt,
          });

          // Schedule state update in the next macrotask.
          // Calling setState directly from the Supabase WebSocket callback
          // runs inside a synchronous stack that React 18 auto-batching
          // cannot reliably flush to the DOM — the update is queued but the
          // render never commits until the next external React trigger.
          // setTimeout(0) escapes that synchronous context so React
          // processes the update cleanly in a fresh macrotask.
          window.setTimeout(() => {
            // Re-read refs inside the timeout for accuracy — the active
            // channel or user could have changed in the milliseconds
            // between the WebSocket callback and the timeout firing.
            const channelId = message.channelId;
            const senderId = message.senderId;
            const activeChannel = activeChannelIdRef.current;
            const currentUser = currentUserIdRef.current;

            setMessages((current) => {
              const currentMessages = current[channelId];
              if (!currentMessages && channelId !== activeChannel) {
                console.log("[chat-realtime] skip — no cache for non-active channel", channelId);
                return current;
              }
              const reconciled = reconcileMessage(currentMessages ?? [], message);
              if (!reconciled.changed) {
                console.log("[chat-realtime] skip — message already in state", message.id);
                return current;
              }
              console.log("[chat-realtime] ✅ appended", message.id, "to", channelId);
              return { ...current, [channelId]: reconciled.list };
            });

            if (senderId === currentUser) return;

            if (channelId === activeChannel) {
              void markChannelAsRead(channelId);
              return;
            }

            setUnreadCounts((current) => ({
              ...current,
              [channelId]: (current[channelId] ?? 0) + 1,
            }));
          }, 0);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_message",
          filter: `organizationId=eq.${organizationId}`,
        },
        (payload) => {
          console.log("[chat-realtime] UPDATE chat_message", payload.new);
          const message = mapRealtimeMessage(payload.new as Record<string, unknown>);
          if (!message || message.organizationId !== organizationIdRef.current) return;

          window.setTimeout(() => {
            setMessages((current) => {
              const currentMessages = current[message.channelId];
              if (!currentMessages) return current;
              const idx = currentMessages.findIndex((m) => m.id === message.id);
              if (idx < 0) return current;
              const next = [...currentMessages];
              next[idx] = { ...next[idx], ...message };
              return { ...current, [message.channelId]: next };
            });
          }, 0);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "chat_message",
          filter: `organizationId=eq.${organizationId}`,
        },
        (payload) => {
          console.log("[chat-realtime] DELETE chat_message", payload.old);
          const record = payload.old as Record<string, unknown>;
          const deletedId = textValue(coalesce(record, "id"));
          const channelId = textValue(coalesce(record, "channelId", "channel_id"));
          if (!deletedId || !channelId) return;

          window.setTimeout(() => {
            setMessages((current) => {
              const currentMessages = current[channelId];
              if (!currentMessages) return current;
              return { ...current, [channelId]: currentMessages.filter((m) => m.id !== deletedId) };
            });
          }, 0);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_channel",
          filter: `organizationId=eq.${organizationId}`,
        },
        (payload) => {
          console.log("[chat-realtime] INSERT chat_channel", payload.new);
          const channel = mapRealtimeChannel(payload.new as Record<string, unknown>);
          if (!channel || channel.organizationId !== organizationIdRef.current) return;

          window.setTimeout(() => {
            setChannels((current) =>
              current.some((item) => item.id === channel.id)
                ? current
                : [...current, channel].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            );
            setUnreadCounts((current) => ({ ...current, [channel.id]: current[channel.id] ?? 0 }));
          }, 0);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "chat_channel",
          filter: `organizationId=eq.${organizationId}`,
        },
        (payload) => {
          const record = payload.old as Record<string, unknown>;
          const deletedChannelId = textValue(coalesce(record, "id"));
          if (!deletedChannelId) return;

          window.setTimeout(() => {
            setChannels((current) => current.filter((channel) => channel.id !== deletedChannelId));
            setMessages((current) => {
              if (!(deletedChannelId in current)) return current;
              const next = { ...current };
              delete next[deletedChannelId];
              return next;
            });
            setUnreadCounts((current) => {
              if (!(deletedChannelId in current)) return current;
              const next = { ...current };
              delete next[deletedChannelId];
              return next;
            });
          }, 0);
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.error("[chat-realtime] subscription error", err);
        } else {
          console.log(`[chat-realtime] status: ${status} (org: ${organizationId})`);
        }
      });

    return () => {
      console.log(`[chat-realtime] unsubscribing (org: ${organizationId})`);
      void supabase.removeChannel(subscription);
    };
  }, [markChannelAsRead, organizationId]);

  const sendMessage = useCallback(async (channelId: string, content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    const clientId = `pending-${crypto.randomUUID()}`;
    const timestamp = new Date().toISOString();
    const optimisticMessage: ChatMessage = {
      id: clientId,
      clientId,
      organizationId: channels.find((channel) => channel.id === channelId)?.organizationId ?? organizationId ?? "",
      channelId,
      senderId: currentUserIdRef.current,
      content: trimmed,
      type: "text",
      createdAt: timestamp,
      updatedAt: timestamp,
      sender: currentUserIdRef.current
        ? { id: currentUserIdRef.current, name: sessionUserName, image: session?.user?.image ?? null }
        : null,
      isPending: true,
    };

    setMessages((current) => {
      const reconciled = reconcileMessage(current[channelId] ?? [], optimisticMessage);
      return { ...current, [channelId]: reconciled.list };
    });
    setUnreadCounts((current) => ({ ...current, [channelId]: 0 }));

    try {
      const payload = await sendChannelMessage(channelId, trimmed);
      setCurrentUserId(payload.message.senderId);
      setMessages((current) => {
        const currentMessages = current[channelId] ?? [];
        const reconciled = reconcileMessage(currentMessages, payload.message);
        if (!reconciled.changed) return current;
        return { ...current, [channelId]: reconciled.list };
      });
      void markChannelAsRead(channelId);
    } catch (err) {
      setMessages((current) => ({
        ...current,
        [channelId]: (current[channelId] ?? []).filter((message) => message.id !== clientId),
      }));
      setError(err instanceof Error ? err.message : "Failed to send message.");
      throw err;
    }
  }, [channels, markChannelAsRead, organizationId, session?.user?.image, sessionUserName]);

  const createChannel = useCallback(async (name: string, description: string) => {
    const payload = await createChannelRequest({ name, description });
    setChannels((current) => current.some((item) => item.id === payload.channel.id) ? current : [...current, payload.channel]);
    setMessages((current) => ({ ...current, [payload.channel.id]: [] }));
    setUnreadCounts((current) => ({ ...current, [payload.channel.id]: 0 }));
    return payload.channel.id;
  }, []);

  const deleteChannel = useCallback(async (channelId: string) => {
    try {
      await deleteChannelRequest(channelId);
      // Determine navigation target *before* state updates to avoid
      // calling router inside a setState updater (which runs during render).
      const isActive = activeChannelIdRef.current === channelId;
      const remainingChannels = channelsRef.current.filter((ch) => ch.id !== channelId);
      const navTarget = isActive
        ? remainingChannels[0]?.id
          ? `/dashboard/chat/${remainingChannels[0].id}`
          : "/dashboard/chat"
        : null;

      setChannels((current) => current.filter((channel) => channel.id !== channelId));
      setMessages((current) => {
        const next = { ...current };
        delete next[channelId];
        return next;
      });
      setUnreadCounts((current) => {
        const next = { ...current };
        delete next[channelId];
        return next;
      });

      // Navigate after state updates are committed, outside of any updater.
      if (navTarget) {
        window.setTimeout(() => router.replace(navTarget), 0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete channel.");
      void refreshChannels({ redirect: false, silent: true });
    }
  }, [refreshChannels, router]);

  const totalUnreadCount = useMemo(
    () => Object.values(unreadCounts).reduce((total, count) => total + count, 0),
    [unreadCounts]
  );

  const value = useMemo(() => ({
    channels,
    messages,
    unreadCounts,
    totalUnreadCount,
    initialLoadingChannels,
    refetchingChannels,
    hasLoadedChannels,
    loadingChannels,
    loadingMessages,
    error,
    currentUserId,
    organizationId,
    activeChannelId,
    setActiveChannel,
    loadMessages,
    markChannelAsRead,
    sendMessage,
    createChannel,
    deleteChannel,
  }), [
    channels,
    messages,
    unreadCounts,
    totalUnreadCount,
    initialLoadingChannels,
    refetchingChannels,
    hasLoadedChannels,
    loadingChannels,
    loadingMessages,
    error,
    currentUserId,
    organizationId,
    activeChannelId,
    setActiveChannel,
    loadMessages,
    markChannelAsRead,
    sendMessage,
    createChannel,
    deleteChannel,
  ]);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
