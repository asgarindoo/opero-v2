"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, MessageSquarePlus } from "lucide-react";
import { useChat } from "../context/ChatContext";

export default function MessageList({ channelId, searchQuery = "" }: { channelId: string; searchQuery?: string }) {
  const {
    messages,
    initialLoadingChannels,
    hasLoadedChannels,
    error,
    currentUserId,
    loadMessages,
  } = useChat();

  const channelMessages = useMemo(() => messages[channelId] ?? [], [messages, channelId]);
  const hasCachedMessages = messages[channelId] !== undefined;

  // ── Diagnostic: log every render so we can confirm context updates reach here ──
  console.log("[chat-ui] MessageList render", {
    channelId,
    messagesKeys: Object.keys(messages),
    channelMessageCount: channelMessages.length,
    hasCachedMessages,
    hasLoaded: hasLoadedChannels[channelId] ?? false,
  });
  
  const isInitialLoading = initialLoadingChannels[channelId] ?? !hasCachedMessages;
  const hasLoaded = hasLoadedChannels[channelId] ?? false;

  const bottomRef = useRef<HTMLDivElement>(null);
  const [previousMessageCount, setPreviousMessageCount] = useState(0);

  useEffect(() => {
    if (hasCachedMessages && hasLoaded) return;
    const timeoutId = window.setTimeout(() => {
      void loadMessages(channelId, { silent: hasCachedMessages });
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [channelId, hasCachedMessages, hasLoaded, loadMessages]);

  useEffect(() => {
    const nextCount = channelMessages.length;

    const frameId = window.requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
      setPreviousMessageCount(nextCount);
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [channelMessages]);

  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return channelMessages;
    return channelMessages.filter((msg) =>
      msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [channelMessages, searchQuery]);

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 scroll-smooth bg-[#faf8f6]">
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/10 bg-red-500/5 px-4 py-3 font-aspekta text-[12px] text-red-600">
          {error}
        </div>
      )}
      
      {isInitialLoading && !hasLoaded && channelMessages.length === 0 ? (
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
      ) : hasLoaded && filteredMessages.length === 0 ? (
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
          {filteredMessages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            const senderName = msg.sender?.name ?? "Team member";
            const initials = getInitials(senderName);
            const messageKey = msg.clientId ?? msg.id;
            const messageIndex = channelMessages.findIndex((item) => (item.clientId ?? item.id) === messageKey);
            
            const isNew = msg.isPending || messageIndex >= previousMessageCount;

            return (
              <div
                key={msg.clientId ?? msg.id}
                className={`group flex w-full ${isMe ? "justify-end" : "justify-start"} ${
                  isNew ? "animate-slide-up-fade" : ""
                }`}
              >
                <div className={`flex items-end gap-2 max-w-[85%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                  {/* User initials circle avatar */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-aspekta font-semibold text-[9px] shrink-0 select-none ${
                      isMe
                        ? "bg-[#18181b] text-white"
                        : "bg-[#f8f3f2] text-black/75 border border-black/10 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                    }`}
                  >
                    {initials}
                  </div>
                  
                  <div className={`flex flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}>
                    <span className="font-aspekta text-[9px] text-black/35 px-1 select-none">
                      {isMe ? formatTime(msg.createdAt) : `${senderName} • ${formatTime(msg.createdAt)}`}
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
                      {msg.content}
                      
                      {msg.isPending && (
                        <div className="mt-1 flex items-center gap-1 opacity-75">
                          <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce [animation-delay:-0.3s]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce [animation-delay:-0.15s]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
