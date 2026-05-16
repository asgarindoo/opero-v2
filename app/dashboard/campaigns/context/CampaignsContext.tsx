"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import type { Campaign } from "../types";

const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: "c1",
    name: "Enterprise Lifecycle Relaunch",
    description: "Coordinate account-based messaging, renewal motions, and customer education across lifecycle touchpoints.",
    status: "Active",
    priority: "High",
    owner: "Maya Chen",
    startDate: "2026-05-01",
    endDate: "2026-06-18",
    assignedStaff: ["Maya Chen", "Noah Ward", "Iris Kim"],
    linkedTasks: 18,
    channel: "Lifecycle",
    tags: ["Enterprise", "Lifecycle"],
    goals: [
      { id: "g1", description: "Finalize segment rules", isCompleted: true },
      { id: "g2", description: "Publish renewal sequence", isCompleted: true },
      { id: "g3", description: "QA account scoring handoff", isCompleted: false },
      { id: "g4", description: "Review week-two performance", isCompleted: false }
    ],
    activities: [
      { id: "act1", type: "update", description: "Lifecycle sequence moved to active monitoring", timestamp: "2026-05-12T08:00:00Z", author: "Maya Chen" },
      { id: "act2", type: "task", description: "3 linked tasks changed owner", timestamp: "2026-05-11T14:30:00Z", author: "Noah Ward" }
    ],
    attachments: ["launch_plan.pdf"],
    notes: "Keep message hierarchy anchored on operational confidence.",
    createdAt: "2026-04-21T10:00:00Z",
    updatedAt: "2026-05-12T08:00:00Z"
  },
  {
    id: "c2",
    name: "Partner Enablement Sprint",
    description: "Shared campaign workspace for partner briefs, co-sell assets, and launch approvals.",
    status: "Planning",
    priority: "Medium",
    owner: "Eli Ramos",
    startDate: "2026-05-20",
    endDate: "2026-07-02",
    assignedStaff: ["Eli Ramos", "Sofia Patel"],
    linkedTasks: 11,
    channel: "Partners",
    tags: ["Partners", "Enablement"],
    goals: [
      { id: "g5", description: "Lock campaign brief", isCompleted: true },
      { id: "g6", description: "Route partner asset approvals", isCompleted: false },
      { id: "g7", description: "Prepare launch checklist", isCompleted: false }
    ],
    activities: [
      { id: "act3", type: "comment", description: "Creative brief received partner feedback", timestamp: "2026-05-10T16:15:00Z", author: "Sofia Patel" }
    ],
    attachments: [],
    notes: "Dependency: legal approval for co-branded one-pager.",
    createdAt: "2026-05-04T09:00:00Z",
    updatedAt: "2026-05-10T16:15:00Z"
  },
  {
    id: "c3",
    name: "Ops Benchmark Report",
    description: "Editorial campaign for benchmark release, field follow-up, and executive audience nurturing.",
    status: "Paused",
    priority: "Medium",
    owner: "Lina Moore",
    startDate: "2026-04-28",
    endDate: "2026-06-06",
    assignedStaff: ["Lina Moore", "Kai Stone", "Maya Chen"],
    linkedTasks: 14,
    channel: "Editorial",
    tags: ["Report", "Executive"],
    goals: [
      { id: "g8", description: "Complete analyst quote review", isCompleted: true },
      { id: "g9", description: "Prepare distribution list", isCompleted: true },
      { id: "g10", description: "Resolve source-data appendix", isCompleted: false }
    ],
    activities: [
      { id: "act4", type: "schedule", description: "Timeline paused while appendix is reviewed", timestamp: "2026-05-09T11:20:00Z", author: "Lina Moore" }
    ],
    attachments: [],
    notes: "Hold external send until research appendix is approved.",
    createdAt: "2026-04-10T11:00:00Z",
    updatedAt: "2026-05-09T11:20:00Z"
  },
  {
    id: "c4",
    name: "Customer Advisory Motion",
    description: "Structured invitation and follow-up path for advisory council recruitment.",
    status: "Completed",
    priority: "Low",
    owner: "Noah Ward",
    startDate: "2026-03-18",
    endDate: "2026-04-22",
    assignedStaff: ["Noah Ward", "Iris Kim"],
    linkedTasks: 9,
    channel: "Customer",
    tags: ["Advisory", "Customer"],
    goals: [
      { id: "g11", description: "Send tier-one invitations", isCompleted: true },
      { id: "g12", description: "Confirm initial cohort", isCompleted: true },
      { id: "g13", description: "Publish internal recap", isCompleted: true }
    ],
    activities: [
      { id: "act5", type: "goal", description: "Initial advisory cohort confirmed", timestamp: "2026-04-22T17:00:00Z", author: "Noah Ward" }
    ],
    attachments: [],
    notes: "Reusable sequence is ready for the next cohort.",
    createdAt: "2026-03-12T11:00:00Z",
    updatedAt: "2026-04-22T17:00:00Z"
  }
];

interface CampaignsContextType {
  campaigns: Campaign[];
  addCampaign: (campaign: Partial<Campaign>) => void;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  deleteCampaigns: (ids: string[]) => void;
}

const CampaignsContext = createContext<CampaignsContextType | undefined>(undefined);

export function CampaignsProvider({ children }: { children: React.ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);

  const addCampaign = useCallback((partial: Partial<Campaign>) => {
    const newCampaign: Campaign = {
      id: "c" + Date.now(),
      name: partial.name || "New Campaign",
      description: partial.description || "",
      status: "Planning",
      priority: partial.priority || "Medium",
      owner: partial.owner || "Unassigned",
      startDate: partial.startDate || new Date().toISOString().split("T")[0],
      endDate: partial.endDate || new Date().toISOString().split("T")[0],
      assignedStaff: partial.assignedStaff || [],
      linkedTasks: partial.linkedTasks || 0,
      channel: partial.channel || "General",
      tags: partial.tags || [],
      goals: partial.goals || [],
      activities: [{ id: "act" + Date.now(), type: "update", description: "Campaign created", timestamp: new Date().toISOString(), author: "You" }],
      attachments: partial.attachments || [],
      notes: partial.notes || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...partial
    };
    setCampaigns(prev => [newCampaign, ...prev]);
  }, []);

  const updateCampaign = useCallback((id: string, updates: Partial<Campaign>) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c));
  }, []);

  const deleteCampaigns = useCallback((ids: string[]) => {
    setCampaigns(prev => prev.filter(c => !ids.includes(c.id)));
  }, []);

  const value = useMemo(() => ({
    campaigns,
    addCampaign,
    updateCampaign,
    deleteCampaigns
  }), [campaigns, addCampaign, updateCampaign, deleteCampaigns]);

  return <CampaignsContext.Provider value={value}>{children}</CampaignsContext.Provider>;
}

export function useCampaigns() {
  const context = useContext(CampaignsContext);
  if (context === undefined) {
    throw new Error("useCampaigns must be used within a CampaignsProvider");
  }
  return context;
}
