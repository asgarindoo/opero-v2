"use client";

import { Clock } from "lucide-react";
import { useDashboardData } from "@/features/dashboard/context/DashboardDataContext";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}M AGO`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}H AGO`;
  return `${Math.floor(hours / 24)}D AGO`;
}



export default function RecentActivityWidget() {
  const { data, loading } = useDashboardData();
  const feed = data?.recentActivity.items ?? [];

  return (
    <div
      className="db-widget rounded-[10px] overflow-hidden flex flex-col"
      style={{ border: "1px solid rgba(0,0,0,0.07)", background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", height: 430 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--color-on-surface-variant)", opacity: 0.7 }}>timeline</span>
          <span className="font-h3 text-[13px] font-semibold text-on-surface">Activity Log</span>
        </div>
      </div>

      {/* Timeline — scrollable, fills remaining height */}
      <div className="flex-1 overflow-y-auto db-sidebar px-5 py-5 min-h-0">
        {loading ? (
          <div className="relative">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="relative pl-6 pb-7 last:pb-0">
                {i < 4 && (
                  <div className="absolute left-[4.5px] top-[12px] bottom-0 w-[1px]" style={{ background: "rgba(0,0,0,0.06)" }} />
                )}
                <div className="absolute left-0 w-2.5 h-2.5 rounded-full bg-black/[0.08] animate-pulse ring-4 ring-white" style={{ top: 3.5 }} />
                <div className="space-y-1.5 ml-2">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-20 rounded bg-black/[0.07] animate-pulse" />
                    <div className="h-3 w-28 rounded bg-black/[0.05] animate-pulse" />
                  </div>
                  <div className="h-2 w-24 rounded bg-black/[0.04] animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : feed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <span className="material-symbols-outlined" style={{ fontSize: 28, color: "var(--color-on-surface-variant)", opacity: 0.2 }}>history</span>
            <p className="font-body-sm text-[12px]" style={{ color: "var(--color-on-surface-variant)", opacity: 0.45 }}>No activity yet</p>
          </div>
        ) : (
          <div className="relative">
            {feed.map((item, idx) => (
              <div key={item.id} className="relative pl-6 pb-7 last:pb-0">
                {/* Vertical connecting line - hidden for the last item */}
                {idx < feed.length - 1 && (
                  <div className="absolute left-[4.5px] top-[14px] bottom-0 w-[1px]" style={{ background: "rgba(0,0,0,0.06)" }} />
                )}

                {/* Timeline Dot — same as ActivityAuditLog */}
                <div
                  className="absolute left-0 w-2.5 h-2.5 rounded-full ring-4 ring-white"
                  style={{ top: 3.5, background: "var(--color-primary)", opacity: 0.8 }}
                />

                {/* Content */}
                <div className="ml-2">
                  {/* Name + action */}
                  <div className="flex items-baseline gap-1.5 flex-wrap mb-1">
                    <span className="font-display font-semibold text-[13px]" style={{ color: "var(--color-on-surface)" }}>
                      {item.user}
                    </span>
                    <span className="font-body-sm text-[13px]" style={{ color: "var(--color-on-surface-variant)", opacity: 0.65 }}>
                      {item.action}
                    </span>
                    <span className="font-display font-semibold text-[13px]" style={{ color: "var(--color-on-surface)", opacity: 0.85 }}>
                      {item.target}
                    </span>
                  </div>

                  {/* Timestamp — same as ActivityAuditLog */}
                  <div className="flex items-center gap-1.5" style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }}>
                    <Clock size={10} strokeWidth={2} />
                    <span className="font-label-caps text-[9px] font-bold tracking-wider">
                      {timeAgo(item.time)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer — pinned to bottom */}
      {!loading && (
        <div className="px-4 py-2.5 border-t shrink-0" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
          <button
            className="w-full font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold flex items-center justify-center gap-1 hover:opacity-70 transition-opacity"
            style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }}
            onClick={() => window.location.href = "/dashboard/activity"}
          >
            View full log
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>arrow_forward</span>
          </button>
        </div>
      )}
    </div>
  );
}
