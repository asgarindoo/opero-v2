"use client";

import { useDashboardData } from "@/features/dashboard/context/DashboardDataContext";

const PRIORITY_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  high: { bg: "rgba(186,26,26,0.08)", text: "rgba(186,26,26,0.85)", label: "High" },
  medium: { bg: "rgba(0,0,0,0.06)", text: "rgba(0,0,0,0.65)", label: "Med" },
  low: { bg: "rgba(0,0,0,0.04)", text: "rgba(0,0,0,0.4)", label: "Low" },
};

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  "In Progress": { bg: "rgba(0,0,0,0.06)", text: "rgba(0,0,0,0.7)" },
  "Pending": { bg: "rgba(0,0,0,0.04)", text: "rgba(0,0,0,0.45)" },
  "Review": { bg: "rgba(0,0,0,0.07)", text: "rgba(0,0,0,0.75)" },
  "Done": { bg: "rgba(0,0,0,0.04)", text: "rgba(0,0,0,0.4)" },
  "Todo": { bg: "rgba(0,0,0,0.04)", text: "rgba(0,0,0,0.45)" },
  "Blocked": { bg: "rgba(186,26,26,0.07)", text: "rgba(186,26,26,0.8)" },
};

function formatDue(due: string | null): { label: string; urgent: boolean } {
  if (!due) return { label: "--", urgent: false };
  const today = new Date().toISOString().slice(0, 10);
  const dueDate = String(due).slice(0, 10);
  if (dueDate === today) return { label: "Today", urgent: true };
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (dueDate === tomorrow.toISOString().slice(0, 10)) return { label: "Tomorrow", urgent: false };
  try {
    return { label: new Date(due).toLocaleDateString("en-US", { month: "short", day: "numeric" }), urgent: dueDate < today };
  } catch {
    return { label: String(due), urgent: false };
  }
}

// Skeleton row
function SkeletonRow() {
  return (
    <div className="grid items-center px-4 py-3 border-b" style={{ gridTemplateColumns: "1fr 60px 64px 56px 56px", borderColor: "rgba(0,0,0,0.04)" }}>
      <div className="space-y-1.5 pr-3">
        <div className="h-2 w-16 rounded bg-black/[0.04] animate-pulse" />
        <div className="h-3 w-48 rounded bg-black/[0.06] animate-pulse" />
      </div>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex justify-center"><div className="h-4 w-10 rounded bg-black/[0.04] animate-pulse" /></div>
      ))}
    </div>
  );
}

export default function ActiveTasksWidget() {
  const { data, loading } = useDashboardData();
  const tasks = data?.activeTasks.items ?? [];
  const total = data?.activeTasks.total ?? 0;

  return (
    <div
      className="db-widget rounded-[10px] overflow-hidden flex flex-col"
      style={{ border: "1px solid rgba(0,0,0,0.07)", background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", height: 430 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--color-on-surface-variant)", opacity: 0.7 }}>task_alt</span>
          <span className="font-h3 text-[13px] font-semibold text-on-surface">Active Tasks</span>
          {!loading && (
            <span className="font-label-caps text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(0,0,0,0.06)", color: "var(--color-on-surface-variant)" }}>
              {total}
            </span>
          )}
        </div>
      </div>

      {/* Column headers */}
      <div
        className="grid px-4 py-1.5 font-label-caps text-[9px] uppercase tracking-[0.08em] font-semibold"
        style={{ gridTemplateColumns: "1fr 60px 64px 56px 56px", color: "var(--color-on-surface-variant)", opacity: 0.45, borderBottom: "1px solid rgba(0,0,0,0.04)" }}
      >
        <span>Task</span>
        <span className="text-center">Priority</span>
        <span className="text-center">Status</span>
        <span className="text-center">Due</span>
        <span className="text-center">Progress</span>
      </div>

      {/* Task rows — scrollable, fills remaining height */}
      <div className="flex-1 overflow-y-auto db-sidebar min-h-0">
        {loading ? (
          [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <span className="material-symbols-outlined" style={{ fontSize: 32, color: "var(--color-on-surface-variant)", opacity: 0.25 }}>task_alt</span>
            <p className="font-body-sm text-[12px] text-on-surface-variant opacity-50">No active tasks yet</p>
          </div>
        ) : (
          tasks.map((task, i) => {
            const p = PRIORITY_STYLE[task.priority] ?? PRIORITY_STYLE.medium;
            const s = STATUS_STYLE[task.status] ?? STATUS_STYLE["Pending"];
            const due = formatDue(task.due);
            return (
              <div
                key={task.id}
                className="grid items-center px-4 py-2.5 hover:bg-black/[0.015] transition-colors cursor-pointer border-b"
                style={{ gridTemplateColumns: "1fr 60px 64px 56px 56px", borderColor: "rgba(0,0,0,0.04)", animationDelay: `${i * 60}ms` }}
              >
                {/* Title + meta */}
                <div className="min-w-0 pr-3">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {task.labels.slice(0, 2).map((l) => (
                      <span key={l} className="font-label-caps text-[8px] font-semibold px-1.5 py-px rounded" style={{ background: "rgba(0,0,0,0.04)", color: "var(--color-on-surface-variant)", opacity: 0.7 }}>
                        {l}
                      </span>
                    ))}
                  </div>
                  <p className="font-body-md text-[12.5px] font-medium text-on-surface truncate">{task.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {(task.assignees ?? []).length > 0 ? (
                      <div className="flex items-center -space-x-1">
                        {(task.assignees ?? []).slice(0, 4).map((a, idx) => (
                          <div
                            key={a.id || idx}
                            title={a.name}
                            className="w-4 h-4 rounded-full border border-white flex items-center justify-center font-display font-bold text-[7px]"
                            style={{ background: "var(--color-surface-container-highest)", color: "var(--color-on-surface)" }}
                          >
                            {a.initials}
                          </div>
                        ))}
                        {(task.assignees ?? []).length > 4 && (
                          <div className="w-4 h-4 rounded-full border border-white flex items-center justify-center font-display font-bold text-[7px]" style={{ background: "rgba(0,0,0,0.08)", color: "var(--color-on-surface-variant)" }}>
                            +{(task.assignees ?? []).length - 4}
                          </div>
                        )}
                      </div>
                    ) : null}
                    {task.checklist.total > 0 && (
                      <span className="font-body-sm text-[10px]" style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }}>
                        {task.checklist.done}/{task.checklist.total} steps
                      </span>
                    )}
                  </div>
                </div>

                {/* Priority */}
                <div className="flex justify-center">
                  <span className="font-label-caps text-[9px] font-semibold px-1.5 py-0.5 rounded" style={{ background: p.bg, color: p.text }}>{p.label}</span>
                </div>

                {/* Status */}
                <div className="flex justify-center">
                  <span className="font-label-caps text-[9px] font-semibold px-1.5 py-0.5 rounded whitespace-nowrap" style={{ background: s.bg, color: s.text }}>{task.status}</span>
                </div>

                {/* Due */}
                <div className="flex justify-center">
                  <span className="font-body-sm text-[10px] font-medium" style={{ color: due.urgent ? "rgba(186,26,26,0.8)" : "var(--color-on-surface-variant)", opacity: due.urgent ? 1 : 0.6 }}>
                    {due.label}
                  </span>
                </div>

                {/* Progress */}
                <div className="flex flex-col items-center gap-1">
                  <span className="font-label-caps text-[9px] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.6 }}>{task.progress}%</span>
                  <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.06)" }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${task.progress}%`, background: "var(--color-primary)" }} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {!loading && (
        <div className="px-4 py-2.5 flex items-center justify-between border-t shrink-0" style={{ borderColor: "rgba(0,0,0,0.04)" }}>
          <span className="font-body-sm text-[11px]" style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }}>
            {total === 0 ? "No tasks" : `Showing ${Math.min(tasks.length, total)} of ${total} task${total !== 1 ? "s" : ""}`}
          </span>
          <button
            className="font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold flex items-center gap-1 hover:text-primary transition-colors"
            style={{ color: "var(--color-on-surface-variant)", opacity: 0.6 }}
            onClick={() => window.location.href = "/dashboard/tasks"}
          >
            View all
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>arrow_forward</span>
          </button>
        </div>
      )}
    </div>
  );
}
