const TEAM = [
  { name: "Andi R.",   role: "Lead",    tasks: 12, done: 10, initials: "AR", load: 83 },
  { name: "Budi K.",   role: "Staff",   tasks: 8,  done: 5,  initials: "BK", load: 62 },
  { name: "Clara S.",  role: "Admin",   tasks: 6,  done: 6,  initials: "CS", load: 100 },
  { name: "Dewi F.",   role: "Staff",   tasks: 9,  done: 4,  initials: "DF", load: 44 },
  { name: "Eko P.",    role: "Staff",   tasks: 7,  done: 7,  initials: "EP", load: 100 },
];

export default function TeamPerformanceWidget() {
  return (
    <div
      className="db-widget rounded-[10px] overflow-hidden"
      style={{ border: "1px solid rgba(0,0,0,0.07)", background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--color-on-surface-variant)", opacity: 0.7 }}>
            group
          </span>
          <span className="font-h3 text-[13px] font-semibold text-on-surface">Team</span>
        </div>
        <button className="font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold hover:text-primary transition-colors" style={{ color: "var(--color-on-surface-variant)", opacity: 0.55 }}>
          Manage →
        </button>
      </div>

      <div className="px-4 py-3 space-y-3">
        {TEAM.map((member) => (
          <div key={member.name} className="flex items-center gap-3">
            {/* Avatar */}
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center font-display font-bold text-[10px] shrink-0"
              style={{ background: "var(--color-surface-container-highest)", color: "var(--color-on-surface)" }}
            >
              {member.initials}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="font-body-md text-[12px] font-semibold text-on-surface">{member.name}</span>
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
                    style={{ width: `${member.load}%`, background: member.load === 100 ? "rgba(0,0,0,0.5)" : "var(--color-primary)", opacity: member.load === 100 ? 0.5 : 1 }}
                  />
                </div>
                <span className="font-label-caps text-[9px] font-semibold shrink-0" style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }}>
                  {member.done}/{member.tasks}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer summary */}
      <div className="px-4 py-2.5 border-t flex items-center justify-between" style={{ borderColor: "rgba(0,0,0,0.05)", background: "rgba(0,0,0,0.015)" }}>
        <span className="font-body-sm text-[11px]" style={{ color: "var(--color-on-surface-variant)", opacity: 0.55 }}>
          5 members · 42 tasks this week
        </span>
        <span className="font-label-caps text-[10px] font-semibold" style={{ color: "var(--color-on-surface)", opacity: 0.7 }}>
          76% done
        </span>
      </div>
    </div>
  );
}
