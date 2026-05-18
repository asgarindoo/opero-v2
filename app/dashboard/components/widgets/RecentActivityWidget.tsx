"use client";

import { useDashboardData } from "../DashboardDataContext";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function SkeletonItem() {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b" style={{ borderColor: "rgba(0,0,0,0.04)" }}>
      <div className="w-6 h-6 rounded-full bg-black/[0.05] animate-pulse shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-2.5 w-40 rounded bg-black/[0.05] animate-pulse" />
        <div className="h-2 w-16 rounded bg-black/[0.03] animate-pulse" />
      </div>
    </div>
  );
}

export default function RecentActivityWidget() {
  const { data, loading } = useDashboardData();
  const feed = data?.recentActivity.items ?? [];

  return (
    <div
      className="db-widget rounded-[10px] overflow-hidden flex flex-col h-full"
      style={{ border: "1px solid rgba(0,0,0,0.07)", background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--color-on-surface-variant)", opacity: 0.7 }}>timeline</span>
          <span className="font-h3 text-[13px] font-semibold text-on-surface">Activity Log</span>
        </div>
      </div>

      {/* Timeline — scrollable, fills remaining height */}
      <div className="flex-1 overflow-y-auto db-sidebar px-4 py-3 min-h-0">
        {loading ? (
          [...Array(6)].map((_, i) => <SkeletonItem key={i} />)
        ) : feed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <span className="material-symbols-outlined" style={{ fontSize: 28, color: "var(--color-on-surface-variant)", opacity: 0.25 }}>history</span>
            <p className="font-body-sm text-[12px] text-on-surface-variant opacity-50">No activity yet</p>
          </div>
        ) : (
          feed.map((item, i) => (
            <div key={item.id} className="flex items-start gap-3 py-2.5 border-b last:border-0" style={{ borderColor: "rgba(0,0,0,0.04)" }}>
              {/* Timeline line + icon */}
              <div className="flex flex-col items-center shrink-0 mt-0.5">
                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.04)" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 12, color: "var(--color-on-surface-variant)", opacity: 0.65 }}>
                    {item.icon}
                  </span>
                </div>
                {i < feed.length - 1 && (
                  <div className="w-px flex-1 mt-1 mb-0" style={{ minHeight: 12, background: "rgba(0,0,0,0.06)" }} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="font-body-sm text-[12px] leading-snug" style={{ color: "var(--color-on-surface)", opacity: 0.85 }}>
                  <span className="font-semibold">{item.user}</span>
                  {" "}<span style={{ opacity: 0.6 }}>{item.action}</span>
                  {" "}<span className="font-medium">{item.target}</span>
                </p>
                <span className="font-label-caps text-[9px] uppercase tracking-[0.05em]" style={{ color: "var(--color-on-surface-variant)", opacity: 0.4 }}>
                  {timeAgo(item.time)} ago
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer — pinned to bottom */}
      {!loading && (
        <div className="px-4 py-2.5 border-t shrink-0" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
          <button
            className="w-full font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold flex items-center justify-center gap-1 hover:opacity-80 transition-opacity"
            style={{ color: "var(--color-on-surface-variant)", opacity: 0.55 }}
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
