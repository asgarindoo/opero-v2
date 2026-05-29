"use client";

import { TrendingUp, ShoppingCart } from "lucide-react";
import { useDashboardData } from "@/features/dashboard/context/DashboardDataContext";

const PIPELINE_COLORS = [
  "rgba(0,0,0,0.12)",
  "rgba(0,0,0,0.25)",
  "rgba(0,0,0,0.45)",
  "rgba(0,0,0,0.68)",
  "var(--color-primary)",
];

const STAGE_COLOR: Record<string, { bg: string; text: string }> = {
  Pending:    { bg: "rgba(0,0,0,0.05)",     text: "var(--color-on-surface-variant)" },
  Processing: { bg: "rgba(0,0,0,0.08)",     text: "var(--color-on-surface)" },
  Completed:  { bg: "var(--color-primary)", text: "var(--color-on-primary)" },
  Cancelled:  { bg: "rgba(186,26,26,0.08)", text: "rgba(186,26,26,0.8)" },
};

function SkeletonPipeline() {
  return (
    <div className="space-y-2.5">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-2.5">
          <div className="w-[68px] h-2.5 rounded bg-black/[0.04] animate-pulse shrink-0" />
          <div className="flex-1 h-[5px] rounded-full bg-black/[0.04] animate-pulse" />
          <div className="w-[90px] h-2.5 rounded bg-black/[0.04] animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export default function SalesOverviewWidget() {
  const { data, loading } = useDashboardData();
  const stages = data?.salesOverview.stages ?? [];
  const recentDeals = data?.salesOverview.recentDeals ?? [];

  const closingCount = stages.find((s) => s.label === "Processing")?.count ?? 0;
  const maxPct = Math.max(...stages.map((s) => s.pct), 1);

  return (
    <div
      className="db-widget rounded-[10px] overflow-hidden"
      style={{ border: "1px solid rgba(0,0,0,0.07)", background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-2">
          <ShoppingCart size={14} strokeWidth={1.75} style={{ color: "var(--color-on-surface-variant)", opacity: 0.65 }} />
          <span className="font-h3 text-[13px] font-semibold text-on-surface">Sales Overview</span>
          {!loading && closingCount > 0 && (
            <span className="font-label-caps text-[8px] font-bold px-1.5 py-[3px] rounded-full" style={{ background: "rgba(0,0,0,0.06)", color: "var(--color-on-surface-variant)" }}>
              {closingCount} processing
            </span>
          )}
        </div>
        <button
          className="font-label-caps text-[9px] font-semibold flex items-center gap-1 hover:text-primary transition-colors"
          style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }}
          onClick={() => window.location.href = "/dashboard/sales"}
        >
          <TrendingUp size={12} strokeWidth={1.75} />
          View all
        </button>
      </div>

      {/* Pipeline funnel */}
      <div className="px-4 pt-3 pb-2">
        <div className="font-label-caps text-[9px] uppercase tracking-[0.1em] font-semibold mb-2" style={{ color: "var(--color-on-surface-variant)", opacity: 0.4 }}>
          Pipeline
        </div>
        {loading ? (
          <SkeletonPipeline />
        ) : stages.every((s) => s.count === 0) ? (
          <div className="flex flex-col items-center justify-center py-6 gap-2">
            <span className="material-symbols-outlined" style={{ fontSize: 24, color: "var(--color-on-surface-variant)", opacity: 0.25 }}>shopping_cart</span>
            <p className="font-body-sm text-[11px] text-on-surface-variant opacity-50">No sales data yet</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {stages.map((stage) => {
              const displayPct = stage.pct > 0 ? Math.max(Math.round((stage.pct / maxPct) * 100), 4) : 0;
              const color = PIPELINE_COLORS[stage.colorIndex] ?? "rgba(0,0,0,0.12)";
              const valueStr = stage.value > 0 ? `$${Number(stage.value).toLocaleString()}` : "$0";
              return (
                <div key={stage.label} className="flex items-center gap-2.5">
                  <div className="w-[68px] shrink-0">
                    <span className="font-body-sm text-[11px]" style={{ color: "var(--color-on-surface-variant)", opacity: 0.7 }}>{stage.label}</span>
                  </div>
                  <div className="flex-1 h-[5px] rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.05)" }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${displayPct}%`, background: color }} />
                  </div>
                  <div className="flex items-center gap-2 shrink-0 justify-end">
                    <span className="font-body-sm text-[11px] font-medium text-on-surface">{stage.count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "rgba(0,0,0,0.05)", margin: "4px 0" }} />

      {/* Recent deals */}
      <div className="px-4 pb-3 pt-2">
        <div className="font-label-caps text-[9px] uppercase tracking-[0.1em] font-semibold mb-2" style={{ color: "var(--color-on-surface-variant)", opacity: 0.4 }}>
          Recent Deals
        </div>
        {loading ? (
          <div className="space-y-1">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-2.5 py-2 rounded-[6px]" style={{ border: "1px solid rgba(0,0,0,0.04)" }}>
                <div className="w-5 h-5 rounded-full bg-black/[0.06] animate-pulse shrink-0" />
                <div className="flex-1 h-2.5 rounded bg-black/[0.05] animate-pulse" />
                <div className="w-12 h-4 rounded bg-black/[0.04] animate-pulse" />
              </div>
            ))}
          </div>
        ) : recentDeals.length === 0 ? (
          <p className="font-body-sm text-[11px] text-on-surface-variant opacity-40 py-2 text-center">No recent deals</p>
        ) : (
          <div className="space-y-1">
            {recentDeals.map((deal, idx) => {
              const sc = STAGE_COLOR[deal.stage] ?? STAGE_COLOR.Pending;
              return (
                <div
                  key={`${deal.name}-${idx}`}
                  className="flex items-center gap-3 px-2.5 py-2 rounded-[6px] hover:bg-black/[0.02] transition-colors cursor-pointer"
                  style={{ border: "1px solid rgba(0,0,0,0.04)" }}
                >
                  <div className="flex-1 min-w-0">
                    <span className="font-body-md text-[12px] font-semibold text-on-surface truncate block">{deal.name}</span>
                  </div>
                  <span className="font-label-caps text-[8px] font-bold px-[6px] py-[3px] rounded shrink-0" style={{ background: sc.bg, color: sc.text }}>
                    {deal.stage}
                  </span>
                  <div className="text-right shrink-0">
                    <div className="font-body-sm text-[10px]" style={{ color: "var(--color-on-surface-variant)", opacity: 0.7 }}>{deal.ago}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
