"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { Asset, AssetActivity } from "@/features/assets";
import { createAsset, deleteAsset, listAssets, updateAsset as saveAsset } from "@/features/assets/services/assets.client";
import { useTenant } from "@/components/providers/TenantProvider";

interface AssetsContextType {
  assets: Asset[];
  addAsset: (asset: Partial<Asset>) => void;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  assignAsset: (id: string, person: string, department?: string) => void;
  deleteAssets: (ids: string[]) => void;
}

const AssetsContext = createContext<AssetsContextType | undefined>(undefined);

export function AssetsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useTenant();
  const userName = user?.name || "You";

  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const items = await listAssets<Asset>();
        if (!cancelled) setAssets(items);
      } catch (err) {
        console.error("Failed to load assets:", err);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const addAsset = useCallback((partial: Partial<Asset>) => {
    const newAsset: Asset = {
      id: "a" + Date.now(),
      name: partial.name || "New Asset",
      category: partial.category || "Uncategorized",
      assetCode: partial.assetCode || "AST-" + Math.floor(Math.random() * 1000),
      status: "Active",
      maintenanceHistory: [],
      activities: [{
        id: "a" + Date.now(),
        type: "status_change",
        description: "Asset record created",
        timestamp: new Date().toISOString(),
        author: userName || "You"
      }],
      notes: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...partial
    };
    createAsset<Asset>(newAsset)
      .then((created) => setAssets(prev => [created, ...prev]))
      .catch((err) => console.error("Failed to create asset:", err));
  }, []);

  const updateAsset = useCallback((id: string, updates: Partial<Asset>) => {
    setAssets(prev => prev.map(a => {
      if (a.id !== id) return a;
      const updated = { ...a, ...updates, updatedAt: new Date().toISOString() };
      const recordId = (a as { recordId?: string }).recordId ?? a.id;
      saveAsset<Asset>(recordId, updated).catch((err) => {
        console.error("Failed to update asset:", err);
      });
      return updated;
    }));
  }, []);

  const assignAsset = useCallback((id: string, person: string, department?: string) => {
    setAssets(prev => prev.map(a => {
      if (a.id !== id) return a;
      const newActivity: AssetActivity = {
        id: Math.random().toString(36).substring(7),
        type: "assignment",
        description: `Assigned to ${person}${department ? ` (${department})` : ""}`,
        timestamp: new Date().toISOString(),
        author: userName
      };
      const updated: Asset = {
        ...a,
        assignedTo: person,
        department: department || a.department,
        status: "In Use",
        activities: [newActivity, ...a.activities],
        updatedAt: newActivity.timestamp
      };
      const recordId = (a as { recordId?: string }).recordId ?? a.id;
      saveAsset<Asset>(recordId, updated).catch((err) => {
        console.error("Failed to assign asset:", err);
      });
      return updated;
    }));
  }, []);

  const deleteAssets = useCallback((ids: string[]) => {
    setAssets(prev => prev.filter(a => !ids.includes(a.id)));
    Promise.all(
      ids.map((id) => {
        const recordId = assets.find(a => a.id === id) as { recordId?: string } | undefined;
        const targetId = recordId?.recordId ?? id;
        return deleteAsset(targetId).catch((err) => {
          console.error("Failed to delete asset:", err);
        });
      })
    ).catch(() => undefined);
  }, [assets]);

  const value = useMemo(() => ({
    assets,
    addAsset,
    updateAsset,
    assignAsset,
    deleteAssets
  }), [assets, addAsset, updateAsset, assignAsset, deleteAssets]);

  return <AssetsContext.Provider value={value}>{children}</AssetsContext.Provider>;
}

export function useAssets() {
  const context = useContext(AssetsContext);
  if (context === undefined) {
    throw new Error("useAssets must be used within an AssetsProvider");
  }
  return context;
}

