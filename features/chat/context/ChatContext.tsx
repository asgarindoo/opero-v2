"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import type { ChatChannel, ChatMessage } from "@/features/chat";
import {
  createChannel as createChannelRequest,
  getSupabaseBrowserClient,
  listChannels,
  listMessages,
  sendChannelMessage,
  deleteChannel as deleteChannelRequest,
} from "@/features/chat/services/chat.client";

interface ChatContextType {
  channels: ChatChannel[];
  messages: Record<string, ChatMessage[]>;
  unreadCounts: Record<string, number>;
  initialLoadingChannels: Record<string, boolean>;
  loadingChannels: boolean;
  loadingMessages: boolean;
  error: string | null;
  currentUserId: string | null;
  loadMessages: (channelId: string) => Promise<void>;
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

function mergeMessage(list: ChatMessage[], message: ChatMessage) {
  return reconcileMessage(list, message).list;
}

function mergeMessages(list: ChatMessage[], incoming: ChatMessage[]) {
  const existingIds = new Set(list.map((message) => message.id));
  const added = incoming.filter((message) => !existingIds.has(message.id));
  if (added.length === 0) return { list, added };

  return {
    list: [...list, ...added].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    added,
  };
}

function sameMessageList(a: ChatMessage[], b: ChatMessage[]) {
  if (a.length !== b.length) return false;
  return a.every((message, index) => (
    message.id === b[index]?.id &&
    message.content === b[index]?.content &&
    message.updatedAt === b[index]?.updatedAt
  ));
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
  if (existingIndex >= 0) {
    console.log("[chat] duplicate ignored", { id: incoming.id });
    return { list, added: false, replacedOptimistic: false };
  }

  const pendingIndex = list.findIndex((message) => isMatchingOptimistic(message, incoming));
  if (pendingIndex >= 0) {
    const next = [...list];
    const pending = next[pendingIndex];
    next[pendingIndex] = {
      ...incoming,
      clientId: pending.clientId,
      isPending: false,
    };
    console.log("[chat] optimistic replaced", {
      clientId: pending.clientId,
      serverId: incoming.id,
    });
    return { list: sortMessages(next), added: true, replacedOptimistic: true };
  }

  console.log("[chat] message appended", {
    id: incoming.id,
    before: list.length,
    after: list.length + 1,
  });
  return { list: sortMessages([...list, incoming]), added: true, replacedOptimistic: false };
}

function reconcileFetchedMessages(current: ChatMessage[], fetched: ChatMessage[]) {
  let next = current;
  let changed = false;

  fetched.forEach((message) => {
    const reconciled = reconcileMessage(next, message);
    if (reconciled.list !== next) {
      changed = true;
      next = reconciled.list;
    }
  });

  const pending = next.filter((message) => message.isPending);
  const fetchedIds = new Set(fetched.map((message) => message.id));
  const missingConfirmed = next.filter((message) => !message.isPending && !fetchedIds.has(message.id));

  if (changed) {
    return { list: next, changed: true };
  }

  if (missingConfirmed.length === 0 && pending.length === 0 && sameMessageList(next, fetched)) {
    return { list: current, changed: false };
  }

  return { list: next, changed };
}

function readKey(userId: string | null, organizationId: string, channelId: string) {
  return `opero:chat:last-read:${userId ?? "anonymous"}:${organizationId}:${channelId}`;
}

function getLastReadAt(userId: string | null, organizationId: string, channelId: string) {
  if (typeof window === "undefined") return 0;
  const value = window.localStorage.getItem(readKey(userId, organizationId, channelId));
  return value ? Number(value) || 0 : 0;
}

function setLastReadAt(userId: string | null, organizationId: string, channelId: string, timestamp = Date.now()) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(readKey(userId, organizationId, channelId), String(timestamp));
}

function countUnreadMessages(messages: ChatMessage[], userId: string | null, organizationId: string, channelId: string) {
  const lastReadAt = getLastReadAt(userId, organizationId, channelId);
  return messages.filter((message) => (
    message.senderId !== userId &&
    new Date(message.createdAt).getTime() > lastReadAt
  )).length;
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const sessionUserId = session?.user?.id ?? null;
  const sessionUserName = session?.user?.name ?? "You";
  const activeChannelId = activeChannelIdFromPath(pathname);
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [initialLoadingChannels, setInitialLoadingChannels] = useState<Record<string, boolean>>({});
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(sessionUserId);
  const lastSessionUserIdRef = useRef<string | null>(null);
  const sessionUserIdRef = useRef<string | null>(sessionUserId);
  const refreshingChannelsRef = useRef(false);
  const loadingMessagesRef = useRef<Set<string>>(new Set());
  const lastVisibleRefreshAtRef = useRef(0);
  const activeSyncInFlightRef = useRef<string | null>(null);
  const organizationId = channels[0]?.organizationId ?? null;

  useEffect(() => {
    sessionUserIdRef.current = sessionUserId;
  }, [sessionUserId]);

  useEffect(() => {
    if (!sessionUserId) return;
    if (lastSessionUserIdRef.current === sessionUserId) return;

    const previousUserId = lastSessionUserIdRef.current;
    lastSessionUserIdRef.current = sessionUserId;
    if (!previousUserId) {
      setCurrentUserId(sessionUserId);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setChannels([]);
      setMessages({});
      setUnreadCounts({});
      setInitialLoadingChannels({});
      setError(null);
      setCurrentUserId(sessionUserId);
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [sessionUserId]);

  const refreshChannels = useCallback(async (options?: { redirect?: boolean; silent?: boolean }) => {
    if (!sessionUserId || refreshingChannelsRef.current) return;

    refreshingChannelsRef.current = true;
    const showLoading = !options?.silent && channels.length === 0;
    if (showLoading) setLoadingChannels(true);
    setError(null);
    try {
      const payload = await listChannels();
      setChannels(payload.channels);

      if (options?.redirect && !activeChannelId && payload.channels[0]) {
        router.replace(`/dashboard/chat/${payload.channels[0].id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load chat channels.");
    } finally {
      refreshingChannelsRef.current = false;
      if (showLoading) setLoadingChannels(false);
    }
  }, [activeChannelId, channels.length, router, sessionUserId]);

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

  useEffect(() => {
    if (!activeChannelId || loadingChannels) return;
    if (channels.length === 0) {
      router.replace("/dashboard/chat");
      return;
    }
    if (!channels.some((channel) => channel.id === activeChannelId)) {
      router.replace(`/dashboard/chat/${channels[0].id}`);
    }
  }, [activeChannelId, channels, loadingChannels, router]);

  const loadMessages = useCallback(async (channelId: string, options?: { silent?: boolean; countUnread?: boolean }) => {
    if (loadingMessagesRef.current.has(channelId)) return;

    loadingMessagesRef.current.add(channelId);
    const isInitialChannelLoad = messages[channelId] === undefined && !options?.silent;
    if (isInitialChannelLoad) {
      setInitialLoadingChannels((current) => ({ ...current, [channelId]: true }));
    }
    if (!options?.silent) setLoadingMessages(true);
    setError(null);
    try {
      const payload = await listMessages(channelId);
      setMessages((current) => {
        const currentMessages = current[channelId] ?? [];
        if (!options?.countUnread) {
          const reconciled = reconcileFetchedMessages(currentMessages, payload.messages);
          if (!reconciled.changed && reconciled.list === currentMessages) return current;
          return { ...current, [channelId]: reconciled.list };
        }

        const merged = mergeMessages(currentMessages, payload.messages);
        if (merged.list === currentMessages) return current;
        if (channelId !== activeChannelId && payload.messages[0]) {
          setUnreadCounts((counts) => {
            const organizationId = payload.messages[0]?.organizationId;
            if (!organizationId) return counts;
            return {
              ...counts,
              [channelId]: countUnreadMessages(payload.messages, sessionUserIdRef.current, organizationId, channelId),
            };
          });
        }

        return { ...current, [channelId]: merged.list };
      });
      if (!options?.silent) {
        const organizationId = payload.messages[0]?.organizationId ?? channels.find((channel) => channel.id === channelId)?.organizationId;
        if (organizationId) {
          setLastReadAt(sessionUserIdRef.current, organizationId, channelId);
        }
        setUnreadCounts((current) => ({ ...current, [channelId]: 0 }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages.");
    } finally {
      loadingMessagesRef.current.delete(channelId);
      if (isInitialChannelLoad) {
        setInitialLoadingChannels((current) => ({ ...current, [channelId]: false }));
      }
      if (!options?.silent) setLoadingMessages(false);
    }
  }, [activeChannelId, channels, messages]);

  useEffect(() => {
    function handleVisible() {
      if (document.visibilityState !== "visible") return;

      const now = Date.now();
      if (now - lastVisibleRefreshAtRef.current < 3_000) return;
      lastVisibleRefreshAtRef.current = now;

      void refreshChannels({ redirect: false, silent: true });
      if (activeChannelId) void loadMessages(activeChannelId, { silent: true });
    }

    window.addEventListener("focus", handleVisible);
    document.addEventListener("visibilitychange", handleVisible);
    return () => {
      window.removeEventListener("focus", handleVisible);
      document.removeEventListener("visibilitychange", handleVisible);
    };
  }, [activeChannelId, loadMessages, refreshChannels]);

  useEffect(() => {
    if (!activeChannelId) return;
    if (messages[activeChannelId]) return;
    const timeoutId = window.setTimeout(() => {
      void loadMessages(activeChannelId, { silent: true });
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [activeChannelId, loadMessages, messages]);

  useEffect(() => {
    if (!activeChannelId) return;
    const channel = channels.find((item) => item.id === activeChannelId);
    if (!channel) return;

    const timeoutId = window.setTimeout(() => {
      setLastReadAt(sessionUserIdRef.current, channel.organizationId, activeChannelId);
      setUnreadCounts((current) => ({ ...current, [activeChannelId]: 0 }));
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [activeChannelId, channels]);

  useEffect(() => {
    if (channels.length === 0) return;

    const intervalId = window.setInterval(() => {
      channels.forEach((channel) => {
        if (channel.id === activeChannelId) return;
        void loadMessages(channel.id, { silent: true, countUnread: true });
      });
    }, 5_000);

    return () => window.clearInterval(intervalId);
  }, [activeChannelId, channels, loadMessages]);

  useEffect(() => {
    if (!activeChannelId) return;
    const channelId = activeChannelId;

    function syncActiveChannel() {
      if (activeSyncInFlightRef.current === channelId) return;
      activeSyncInFlightRef.current = channelId;

      listMessages(channelId)
        .then((payload) => {
          console.log("[chat] active sync", {
            channelId,
            received: payload.messages.length,
          });
          setMessages((current) => {
            const currentMessages = current[channelId] ?? [];
            const reconciled = reconcileFetchedMessages(currentMessages, payload.messages);
            if (!reconciled.changed && reconciled.list === currentMessages) return current;
            return {
              ...current,
              [channelId]: reconciled.list,
            };
          });
        })
        .catch((err) => {
          console.error("[chat] active sync failed", err);
        })
        .finally(() => {
          activeSyncInFlightRef.current = null;
        });
    }

    syncActiveChannel();
    const intervalId = window.setInterval(syncActiveChannel, 1_000);

    return () => window.clearInterval(intervalId);
  }, [activeChannelId]);

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
          const record = payload.new as Record<string, unknown>;
          if (record.organizationId !== organizationId) return;
          const channelId = typeof record.channelId === "string" ? record.channelId : null;
          if (!channelId) return;

          const senderId = typeof record.senderId === "string" ? record.senderId : null;
          const message: ChatMessage = {
            id: String(record.id),
            organizationId: String(record.organizationId),
            channelId,
            senderId,
            content: String(record.content ?? ""),
            type: record.type === "system" ? "system" : "text",
            createdAt: String(record.createdAt),
            updatedAt: String(record.updatedAt),
            sender: senderId
              ? {
                  id: senderId,
                  name: "Team member",
                  image: null,
                }
              : null,
          };
          console.log("[chat] realtime payload", { id: message.id, channelId });

          setMessages((current) => {
            const before = current[channelId]?.length ?? 0;
            const reconciled = reconcileMessage(current[channelId] ?? [], message);
            console.log("[chat] realtime reconcile", {
              id: message.id,
              before,
              after: reconciled.list.length,
            });
            if (reconciled.list === (current[channelId] ?? [])) return current;
            return {
              ...current,
              [channelId]: reconciled.list,
            };
          });
          setUnreadCounts((current) => {
            if (channelId === activeChannelId || senderId === sessionUserIdRef.current) {
              setLastReadAt(sessionUserIdRef.current, organizationId, channelId, new Date(message.createdAt).getTime());
              return { ...current, [channelId]: 0 };
            }

            const lastReadAt = getLastReadAt(sessionUserIdRef.current, organizationId, channelId);
            if (new Date(message.createdAt).getTime() <= lastReadAt) return current;

            return {
              ...current,
              [channelId]: (current[channelId] ?? 0) + 1,
            };
          });
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
          const deletedChannelId = typeof record.id === "string" ? record.id : null;
          if (!deletedChannelId) return;

          setChannels((current) => current.filter((channel) => channel.id !== deletedChannelId));
          setMessages((current) => {
            const next = { ...current };
            delete next[deletedChannelId];
            return next;
          });
          setUnreadCounts((current) => {
            const next = { ...current };
            delete next[deletedChannelId];
            return next;
          });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(subscription);
    };
  }, [activeChannelId, organizationId]);

  const sendMessage = useCallback(async (channelId: string, content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    const optimisticId = `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const clientId = optimisticId;
    const optimisticMessage: ChatMessage = {
      id: optimisticId,
      clientId,
      organizationId: channels.find((channel) => channel.id === channelId)?.organizationId ?? "",
      channelId,
      senderId: sessionUserId,
      content: trimmed,
      type: "text",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sender: sessionUserId ? { id: sessionUserId, name: sessionUserName, image: session?.user?.image ?? null } : null,
      isPending: true,
    };
    console.log("[chat] send start", { channelId, clientId, contentLength: trimmed.length });

    setMessages((current) => ({
      ...current,
      [channelId]: mergeMessage(current[channelId] ?? [], optimisticMessage),
    }));
    setUnreadCounts((current) => ({ ...current, [channelId]: 0 }));

    try {
      const payload = await sendChannelMessage(channelId, trimmed);
      console.log("[chat] server message", { clientId, serverId: payload.message.id });
      setCurrentUserId(payload.message.senderId);
      setMessages((current) => {
        const before = current[channelId]?.length ?? 0;
        const reconciled = reconcileMessage(current[channelId] ?? [], payload.message);
        console.log("[chat] server reconcile", {
          clientId,
          serverId: payload.message.id,
          before,
          after: reconciled.list.length,
        });
        if (reconciled.list === (current[channelId] ?? [])) return current;
        return {
          ...current,
          [channelId]: reconciled.list,
        };
      });
    } catch (err) {
      setMessages((current) => ({
        ...current,
        [channelId]: (current[channelId] ?? []).filter((message) => message.id !== optimisticId),
      }));
      setError(err instanceof Error ? err.message : "Failed to send message.");
    }
  }, [channels, session?.user?.image, sessionUserId, sessionUserName]);

  const createChannel = useCallback(async (name: string, description: string) => {
    const payload = await createChannelRequest({ name, description });
    setChannels((current) => current.some((item) => item.id === payload.channel.id) ? current : [...current, payload.channel]);
    setMessages((current) => ({ ...current, [payload.channel.id]: [] }));
    return payload.channel.id;
  }, []);

  const deleteChannel = useCallback(async (channelId: string) => {
    try {
      await deleteChannelRequest(channelId);
      setChannels((current) => {
        const next = current.filter((channel) => channel.id !== channelId);
        if (activeChannelId === channelId) {
          const target = next[0]?.id;
          router.replace(target ? `/dashboard/chat/${target}` : "/dashboard/chat");
        }
        return next;
      });
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete channel.");
      void refreshChannels({ redirect: false, silent: true });
    }
  }, [activeChannelId, refreshChannels, router]);

  const value = useMemo(() => ({
    channels,
    messages,
    unreadCounts,
    initialLoadingChannels,
    loadingChannels,
    loadingMessages,
    error,
    currentUserId,
    loadMessages,
    sendMessage,
    createChannel,
    deleteChannel,
  }), [channels, messages, unreadCounts, initialLoadingChannels, loadingChannels, loadingMessages, error, currentUserId, loadMessages, sendMessage, createChannel, deleteChannel]);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
