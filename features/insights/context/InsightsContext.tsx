"use client";

import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import { Metric, InsightTrend, ActivityPoint, InsightCategory } from "../types";
import { listActivities } from "@/lib/client/services/activity.service";
import { listTransactions } from "@/lib/client/services/finance.service";
import { listSales } from "@/lib/client/services/sale.service";
import { listTasks } from "@/lib/client/services/task.service";

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

function parseDate(dateStr?: string) {
  if (!dateStr) return null;
  const dt = new Date(dateStr);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function rangeStart(range: string) {
  const now = new Date();
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (range === "Today") return base;
  if (range.includes("7")) {
    base.setDate(base.getDate() - 7);
    return base;
  }
  if (range.includes("30")) {
    base.setDate(base.getDate() - 30);
    return base;
  }
  if (range.includes("12")) {
    base.setMonth(base.getMonth() - 12);
    return base;
  }
  return new Date(0);
}

export function InsightsProvider({ children }: { children: React.ReactNode }) {
  const [selectedCategory, setSelectedCategory] = useState<"All" | InsightCategory>("All");
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [trends, setTrends] = useState<InsightTrend[]>([]);
  const [activityData, setActivityData] = useState<ActivityPoint[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [tasks, sales, finance, activityLogs] = await Promise.all([
          listTasks<any>(),
          listSales<any>(),
          listTransactions<any>(),
          listActivities(),
        ]);

        const start = rangeStart(dateRange);
        const taskInRange = tasks.filter((t) => {
          const updated = parseDate(t.recordUpdatedAt) ?? parseDate(t.recordCreatedAt);
          return updated ? updated >= start : false;
        });

        const activeTasks = taskInRange.filter((t) => t.status !== "Done" && t.status !== "Cancelled");
        const completedTasks = taskInRange.filter((t) => t.status === "Done");
        const avgCompletion = completedTasks.length
          ? Math.round(
              completedTasks.reduce((acc, t) => {
                const created = parseDate(t.created) ?? parseDate(t.recordCreatedAt);
                const updated = parseDate(t.recordUpdatedAt);
                if (!created || !updated) return acc;
                return acc + Math.max(1, Math.round((updated.getTime() - created.getTime()) / 86_400_000));
              }, 0) / completedTasks.length
            )
          : 0;

        const revenue = sales.reduce((acc, s) => acc + (Number(s.value) || 0), 0);
        const expenses = finance.filter((t) => t.type === "Expense").reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

        const metricList: Metric[] = [
          { id: "1", label: "Active Tasks", value: activeTasks.length, trend: 0, category: "Operations" },
          { id: "2", label: "Avg. Completion Time", value: avgCompletion ? `${avgCompletion}d` : "--", trend: 0, category: "Operations" },
          { id: "3", label: "Revenue", value: revenue.toLocaleString(), prefix: "$", trend: 0, category: "Sales" },
          { id: "4", label: "Operational Costs", value: expenses.toLocaleString(), prefix: "$", trend: 0, category: "Finance" },
        ];

        const days = dateRange.includes("7") ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] : ["Week 1", "Week 2", "Week 3", "Week 4"];
        const trendList: InsightTrend[] = [
          {
            id: "t1",
            title: "Task Completion",
            category: "Operations",
            data: days.map((label, idx) => ({ label, value: idx < completedTasks.length ? completedTasks.length : 0 })),
          },
          {
            id: "t2",
            title: "Value Velocity",
            category: "Sales",
            data: days.map((label) => ({ label, value: Math.round(revenue / Math.max(1, days.length)) })),
          },
        ];

        const heatmap = Array.from({ length: 7 * 12 }, (_, i) => {
          const day = Math.floor(i / 12);
          const hour = (i % 12) * 2;
          const intensity = (activityLogs as any[]).filter((log) => {
            const dt = new Date(log.timestamp);
            const now = new Date();
            const dayIndex = (now.getDay() + 6) % 7;
            const diffDays = (dayIndex - day + 7) % 7;
            const bucketDay = new Date(now);
            bucketDay.setDate(now.getDate() - diffDays);
            return dt.getDay() === bucketDay.getDay() && Math.floor(dt.getHours() / 2) * 2 === hour;
          }).length;
          return { day, hour, intensity: Math.min(1, intensity / 5) };
        });

        if (!cancelled) {
          setMetrics(metricList);
          setTrends(trendList);
          setActivityData(heatmap);
        }
      } catch (err) {
        console.error("Failed to load insights:", err);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [dateRange]);

  const filteredMetrics = useMemo(() => {
    if (selectedCategory === "All") return metrics;
    return metrics.filter(m => m.category === selectedCategory);
  }, [metrics, selectedCategory]);

  const filteredTrends = useMemo(() => {
    if (selectedCategory === "All") return trends;
    return trends.filter(t => t.category === selectedCategory);
  }, [trends, selectedCategory]);

  const exportData = () => {
    // Generate simple CSV
    const headers = "Metric,Value,Trend,Category\n";
    const rows = filteredMetrics.map(m => `${m.label},${m.prefix || ""}${m.value}${m.suffix || ""},${m.trend}%,${m.category}`).join("\n");
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
    metrics: filteredMetrics,
    trends: filteredTrends,
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
