"use client";

import React, { createContext, useContext, useState, useMemo } from "react";

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
  setChannels: React.Dispatch<React.SetStateAction<Channel[]>>;
  addChannel: (channel: Channel) => void;
  updateChannel: (id: string, channel: Partial<Channel>) => void;
  removeChannel: (id: string) => void;
}

const SocialChannelsContext = createContext<SocialChannelsContextType | undefined>(undefined);

const MOCK_CHANNELS: Channel[] = [
  {
    id: "ch-1",
    name: "Opero Official",
    platform: "Instagram",
    username: "@opero_official",
    profileLink: "https://instagram.com/opero_official",
    status: "Active",
    followers: 12500,
    postsThisMonth: 12,
    interactions: 3400,
    lastActiveDate: new Date().toISOString().split('T')[0],
    notes: "Main brand account"
  },
  {
    id: "ch-2",
    name: "Opero Support",
    platform: "X/Twitter",
    username: "@opero_support",
    profileLink: "https://twitter.com/opero_support",
    status: "Active",
    followers: 4300,
    postsThisMonth: 45,
    interactions: 1200,
    lastActiveDate: new Date().toISOString().split('T')[0],
    notes: "Customer service channel"
  },
  {
    id: "ch-3",
    name: "Opero Highlights",
    platform: "TikTok",
    username: "@opero_tiktok",
    profileLink: "https://tiktok.com/@opero_tiktok",
    status: "Active",
    followers: 89000,
    postsThisMonth: 8,
    interactions: 45000,
    lastActiveDate: new Date().toISOString().split('T')[0],
    notes: "Viral video content"
  }
];

export function SocialChannelsProvider({ children }: { children: React.ReactNode }) {
  const [channels, setChannels] = useState<Channel[]>(MOCK_CHANNELS);

  const addChannel = (channel: Channel) => setChannels(prev => [...prev, channel]);
  
  const updateChannel = (id: string, updates: Partial<Channel>) => {
    setChannels(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };
  
  const removeChannel = (id: string) => {
    setChannels(prev => prev.filter(c => c.id !== id));
  };

  const value = useMemo(() => ({
    channels,
    setChannels,
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
