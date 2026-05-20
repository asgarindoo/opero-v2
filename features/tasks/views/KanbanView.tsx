"use client";

import { useState, useRef } from "react";
import { Plus } from "lucide-react";
import type { Task, Status } from "@/features/tasks";
import { STATUS_META, PRIORITY_META, ALL_STATUSES } from "@/features/tasks";

interface Props {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: (status: Status) => void;
  onStatusChange: (taskId: string, status: Status) => void;
}

function KanbanCard({ task, onClick, onDragStart }: { task: Task; onClick: () => void; onDragStart: () => void }) {
  const pm = PRIORITY_META[task.priority] || { label: task.priority || "None", bg: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.6)" };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="rounded-[8px] p-3 cursor-pointer hover:shadow-md transition-all hover:-translate-y-px select-none"
      style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
    >
      {/* Labels */}
      {task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.labels.slice(0, 3).map(l => (
            <span key={l} className="font-label-caps text-[8px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(0,0,0,0.05)", color: "var(--color-on-surface-variant)" }}>{l}</span>
          ))}
        </div>
      )}

      {/* Title */}
      <p className="font-body-md text-[12.5px] font-medium leading-snug mb-2.5" style={{ color: "var(--color-on-surface)", opacity: 0.9 }}>
        {task.title}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="font-label-caps text-[8px] font-semibold px-1.5 py-0.5 rounded">{pm.label}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {task.due && <span className="font-label-caps text-[8px] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.45 }}>{new Date(task.due).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}
          <div className="flex -space-x-1">
            {task.assignees.slice(0, 2).map(a => (
              <div key={a.id} title={a.name} className="w-4.5 h-4.5 rounded-full border border-white flex items-center justify-center font-display font-bold text-[6px]" style={{ background: "var(--color-surface-container-highest)", color: "var(--color-on-surface)", width: 18, height: 18 }}>
                {a.initials}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function KanbanView({ tasks, onTaskClick, onAddTask, onStatusChange }: Props) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<Status | null>(null);

  function handleDrop(status: Status) {
    if (draggingId) onStatusChange(draggingId, status);
    setDraggingId(null);
    setDragOverCol(null);
  }

  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden">
      <div className="flex gap-3 h-full px-4 py-4" style={{ minWidth: ALL_STATUSES.length * 260 }}>
        {ALL_STATUSES.map(status => {
          const sm = STATUS_META[status] || { dot: "rgba(0,0,0,0.3)" };
          const colTasks = tasks.filter(t => t.status === status);
          const isDragOver = dragOverCol === status;

          return (
            <div
              key={status}
              className="flex flex-col rounded-[10px] shrink-0 transition-all"
              style={{ width: 256, background: isDragOver ? "rgba(0,0,0,0.035)" : "rgba(0,0,0,0.02)", border: `1px solid ${isDragOver ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.07)"}`, transition: "all 0.15s" }}
              onDragOver={e => { e.preventDefault(); setDragOverCol(status); }}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={() => handleDrop(status)}
            >
              {/* Column header */}
              <div className="flex items-center justify-between px-3 py-2.5 border-b shrink-0" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: sm.dot }} />
                  <span className="font-label-caps text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--color-on-surface)", opacity: 0.7 }}>{status}</span>
                  <span className="font-label-caps text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(0,0,0,0.06)", color: "var(--color-on-surface-variant)" }}>{colTasks.length}</span>
                </div>
                <button onClick={() => onAddTask(status)} className="w-5 h-5 rounded-[4px] flex items-center justify-center hover:bg-black/[0.08] transition-colors">
                  <Plus size={11} strokeWidth={2} style={{ color: "var(--color-on-surface-variant)", opacity: 0.55 } as React.CSSProperties} />
                </button>
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2 db-sidebar">
                {colTasks.map(task => (
                  <KanbanCard
                    key={task.id}
                    task={task}
                    onClick={() => onTaskClick(task)}
                    onDragStart={() => setDraggingId(task.id)}
                  />
                ))}

                {colTasks.length === 0 && (
                  <div className="flex items-center justify-center h-20 rounded-[6px]" style={{ border: "1.5px dashed rgba(0,0,0,0.1)" }}>
                    <span className="font-body-sm text-[11px]" style={{ color: "var(--color-on-surface-variant)", opacity: 0.35 }}>Drop here</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
