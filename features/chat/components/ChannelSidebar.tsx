"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, MessageSquare, Trash2 } from "lucide-react";
import { useChat } from "../context/ChatContext";
import CreateChannelModal from "./CreateChannelModal";

export default function ChannelSidebar() {
  const pathname = usePathname();
  const { channels, unreadCounts, loadingChannels, error, deleteChannel } = useChat();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="flex flex-col h-full py-3">
      <div className="px-5 mb-5 mt-1">
        <h2 className="font-display font-semibold text-[15px] text-primary tracking-tight">Team Chat</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        {/* Channels Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between px-4 mb-2.5 text-on-surface-variant">
            <span className="font-label-caps text-[8.5px] font-bold tracking-[0.15em] opacity-60">CHANNELS</span>
            <button 
              onClick={() => setShowCreate(true)}
              className="opacity-60 hover:opacity-100 transition-opacity p-1 hover:bg-surface-container-high rounded text-on-surface-variant"
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="space-y-[4px]">
            {loadingChannels && (
              <div className="px-3 py-2 space-y-2">
                <div className="h-8 rounded-xl bg-black/[0.04] animate-pulse" />
                <div className="h-8 rounded-xl bg-black/[0.03] animate-pulse" />
              </div>
            )}
            {!loadingChannels && error && (
              <div className="px-4 py-3 font-body-sm text-[12px] text-red-600">{error}</div>
            )}
            {!loadingChannels && channels.map(channel => {
              const href = `/dashboard/chat/${channel.id}`;
              const isActive = pathname === href;
              return (
                <Link
                  key={channel.id}
                  href={href}
                  className={`group flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${isActive
                      ? "text-primary"
                      : "text-on-surface hover:bg-surface-container-lowest"
                    }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${isActive ? "bg-primary text-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]" : "bg-surface-container-high/50 text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary"
                    }`}>
                    <MessageSquare size={13} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className={`font-body-md text-[13.5px] flex-1 min-w-0 truncate ${isActive ? 'font-semibold' : 'font-medium opacity-80 group-hover:opacity-100'}`}>
                    {channel.name}
                  </span>
                  {(unreadCounts[channel.id] ?? 0) > 0 && (
                    <span
                      className="ml-auto min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center font-label-caps text-[10px] font-bold"
                      style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
                    >
                      {unreadCounts[channel.id] > 99 ? "99+" : unreadCounts[channel.id]}
                    </span>
                  )}
                  <button
                    type="button"
                    className="opacity-0 group-hover:opacity-60 hover:opacity-100 p-1 rounded text-on-surface-variant hover:text-red-600 hover:bg-red-500/10 transition-all"
                    title="Delete channel"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      const confirmed = window.confirm(`Delete #${channel.name}? Messages in this channel will also be removed.`);
                      if (confirmed) void deleteChannel(channel.id);
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {showCreate && <CreateChannelModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
