const METRICS = [
  {
    label: "Tasks Completed",
    value: "76",
    suffix: "",
    delta: "+12",
    icon: "task_alt",
    trend: [30, 45, 40, 60, 55, 70, 76],
  },
  {
    label: "Automation Runs",
    value: "143",
    suffix: "",
    delta: "+28",
    icon: "bolt",
    trend: [80, 95, 88, 110, 120, 135, 143],
  },
  {
    label: "Inbox Messages",
    value: "38",
    suffix: "",
    delta: "+5",
    icon: "inbox",
    trend: [20, 25, 22, 30, 28, 35, 38],
  },
  {
    label: "Bot Conversions",
    value: "24",
    suffix: "",
    delta: "+8",
    icon: "smart_toy",
    trend: [10, 12, 14, 16, 18, 22, 24],
  },
];

export default function PerformanceMetricsWidget() {
  return (
    <div
      className="db-widget rounded-[10px] overflow-hidden"
      style={{ border: "1px solid rgba(0,0,0,0.07)", background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--color-on-surface-variant)", opacity: 0.7 }}>
            insights
          </span>
          <span className="font-h3 text-[13px] font-semibold text-on-surface">Performance</span>
        </div>
        <span className="font-label-caps text-[9px] uppercase tracking-[0.07em] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.4 }}>
          This week
        </span>
      </div>

      <div className="px-4 py-3 grid grid-cols-2 gap-3">
        {METRICS.map((m) => {
          const max = Math.max(...m.trend);
          return (
            <div
              key={m.label}
              className="p-3 rounded-[6px] cursor-pointer hover:bg-black/[0.02] transition-colors"
              style={{ border: "1px solid rgba(0,0,0,0.05)" }}
            >
              {/* Icon + delta */}
              <div className="flex items-center justify-between mb-2">
                <div
                  className="w-6 h-6 rounded-[4px] flex items-center justify-center"
                  style={{ background: "rgba(0,0,0,0.04)" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 13, color: "var(--color-on-surface-variant)", opacity: 0.7 }}>
                    {m.icon}
                  </span>
                </div>
                <span
                  className="font-label-caps text-[9px] font-bold px-1.5 py-0.5 rounded"
                  style={{ background: "rgba(0,0,0,0.04)", color: "var(--color-on-surface)", opacity: 0.6 }}
                >
                  +{m.delta}
                </span>
              </div>

              {/* Value */}
              <div className="font-display text-[22px] font-bold text-on-surface leading-none mb-0.5">
                {m.value}
              </div>
              <div className="font-body-sm text-[10px] mb-2" style={{ color: "var(--color-on-surface-variant)", opacity: 0.55 }}>
                {m.label}
              </div>

              {/* Spark line */}
              <div className="flex items-end gap-px h-5">
                {m.trend.map((v, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-[1px] animate-grow-up"
                    style={{
                      height: `${(v / max) * 100}%`,
                      background: i === m.trend.length - 1 ? "var(--color-primary)" : "rgba(0,0,0,0.1)",
                      animationDelay: `${i * 60}ms`,
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
