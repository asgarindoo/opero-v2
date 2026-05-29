"use client";

import { useDashboardData } from "@/features/dashboard/context/DashboardDataContext";

function SkeletonBoard() {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <div className="h-3 w-28 rounded bg-black/[0.06] animate-pulse" />
        <div className="h-2.5 w-12 rounded bg-black/[0.04] animate-pulse" />
      </div>
      <div className="flex gap-px h-1.5 rounded-full overflow-hidden bg-black/[0.04] animate-pulse" />
      <div className="flex gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-2 w-14 rounded bg-black/[0.03] animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default function WorkflowProgressWidget() {
  const { data, loading } = useDashboardData();
  const boards = data?.workflowProgress.boards ?? [];

  return (
    <div
      className="db-widget rounded-[10px] overflow-hidden"
      style={{ border: "1px solid rgba(0,0,0,0.07)", background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--color-on-surface-variant)", opacity: 0.7 }}>view_kanban</span>
          <span className="font-h3 text-[13px] font-semibold text-on-surface">Active Flows</span>
          {!loading && (
            <span className="font-label-caps text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(0,0,0,0.06)", color: "var(--color-on-surface-variant)" }}>
              {boards.length}
            </span>
          )}
        </div>
        <button
          className="font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold hover:text-primary transition-colors"
          style={{ color: "var(--color-on-surface-variant)", opacity: 0.55 }}
          onClick={() => window.location.href = "/dashboard/flows"}
        >
          All flows →
        </button>
      </div>

      <div className="px-4 py-3 space-y-4 max-h-[320px] overflow-y-auto custom-scrollbar">
        {loading ? (
          [...Array(3)].map((_, i) => <SkeletonBoard key={i} />)
        ) : boards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <span className="material-symbols-outlined" style={{ fontSize: 28, color: "var(--color-on-surface-variant)", opacity: 0.25 }}>view_kanban</span>
            <p className="font-body-sm text-[12px] text-on-surface-variant opacity-50">No active flows yet</p>
            <button
              className="font-label-caps text-[10px] font-semibold px-3 py-1.5 rounded-[5px] transition-colors hover:bg-black/[0.04]"
              style={{ color: "var(--color-primary)", border: "1px solid rgba(0,0,0,0.08)" }}
              onClick={() => window.location.href = "/dashboard/flows"}
            >
              Create a flow →
            </button>
          </div>
        ) : (
          boards.map((board, boardIndex) => {
            const lastCol = board.columns[board.columns.length - 1];
            const donePercent = lastCol ? Math.round((lastCol.count / Math.max(board.total, 1)) * 100) : 0;
            return (
              <div key={board.id ?? `${board.name}-${boardIndex}`} className="cursor-pointer group">
                {/* Board name */}
                <div className="flex items-center justify-between mb-2 gap-3">
                  <span className="font-body-md text-[12.5px] font-semibold text-on-surface group-hover:text-primary transition-colors truncate flex-1">
                    {board.name}
                  </span>
                  <span className="font-label-caps text-[9px] font-semibold whitespace-nowrap" style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }}>
                    {board.total} items
                  </span>
                </div>

                {/* Column flow bar */}
                <div className="flex gap-px h-1.5 rounded-full overflow-hidden mb-2">
                  {board.columns.map((col, i) => (
                    <div
                      key={`${col.name}-${i}`}
                      className="transition-all duration-300"
                      style={{
                        flex: col.count || 0.5,
                        background: `rgba(0,0,0,${0.12 + i * 0.18})`,
                      }}
                    />
                  ))}
                </div>

                {/* Column counts */}
                <div className="flex items-center gap-3 flex-wrap">
                  {board.columns.map((col, i) => (
                    <div key={`${col.name}-${i}`} className="flex items-center gap-1">
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
          })
        )}
      </div>
    </div>
  );
}
