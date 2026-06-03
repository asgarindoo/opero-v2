"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, MessageSquare, Trash2 } from "lucide-react";
import { useChat } from "../context/ChatContext";
import CreateChannelModal from "./CreateChannelModal";
import { usePresence } from "@/features/presence";
import UserAvatar from "@/components/common/UserAvatar";
import { getUserDisplayName } from "@/lib/user-identity";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import type { ChatChannel } from "@/features/chat";
import { useTenant } from "@/components/providers/TenantProvider";
import { isManagerRole } from "@/lib/client/rbac";

export default function ChannelSidebar() {
  const pathname = usePathname();
  const { role } = useTenant();
  const canManageChannels = isManagerRole(role);
  const { channels, unreadCounts, loadingChannels, error, deleteChannel } = useChat();
  const { onlineUsers } = usePresence();
  const [showCreate, setShowCreate] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [channelToDelete, setChannelToDelete] = useState<ChatChannel | null>(null);

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
            {canManageChannels && (
              <button 
                onClick={() => setShowCreate(true)}
                className="opacity-60 hover:opacity-100 transition-opacity p-1 hover:bg-surface-container-high rounded text-on-surface-variant"
              >
                <Plus size={14} />
              </button>
            )}
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
                  {canManageChannels && (
                    <button
                      type="button"
                      className="p-1 rounded opacity-30 hover:opacity-100 text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-all ml-1 shrink-0"
                      title="Delete channel"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setChannelToDelete(channel);
                        setIsDeleteModalOpen(true);
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {onlineUsers.length > 0 && (
          <div className="mb-6">
            <div className="px-4 mb-2.5 text-on-surface-variant">
              <span className="font-label-caps text-[8.5px] font-bold tracking-[0.15em] opacity-60">ONLINE</span>
            </div>
            <div className="space-y-[2px]">
              {onlineUsers.slice(0, 8).map((user) => (
                <div key={user.userId} className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-on-surface">
                  <UserAvatar user={user} size="md" online />
                  <span className="font-body-md text-[12.5px] font-medium min-w-0 truncate opacity-80">
                    {getUserDisplayName(user)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {canManageChannels && showCreate && <CreateChannelModal onClose={() => setShowCreate(false)} />}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setChannelToDelete(null);
        }}
        onConfirm={() => {
          if (!canManageChannels) return;
          if (channelToDelete) {
            void deleteChannel(channelToDelete.id);
            setIsDeleteModalOpen(false);
            setChannelToDelete(null);
          }
        }}
        title="Delete channel?"
        description={`This action permanently removes #${channelToDelete?.name} and all its messages. This action cannot be undone.`}
        confirmLabel="Delete Channel"
      />
    </div>
  );
}
