"use client";

import { useDashboardData } from "../DashboardDataContext";

function SkeletonMetric() {
  return (
    <div className="p-3 rounded-[6px] space-y-2" style={{ border: "1px solid rgba(0,0,0,0.05)" }}>
      <div className="flex justify-between">
        <div className="w-6 h-6 rounded-[4px] bg-black/[0.05] animate-pulse" />
        <div className="h-4 w-8 rounded bg-black/[0.04] animate-pulse" />
      </div>
      <div className="h-6 w-12 rounded bg-black/[0.06] animate-pulse" />
      <div className="h-2 w-20 rounded bg-black/[0.04] animate-pulse" />
      <div className="flex items-end gap-px h-5">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="flex-1 rounded-t-[1px] bg-black/[0.06] animate-pulse" style={{ height: `${30 + ((i * 29) % 60)}%` }} />
        ))}
      </div>
    </div>
  );
}

export default function PerformanceMetricsWidget() {
  const { data, loading } = useDashboardData();
  const metrics = data?.performance.metrics ?? [];

  return (
    <div
      className="db-widget rounded-[10px] overflow-hidden"
      style={{ border: "1px solid rgba(0,0,0,0.07)", background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--color-on-surface-variant)", opacity: 0.7 }}>insights</span>
          <span className="font-h3 text-[13px] font-semibold text-on-surface">Performance</span>
        </div>
        <span className="font-label-caps text-[9px] uppercase tracking-[0.07em] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.4 }}>
          This week
        </span>
      </div>

      <div className="px-4 py-3 grid grid-cols-2 gap-3">
        {loading ? (
          [...Array(4)].map((_, i) => <SkeletonMetric key={i} />)
        ) : metrics.length === 0 ? (
          <div className="col-span-2 flex flex-col items-center justify-center py-8 gap-2">
            <span className="material-symbols-outlined" style={{ fontSize: 28, color: "var(--color-on-surface-variant)", opacity: 0.25 }}>insights</span>
            <p className="font-body-sm text-[12px] text-on-surface-variant opacity-50">No metrics yet</p>
          </div>
        ) : (
          metrics.map((m) => {
            const trend = Array.isArray(m.trend) && m.trend.length > 0 ? m.trend : [0];
            const max = Math.max(...trend, 1);
            return (
              <div
                key={m.label}
                className="p-3 rounded-[6px] cursor-pointer hover:bg-black/[0.02] transition-colors"
                style={{ border: "1px solid rgba(0,0,0,0.05)" }}
              >
                {/* Icon + delta */}
                <div className="flex items-center justify-between mb-2">
                  <div className="w-6 h-6 rounded-[4px] flex items-center justify-center" style={{ background: "rgba(0,0,0,0.04)" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 13, color: "var(--color-on-surface-variant)", opacity: 0.7 }}>
                      {m.icon}
                    </span>
                  </div>
                  <span className="font-label-caps text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(0,0,0,0.04)", color: "var(--color-on-surface)", opacity: 0.6 }}>
                    +{m.delta}
                  </span>
                </div>

                {/* Value */}
                <div className="font-display text-[22px] font-bold text-on-surface leading-none mb-0.5">
                  {m.value}{m.suffix}
                </div>
                <div className="font-body-sm text-[10px] mb-2" style={{ color: "var(--color-on-surface-variant)", opacity: 0.55 }}>
                  {m.label}
                </div>

                {/* Spark line */}
                <div className="flex items-end gap-px h-5">
                  {trend.map((v, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-[1px] animate-grow-up"
                      style={{
                        height: `${(v / max) * 100}%`,
                        background: i === trend.length - 1 ? "var(--color-primary)" : "rgba(0,0,0,0.1)",
                        animationDelay: `${i * 60}ms`,
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
