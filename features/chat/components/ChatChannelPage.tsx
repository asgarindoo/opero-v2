"use client";

import React, { useEffect, useState } from "react";
import { Hash, Search, X } from "lucide-react";
import { useChat } from "@/features/chat";
import MessageList from "@/features/chat/components/MessageList";
import MessageComposer from "@/features/chat/components/MessageComposer";
import ModuleHeader from "@/components/common/ModuleHeader";

export default function ChannelPage({ channelId }: { channelId: string }) {
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
        <ModuleHeader
          title={channel.name}
          leftContent={channel.description ? (
            <div className="group relative hidden sm:block">
              <p className="font-body-sm text-[13px] font-normal text-black/50 leading-[1.45] truncate max-w-[200px] md:max-w-[300px] cursor-default">
                {channel.description}
              </p>
              <div className="absolute top-full left-0 mt-2 w-max max-w-[320px] px-3 py-2 bg-[#27272a] text-[#f8f8f8] text-[12px] rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none font-body-sm leading-relaxed">
                {channel.description}
              </div>
            </div>
          ) : null}
          rightContent={
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
          }
        />

        {/* Messages */}
        <MessageList channelId={channelId} searchQuery={searchQuery} />

        {/* Composer */}
        <MessageComposer channelId={channelId} />
      </div>
    </div>
  );
}
