"use client";

import React, { useState } from "react";
import {
  Sparkles,
  TrendingUp,
  Activity,
  BarChart3,
  Inbox
} from "lucide-react";
import { InsightsProvider, useInsights } from "@/features/insights";
import MetricCard from "@/features/insights/components/MetricCard";
import TrendOverview from "@/features/insights/components/TrendOverview";
import ActivityHeatmap from "@/features/insights/components/ActivityHeatmap";
import { InsightCategory } from "@/features/insights";
import DateRangePicker from "@/components/common/DateRangePicker";
import ExportButton from "@/components/common/ExportButton";
import ModuleHeader from "@/components/common/ModuleHeader";
import ModuleTabs from "@/components/common/ModuleTabs";

function InsightsContent() {
  const {
    metrics,
    trends,
    activityData,
    selectedCategory,
    setSelectedCategory,
    dateRange,
    setDateRange,
    exportData
  } = useInsights();

  const categories = [
    { id: "All", label: "All Insights" },
    { id: "Operations", label: "Operations" },
    { id: "Sales", label: "Sales" },
    { id: "Marketing", label: "Marketing" },
    { id: "Team", label: "Team" },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#fef8f8] overflow-hidden">
      <ModuleHeader
        title="Insights"
        className="my-2"
      />

      <ModuleTabs
        tabs={categories}
        activeTab={selectedCategory}
        onTabChange={(id) => setSelectedCategory(id as any)}
        rightContent={(
          <div className="flex items-center gap-3 px-6">
            <DateRangePicker value={dateRange} onChange={setDateRange} />
            <ExportButton onClick={exportData} label="Export" />
          </div>
        )}
      />

      {/* ── Main Workspace Area ── */}
      <main className="flex-1 overflow-y-auto px-10 py-10 custom-scrollbar">
        <div className="max-w-[1140px] mx-auto space-y-12 animate-fade-in">

          {/* Section: Operational Metrics */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="text-primary" size={16} />
              <h2 className="font-display text-[14px] font-bold tracking-widest text-on-surface-variant uppercase">Operational Metrics</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {metrics.map((metric, idx) => (
                <MetricCard key={idx} metric={metric} />
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Section: Trend Overview */}
            <section className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="text-primary" size={16} />
                  <h2 className="font-display text-[14px] font-bold tracking-widest text-on-surface-variant uppercase">Performance Trends</h2>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {trends.map(trend => (
                  <TrendOverview key={trend.id} trend={trend} />
                ))}
              </div>
            </section>

            {/* Section: Activity Heatmap */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Activity className="text-primary" size={16} />
                <h2 className="font-display text-[14px] font-bold tracking-widest text-on-surface-variant uppercase">Platform Activity</h2>
              </div>
              <ActivityHeatmap data={activityData} />
            </section>
          </div>

          {/* Empty State placeholder for deeper analysis */}
          <section className="pt-8 border-t border-black/[0.04]">
            <div className="flex flex-col items-center justify-center py-20 bg-black/[0.01] rounded-3xl border border-dashed border-black/[0.08]">
              <BarChart3 className="text-on-surface-variant opacity-60 mb-4" size={48} strokeWidth={1} />
              <p className="font-display text-[13px] font-medium text-on-surface-variant opacity-60 uppercase tracking-widest">Select a metric for deeper drill-down</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default function InsightsPage() {
  return (
    <InsightsProvider>
      <InsightsContent />
    </InsightsProvider>
  );
}
