"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { Search, MessageSquarePlus } from "lucide-react";
import { useChat } from "../context/ChatContext";

export default function MessageList({ channelId, searchQuery = "" }: { channelId: string; searchQuery?: string }) {
  const { messages, initialLoadingChannels, error, currentUserId, loadMessages } = useChat();
  const channelMessages = useMemo(() => messages[channelId] ?? [], [messages, channelId]);
  const isInitialLoading = initialLoadingChannels[channelId] ?? messages[channelId] === undefined;
  const bottomRef = useRef<HTMLDivElement>(null);
  const previousMessageCountRef = useRef(0);

  useEffect(() => {
    if (messages[channelId] !== undefined) return;
    const timeoutId = window.setTimeout(() => {
      void loadMessages(channelId);
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [channelId, loadMessages, messages]);

  useEffect(() => {
    const nextCount = channelMessages.length;
    previousMessageCountRef.current = nextCount;

    const frameId = window.requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [channelMessages]);

  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return channelMessages;
    return channelMessages.filter((msg) => msg.content.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [channelMessages, searchQuery]);

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/10 bg-red-500/5 px-4 py-3 font-body-sm text-[12px] text-red-600">
          {error}
        </div>
      )}
      {isInitialLoading ? (
        <div className="h-full" />
      ) : filteredMessages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center px-6 animate-fade-in-up">
          {searchQuery ? (
            <>
              <div className="w-14 h-14 rounded-full bg-surface-container-low flex items-center justify-center mb-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                <Search size={20} className="text-on-surface-variant opacity-50" />
              </div>
              <h3 className="font-display font-semibold text-[16px] text-primary mb-1">No results found</h3>
              <p className="font-body-sm text-[13px] text-on-surface-variant opacity-70">
                {`No messages contain "${searchQuery}".`}
              </p>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-full bg-surface-container-low flex items-center justify-center mb-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                <MessageSquarePlus size={20} className="text-on-surface-variant opacity-50" />
              </div>
              <h3 className="font-display font-semibold text-[16px] text-primary mb-1">Start a conversation</h3>
              <p className="font-body-sm text-[13px] text-on-surface-variant opacity-70 max-w-[280px]">Messages shared here will be visible to all members.</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredMessages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            const senderName = msg.sender?.name ?? "Team member";
            return (
              <div key={msg.clientId ?? msg.id} className={`group relative flex w-full ${isMe ? "justify-end" : "justify-start"} mb-6`}>
                <div className={`flex items-end gap-3 max-w-[75%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-[11px] shrink-0 shadow-sm ${isMe ? "bg-primary text-on-primary" : "bg-surface-container-highest text-primary"}`}>
                    {senderName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className={`font-label-caps text-[10px] text-on-surface-variant opacity-60 ${isMe ? "mr-2 text-right" : "ml-2"}`}>
                      {isMe ? formatTime(msg.createdAt) : `${senderName} - ${formatTime(msg.createdAt)}`}
                    </span>
                    <div className={`relative px-4 py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] ${
                      isMe
                        ? "bg-primary text-white rounded-[18px] rounded-br-[4px]"
                        : "bg-surface-container-low text-on-surface rounded-[18px] rounded-bl-[4px]"
                    }`}>
                      <div className="font-body-md text-[13.5px] leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                      {msg.isPending && (
                        <div className="mt-1 font-body-sm text-[10px] opacity-60">Sending...</div>
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
