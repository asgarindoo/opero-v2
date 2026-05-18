"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import type { Campaign } from "../types";
import {
  createTenantRecord,
  deleteTenantRecord,
  listTenantRecords,
  updateTenantRecord,
} from "@/lib/client/tenant-records";

interface CampaignsContextType {
  campaigns: Campaign[];
  addCampaign: (campaign: Partial<Campaign>) => void;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  deleteCampaigns: (ids: string[]) => void;
}

const CampaignsContext = createContext<CampaignsContextType | undefined>(undefined);

export function CampaignsProvider({ children }: { children: React.ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const items = await listTenantRecords<Campaign>("campaigns");
        if (!cancelled) setCampaigns(items);
      } catch (err) {
        console.error("Failed to load campaigns:", err);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

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
    createTenantRecord<Campaign>("campaigns", newCampaign)
      .then((created) => setCampaigns(prev => [created, ...prev]))
      .catch((err) => console.error("Failed to create campaign:", err));
  }, []);

  const updateCampaign = useCallback((id: string, updates: Partial<Campaign>) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id !== id) return c;
      const updated = { ...c, ...updates, updatedAt: new Date().toISOString() };
      const recordId = (c as { recordId?: string }).recordId ?? c.id;
      updateTenantRecord<Campaign>("campaigns", recordId, updated).catch((err) => {
        console.error("Failed to update campaign:", err);
      });
      return updated;
    }));
  }, []);

  const deleteCampaigns = useCallback((ids: string[]) => {
    setCampaigns(prev => prev.filter(c => !ids.includes(c.id)));
    Promise.all(
      ids.map((id) => {
        const recordId = campaigns.find(c => c.id === id) as { recordId?: string } | undefined;
        const targetId = recordId?.recordId ?? id;
        return deleteTenantRecord("campaigns", targetId).catch((err) => {
          console.error("Failed to delete campaign:", err);
        });
      })
    ).catch(() => undefined);
  }, [campaigns]);

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
