"use client";

import React, { useState } from "react";
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
    setSelectedCategory,
    dateRange,
    setDateRange
  } = useActivity();

  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);

  const modules = [
    { id: "All", label: "All Activity" },
    { id: "TASKS", label: "Tasks" },
    { id: "MARKETING", label: "Marketing" },
    { id: "TEAM", label: "Team" },
    { id: "FINANCE", label: "Finance" },
    { id: "SALES", label: "Sales" },
    { id: "DOCUMENTS", label: "Documents" }
  ];

  const exportActivities = () => {
    const headers = ["Time", "Module", "Action", "Entity Type", "Entity Name", "User", "Description"];
    const rows = activities.map((activity) => [
      new Date(activity.timestamp).toLocaleString(),
      activity.module,
      activity.action,
      activity.entityType,
      activity.entityName,
      activity.user.name,
      activity.description ?? "",
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `activity-log-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-[#fef8f8] overflow-hidden">

      <ModuleHeader
        title="Activity Log"
        count={activities.length}
        className="border-black/[0.06]"
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
        background="bg-transparent"
        className="border-black/[0.06]"
        rightContent={(
          <div className="flex items-center gap-3 px-6">
            <DateRangePicker value={dateRange} onChange={setDateRange} />
            <ExportButton label="Export" onClick={exportActivities} />
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
