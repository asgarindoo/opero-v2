"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { Bot, BotStatus } from "@/features/bots";
import { createBot, deleteBot as removeBot, listBots, updateBot as saveBot } from "@/features/bots";

interface BotContextType {
  bots: Bot[];
  addBot: (b: Partial<Bot>) => void;
  updateBot: (id: string, updates: Partial<Bot>) => void;
  deleteBot: (id: string) => void;
  updateStatus: (id: string, status: BotStatus) => void;
}

const BotContext = createContext<BotContextType | undefined>(undefined);

export function BotProvider({ children }: { children: React.ReactNode }) {
  const [bots, setBots] = useState<Bot[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const items = await listBots<Bot>();
        if (!cancelled) setBots(items);
      } catch (err) {
        console.error("Failed to load bots:", err);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const addBot = useCallback((partial: Partial<Bot>) => {
    const newBot: Bot = {
      id: "bot" + Date.now(),
      name: partial.name || "New Bot",
      description: partial.description || "",
      platform: partial.platform || "Telegram",
      status: partial.status || "Pending Setup",
      token: partial.token,
      webhookUrl: partial.webhookUrl,
      metrics: { messagesSent: 0, activeWorkflows: 0 },
      automations: partial.automations || {
        autoReplyEnabled: false,
        welcomeMessageEnabled: false,
        defaultFallbackEnabled: false
      },
      commands: partial.commands || [],
      activities: [{ id: "a" + Date.now(), type: "status_changed", description: "Bot created", timestamp: new Date().toISOString(), author: "Current User" }],
      assignedStaff: partial.assignedStaff || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    createBot<Bot>(newBot)
      .then((created) => setBots(prev => [created, ...prev]))
      .catch((err) => console.error("Failed to create bot:", err));
  }, []);

  const updateBot = useCallback((id: string, updates: Partial<Bot>) => {
    setBots(prev => prev.map(b => {
      if (b.id !== id) return b;
      const updated: Bot = { 
        ...b, 
        ...updates, 
        updatedAt: new Date().toISOString(),
        activities: [...b.activities, { id: "a" + Date.now(), type: "config_updated", description: "Configuration updated", timestamp: new Date().toISOString(), author: "Current User" }]
      };
      const recordId = (b as { recordId?: string }).recordId ?? b.id;
      saveBot<Bot>(recordId, updated).catch((err) => {
        console.error("Failed to update bot:", err);
      });
      return updated;
    }));
  }, []);

  const deleteBot = useCallback((id: string) => {
    setBots(prev => prev.filter(b => b.id !== id));
    const recordId = bots.find(b => b.id === id) as { recordId?: string } | undefined;
    const targetId = recordId?.recordId ?? id;
    removeBot(targetId).catch((err) => {
      console.error("Failed to delete bot:", err);
    });
  }, [bots]);

  const updateStatus = useCallback((id: string, status: BotStatus) => {
    setBots(prev => prev.map(b => {
      if (b.id !== id) return b;
      const updated: Bot = { 
        ...b, 
        status, 
        updatedAt: new Date().toISOString(),
        activities: [...b.activities, { id: "a" + Date.now(), type: "status_changed", description: `Status changed to ${status}`, timestamp: new Date().toISOString(), author: "Current User" }]
      };
      const recordId = (b as { recordId?: string }).recordId ?? b.id;
      saveBot<Bot>(recordId, updated).catch((err) => {
        console.error("Failed to update bot status:", err);
      });
      return updated;
    }));
  }, []);

  const value = useMemo(() => ({
    bots,
    addBot,
    updateBot,
    deleteBot,
    updateStatus
  }), [bots, addBot, updateBot, deleteBot, updateStatus]);

  return <BotContext.Provider value={value}>{children}</BotContext.Provider>;
}

export function useBots() {
  const context = useContext(BotContext);
  if (context === undefined) {
    throw new Error("useBots must be used within a BotProvider");
  }
  return context;
}

