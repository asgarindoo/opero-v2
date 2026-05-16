"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { Bot, BotStatus, PlatformType } from "../types";

const MOCK_BOTS: Bot[] = [
  {
    id: "bot1",
    name: "Opero Ops Notifier",
    description: "Sends critical system alerts and deployment updates to the engineering channel.",
    platform: "Telegram",
    status: "Active",
    token: "1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    webhookUrl: "https://api.opero.com/webhooks/telegram/ops",
    metrics: {
      messagesSent: 12450,
      activeWorkflows: 3
    },
    automations: {
      autoReplyEnabled: false,
      welcomeMessageEnabled: true,
      defaultFallbackEnabled: false
    },
    commands: [
      { id: "cmd1", command: "/status", description: "Get current system status", actionType: "Reply" },
      { id: "cmd2", command: "/deploy", description: "Trigger deployment workflow", actionType: "Trigger Workflow" }
    ],
    activities: [
      { id: "act1", type: "config_updated", description: "Updated webhook URL", timestamp: "2024-05-10T09:00:00Z", author: "Alex M." },
      { id: "act2", type: "status_changed", description: "Bot activated", timestamp: "2024-05-10T09:10:00Z", author: "Alex M." }
    ],
    assignedStaff: ["Alex M.", "Sarah K."],
    createdAt: "2024-05-01T10:00:00Z",
    updatedAt: "2024-05-10T09:10:00Z"
  },
  {
    id: "bot2",
    name: "Customer Support (WA)",
    description: "Handles incoming customer queries and routes them to the support team.",
    platform: "WhatsApp",
    status: "Pending Setup",
    metrics: {
      messagesSent: 0,
      activeWorkflows: 1
    },
    automations: {
      autoReplyEnabled: true,
      welcomeMessageEnabled: true,
      defaultFallbackEnabled: true
    },
    commands: [],
    activities: [
      { id: "act3", type: "status_changed", description: "Created bot profile", timestamp: "2024-05-12T08:00:00Z", author: "John D." }
    ],
    assignedStaff: ["John D."],
    createdAt: "2024-05-12T08:00:00Z",
    updatedAt: "2024-05-12T08:00:00Z"
  }
];

interface BotContextType {
  bots: Bot[];
  addBot: (b: Partial<Bot>) => void;
  updateBot: (id: string, updates: Partial<Bot>) => void;
  deleteBot: (id: string) => void;
  updateStatus: (id: string, status: BotStatus) => void;
}

const BotContext = createContext<BotContextType | undefined>(undefined);

export function BotProvider({ children }: { children: React.ReactNode }) {
  const [bots, setBots] = useState<Bot[]>(MOCK_BOTS);

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
    setBots(prev => [newBot, ...prev]);
  }, []);

  const updateBot = useCallback((id: string, updates: Partial<Bot>) => {
    setBots(prev => prev.map(b => b.id === id ? { 
      ...b, 
      ...updates, 
      updatedAt: new Date().toISOString(),
      activities: [...b.activities, { id: "a" + Date.now(), type: "config_updated", description: "Configuration updated", timestamp: new Date().toISOString(), author: "Current User" }]
    } : b));
  }, []);

  const deleteBot = useCallback((id: string) => {
    setBots(prev => prev.filter(b => b.id !== id));
  }, []);

  const updateStatus = useCallback((id: string, status: BotStatus) => {
    setBots(prev => prev.map(b => b.id === id ? { 
      ...b, 
      status, 
      updatedAt: new Date().toISOString(),
      activities: [...b.activities, { id: "a" + Date.now(), type: "status_changed", description: `Status changed to ${status}`, timestamp: new Date().toISOString(), author: "Current User" }]
    } : b));
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
