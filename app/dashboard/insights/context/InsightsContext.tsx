"use client";

import React, { createContext, useContext, useState, useMemo } from "react";
import { Metric, InsightTrend, ActivityPoint, InsightCategory } from "../types";

interface InsightsContextType {
  metrics: Metric[];
  trends: InsightTrend[];
  activityData: ActivityPoint[];
  selectedCategory: "All" | InsightCategory;
  setSelectedCategory: (category: "All" | InsightCategory) => void;
  dateRange: string;
  setDateRange: (range: string) => void;
  exportData: () => void;
}

const InsightsContext = createContext<InsightsContextType | undefined>(undefined);

// Base Mock Data generator
const getMockMetrics = (range: string): Metric[] => {
  const multiplier = range === "Today" ? 0.1 : range.includes("7") ? 0.25 : range.includes("30") ? 1 : range.includes("12") ? 12 : 1;
  const trendBase = range === "Today" ? 2 : 5;
  
  return [
    { id: "1", label: "Active Tasks", value: Math.round(24 * multiplier), trend: trendBase + 2, category: "Operations" },
    { id: "2", label: "Avg. Completion Time", value: range === "Today" ? "0.8d" : "3.2d", trend: -5, category: "Operations" },
    { id: "3", label: "Revenue", value: (42500 * multiplier).toLocaleString(), prefix: "$", trend: 8, category: "Sales" },
    { id: "4", label: "Conversion Rate", value: "4.8%", trend: 2, category: "Marketing" },
    { id: "5", label: "Team Productivity", value: "92%", trend: 4, category: "Team" },
    { id: "6", label: "Operational Costs", value: (12800 * multiplier).toLocaleString(), prefix: "$", trend: -1.5, category: "Finance" },
  ];
};

const getMockTrends = (range: string): InsightTrend[] => {
  const labels = range === "Today" ? ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"] :
                 range.includes("7") ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] :
                 range.includes("30") ? ["Week 1", "Week 2", "Week 3", "Week 4"] :
                 ["Jan", "Mar", "May", "Jul", "Sep", "Nov"];

  return [
    {
      id: "t1",
      title: "Task Completion",
      category: "Operations",
      data: labels.map(l => ({ label: l, value: Math.floor(Math.random() * 50) + 10 }))
    },
    {
      id: "t2",
      title: "Value Velocity",
      category: "Sales",
      data: labels.map(l => ({ label: l, value: Math.floor(Math.random() * 100) + 20 }))
    }
  ];
};

export function InsightsProvider({ children }: { children: React.ReactNode }) {
  const [selectedCategory, setSelectedCategory] = useState<"All" | InsightCategory>("All");
  const [dateRange, setDateRange] = useState("Last 30 Days");

  const metrics = useMemo(() => {
    const all = getMockMetrics(dateRange);
    if (selectedCategory === "All") return all;
    return all.filter(m => m.category === selectedCategory);
  }, [selectedCategory, dateRange]);

  const trends = useMemo(() => {
    const all = getMockTrends(dateRange);
    if (selectedCategory === "All") return all;
    return all.filter(t => t.category === selectedCategory);
  }, [selectedCategory, dateRange]);

  const activityData: ActivityPoint[] = useMemo(() => {
    return Array.from({ length: 7 * 12 }, (_, i) => ({
      day: Math.floor(i / 12),
      hour: (i % 12) * 2,
      intensity: Math.random()
    }));
  }, [dateRange]);

  const exportData = () => {
    // Generate simple CSV
    const headers = "Metric,Value,Trend,Category\n";
    const rows = metrics.map(m => `${m.label},${m.prefix || ""}${m.value}${m.suffix || ""},${m.trend}%,${m.category}`).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `opero_insights_${dateRange.toLowerCase().replace(/ /g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const value = {
    metrics,
    trends,
    activityData,
    selectedCategory,
    setSelectedCategory,
    dateRange,
    setDateRange,
    exportData
  };

  return <InsightsContext.Provider value={value}>{children}</InsightsContext.Provider>;
}

export function useInsights() {
  const context = useContext(InsightsContext);
  if (!context) throw new Error("useInsights must be used within InsightsProvider");
  return context;
}
