"use client";

import { useDashboardData } from "@/features/dashboard/context/DashboardDataContext";
import UserAvatar from "@/components/common/UserAvatar";

function SkeletonMember() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-7 h-7 rounded-full bg-black/[0.06] animate-pulse shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-2.5 w-28 rounded bg-black/[0.06] animate-pulse" />
        <div className="h-1 w-full rounded-full bg-black/[0.04] animate-pulse" />
      </div>
    </div>
  );
}

export default function TeamPerformanceWidget() {
  const { data, loading } = useDashboardData();
  const team = data?.teamPerformance.members ?? [];
  const summary = data?.teamPerformance.summary;

  return (
    <div
      className="db-widget rounded-[10px] overflow-hidden flex flex-col h-full"
      style={{ border: "1px solid rgba(0,0,0,0.07)", background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--color-on-surface-variant)", opacity: 0.7 }}>group</span>
          <span className="font-h3 text-[13px] font-semibold text-on-surface">Team</span>
        </div>
        <button
          className="font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold hover:text-primary transition-colors"
          style={{ color: "var(--color-on-surface-variant)", opacity: 0.55 }}
          onClick={() => window.location.href = "/dashboard/members"}
        >
          Manage →
        </button>
      </div>

      <div className="px-4 py-3 space-y-3 max-h-[320px] overflow-y-auto custom-scrollbar flex-1">
        {loading ? (
          [...Array(4)].map((_, i) => <SkeletonMember key={i} />)
        ) : team.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <span className="material-symbols-outlined" style={{ fontSize: 28, color: "var(--color-on-surface-variant)", opacity: 0.25 }}>group</span>
            <p className="font-body-sm text-[12px] text-on-surface-variant opacity-50">No team members yet</p>
          </div>
        ) : (
          team.map((member) => (
            <div key={member.name} className="flex items-center gap-3">
              {/* Avatar */}
              <UserAvatar user={member} size="md" />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1 gap-2">
                  <span className="font-body-md text-[12px] font-semibold text-on-surface truncate flex-1">{member.name}</span>
                  <span
                    className="font-label-caps text-[9px] font-semibold px-1.5 py-0.5 rounded"
                    style={{ background: "rgba(0,0,0,0.04)", color: "var(--color-on-surface-variant)", opacity: 0.7 }}
                  >
                    {member.role}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.06)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${member.load}%`,
                        background: member.load === 100 ? "rgba(0,0,0,0.5)" : "var(--color-primary)",
                        opacity: member.load === 100 ? 0.5 : 1,
                      }}
                    />
                  </div>
                  <span className="font-label-caps text-[9px] font-semibold shrink-0" style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }}>
                    {member.done}/{member.tasks}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer summary */}
      <div className="px-4 py-2.5 border-t flex items-center justify-between mt-auto" style={{ borderColor: "rgba(0,0,0,0.05)", background: "rgba(0,0,0,0.015)" }}>
        {loading ? (
          <div className="h-2.5 w-40 rounded bg-black/[0.05] animate-pulse" />
        ) : (
          <>
            <span className="font-body-sm text-[11px]" style={{ color: "var(--color-on-surface-variant)", opacity: 0.55 }}>
              {summary?.membersCount ?? 0} members · {summary?.tasksCount ?? 0} tasks
            </span>
            <span className="font-label-caps text-[10px] font-semibold" style={{ color: "var(--color-on-surface)", opacity: 0.7 }}>
              {summary?.donePct ?? 0}% done
            </span>
          </>
        )}
      </div>
    </div>
  );
}
