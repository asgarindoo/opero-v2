"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { CornerUpLeft, Search, MessageSquarePlus, Trash2 } from "lucide-react";
import { useChat } from "../context/ChatContext";
import type { ChatMessage } from "@/features/chat";
import UserAvatar from "@/components/common/UserAvatar";
import { getUserDisplayName } from "@/lib/user-identity";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { useTenant } from "@/components/providers/TenantProvider";

function messageDebugShape(message: ChatMessage) {
  const diagnosticFields = message as ChatMessage & {
    chatChannelId?: unknown;
    status?: unknown;
  };

  return {
    id: message.id,
    content: message.content,
    channelId: message.channelId,
    chatChannelId: diagnosticFields.chatChannelId,
    status: diagnosticFields.status,
    type: message.type,
    createdAt: message.createdAt,
    senderId: message.senderId,
    sender: message.sender,
  };
}

export default function MessageList({ channelId, searchQuery = "", onReply }: { channelId: string; searchQuery?: string; onReply?: (message: ChatMessage) => void }) {
  const { role } = useTenant();
  const {
    messages,
    initialLoadingChannels,
    hasLoadedChannels,
    error,
    currentUserId,
    loadMessages,
    deleteMessage,
  } = useChat();

  const rawMessages = useMemo(() => messages[channelId] ?? [], [messages, channelId]);
  const hasCachedMessages = messages[channelId] !== undefined;
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  const visibleMessages = useMemo(() => {
    if (!normalizedSearchQuery) return rawMessages;
    return rawMessages.filter((msg) =>
      (msg.content ?? "").toLowerCase().includes(normalizedSearchQuery)
    );
  }, [rawMessages, normalizedSearchQuery]);

  // Diagnostic: log every render so we can confirm context updates reach here.
  console.log("[chat-ui] MessageList render", {
    channelId,
    messagesKeys: Object.keys(messages),
    channelMessageCount: rawMessages.length,
    hasCachedMessages,
    hasLoaded: hasLoadedChannels[channelId] ?? false,
  });
  console.log("[chat-ui] raw messages", rawMessages.length, rawMessages.map(messageDebugShape));
  console.log("[chat-ui] visible messages", visibleMessages.length, visibleMessages.map((m) => ({
    id: m.id,
    content: m.content,
  })));
  
  const isInitialLoading = initialLoadingChannels[channelId] ?? !hasCachedMessages;
  const hasLoaded = hasLoadedChannels[channelId] ?? false;

  const bottomRef = useRef<HTMLDivElement>(null);
  const [previousMessageCount, setPreviousMessageCount] = useState(0);
  const [messageToDelete, setMessageToDelete] = useState<ChatMessage | null>(null);
  const [contextMenu, setContextMenu] = useState<{ message: ChatMessage; x: number; y: number } | null>(null);

  useEffect(() => {
    if (hasCachedMessages && hasLoaded) return;
    const timeoutId = window.setTimeout(() => {
      void loadMessages(channelId, { silent: hasCachedMessages });
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [channelId, hasCachedMessages, hasLoaded, loadMessages]);

  useEffect(() => {
    const nextCount = visibleMessages.length;

    const frameId = window.requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
      setPreviousMessageCount(nextCount);
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [visibleMessages]);

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    if (!Number.isFinite(d.getTime())) return "";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 scroll-smooth bg-[#faf8f6]">
      {contextMenu && (
        <>
          <button className="fixed inset-0 z-40 cursor-default" type="button" onClick={() => setContextMenu(null)} />
          <div
            className="fixed z-50 min-w-[150px] rounded-[8px] border border-black/[0.08] bg-white p-1 shadow-[0_12px_32px_rgba(0,0,0,0.12)]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              type="button"
              onClick={() => {
                onReply?.(contextMenu.message);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2 rounded-[6px] px-2.5 py-2 text-left font-aspekta text-[12px] text-black/75 hover:bg-black/[0.04]"
            >
              <CornerUpLeft size={13} />
              Reply
            </button>
            {(contextMenu.message.senderId === currentUserId || role === "owner" || role === "admin") && (
              <button
                type="button"
                onClick={() => {
                  setMessageToDelete(contextMenu.message);
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-2 rounded-[6px] px-2.5 py-2 text-left font-aspekta text-[12px] text-black/75 hover:bg-black/[0.04]"
              >
                <Trash2 size={13} />
                {contextMenu.message.senderId === currentUserId ? "Tarik pesan" : "Hapus pesan"}
              </button>
            )}
          </div>
        </>
      )}
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/10 bg-red-500/5 px-4 py-3 font-aspekta text-[12px] text-red-600">
          {error}
        </div>
      )}
      
      {isInitialLoading && !hasLoaded && rawMessages.length === 0 ? (
        <div className="space-y-6 animate-pulse">
          <div className="flex items-end gap-2.5 max-w-[60%]">
            <div className="w-6 h-6 rounded-full bg-black/5 shrink-0" />
            <div className="flex flex-col gap-1.5 w-full">
              <div className="h-2.5 w-16 bg-black/5 rounded" />
              <div className="h-8 bg-black/5 rounded-full rounded-bl-xs w-48" />
            </div>
          </div>
          <div className="flex items-end gap-2.5 max-w-[60%] ml-auto flex-row-reverse">
            <div className="w-6 h-6 rounded-full bg-black/5 shrink-0" />
            <div className="flex flex-col gap-1.5 w-full items-end">
              <div className="h-2.5 w-16 bg-black/5 rounded" />
              <div className="h-8 bg-black/5 rounded-full rounded-br-xs w-36" />
            </div>
          </div>
          <div className="flex items-end gap-2.5 max-w-[60%]">
            <div className="w-6 h-6 rounded-full bg-black/5 shrink-0" />
            <div className="flex flex-col gap-1.5 w-full">
              <div className="h-2.5 w-16 bg-black/5 rounded" />
              <div className="h-14 bg-black/5 rounded-full rounded-bl-xs w-64" />
            </div>
          </div>
        </div>
      ) : hasLoaded && visibleMessages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center px-6 animate-fade-in-up">
          {searchQuery ? (
            <>
              <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center mb-3">
                <Search size={16} className="text-black opacity-40" />
              </div>
              <h3 className="font-aspekta font-semibold text-[13.5px] text-black mb-1">No results found</h3>
              <p className="font-aspekta text-[12px] text-black/60">
                {`No messages contain "${searchQuery}".`}
              </p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center mb-3">
                <MessageSquarePlus size={16} className="text-black opacity-40" />
              </div>
              <h3 className="font-aspekta font-semibold text-[13.5px] text-black mb-1">Start a conversation</h3>
              <p className="font-aspekta text-[12px] text-black/60 max-w-60">
                Messages shared here will be visible to all members.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3.5">
          {visibleMessages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            const canDeleteMessage = isMe || role === "owner" || role === "admin";
            const senderName = getUserDisplayName(msg.sender, isMe ? "You" : "Unknown User");
            const messageKey = msg.clientId ?? msg.id;
            const messageIndex = visibleMessages.findIndex((item) => (item.clientId ?? item.id) === messageKey);
            
            const isNew = msg.isPending || messageIndex >= previousMessageCount;
            const timestamp = formatTime(msg.createdAt);

            return (
              <div
                key={msg.clientId ?? msg.id}
                onContextMenu={(event) => {
                  event.preventDefault();
                  setContextMenu({
                    message: msg,
                    x: Math.min(event.clientX, window.innerWidth - 170),
                    y: Math.min(event.clientY, window.innerHeight - 96),
                  });
                }}
                className={`group flex w-full ${isMe ? "justify-end" : "justify-start"} ${
                  isNew ? "animate-slide-up-fade" : ""
                }`}
              >
                <div className={`flex items-end gap-2 max-w-[85%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                  {/* User avatar */}
                  <UserAvatar
                    user={msg.sender}
                    name={senderName}
                    size="md"
                    className={`h-6 w-6 text-[9px] select-none ${
                      isMe
                        ? "bg-[#18181b] text-white"
                        : "bg-[#f8f3f2] text-black/75 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                    }`}
                  />
                  
                  <div className={`flex flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}>
                    <span className="font-aspekta text-[9px] text-black/35 px-1 select-none">
                      {isMe ? timestamp : [senderName, timestamp].filter(Boolean).join(" - ")}
                    </span>
                    
                    <div
                      className={`relative px-3.5 py-2 transition-all duration-300 font-aspekta text-[12.5px] leading-relaxed whitespace-pre-wrap ${
                        isMe
                          ? `bg-[#18181b] text-white rounded-full rounded-br-xs hover:bg-black/90 ${
                              msg.isPending ? "opacity-75 bg-[#27272a] animate-pulse" : "shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                            }`
                          : "bg-[#f8f3f2] text-[#1c1b1b] rounded-full rounded-bl-xs border border-black/3 hover:bg-[#f2eceb]"
                      }`}
                    >
                      {msg.replyTo && (
                        <div className={`mb-1.5 rounded-[10px] px-2.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] ${
                          isMe ? "bg-white/[0.12]" : "bg-white/70 border border-black/[0.04]"
                        }`}>
                          <div className="flex items-center gap-1.5">
                            <span className={`font-aspekta text-[10px] ${isMe ? "text-white/55" : "text-black/35"}`}>↩</span>
                            <p className={`font-label-caps text-[8px] font-bold uppercase tracking-[0.14em] ${isMe ? "text-white/60" : "text-black/35"}`}>
                              {msg.replyTo.senderName}
                            </p>
                          </div>
                          <p className={`mt-0.5 font-aspekta text-[10.5px] truncate ${isMe ? "text-white/55" : "text-black/45"}`}>
                            {msg.replyTo.content}
                          </p>
                        </div>
                      )}
                      {msg.content ?? ""}
                      
                      {msg.isPending && (
                        <div className="mt-1 flex items-center gap-1 opacity-75">
                          <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce [animation-delay:-0.3s]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce [animation-delay:-0.15s]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" />
                        </div>
                      )}
                    </div>
                    {!msg.isPending && canDeleteMessage && (
                      <button
                        type="button"
                        onClick={() => setMessageToDelete(msg)}
                        className={`opacity-0 group-hover:opacity-100 transition-all h-6 w-6 flex items-center justify-center rounded-full text-black/35 hover:text-black/70 hover:bg-black/[0.05] ${
                          isMe ? "mr-1" : "ml-1"
                        }`}
                        title={isMe ? "Recall message" : "Delete message"}
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      )}
      <ConfirmationModal
        isOpen={!!messageToDelete}
        onClose={() => setMessageToDelete(null)}
        onConfirm={() => {
          if (!messageToDelete) return;
          void deleteMessage(channelId, messageToDelete.id);
          setMessageToDelete(null);
        }}
        title={messageToDelete?.senderId === currentUserId ? "Recall message?" : "Delete message?"}
        description="This message will be permanently deleted from the database. This action cannot be undone."
        confirmLabel={messageToDelete?.senderId === currentUserId ? "Recall Message" : "Delete Message"}
        variant="info"
      />
    </div>
  );
}
