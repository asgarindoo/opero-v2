const AUTOMATIONS = [
  {
    name: "Lead Capture → Task",
    trigger: "WhatsApp message",
    status: "active",
    runs: 48,
    lastRun: "4m ago",
    platform: "smart_toy",
  },
  {
    name: "Overdue → Notify Admin",
    trigger: "Task overdue",
    status: "active",
    runs: 12,
    lastRun: "1h ago",
    platform: "notifications",
  },
  {
    name: "Complaint → Assign Lead",
    trigger: "Telegram complaint",
    status: "active",
    runs: 7,
    lastRun: "3h ago",
    platform: "smart_toy",
  },
  {
    name: "Payment Received → Invoice",
    trigger: "Finance event",
    status: "paused",
    runs: 0,
    lastRun: "2d ago",
    platform: "payments",
  },
];

export default function AutomationStatusWidget() {
  return (
    <div
      className="db-widget rounded-[10px] overflow-hidden"
      style={{ border: "1px solid rgba(0,0,0,0.07)", background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--color-on-surface-variant)", opacity: 0.7 }}>
            bolt
          </span>
          <span className="font-h3 text-[13px] font-semibold text-on-surface">Automations</span>
          <span className="font-label-caps text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(0,0,0,0.06)", color: "var(--color-on-surface-variant)" }}>
            {AUTOMATIONS.filter(a => a.status === "active").length} active
          </span>
        </div>
        <button className="font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold hover:text-primary transition-colors" style={{ color: "var(--color-on-surface-variant)", opacity: 0.55 }}>
          Manage →
        </button>
      </div>

      <div className="px-4 py-3 space-y-2">
        {AUTOMATIONS.map((auto) => (
          <div
            key={auto.name}
            className="flex items-center gap-3 p-2.5 rounded-[6px] hover:bg-black/[0.02] transition-colors cursor-pointer"
            style={{ border: "1px solid rgba(0,0,0,0.04)" }}
          >
            {/* Status dot */}
            <div className="relative shrink-0">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: auto.status === "active" ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.2)" }}
              />
              {auto.status === "active" && (
                <div
                  className="absolute inset-0 rounded-full animate-ping"
                  style={{ background: "rgba(0,0,0,0.2)", animationDuration: "2s" }}
                />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-body-md text-[12px] font-semibold text-on-surface truncate">{auto.name}</span>
                <span
                  className="font-label-caps text-[8px] font-semibold px-1.5 py-0.5 rounded ml-2 shrink-0"
                  style={{
                    background: auto.status === "active" ? "rgba(0,0,0,0.06)" : "rgba(0,0,0,0.03)",
                    color: auto.status === "active" ? "var(--color-on-surface)" : "var(--color-on-surface-variant)",
                    opacity: auto.status === "active" ? 1 : 0.6,
                  }}
                >
                  {auto.status}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="material-symbols-outlined" style={{ fontSize: 10, color: "var(--color-on-surface-variant)", opacity: 0.5 }}>
                  {auto.platform}
                </span>
                <span className="font-body-sm text-[10px]" style={{ color: "var(--color-on-surface-variant)", opacity: 0.55 }}>
                  {auto.trigger} · {auto.runs} runs · {auto.lastRun}
                </span>
              </div>
            </div>

            {/* Toggle */}
            <div
              className="shrink-0 w-8 h-4 rounded-full relative cursor-pointer transition-colors duration-200"
              style={{ background: auto.status === "active" ? "var(--color-primary)" : "rgba(0,0,0,0.12)" }}
            >
              <div
                className="absolute top-0.5 w-3 h-3 rounded-full transition-all duration-200"
                style={{ background: "#fff", left: auto.status === "active" ? "calc(100% - 14px)" : "2px" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
