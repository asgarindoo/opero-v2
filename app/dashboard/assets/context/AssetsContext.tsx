"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { Asset, AssetStatus, AssetActivity } from "../types";

const MOCK_ASSETS: Asset[] = [
  {
    id: "a1",
    name: "MacBook Pro 16\" (M3 Max)",
    category: "Computing",
    assetCode: "HW-LAP-001",
    status: "In Use",
    assignedTo: "Alice Smith",
    department: "Engineering",
    location: "Remote",
    purchaseDate: "2024-01-10",
    purchaseValue: 3499,
    warrantyExpiry: "2025-01-10",
    supplierName: "Apple Enterprise",
    maintenanceHistory: [],
    activities: [
      { id: "act1", type: "assignment", description: "Assigned to Alice Smith", timestamp: "2024-01-12T10:00:00Z", author: "You" }
    ],
    notes: "New employee kit.",
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2024-01-12T10:00:00Z"
  },
  {
    id: "a2",
    name: "Herman Miller Aeron Chair",
    category: "Furniture",
    assetCode: "FUR-CHR-99",
    status: "Active",
    department: "Operations",
    location: "Main Office - 4th Floor",
    purchaseDate: "2023-05-20",
    purchaseValue: 1200,
    warrantyExpiry: "2035-05-20",
    supplierName: "OfficeDesign Inc.",
    maintenanceHistory: [
      { id: "m1", date: "2024-03-15", description: "Hydraulic cylinder replacement", technician: "FurnitureFix", cost: 150 }
    ],
    activities: [
      { id: "act2", type: "maintenance", description: "Scheduled hydraulic maintenance", timestamp: "2024-03-15T14:30:00Z", author: "Sarah Connor" }
    ],
    notes: "Ergonomic standard.",
    createdAt: "2023-05-20T09:00:00Z",
    updatedAt: "2024-03-15T14:30:00Z"
  },
  {
    id: "a3",
    name: "Conference Room Display (85\")",
    category: "AV Equipment",
    assetCode: "AV-DIS-500",
    status: "Maintenance",
    location: "Room 402",
    purchaseDate: "2022-11-15",
    purchaseValue: 2500,
    maintenanceHistory: [],
    activities: [
      { id: "act3", type: "status_change", description: "Moved to Maintenance: Backlight flickering", timestamp: "2024-05-10T09:00:00Z", author: "Sarah Connor" }
    ],
    notes: "Contacting Samsung for warranty support.",
    createdAt: "2022-11-15T08:00:00Z",
    updatedAt: "2024-05-10T09:00:00Z"
  }
];

interface AssetsContextType {
  assets: Asset[];
  addAsset: (asset: Partial<Asset>) => void;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  assignAsset: (id: string, person: string, department?: string) => void;
  deleteAssets: (ids: string[]) => void;
}

const AssetsContext = createContext<AssetsContextType | undefined>(undefined);

export function AssetsProvider({ children }: { children: React.ReactNode }) {
  const [assets, setAssets] = useState<Asset[]>(MOCK_ASSETS);

  const addAsset = useCallback((partial: Partial<Asset>) => {
    const newAsset: Asset = {
      id: "a" + Date.now(),
      name: partial.name || "New Asset",
      category: partial.category || "Uncategorized",
      assetCode: partial.assetCode || "AST-" + Math.floor(Math.random() * 1000),
      status: "Active",
      maintenanceHistory: [],
      activities: [],
      notes: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...partial
    };
    setAssets(prev => [newAsset, ...prev]);
  }, []);

  const updateAsset = useCallback((id: string, updates: Partial<Asset>) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a));
  }, []);

  const assignAsset = useCallback((id: string, person: string, department?: string) => {
    setAssets(prev => prev.map(a => {
      if (a.id !== id) return a;
      const newActivity: AssetActivity = {
        id: Math.random().toString(36).substring(7),
        type: "assignment",
        description: `Assigned to ${person}${department ? ` (${department})` : ""}`,
        timestamp: new Date().toISOString(),
        author: "You"
      };
      return {
        ...a,
        assignedTo: person,
        department: department || a.department,
        status: "In Use",
        activities: [newActivity, ...a.activities],
        updatedAt: newActivity.timestamp
      };
    }));
  }, []);

  const deleteAssets = useCallback((ids: string[]) => {
    setAssets(prev => prev.filter(a => !ids.includes(a.id)));
  }, []);

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
