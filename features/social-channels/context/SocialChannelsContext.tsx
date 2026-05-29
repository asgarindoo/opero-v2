"use client";

import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import useSWR from "swr";
import { fetchChannels, createChannel as apiCreate, updateChannel as apiUpdate, deleteChannel as apiDelete } from "../services/channels.client";

export type ChannelStatus = "Active" | "Inactive" | "Archived";
export type ChannelCategory = "Social" | "Email" | "Community" | "Marketplace" | "Custom";

export interface Channel {
   id: string;
   name: string;
   platform: string;
   username: string;
   profileLink: string;
   status: ChannelStatus;
   followers: number;
   postsThisMonth: number;
   interactions: number;
   monthlyReach?: number;
   averageViews?: number;
   lastActiveDate: string;
   notes: string;
}

interface SocialChannelsContextType {
  channels: Channel[];
  loading: boolean;
  setChannels: React.Dispatch<React.SetStateAction<Channel[]>>;
  addChannel: (channel: Channel) => Promise<void>;
  updateChannel: (id: string, channel: Partial<Channel>) => Promise<void>;
  removeChannel: (id: string) => Promise<void>;
}

const SocialChannelsContext = createContext<SocialChannelsContextType | undefined>(undefined);

const MOCK_CHANNELS: Channel[] = [];

export function SocialChannelsProvider({ children }: { children: React.ReactNode }) {
  const { data, mutate, isLoading } = useSWR<Channel[]>("social-channels", fetchChannels, {
    fallbackData: [],
  });

  const channels = data || [];

  const addChannel = async (channel: Channel) => {
    // optimistic
    mutate([...channels, channel], false);
    await apiCreate(channel);
    mutate();
  };
  
  const updateChannel = async (id: string, updates: Partial<Channel>) => {
    mutate(channels.map(c => c.id === id ? { ...c, ...updates } : c), false);
    await apiUpdate(id, updates);
    mutate();
  };
  
  const removeChannel = async (id: string) => {
    mutate(channels.filter(c => c.id !== id), false);
    await apiDelete(id);
    mutate();
  };

  const value = useMemo(() => ({
    channels,
    loading: isLoading,
    setChannels: () => {}, // unused but kept for interface compat if needed

    addChannel,
    updateChannel,
    removeChannel
  }), [channels]);

  return <SocialChannelsContext.Provider value={value}>{children}</SocialChannelsContext.Provider>;
}

export function useSocialChannels() {
  const context = useContext(SocialChannelsContext);
  if (context === undefined) {
    throw new Error("useSocialChannels must be used within a SocialChannelsProvider");
  }
  return context;
}
