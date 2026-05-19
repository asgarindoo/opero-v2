"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ActivityLog, ActivityCategory, ActivityGroup, ActivityModule } from "../types";
import { listActivities } from "@/lib/client/services/activity.service";

interface ActivityContextType {
  activities: ActivityLog[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: "All" | ActivityModule;
  setSelectedCategory: (category: "All" | ActivityModule) => void;
  groupedActivities: ActivityGroup[];
  loading: boolean;
  error: string | null;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const [allActivities, setAllActivities] = useState<ActivityLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"All" | ActivityModule>("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const items = await listActivities();
        if (!cancelled) setAllActivities(items as ActivityLog[]);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load activity log");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredActivities = useMemo(() => {
    return allActivities.filter(a => {
      const matchesSearch = a.entityName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            a.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            a.user.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesModule = selectedCategory === "All" || a.module === selectedCategory;
      return matchesSearch && matchesModule;
    });
  }, [allActivities, searchQuery, selectedCategory]);

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
    groupedActivities,
    loading,
    error
  };

  return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>;
}

export function useActivity() {
  const context = useContext(ActivityContext);
  if (!context) throw new Error("useActivity must be used within ActivityProvider");
  return context;
}
