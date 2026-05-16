const TASKS = [
  {
    id: "T-041", title: "Revamp client onboarding deck",
    priority: "high", status: "In Progress", assignee: "AR",
    due: "Today", labels: ["Design", "Client"],
    checklist: { done: 3, total: 5 }, progress: 60,
  },
  {
    id: "T-042", title: "Set up WhatsApp bot for CS team",
    priority: "medium", status: "In Progress", assignee: "BK",
    due: "Tomorrow", labels: ["Bot", "Automation"],
    checklist: { done: 1, total: 4 }, progress: 25,
  },
  {
    id: "T-043", title: "Write Q2 financial summary report",
    priority: "high", status: "Pending", assignee: "CR",
    due: "May 10", labels: ["Finance"],
    checklist: { done: 0, total: 3 }, progress: 0,
  },
  {
    id: "T-044", title: "Review vendor proposal for office supplies",
    priority: "low", status: "Pending", assignee: "DS",
    due: "May 12", labels: ["Operations"],
    checklist: { done: 2, total: 2 }, progress: 100,
  },
  {
    id: "T-045", title: "Deploy automation: lead capture → task",
    priority: "medium", status: "Review", assignee: "EF",
    due: "May 9", labels: ["Automation"],
    checklist: { done: 4, total: 4 }, progress: 90,
  },
];

const PRIORITY_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  high:   { bg: "rgba(186,26,26,0.08)",  text: "rgba(186,26,26,0.85)",  label: "High" },
  medium: { bg: "rgba(0,0,0,0.06)",      text: "rgba(0,0,0,0.65)",      label: "Med"  },
  low:    { bg: "rgba(0,0,0,0.04)",      text: "rgba(0,0,0,0.4)",       label: "Low"  },
};

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  "In Progress": { bg: "rgba(0,0,0,0.06)",     text: "rgba(0,0,0,0.7)"   },
  "Pending":     { bg: "rgba(0,0,0,0.04)",     text: "rgba(0,0,0,0.45)"  },
  "Review":      { bg: "rgba(0,0,0,0.07)",     text: "rgba(0,0,0,0.75)"  },
  "Done":        { bg: "rgba(0,0,0,0.04)",     text: "rgba(0,0,0,0.4)"   },
};

export default function ActiveTasksWidget() {
  return (
    <div
      className="db-widget rounded-[10px] overflow-hidden"
      style={{ border: "1px solid rgba(0,0,0,0.07)", background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--color-on-surface-variant)", opacity: 0.7 }}>
            task_alt
          </span>
          <span className="font-h3 text-[13px] font-semibold text-on-surface">Active Tasks</span>
          <span
            className="font-label-caps text-[9px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ background: "rgba(0,0,0,0.06)", color: "var(--color-on-surface-variant)" }}
          >
            {TASKS.length}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            className="font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold flex items-center gap-1 px-2 py-1 rounded-[4px] hover:bg-black/[0.04] transition-colors"
            style={{ color: "var(--color-on-surface-variant)", opacity: 0.6 }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>filter_list</span>
            Filter
          </button>
          <button
            className="font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold flex items-center gap-1 px-2.5 py-1 rounded-[4px] transition-colors"
            style={{ border: "1px solid rgba(0,0,0,0.1)", color: "var(--color-on-surface)" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>add</span>
            Add Task
          </button>
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

      {/* Task rows */}
      <div>
        {TASKS.map((task, i) => {
          const p = PRIORITY_STYLE[task.priority];
          const s = STATUS_STYLE[task.status] ?? STATUS_STYLE["Pending"];
          return (
            <div
              key={task.id}
              className="grid items-center px-4 py-2.5 hover:bg-black/[0.015] transition-colors cursor-pointer border-b"
              style={{ gridTemplateColumns: "1fr 60px 64px 56px 56px", borderColor: "rgba(0,0,0,0.04)", animationDelay: `${i * 60}ms` }}
            >
              {/* Title + meta */}
              <div className="min-w-0 pr-3">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="font-label-caps text-[9px] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.45 }}>
                    {task.id}
                  </span>
                  {task.labels.map((l) => (
                    <span
                      key={l}
                      className="font-label-caps text-[8px] font-semibold px-1.5 py-px rounded"
                      style={{ background: "rgba(0,0,0,0.04)", color: "var(--color-on-surface-variant)", opacity: 0.7 }}
                    >
                      {l}
                    </span>
                  ))}
                </div>
                <p className="font-body-md text-[12.5px] font-medium text-on-surface truncate">{task.title}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center font-display font-bold text-[8px]"
                    style={{ background: "var(--color-surface-container-highest)", color: "var(--color-on-surface)" }}
                  >
                    {task.assignee}
                  </div>
                  <span className="font-body-sm text-[10px]" style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }}>
                    {task.checklist.done}/{task.checklist.total} steps
                  </span>
                </div>
              </div>

              {/* Priority */}
              <div className="flex justify-center">
                <span
                  className="font-label-caps text-[9px] font-semibold px-1.5 py-0.5 rounded"
                  style={{ background: p.bg, color: p.text }}
                >
                  {p.label}
                </span>
              </div>

              {/* Status */}
              <div className="flex justify-center">
                <span
                  className="font-label-caps text-[9px] font-semibold px-1.5 py-0.5 rounded whitespace-nowrap"
                  style={{ background: s.bg, color: s.text }}
                >
                  {task.status}
                </span>
              </div>

              {/* Due date */}
              <div className="flex justify-center">
                <span
                  className="font-body-sm text-[10px] font-medium"
                  style={{ color: task.due === "Today" ? "rgba(186,26,26,0.8)" : "var(--color-on-surface-variant)", opacity: task.due === "Today" ? 1 : 0.6 }}
                >
                  {task.due}
                </span>
              </div>

              {/* Progress */}
              <div className="flex flex-col items-center gap-1">
                <span className="font-label-caps text-[9px] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.6 }}>
                  {task.progress}%
                </span>
                <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.06)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${task.progress}%`, background: "var(--color-primary)" }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 flex items-center justify-between">
        <span className="font-body-sm text-[11px]" style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }}>
          Showing 5 of 24 tasks
        </span>
        <button className="font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold flex items-center gap-1 hover:text-primary transition-colors" style={{ color: "var(--color-on-surface-variant)", opacity: 0.6 }}>
          View all
          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
