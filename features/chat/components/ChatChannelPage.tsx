"use client";

import React, { use, useState } from "react";
import { Hash, Search, X, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useChat } from "@/features/chat";
import MessageList from "@/features/chat/components/MessageList";
import MessageComposer from "@/features/chat/components/MessageComposer";

export default function ChannelPage({ params }: { params: Promise<{ channelId: string }> }) {
  const resolvedParams = use(params);
  const { channelId } = resolvedParams;
  const { channels, deleteChannel } = useChat();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const channel = channels.find(c => c.id === channelId);

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this channel?")) {
      deleteChannel(channelId);
      router.push("/dashboard/chat");
    }
  };

  if (!channel) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-surface">
        <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center mb-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <Hash size={20} className="text-on-surface-variant opacity-40" />
        </div>
        <h2 className="font-display font-semibold text-[16px] text-primary mb-1">Channel unavailable</h2>
        <p className="font-body-sm text-[13px] text-on-surface-variant max-w-[260px] opacity-70">
          This channel might have been deleted, or you don't have access to view it.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Header */}
      <div className="h-16 shrink-0 px-6 flex items-center justify-between bg-surface-container-lowest/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Hash size={18} className="text-on-surface-variant opacity-50" />
          <h1 className="font-h3 text-primary tracking-tight">
            {channel.name}
          </h1>
          {channel.description && (
            <>
              <span className="text-on-surface-variant opacity-30 mx-2">•</span>
              <p className="font-body-md text-[13px] text-on-surface-variant opacity-80 truncate max-w-[200px] hidden sm:block">
                {channel.description}
              </p>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-2 px-2.5 py-1.5 bg-surface-container-high/40 focus-within:bg-surface-container-high/60 rounded-full transition-all w-48 shadow-[0_2px_8px_rgba(0,0,0,0.02)] focus-within:shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
             <Search size={13} className="text-on-surface-variant opacity-60 ml-1 shrink-0" />
             <input 
               type="text" 
               placeholder="Search..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="bg-transparent border-none outline-none font-body-sm text-[12.5px] w-full text-on-surface placeholder:text-on-surface-variant/40"
             />
             {searchQuery && (
               <button onClick={() => setSearchQuery("")} className="p-0.5 opacity-40 hover:opacity-100 text-on-surface-variant shrink-0 mr-0.5 transition-opacity">
                 <X size={12} />
               </button>
             )}
          </div>
          
          <div className="w-px h-3 bg-outline-variant/30 mx-1" />
          <button 
            onClick={handleDelete}
            className="p-1.5 text-on-surface-variant opacity-40 hover:opacity-100 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
            title="Delete channel"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <MessageList channelId={channelId} searchQuery={searchQuery} />

      {/* Composer */}
      <MessageComposer channelId={channelId} />
    </div>
  );
}
