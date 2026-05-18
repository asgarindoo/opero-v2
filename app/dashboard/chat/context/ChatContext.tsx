"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { ChatChannel, ChatMessage, User } from "../types";

// INITIAL MOCK DATA
const MOCK_USERS: Record<string, User> = {};

const MOCK_CHANNELS: ChatChannel[] = [];
const MOCK_MESSAGES: Record<string, ChatMessage[]> = {};

interface ChatContextType {
  channels: ChatChannel[];
  messages: Record<string, ChatMessage[]>;
  users: Record<string, User>;
  currentUserId: string;
  sendMessage: (channelId: string, content: string, attachments?: any[]) => void;
  addReaction: (messageId: string, channelId: string, emoji: string) => void;
  createChannel: (name: string, description: string) => string;
  startDirectMessage: (userId: string) => string;
  deleteChannel: (id: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [channels, setChannels] = useState<ChatChannel[]>(MOCK_CHANNELS);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(MOCK_MESSAGES);
  const [users] = useState(MOCK_USERS);
  const currentUserId = "u1";

  // In production, this would be: await supabase.from('chat_messages').insert({...})
  const sendMessage = useCallback((channelId: string, content: string, attachments?: any[]) => {
    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      channel_id: channelId,
      user_id: currentUserId,
      content,
      attachments,
      reactions: [],
      created_at: new Date().toISOString()
    };

    setMessages(prev => ({
      ...prev,
      [channelId]: [...(prev[channelId] || []), newMessage]
    }));
  }, [currentUserId]);

  const addReaction = useCallback((messageId: string, channelId: string, emoji: string) => {
    setMessages(prev => {
      const channelMessages = prev[channelId] || [];
      return {
        ...prev,
        [channelId]: channelMessages.map(m => {
          if (m.id === messageId) {
            const hasReacted = m.reactions.find(r => r.user_id === currentUserId && r.emoji === emoji);
            if (hasReacted) {
              return { ...m, reactions: m.reactions.filter(r => r.id !== hasReacted.id) };
            }
            return {
              ...m,
              reactions: [...m.reactions, { id: Math.random().toString(), emoji, user_id: currentUserId }]
            };
          }
          return m;
        })
      };
    });
  }, [currentUserId]);

  const createChannel = useCallback((name: string, description: string) => {
    const newChannel: ChatChannel = {
      id: Math.random().toString(36).substr(2, 9),
      tenant_id: "t1",
      name: name.toLowerCase().replace(/\s+/g, '-'),
      description,
      is_private: false,
      created_at: new Date().toISOString()
    };
    setChannels(prev => [...prev, newChannel]);
    setMessages(prev => ({ ...prev, [newChannel.id]: [] }));
    return newChannel.id;
  }, []);

  const startDirectMessage = useCallback((userId: string) => {
    // Check if DM channel already exists
    const existing = channels.find(c => 
      c.is_private && 
      c.members?.includes(currentUserId) && 
      c.members?.includes(userId)
    );

    if (existing) return existing.id;

    // Create new DM channel
    const otherUser = users[userId];
    const newChannel: ChatChannel = {
      id: Math.random().toString(36).substr(2, 9),
      tenant_id: "t1",
      name: `dm-${(otherUser?.name || "user").toLowerCase().replace(/\s+/g, '-')}`,
      is_private: true,
      members: [currentUserId, userId],
      created_at: new Date().toISOString()
    };

    setChannels(prev => [...prev, newChannel]);
    setMessages(prev => ({ ...prev, [newChannel.id]: [] }));
    return newChannel.id;
  }, [channels, users, currentUserId]);

  const deleteChannel = useCallback((id: string) => {
    setChannels(prev => prev.filter(c => c.id !== id));
    setMessages(prev => {
      const newMessages = { ...prev };
      delete newMessages[id];
      return newMessages;
    });
  }, []);

  return (
    <ChatContext.Provider value={{ channels, messages, users, currentUserId, sendMessage, addReaction, createChannel, startDirectMessage, deleteChannel }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
