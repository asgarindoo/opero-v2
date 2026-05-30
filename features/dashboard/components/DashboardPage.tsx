"use client";

import { DashboardDataProvider } from "@/features/dashboard/context/DashboardDataContext";
import DashboardHero from "@/features/dashboard/components/DashboardHero";
import ActiveTasksWidget from "@/features/dashboard/components/widgets/ActiveTasksWidget";
import RecentActivityWidget from "@/features/dashboard/components/widgets/RecentActivityWidget";
import ProductivityWidget from "@/features/dashboard/components/widgets/ProductivityWidget";
import TeamPerformanceWidget from "@/features/dashboard/components/widgets/TeamPerformanceWidget";
import WorkflowProgressWidget from "@/features/dashboard/components/widgets/WorkflowProgressWidget";
import SalesOverviewWidget from "@/features/dashboard/components/widgets/SalesOverviewWidget";
import CalendarWidget from "@/features/dashboard/components/widgets/CalendarWidget";
import PerformanceMetricsWidget from "@/features/dashboard/components/widgets/PerformanceMetricsWidget";

export default function DashboardPage() {
  return (
    <DashboardDataProvider>
      <div className="px-5 py-5 max-w-container-max mx-auto">

        {/* ── Hero ── */}
        <div className="animate-fade-in-up">
          <DashboardHero />
        </div>

        {/* ── Row 1: Tasks (wide) + Activity (narrow) ── */}
        <div
          className="grid gap-4 mb-4 animate-fade-in-up delay-100"
          style={{ gridTemplateColumns: "minmax(0,2fr) minmax(0,1fr)" }}
        >
          <ActiveTasksWidget />
          <RecentActivityWidget />
        </div>

        {/* ── Row 2: Productivity + Team + Workflow ── */}
        <div
          className="grid gap-4 mb-4 animate-fade-in-up delay-200"
          style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)" }}
        >
          <ProductivityWidget />
          <TeamPerformanceWidget />
          <WorkflowProgressWidget />
        </div>

        {/* ── Row 3: Sales + Calendar + Metrics ── */}
        <div
          className="grid gap-4 mb-6 animate-fade-in-up delay-300"
          style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)" }}
        >
          <SalesOverviewWidget />
          <CalendarWidget />
          <PerformanceMetricsWidget />
        </div>

        {/* ── Responsive overrides ── */}
        <style>{`
          @media (max-width: 1024px) {
            .db-row-1 { grid-template-columns: 1fr !important; }
            .db-row-2 { grid-template-columns: 1fr 1fr !important; }
            .db-row-3 { grid-template-columns: 1fr 1fr !important; }
          }
          @media (max-width: 768px) {
            .db-row-2, .db-row-3 { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </DashboardDataProvider>
  );
}
