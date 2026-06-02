"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import type { Campaign } from "@/features/campaigns";
import { createCampaign, deleteCampaign, listCampaigns, updateCampaign as saveCampaign } from "@/features/campaigns/services/campaigns.client";
import { useTenant } from "@/components/providers/TenantProvider";
import { getUserDisplayName, getUserInitials } from "@/lib/user-identity";

interface CampaignsContextType {
  campaigns: Campaign[];
  loading: boolean;
  addCampaign: (campaign: Partial<Campaign>) => void;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  deleteCampaigns: (ids: string[]) => void;
}

const CampaignsContext = createContext<CampaignsContextType | undefined>(undefined);

export function CampaignsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useTenant();
  const userName = getUserDisplayName(user, "You");

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const items = await listCampaigns<Campaign>();
        if (!cancelled) {
          setCampaigns(items);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load campaigns:", err);
        if (!cancelled) setLoading(false);
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
      owner: partial.owner || { id: user?.id, name: userName, email: user?.email, image: user?.image },
      startDate: partial.startDate || new Date().toISOString().split("T")[0],
      endDate: partial.endDate || new Date().toISOString().split("T")[0],
      linkedTasks: partial.linkedTasks || [],
      campaignAccounts: partial.campaignAccounts || [],
      budget: partial.budget || 0,
      currency: partial.currency || "USD",
      tags: partial.tags || [],
      activities: [{
        id: "act" + Date.now(),
        type: "update",
        description: "Campaign created",
        timestamp: new Date().toISOString(),
        userId: user?.id,
        author: userName,
        email: user?.email ?? undefined,
        avatar: user?.image ?? null,
        initials: getUserInitials(user)
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...partial
    };
    createCampaign<Campaign>(newCampaign)
      .then((created) => setCampaigns(prev => [created, ...prev]))
      .catch((err) => console.error("Failed to create campaign:", err));
  }, [user?.email, user?.id, user?.image, userName]);

  const updateCampaign = useCallback((id: string, updates: Partial<Campaign>) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id !== id) return c;
      const updated = { ...c, ...updates, updatedAt: new Date().toISOString() };
      const recordId = (c as { recordId?: string }).recordId ?? c.id;
      saveCampaign<Campaign>(recordId, updated).catch((err) => {
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
        return deleteCampaign(targetId).catch((err) => {
          console.error("Failed to delete campaign:", err);
        });
      })
    ).catch(() => undefined);
  }, [campaigns]);

  const value = useMemo(() => ({
    campaigns,
    loading,
    addCampaign,
    updateCampaign,
    deleteCampaigns
  }), [campaigns, loading, addCampaign, updateCampaign, deleteCampaigns]);

  return <CampaignsContext.Provider value={value}>{children}</CampaignsContext.Provider>;
}

export function useCampaigns() {
  const context = useContext(CampaignsContext);
  if (context === undefined) {
    throw new Error("useCampaigns must be used within a CampaignsProvider");
  }
  return context;
}

