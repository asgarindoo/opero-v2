import React, { useState, useEffect } from "react";
import { Check, Search, X } from "lucide-react";
import { listTasks, type Task } from "@/features/tasks";

export function TaskSelector({
  selectedTasks,
  onSelect
}: {
  selectedTasks: Task[];
  onSelect: (task: Task) => void;
}) {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && allTasks.length === 0) {
      setLoading(true);
      listTasks<Task>()
        .then(setAllTasks)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [open, allTasks.length]);

  const availableTasks = allTasks.filter((t) => !selectedTasks.some((s) => s.id === t.id));
  const filtered = availableTasks.filter((t) =>
    (t.title || "").toLowerCase().includes(query.toLowerCase()) ||
    (t.id || "").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] hover:bg-black/[0.04] transition-colors font-label-caps text-[9px] font-semibold uppercase tracking-[0.08em]"
        style={{ border: "1px dashed rgba(0,0,0,0.18)", color: "var(--color-on-surface-variant)", opacity: 0.7 }}
      >
        + Add Task
      </button>

      {open && (
        <div className="mt-2 w-full z-10 rounded-[10px] overflow-hidden border bg-white shadow-sm" style={{ borderColor: "rgba(0,0,0,0.1)" }}>
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-b" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
            <Search size={12} strokeWidth={1.75} style={{ color: "var(--color-on-surface-variant)", opacity: 0.45, flexShrink: 0 }} />
            <input
              autoFocus
              placeholder="Search tasks…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none font-body-md text-[12px]"
              style={{ color: "var(--color-on-surface)" }}
            />
          </div>

          {/* List */}
          <div className="max-h-48 overflow-y-auto py-1">
            {loading ? (
              <div className="px-4 py-6 flex flex-col items-center justify-center text-center">
                <p className="font-body-sm text-[11px] text-on-surface-variant opacity-60">Loading tasks...</p>
              </div>
            ) : filtered.length > 0 ? (
              filtered.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    onSelect(t);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-black/[0.03] transition-colors text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-body-md text-[12px] font-medium truncate" style={{ color: "var(--color-on-surface)" }}>
                      {t.title}
                    </div>
                    <div className="font-body-sm text-[10px] uppercase" style={{ color: "var(--color-on-surface-variant)", opacity: 0.55 }}>
                      {t.status}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-6 flex flex-col items-center justify-center text-center">
                <p className="font-display text-[12px] font-medium text-on-surface mb-1">No tasks available</p>
                <p className="font-body-sm text-[11px] text-on-surface-variant opacity-60 max-w-[200px]">
                  All tasks are already attached, or no tasks exist.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-3 py-2 border-t flex justify-end" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
            <button type="button" onClick={() => setOpen(false)} className="font-label-caps text-[9px] font-semibold px-2.5 py-1 rounded-[5px] hover:bg-black/[0.05] transition-colors uppercase tracking-[0.06em]" style={{ color: "var(--color-on-surface-variant)", opacity: 0.7 }}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
