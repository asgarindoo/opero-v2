"use client";

import { useEffect, useState } from "react";
import DashboardHero from "./components/DashboardHero";
import ActiveTasksWidget from "./components/widgets/ActiveTasksWidget";
import RecentActivityWidget from "./components/widgets/RecentActivityWidget";
import ProductivityWidget from "./components/widgets/ProductivityWidget";
import TeamPerformanceWidget from "./components/widgets/TeamPerformanceWidget";
import WorkflowProgressWidget from "./components/widgets/WorkflowProgressWidget";
import SalesOverviewWidget from "./components/widgets/SalesOverviewWidget";
import CalendarWidget from "./components/widgets/CalendarWidget";
import PerformanceMetricsWidget from "./components/widgets/PerformanceMetricsWidget";

function getCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

export default function DashboardPage() {
  const [tenantName, setTenantName] = useState("Your Workspace");
  const [ready, setReady]           = useState(false);

  useEffect(() => {
    const slug = getCookie("opero_active_tenant");
    if (slug) {
      setTenantName(
        slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
      );
    }
    setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <div className="px-5 py-5 max-w-[1440px] mx-auto">

      {/* ── Hero ── */}
      <div className="animate-fade-in-up">
        <DashboardHero tenantName={tenantName} />
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
  );
}
