"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  Calendar as CalendarIcon
} from "lucide-react";
import { ActivityProvider, useActivity } from "@/features/activity/context/ActivityContext";
import ActivityTimeline from "@/features/activity/components/ActivityTimeline";
import ActivityDetailsDrawer from "@/features/activity/components/ActivityDetailsDrawer";
import { ActivityModule } from "@/features/activity/types";
import ModuleHeader from "@/components/common/ModuleHeader";
import ModuleTabs from "@/components/common/ModuleTabs";
import SearchInput from "@/components/common/SearchInput";
import ExportButton from "@/components/common/ExportButton";
import DateRangePicker from "@/components/common/DateRangePicker";

function ActivityContent() {
  const {
    activities,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory
  } = useActivity();

  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState("Last 7 Days");

  const modules = [
    { id: "All", label: "All Activity" },
    { id: "TASKS", label: "Tasks" },
    { id: "MARKETING", label: "Marketing" },
    { id: "TEAM", label: "Team" },
    { id: "FINANCE", label: "Finance" },
    { id: "SALES", label: "Sales" },
    { id: "DOCUMENTS", label: "Documents" },
    { id: "SYSTEM", label: "System" }
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#fef8f8] overflow-hidden">

      <ModuleHeader
        title="Activity Log"
        count={activities.length}
        className="!bg-[#f9f5f5] border-black/[0.06]"
        rightContent={(
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search history..."
            width={180}
          />
        )}
      />

      <ModuleTabs
        tabs={modules}
        activeTab={selectedCategory}
        onTabChange={(id) => setSelectedCategory(id as any)}
        background="bg-[#f9f5f5]"
        className="border-black/[0.06]"
        rightContent={(
          <div className="flex items-center gap-3 px-6">
            <DateRangePicker value={dateRange} onChange={setDateRange} />
            <ExportButton label="Export" />
          </div>
        )}
      />

      {/* ── Operational Log Stream ── */}
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <ActivityTimeline onSelect={id => setSelectedActivityId(id)} />
      </main>

      {/* Details Drawer */}
      {selectedActivityId && (
        <ActivityDetailsDrawer
          activityId={selectedActivityId}
          onClose={() => setSelectedActivityId(null)}
        />
      )}
    </div>
  );
}

export default function ActivityPage() {
  return (
    <ActivityProvider>
      <ActivityContent />
    </ActivityProvider>
  );
}
