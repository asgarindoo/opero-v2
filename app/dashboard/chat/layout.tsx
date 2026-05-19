"use client";

import React from "react";
import { ChatProvider } from "@/features/chat/context/ChatContext";
import ChannelSidebar from "@/features/chat/components/ChannelSidebar";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChatProvider>
      <div className="flex h-full w-full bg-surface">
        {/* Chat Sidebar: Channels & DMs */}
        <div className="w-64 border-r border-black/[0.06] flex-shrink-0 bg-surface-container-low hidden md:block">
          <ChannelSidebar />
        </div>
        
        {/* Main Chat Area */}
        <div className="flex-1 min-w-0 flex flex-col bg-surface">
          {children}
        </div>
      </div>
    </ChatProvider>
  );
}
