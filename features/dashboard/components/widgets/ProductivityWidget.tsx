"use client";

import { useState } from "react";
import { useDashboardData } from "@/features/dashboard/context/DashboardDataContext";

export default function ProductivityWidget() {
  const { data, loading } = useDashboardData();
  const [period, setPeriod] = useState<"Week" | "Month">("Week");

  const bars = data?.productivity.bars ?? [];
  const metrics = data?.productivity.metrics ?? [];

  // Normalize bar heights relative to max
  const maxTasks = Math.max(...bars.map((b) => b.tasks), 1);

  const today = new Date();
  const adjustedToday = today.getDay() === 0 ? 6 : today.getDay() - 1; // Mon-based

  return (
    <div
      className="db-widget rounded-[10px] overflow-hidden"
      style={{ border: "1px solid rgba(0,0,0,0.07)", background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--color-on-surface-variant)", opacity: 0.7 }}>bar_chart</span>
          <span className="font-h3 text-[13px] font-semibold text-on-surface">Productivity</span>
        </div>
        <div className="flex items-center gap-1">
          {(["Week", "Month"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="font-label-caps text-[9px] uppercase tracking-[0.06em] font-semibold px-2 py-1 rounded transition-colors"
              style={{
                background: period === p ? "rgba(0,0,0,0.06)" : "transparent",
                color: period === p ? "var(--color-on-surface)" : "var(--color-on-surface-variant)",
                opacity: period === p ? 1 : 0.5,
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Bar chart */}
        <div className="flex items-end gap-2 h-24 mb-3">
          {loading ? (
            [...Array(7)].map((_, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-[3px] bg-black/[0.05] animate-pulse"
                  style={{ height: `${30 + ((i * 23) % 50)}%` }}
                />
                <div className="h-2 w-4 rounded bg-black/[0.04] animate-pulse" />
              </div>
            ))
          ) : bars.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <span className="font-body-sm text-[11px] text-on-surface-variant opacity-40">No data</span>
            </div>
          ) : (
            bars.map((bar, i) => {
              const height = maxTasks > 0 ? Math.max((bar.tasks / maxTasks) * 100, bar.tasks > 0 ? 8 : 3) : 3;
              const isToday = i === adjustedToday;
              return (
                <div key={bar.day} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-[3px] animate-grow-up relative group"
                    style={{ height: `${height}%`, background: isToday ? "var(--color-primary)" : "rgba(0,0,0,0.10)", animationDelay: `${i * 80}ms` }}
                  >
                    {bar.tasks > 0 && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center whitespace-nowrap">
                        <span className="font-label-caps text-[9px] font-semibold px-1.5 py-0.5 rounded" style={{ background: "var(--color-primary)", color: "#fff" }}>
                          {bar.tasks}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="font-label-caps text-[8px] uppercase tracking-[0.04em] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: isToday ? 0.8 : 0.45 }}>
                    {bar.day}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Metric chips */}
        <div className="grid grid-cols-2 gap-2">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="p-2.5 rounded-[6px] space-y-1.5" style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.05)" }}>
                <div className="h-5 w-10 rounded bg-black/[0.06] animate-pulse" />
                <div className="h-2 w-20 rounded bg-black/[0.04] animate-pulse" />
              </div>
            ))
          ) : (
            metrics.map((m) => (
              <div key={m.label} className="p-2.5 rounded-[6px]" style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.05)" }}>
                <div className="font-display text-[20px] font-bold text-on-surface leading-none mb-0.5">{m.value}</div>
                <div className="font-body-sm text-[10px]" style={{ color: "var(--color-on-surface-variant)", opacity: 0.6 }}>{m.label}</div>
                <div className="font-label-caps text-[9px] font-semibold mt-1" style={{ color: m.up ? "rgba(0,0,0,0.6)" : "rgba(186,26,26,0.7)" }}>
                  {m.delta} total
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
