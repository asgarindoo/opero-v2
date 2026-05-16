"use client";

import React, { createContext, useContext, useState, useMemo } from "react";
import { ActivityLog, ActivityCategory, ActivityGroup, ActivityModule } from "../types";

interface ActivityContextType {
  activities: ActivityLog[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: "All" | ActivityModule;
  setSelectedCategory: (category: "All" | ActivityModule) => void;
  groupedActivities: ActivityGroup[];
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

const MOCK_ACTIVITIES: ActivityLog[] = [
  {
    id: "a1",
    category: "UPDATE",
    module: "TASKS",
    action: "Completed",
    entityName: "Design System Review",
    entityType: "Task",
    entityId: "t-101",
    user: { id: "u1", name: "Alex Rivera", role: "Design Lead" },
    timestamp: new Date().toISOString(),
    description: "Finalized the typography and color tokens for the OPERA design system."
  },
  {
    id: "a2",
    category: "INFO",
    module: "MARKETING",
    action: "Published",
    entityName: "Summer Solstice 2026",
    entityType: "Campaign",
    entityId: "c-505",
    user: { id: "u2", name: "Sarah Chen", role: "Marketing Manager" },
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    description: "Launch of the multi-channel summer seasonal campaign across all regions."
  },
  {
    id: "a3",
    category: "AUTOMATION",
    module: "SYSTEM",
    action: "Connected",
    entityName: "Slack Workspace",
    entityType: "Integration",
    entityId: "i-99",
    user: { id: "u1", name: "Alex Rivera", role: "Owner" },
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    description: "Successfully linked the workspace to Slack for automated notifications."
  },
  {
    id: "a4",
    category: "UPDATE",
    module: "FINANCE",
    action: "Approved",
    entityName: "Invoice #INV-2026-042",
    entityType: "Invoice",
    entityId: "i-303",
    user: { id: "u3", name: "Marcus Wright", role: "Finance" },
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    description: "Approved the quarterly infrastructure maintenance invoice."
  },
  {
    id: "a5",
    category: "SECURITY",
    module: "SYSTEM",
    action: "Updated",
    entityName: "2FA Enforcement",
    entityType: "Security",
    entityId: "s-808",
    user: { id: "u1", name: "Alex Rivera", role: "Owner" },
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    description: "Enabled mandatory Two-Factor Authentication for all administrative accounts."
  },
  {
    id: "a6",
    category: "UPDATE",
    module: "DOCUMENTS",
    action: "Uploaded",
    entityName: "Q3 Financial Projection.pdf",
    entityType: "Document",
    entityId: "doc-101",
    user: { id: "u3", name: "Marcus Wright", role: "Finance" },
    timestamp: new Date(Date.now() - 86400000 * 1.2).toISOString(),
    description: "Uploaded the revised financial projections for team review."
  },
  {
    id: "a7",
    category: "INFO",
    module: "MARKETING",
    action: "Sent",
    entityName: "Product Launch Broadcast",
    entityType: "Broadcast",
    entityId: "b-77",
    user: { id: "u2", name: "Sarah Chen", role: "Marketing" },
    timestamp: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    description: "Broadcast sent to 12,400 subscribers regarding the new feature release."
  },
  {
    id: "a8",
    category: "UPDATE",
    module: "TEAM",
    action: "Invited",
    entityName: "Elena Rossi",
    entityType: "Member",
    entityId: "m-909",
    user: { id: "u1", name: "Alex Rivera", role: "Owner" },
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    description: "Elena Rossi has been invited to join the Product Management team."
  }
];

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"All" | ActivityModule>("All");

  const filteredActivities = useMemo(() => {
    return MOCK_ACTIVITIES.filter(a => {
      const matchesSearch = a.entityName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            a.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            a.user.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesModule = selectedCategory === "All" || a.module === selectedCategory;
      return matchesSearch && matchesModule;
    });
  }, [searchQuery, selectedCategory]);

  const groupedActivities = useMemo(() => {
    const groups: Record<string, ActivityLog[]> = {};
    
    filteredActivities.forEach(activity => {
      const date = new Date(activity.timestamp).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(activity);
    });

    return Object.entries(groups).map(([date, activities]) => ({
      date,
      activities: activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    }));
  }, [filteredActivities]);

  const value = {
    activities: filteredActivities,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    groupedActivities
  };

  return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>;
}

export function useActivity() {
  const context = useContext(ActivityContext);
  if (!context) throw new Error("useActivity must be used within ActivityProvider");
  return context;
}
