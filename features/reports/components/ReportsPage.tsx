"use client";

import { useState, useMemo } from "react";
import { Plus, Inbox, TrendingUp, BarChart3 } from "lucide-react";
import { ReportsProvider, useReports } from "@/features/reports";
import ReportListView from "@/features/reports/components/ReportListView";
import ReportDetail from "@/features/reports/components/ReportDetail";
import type { ReportType } from "@/features/reports";

import ModuleHeader from "@/components/common/ModuleHeader";
import ModuleTabs from "@/components/common/ModuleTabs";
import SearchInput from "@/components/common/SearchInput";
import Button from "@/components/ui/Button";

import { EmptyState } from "@/components/common/DataState";

function ReportsContent() {
  const {
    reports,
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType
  } = useReports();

  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const categories: { id: string; label: string }[] = [
    { id: "All", label: "All" },
    { id: "Sales", label: "Sales" },
    { id: "Operations", label: "Operations" },
    { id: "Finance", label: "Finance" },
    { id: "Marketing", label: "Marketing" },
    { id: "Activity", label: "Activity" }
  ];

  const filtered = useMemo(() => {
    let r = reports;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      r = r.filter(rep => rep.title.toLowerCase().includes(q) || rep.description.toLowerCase().includes(q));
    }
    if (selectedType !== "All") {
      r = r.filter(rep => rep.type === selectedType);
    }
    return r;
  }, [reports, searchQuery, selectedType]);

  const selectedReport = useMemo(() =>
    reports.find(r => r.id === selectedReportId) || null
    , [reports, selectedReportId]);

  if (selectedReport) {
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
        <ReportDetail
          report={selectedReport}
          onClose={() => setSelectedReportId(null)}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      <ModuleHeader
        title="Reports"
        count={reports.length}
        rightContent={(
          <>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search reports..."
              width={180}
            />
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
            >
              NEW REPORT
            </Button>
          </>
        )}
      />

      <ModuleTabs
        tabs={categories}
        activeTab={selectedType}
        onTabChange={(id) => setSelectedType(id as any)}
        rightContent={(
          <div className="flex items-center gap-6 mr-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={12} strokeWidth={1.75} style={{ color: "var(--color-on-surface-variant)", opacity: 0.6 }} />
              <span className="font-label-caps text-[9px] font-semibold text-on-surface-variant opacity-60 uppercase">98% Accuracy</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 size={12} strokeWidth={1.75} style={{ color: "var(--color-on-surface-variant)", opacity: 0.6 }} />
              <span className="font-label-caps text-[9px] font-semibold text-on-surface-variant opacity-60 uppercase">Scheduled Exports: 4</span>
            </div>
          </div>
        )}
      />

      <main className="flex-1 overflow-y-auto">
        {filtered.length > 0 ? (
          <ReportListView
            reports={filtered}
            onReportClick={(r) => setSelectedReportId(r.id)}
          />
        ) : (
          <EmptyState
            icon="analytics"
            title="No reports found"
            description="There are no reports matching your current query or filters."
          />
        )}
      </main>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <ReportsProvider>
      <ReportsContent />
    </ReportsProvider>
  );
}
