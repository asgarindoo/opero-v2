const BARS = [
  { day: "Mon", tasks: 8,  height: 40 },
  { day: "Tue", tasks: 14, height: 70 },
  { day: "Wed", tasks: 11, height: 55 },
  { day: "Thu", tasks: 18, height: 90 },
  { day: "Fri", tasks: 16, height: 80 },
  { day: "Sat", tasks: 6,  height: 30 },
  { day: "Sun", tasks: 3,  height: 15 },
];

const METRICS = [
  { label: "Tasks completed",   value: "76",    delta: "+12%", up: true },
  { label: "Avg. completion",   value: "2.4d",  delta: "-0.6d", up: true },
  { label: "Blocked tasks",     value: "3",     delta: "-2", up: true },
  { label: "On-time rate",      value: "88%",   delta: "+4%", up: true },
];

export default function ProductivityWidget() {
  return (
    <div
      className="db-widget rounded-[10px] overflow-hidden"
      style={{ border: "1px solid rgba(0,0,0,0.07)", background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--color-on-surface-variant)", opacity: 0.7 }}>
            bar_chart
          </span>
          <span className="font-h3 text-[13px] font-semibold text-on-surface">Productivity</span>
        </div>
        <div className="flex items-center gap-1">
          {["Week", "Month"].map((p) => (
            <button
              key={p}
              className="font-label-caps text-[9px] uppercase tracking-[0.06em] font-semibold px-2 py-1 rounded transition-colors"
              style={{
                background: p === "Week" ? "rgba(0,0,0,0.06)" : "transparent",
                color: p === "Week" ? "var(--color-on-surface)" : "var(--color-on-surface-variant)",
                opacity: p === "Week" ? 1 : 0.5,
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
          {BARS.map((bar, i) => (
            <div key={bar.day} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t-[3px] animate-grow-up relative group" style={{ height: `${bar.height}%`, background: i === 3 ? "var(--color-primary)" : "rgba(0,0,0,0.10)", animationDelay: `${i * 80}ms` }}>
                {/* Tooltip */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center whitespace-nowrap">
                  <span className="font-label-caps text-[9px] font-semibold px-1.5 py-0.5 rounded" style={{ background: "var(--color-primary)", color: "#fff" }}>
                    {bar.tasks}
                  </span>
                </div>
              </div>
              <span className="font-label-caps text-[8px] uppercase tracking-[0.04em] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.45 }}>
                {bar.day}
              </span>
            </div>
          ))}
        </div>

        {/* Metric chips */}
        <div className="grid grid-cols-2 gap-2">
          {METRICS.map((m) => (
            <div key={m.label} className="p-2.5 rounded-[6px]" style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.05)" }}>
              <div className="font-display text-[20px] font-bold text-on-surface leading-none mb-0.5">{m.value}</div>
              <div className="font-body-sm text-[10px]" style={{ color: "var(--color-on-surface-variant)", opacity: 0.6 }}>{m.label}</div>
              <div className="font-label-caps text-[9px] font-semibold mt-1" style={{ color: m.up ? "rgba(0,0,0,0.6)" : "rgba(186,26,26,0.7)" }}>
                {m.delta} this week
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
