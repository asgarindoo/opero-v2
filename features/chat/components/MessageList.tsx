"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { SmilePlus, MoreHorizontal, Search, MessageSquarePlus } from "lucide-react";
import { useChat } from "../context/ChatContext";

export default function MessageList({ channelId, searchQuery = "" }: { channelId: string, searchQuery?: string }) {
  const { messages, users, addReaction, currentUserId } = useChat();
  const channelMessages = messages[channelId] || [];
  const bottomRef = useRef<HTMLDivElement>(null);
  
  // Basic emoji picker mock state
  const [activeReactionId, setActiveReactionId] = useState<string | null>(null);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [channelMessages]);

  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return channelMessages;
    return channelMessages.filter(msg => msg.content.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [channelMessages, searchQuery]);

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      {filteredMessages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center px-6 animate-fade-in-up">
           {searchQuery ? (
             <>
               <div className="w-14 h-14 rounded-full bg-surface-container-low flex items-center justify-center mb-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                 <Search size={20} className="text-on-surface-variant opacity-50" />
               </div>
               <h3 className="font-display font-semibold text-[16px] text-primary mb-1">No results found</h3>
               <p className="font-body-sm text-[13px] text-on-surface-variant opacity-70">We couldn't find any messages containing "{searchQuery}".</p>
             </>
           ) : (
             <>
               <div className="w-14 h-14 rounded-full bg-surface-container-low flex items-center justify-center mb-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                 <MessageSquarePlus size={20} className="text-on-surface-variant opacity-50" />
               </div>
               <h3 className="font-display font-semibold text-[16px] text-primary mb-1">Start a conversation</h3>
               <p className="font-body-sm text-[13px] text-on-surface-variant opacity-70 max-w-[280px]">Messages, files, and links shared here will be visible to all members.</p>
             </>
           )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredMessages.map((msg, index) => {
            const user = users[msg.user_id];
            if (!user) return null;
            
            const isMe = msg.user_id === currentUserId;
            
            return (
              <div key={msg.id} className={`group relative flex w-full ${isMe ? "justify-end" : "justify-start"} mb-6`}>
                
                <div className={`flex items-end gap-3 max-w-[75%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-[11px] shrink-0 shadow-sm ${isMe ? "bg-primary text-on-primary" : "bg-surface-container-highest text-primary"}`}>
                    {user.name.charAt(0)}
                  </div>
                  
                  {/* Bubble */}
                  <div className="flex flex-col gap-1">
                    {!isMe && (
                      <span className="font-label-caps text-[10px] text-on-surface-variant opacity-60 ml-2">
                        {user.name} • {formatTime(msg.created_at)}
                      </span>
                    )}
                    {isMe && (
                      <span className="font-label-caps text-[10px] text-on-surface-variant opacity-60 mr-2 text-right">
                        {formatTime(msg.created_at)}
                      </span>
                    )}
                    
                    <div className={`relative px-4 py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] ${
                      isMe 
                        ? "bg-primary text-white rounded-[18px] rounded-br-[4px]" 
                        : "bg-surface-container-low text-on-surface rounded-[18px] rounded-bl-[4px]"
                    }`}>
                      <div className="font-body-md text-[13.5px] leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </div>
                      
                      {/* Reactions */}
                      {msg.reactions.length > 0 && (
                        <div className={`flex flex-wrap gap-1.5 mt-2.5 ${isMe ? "justify-end" : "justify-start"}`}>
                          {msg.reactions.map(r => (
                            <button 
                              key={r.id} 
                              onClick={() => addReaction(msg.id, channelId, r.emoji)}
                              className={`flex items-center justify-center px-2 py-0.5 rounded-full text-[12px] backdrop-blur-md transition-all hover:scale-105 ${
                                isMe ? "bg-white/10 hover:bg-white/20 border border-white/10" : "bg-black/5 hover:bg-black/10 border border-black/5"
                              }`}
                            >
                              <span>{r.emoji}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hover Actions */}
                <div className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1.5 ${
                  isMe ? "right-[calc(75%+24px)] flex-row-reverse" : "left-[calc(75%+24px)] flex-row"
                }`}>
                  <button 
                    onClick={() => setActiveReactionId(activeReactionId === msg.id ? null : msg.id)}
                    className="p-1.5 text-on-surface-variant hover:text-primary bg-surface-container-lowest rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:shadow-md transition-all" 
                    title="Add reaction"
                  >
                    <SmilePlus size={14} />
                  </button>
                </div>
                
                {/* Emoji Popover */}
                {activeReactionId === msg.id && (
                  <div className={`absolute top-0 z-10 bg-surface-container-lowest/90 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.06)] rounded-full p-1.5 flex gap-1 animate-scale-in ${
                    isMe ? "right-16" : "left-16"
                  }`}>
                    {['👍', '❤️', '🚀', '👀', '😂', '🔥'].map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => {
                          addReaction(msg.id, channelId, emoji);
                          setActiveReactionId(null);
                        }}
                        className="w-8 h-8 flex items-center justify-center hover:bg-black/5 rounded-full text-[16px] transition-transform hover:scale-125"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
