"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Hash, Plus, MessageSquare, ChevronDown } from "lucide-react";
import { useChat } from "../context/ChatContext";
import CreateChannelModal from "./CreateChannelModal";
import { useRouter } from "next/navigation";

export default function ChannelSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { channels, users, currentUserId, startDirectMessage } = useChat();
  const [showCreate, setShowCreate] = useState(false);

  // Exclude current user from DM list
  const otherUsers = Object.values(users).filter(u => u.id !== currentUserId);

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
            {channels.filter(c => !c.is_private).map(channel => {
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
                  <span className={`font-body-md text-[13.5px] ${isActive ? 'font-semibold' : 'font-medium opacity-80 group-hover:opacity-100'}`}>
                    {channel.name}
                  </span>
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
