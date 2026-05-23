"use client";

import React, { use, useEffect, useState } from "react";
import { Hash, Search, X } from "lucide-react";
import { useChat } from "@/features/chat";
import MessageList from "@/features/chat/components/MessageList";
import MessageComposer from "@/features/chat/components/MessageComposer";

export default function ChannelPage({ params }: { params: Promise<{ channelId: string }> }) {
  const resolvedParams = use(params);
  const { channelId } = resolvedParams;
  const { channels, loadingChannels, setActiveChannel } = useChat();
  const [searchQuery, setSearchQuery] = useState("");

  const channel = channels.find(c => c.id === channelId);

  useEffect(() => {
    setActiveChannel(channelId);
    return () => setActiveChannel(null);
  }, [channelId, setActiveChannel]);

  if (!channel && loadingChannels) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="h-14 shrink-0 px-6 flex items-center bg-white border-b border-black/5">
            <div className="h-4 w-40 rounded bg-black/[0.04] animate-pulse" />
          </div>
          <div className="flex-1 p-6 space-y-4 bg-white">
            <div className="h-10 w-64 rounded-[18px] bg-black/[0.035] animate-pulse" />
            <div className="h-10 w-72 rounded-[18px] bg-black/[0.03] animate-pulse ml-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center p-8 bg-white">
        <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center mb-4">
          <Hash size={20} className="text-black opacity-40" />
        </div>
        <h2 className="font-display font-semibold text-[16px] text-black mb-1">Channel unavailable</h2>
        <p className="font-body-sm text-[13px] text-black/60 max-w-[260px]">
          This channel might have been deleted, or you don&apos;t have access to view it.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <div className="h-14 shrink-0 px-6 flex items-center justify-between bg-white border-b border-black/5">
          <div className="flex items-center gap-2">
            <Hash size={15} className="text-black/40" />
            <h1 className="font-h3 text-black font-semibold text-[14px] tracking-tight">
              {channel.name}
            </h1>
            {channel.description && (
              <>
                <span className="text-black/25 mx-2 text-[12px]">•</span>
                <p className="font-body-md text-[12px] text-black/50 truncate max-w-[220px] hidden sm:block">
                  {channel.description}
                </p>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-black/[0.03] focus-within:bg-black/[0.05] rounded-full transition-all w-48 border border-black/5">
              <Search size={12} className="text-black/45 ml-0.5 shrink-0" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none font-body-sm text-[12px] w-full text-black placeholder:text-black/30"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="p-0.5 opacity-40 hover:opacity-100 text-black shrink-0 mr-0.5 transition-opacity">
                  <X size={11} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <MessageList channelId={channelId} searchQuery={searchQuery} />

        {/* Composer */}
        <MessageComposer channelId={channelId} />
      </div>
    </div>
  );
}
