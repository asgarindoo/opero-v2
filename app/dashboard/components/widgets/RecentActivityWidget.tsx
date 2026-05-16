const FEED = [
  { icon: "task_alt",   user: "Andi R.",   action: "completed",   target: "Client proposal draft",       time: "2m",  color: "rgba(0,0,0,0.7)"  },
  { icon: "bolt",       user: "System",    action: "triggered",   target: "Lead capture automation",     time: "8m",  color: "rgba(0,0,0,0.55)" },
  { icon: "forum",      user: "Budi K.",   action: "commented on",target: "Design Sprint discussion",    time: "14m", color: "rgba(0,0,0,0.6)"  },
  { icon: "group",      user: "Admin",     action: "invited",     target: "Clara to workspace",          time: "1h",  color: "rgba(0,0,0,0.5)"  },
  { icon: "view_kanban",user: "Dewi S.",   action: "moved",       target: "Vendor review → In Progress", time: "2h",  color: "rgba(0,0,0,0.5)"  },
  { icon: "smart_toy",  user: "Bot",       action: "converted",   target: "3 messages → Tasks",          time: "3h",  color: "rgba(0,0,0,0.45)" },
  { icon: "payments",   user: "Eko F.",    action: "logged",      target: "Invoice #INV-089 paid",       time: "4h",  color: "rgba(0,0,0,0.4)"  },
];

export default function RecentActivityWidget() {
  return (
    <div
      className="db-widget rounded-[10px] overflow-hidden"
      style={{ border: "1px solid rgba(0,0,0,0.07)", background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--color-on-surface-variant)", opacity: 0.7 }}>
            timeline
          </span>
          <span className="font-h3 text-[13px] font-semibold text-on-surface">Activity Log</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "rgba(0,0,0,0.4)" }} />
          <span className="font-label-caps text-[9px] uppercase tracking-[0.07em] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.45 }}>
            Live
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="px-4 py-3 space-y-0">
        {FEED.map((item, i) => (
          <div key={i} className="flex items-start gap-3 py-2.5 border-b last:border-0" style={{ borderColor: "rgba(0,0,0,0.04)" }}>
            {/* Timeline line + icon */}
            <div className="flex flex-col items-center shrink-0 mt-0.5">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.04)" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 12, color: "var(--color-on-surface-variant)", opacity: 0.65 }}>
                  {item.icon}
                </span>
              </div>
              {i < FEED.length - 1 && (
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
                {item.time} ago
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        <button className="w-full font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold flex items-center justify-center gap-1 hover:text-primary transition-colors" style={{ color: "var(--color-on-surface-variant)", opacity: 0.55 }}>
          View full log
          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
