"use client";

import { useState, KeyboardEvent } from "react";
import { CheckSquare, Square, Plus, Trash2, ChevronRight } from "lucide-react";
import type { Subtask, SubSubtask } from "../types";

interface Props {
  subtasks: Subtask[];
  onChange: (subtasks: Subtask[]) => void;
}

export default function SubtaskList({ subtasks, onChange }: Props) {
  const [newTitle,    setNewTitle]    = useState("");
  const [expandedId,  setExpandedId]  = useState<string | null>(null);
  const [newSubTitle, setNewSubTitle] = useState("");

  const done  = subtasks.filter(s => s.done).length;
  const total = subtasks.length;
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;

  /* ── Subtask CRUD ── */
  function addSubtask() {
    const t = newTitle.trim();
    if (!t) return;
    onChange([...subtasks, { id: `s${Date.now()}`, title: t, done: false, subtasks: [] }]);
    setNewTitle("");
  }

  function toggleSubtask(id: string) {
    onChange(subtasks.map(s => s.id === id ? { ...s, done: !s.done } : s));
  }

  function removeSubtask(id: string) {
    onChange(subtasks.filter(s => s.id !== id));
  }

  /* ── Nested subtask CRUD ── */
  function addNestedSub(parentId: string) {
    const t = newSubTitle.trim();
    if (!t) return;
    onChange(subtasks.map(s => s.id === parentId
      ? { ...s, subtasks: [...(s.subtasks ?? []), { id: `ss${Date.now()}`, title: t, done: false }] }
      : s));
    setNewSubTitle("");
  }

  function toggleNestedSub(parentId: string, subId: string) {
    onChange(subtasks.map(s => s.id === parentId
      ? { ...s, subtasks: (s.subtasks ?? []).map(ss => ss.id === subId ? { ...ss, done: !ss.done } : ss) }
      : s));
  }

  function removeNestedSub(parentId: string, subId: string) {
    onChange(subtasks.map(s => s.id === parentId
      ? { ...s, subtasks: (s.subtasks ?? []).filter(ss => ss.id !== subId) }
      : s));
  }

  function onKD(e: KeyboardEvent<HTMLInputElement>, fn: () => void) {
    if (e.key === "Enter") { e.preventDefault(); fn(); }
  }

  return (
    <div className="space-y-1">
      {/* Progress row */}
      {total > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.07)" }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: pct === 100 ? "rgba(0,120,60,0.7)" : "var(--color-primary)" }} />
          </div>
          <span className="font-label-caps text-[9px] font-semibold shrink-0" style={{ color: "var(--color-on-surface-variant)", opacity: 0.55 }}>{done}/{total}</span>
        </div>
      )}

      {/* Subtask rows */}
      {subtasks.map(s => (
        <div key={s.id}>
          <div className="flex items-start gap-2 px-2 py-1.5 rounded-[6px] hover:bg-black/[0.02] group/st transition-colors">
            <button onClick={() => toggleSubtask(s.id)} className="shrink-0 mt-0.5">
              {s.done
                ? <CheckSquare size={13} strokeWidth={2} style={{ color: "rgba(0,120,60,0.75)" }} />
                : <Square size={13} strokeWidth={1.75} style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 } as React.CSSProperties} />
              }
            </button>

            <span className="flex-1 font-body-md text-[12.5px] leading-snug" style={{ color: s.done ? "var(--color-on-surface-variant)" : "var(--color-on-surface)", opacity: s.done ? 0.45 : 0.9, textDecoration: s.done ? "line-through" : "none" }}>
              {s.title}
            </span>

            <div className="flex items-center gap-0.5 opacity-0 group-hover/st:opacity-100 transition-opacity shrink-0">
              <button
                onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                className="p-1 rounded-[4px] hover:bg-black/[0.06] transition-colors"
                title="Add nested subtask"
              >
                <ChevronRight size={10} strokeWidth={2} style={{ color: "var(--color-on-surface-variant)", opacity: 0.5, transform: expandedId === s.id ? "rotate(90deg)" : "none", transition: "transform 0.15s" } as React.CSSProperties} />
              </button>
              <button onClick={() => removeSubtask(s.id)} className="p-1 rounded-[4px] hover:bg-red-50 transition-colors">
                <Trash2 size={10} strokeWidth={1.75} style={{ color: "rgba(186,26,26,0.55)" }} />
              </button>
            </div>
          </div>

          {/* Nested subtasks */}
          {(expandedId === s.id || (s.subtasks ?? []).length > 0) && (
            <div className="ml-6 mt-0.5 space-y-0.5">
              {(s.subtasks ?? []).map(ss => (
                <div key={ss.id} className="flex items-center gap-2 px-2 py-1 rounded-[5px] hover:bg-black/[0.015] group/ss transition-colors">
                  <button onClick={() => toggleNestedSub(s.id, ss.id)} className="shrink-0">
                    {ss.done
                      ? <CheckSquare size={11} strokeWidth={2} style={{ color: "rgba(0,120,60,0.7)" }} />
                      : <Square size={11} strokeWidth={1.75} style={{ color: "var(--color-on-surface-variant)", opacity: 0.35 } as React.CSSProperties} />
                    }
                  </button>
                  <span className="flex-1 font-body-sm text-[11.5px]" style={{ color: ss.done ? "var(--color-on-surface-variant)" : "var(--color-on-surface)", opacity: ss.done ? 0.4 : 0.85, textDecoration: ss.done ? "line-through" : "none" }}>{ss.title}</span>
                  <button onClick={() => removeNestedSub(s.id, ss.id)} className="opacity-0 group-hover/ss:opacity-100 p-0.5 rounded hover:bg-red-50 transition-all">
                    <Trash2 size={9} strokeWidth={1.75} style={{ color: "rgba(186,26,26,0.5)" }} />
                  </button>
                </div>
              ))}

              {expandedId === s.id && (
                <div className="flex items-center gap-1.5 px-2 py-1">
                  <Plus size={9} strokeWidth={2} style={{ color: "var(--color-on-surface-variant)", opacity: 0.35 }} />
                  <input
                    autoFocus
                    placeholder="Nested subtask…"
                    value={newSubTitle}
                    onChange={e => setNewSubTitle(e.target.value)}
                    onKeyDown={e => onKD(e, () => addNestedSub(s.id))}
                    onBlur={() => { addNestedSub(s.id); setExpandedId(null); }}
                    className="flex-1 bg-transparent outline-none font-body-sm text-[11.5px]"
                    style={{ color: "var(--color-on-surface)" }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Add subtask input */}
      <div className="flex items-center gap-2 px-2 py-1.5 rounded-[6px]" style={{ border: "1px dashed rgba(0,0,0,0.13)", background: "rgba(0,0,0,0.01)" }}>
        <Plus size={11} strokeWidth={1.75} style={{ color: "var(--color-on-surface-variant)", opacity: 0.35, flexShrink: 0 }} />
        <input
          placeholder="Add subtask… (Enter)"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          onKeyDown={e => onKD(e, addSubtask)}
          className="flex-1 bg-transparent outline-none font-body-md text-[12.5px]"
          style={{ color: "var(--color-on-surface)" }}
        />
        {newTitle.trim() && (
          <button onClick={addSubtask} className="font-label-caps text-[9px] font-semibold px-2 py-0.5 rounded shrink-0" style={{ background: "rgba(0,0,0,0.07)", color: "var(--color-on-surface-variant)" }}>Add</button>
        )}
      </div>
    </div>
  );
}
