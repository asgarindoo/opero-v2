const BOARDS = [
  {
    name: "Client Requests",
    color: "rgba(0,0,0,0.7)",
    columns: [
      { name: "Inbox",       count: 7 },
      { name: "In Progress", count: 4 },
      { name: "Review",      count: 2 },
      { name: "Done",        count: 18 },
    ],
    total: 31,
  },
  {
    name: "Operations Flow",
    color: "rgba(0,0,0,0.55)",
    columns: [
      { name: "Pending",     count: 5 },
      { name: "Active",      count: 6 },
      { name: "Review",      count: 1 },
      { name: "Completed",   count: 12 },
    ],
    total: 24,
  },
  {
    name: "Support Handling",
    color: "rgba(0,0,0,0.4)",
    columns: [
      { name: "Open",        count: 9 },
      { name: "Handling",    count: 3 },
      { name: "Resolved",    count: 22 },
      { name: "Closed",      count: 14 },
    ],
    total: 48,
  },
];

export default function WorkflowProgressWidget() {
  return (
    <div
      className="db-widget rounded-[10px] overflow-hidden"
      style={{ border: "1px solid rgba(0,0,0,0.07)", background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--color-on-surface-variant)", opacity: 0.7 }}>
            view_kanban
          </span>
          <span className="font-h3 text-[13px] font-semibold text-on-surface">Active Boards</span>
          <span className="font-label-caps text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(0,0,0,0.06)", color: "var(--color-on-surface-variant)" }}>
            {BOARDS.length}
          </span>
        </div>
        <button className="font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold hover:text-primary transition-colors" style={{ color: "var(--color-on-surface-variant)", opacity: 0.55 }}>
          All boards →
        </button>
      </div>

      <div className="px-4 py-3 space-y-4">
        {BOARDS.map((board) => {
          const doneCol = board.columns[board.columns.length - 1];
          const donePercent = Math.round((doneCol.count / board.total) * 100);
          return (
            <div key={board.name} className="cursor-pointer group">
              {/* Board name */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-body-md text-[12.5px] font-semibold text-on-surface group-hover:text-primary transition-colors">
                  {board.name}
                </span>
                <span className="font-label-caps text-[9px] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }}>
                  {board.total} items
                </span>
              </div>

              {/* Column flow bar */}
              <div className="flex gap-px h-1.5 rounded-full overflow-hidden mb-2">
                {board.columns.map((col, i) => (
                  <div
                    key={col.name}
                    className="transition-all duration-300"
                    style={{
                      flex: col.count,
                      background: `rgba(0,0,0,${0.12 + i * 0.18})`,
                    }}
                  />
                ))}
              </div>

              {/* Column counts */}
              <div className="flex items-center gap-3 flex-wrap">
                {board.columns.map((col) => (
                  <div key={col.name} className="flex items-center gap-1">
                    <span className="font-label-caps text-[9px] uppercase tracking-[0.05em] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }}>
                      {col.name}
                    </span>
                    <span className="font-label-caps text-[10px] font-bold" style={{ color: "var(--color-on-surface)", opacity: 0.7 }}>
                      {col.count}
                    </span>
                  </div>
                ))}
                <div className="ml-auto">
                  <span className="font-label-caps text-[9px] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }}>
                    {donePercent}% complete
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
