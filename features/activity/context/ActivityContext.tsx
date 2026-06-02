"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ActivityLog, ActivityGroup, ActivityModule } from "@/features/activity";
import { listActivities } from "@/features/activity";
import { getUserDisplayName } from "@/lib/user-identity";

interface ActivityContextType {
  activities: ActivityLog[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: "All" | ActivityModule;
  setSelectedCategory: (category: "All" | ActivityModule) => void;
  dateRange: string;
  setDateRange: (range: string) => void;
  groupedActivities: ActivityGroup[];
  loading: boolean;
  error: string | null;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

function isInsideDateRange(timestamp: string, range: string) {
  if (range === "All Time") return true;

  const activityDate = new Date(timestamp);
  const now = new Date();
  if (Number.isNaN(activityDate.getTime())) return false;

  if (range === "Today") {
    return activityDate.toDateString() === now.toDateString();
  }

  const rangeDays: Record<string, number> = {
    "Last 7 Days": 7,
    "Last 30 Days": 30,
    "Last 12 Months": 365,
  };

  const days = rangeDays[range];
  if (!days) return true;

  const cutoff = new Date(now);
  cutoff.setDate(now.getDate() - days);
  return activityDate >= cutoff;
}

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const [allActivities, setAllActivities] = useState<ActivityLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"All" | ActivityModule>("All");
  const [dateRange, setDateRange] = useState("Last 7 Days");
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
                            getUserDisplayName(a.user).toLowerCase().includes(searchQuery.toLowerCase());
      const matchesModule = selectedCategory === "All" || a.module === selectedCategory;
      const matchesDateRange = isInsideDateRange(a.timestamp, dateRange);
      return matchesSearch && matchesModule && matchesDateRange;
    });
  }, [allActivities, dateRange, searchQuery, selectedCategory]);

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
    dateRange,
    setDateRange,
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
