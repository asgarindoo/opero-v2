"use client";

import { useState } from "react";
import { Link2, ArrowRight, ArrowLeft, RefreshCw, Copy, Plus, X } from "lucide-react";
import type { TaskRelationship, RelationshipType, Task } from "../types";

const REL_META: Record<RelationshipType, { label: string; icon: React.ReactNode; color: string }> = {
  "blocks":      { label: "Blocks",      icon: <ArrowRight size={10} strokeWidth={2} />, color: "rgba(186,26,26,0.75)" },
  "blocked-by":  { label: "Blocked by",  icon: <ArrowLeft  size={10} strokeWidth={2} />, color: "rgba(186,26,26,0.55)" },
  "relates-to":  { label: "Relates to",  icon: <Link2      size={10} strokeWidth={2} />, color: "rgba(0,0,0,0.5)"       },
  "duplicates":  { label: "Duplicates",  icon: <Copy       size={10} strokeWidth={2} />, color: "rgba(0,80,180,0.65)"   },
};

interface Props {
  relationships: TaskRelationship[];
  allTasks: Task[];
  onChange: (rels: TaskRelationship[]) => void;
}

export default function DependencyPanel({ relationships, allTasks, onChange }: Props) {
  const [adding,    setAdding]   = useState(false);
  const [relType,   setRelType]  = useState<RelationshipType>("relates-to");
  const [query,     setQuery]    = useState("");

  const filteredTasks = allTasks.filter(t =>
    (t.title.toLowerCase().includes(query.toLowerCase()) || t.id.toLowerCase().includes(query.toLowerCase()))
  );

  function addRel(task: Task) {
    if (relationships.some(r => r.targetId === task.id && r.type === relType)) return;
    onChange([...relationships, { id: `r-${relType}-${task.id}`, type: relType, targetId: task.id, targetTitle: task.title }]);
    setAdding(false); setQuery("");
  }

  function removeRel(id: string) {
    onChange(relationships.filter(r => r.id !== id));
  }

  const hasBlocked = relationships.some(r => r.type === "blocked-by");

  return (
    <div className="space-y-2">
      {/* Blocked warning */}
      {hasBlocked && (
        <div className="flex items-center gap-2 px-2.5 py-2 rounded-[6px]" style={{ background: "rgba(186,26,26,0.06)", border: "1px solid rgba(186,26,26,0.15)" }}>
          <ArrowLeft size={12} strokeWidth={2} style={{ color: "rgba(186,26,26,0.7)", flexShrink: 0 }} />
          <span className="font-label-caps text-[9px] font-semibold uppercase tracking-[0.08em]" style={{ color: "rgba(186,26,26,0.75)" }}>This task is blocked</span>
        </div>
      )}

      {/* Relationship chips */}
      {relationships.map(r => {
        const meta = REL_META[r.type];
        return (
          <div key={r.id} className="group flex items-center gap-2 px-2.5 py-1.5 rounded-[6px]" style={{ border: "1px solid rgba(0,0,0,0.07)", background: "rgba(0,0,0,0.015)" }}>
            <span style={{ color: meta.color, flexShrink: 0 }}>{meta.icon}</span>
            <span className="font-label-caps text-[9px] font-semibold shrink-0" style={{ color: meta.color }}>{meta.label}</span>
            <span className="font-body-md text-[11.5px] flex-1 truncate" style={{ color: "var(--color-on-surface)", opacity: 0.85 }}>{r.targetId} · {r.targetTitle}</span>
            <button onClick={() => removeRel(r.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-black/[0.06]">
              <X size={10} strokeWidth={2} style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 } as React.CSSProperties} />
            </button>
          </div>
        );
      })}

      {/* Add form */}
      {adding ? (
        <div className="rounded-[8px] p-3 space-y-2.5" style={{ border: "1px solid rgba(0,0,0,0.09)", background: "rgba(0,0,0,0.015)" }}>
          {/* Relationship type select */}
          <div className="flex gap-1.5 flex-wrap">
            {(Object.keys(REL_META) as RelationshipType[]).map(t => (
              <button key={t} onClick={() => setRelType(t)}
                className="font-label-caps text-[9px] font-semibold px-2 py-1 rounded-full transition-all"
                style={{ background: relType === t ? "var(--color-primary)" : "rgba(0,0,0,0.05)", color: relType === t ? "var(--color-on-primary)" : "var(--color-on-surface-variant)" }}>
                {REL_META[t].label}
              </button>
            ))}
          </div>

          {/* Task search */}
          <input autoFocus placeholder="Search tasks by title or ID…" value={query} onChange={e => setQuery(e.target.value)}
            className="w-full bg-transparent outline-none font-body-md text-[12px] border-b pb-1" style={{ borderColor: "rgba(0,0,0,0.1)", color: "var(--color-on-surface)" }} />

          {query && (
            <div className="max-h-36 overflow-y-auto space-y-0.5">
              {filteredTasks.slice(0, 8).map(t => (
                <button key={t.id} onClick={() => addRel(t)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-[5px] hover:bg-black/[0.04] text-left transition-colors">
                  <span className="font-label-caps text-[9px] font-semibold shrink-0" style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }}>{t.id}</span>
                  <span className="font-body-md text-[12px] truncate" style={{ color: "var(--color-on-surface)", opacity: 0.85 }}>{t.title}</span>
                </button>
              ))}
              {filteredTasks.length === 0 && <p className="font-body-sm text-[11px] text-center py-2" style={{ color: "var(--color-on-surface-variant)", opacity: 0.45 }}>No tasks found</p>}
            </div>
          )}

          <button onClick={() => { setAdding(false); setQuery(""); }} className="font-label-caps text-[9px] font-semibold px-2 py-1 rounded hover:bg-black/[0.05]" style={{ color: "var(--color-on-surface-variant)", opacity: 0.6 }}>Cancel</button>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] hover:bg-black/[0.04] font-label-caps text-[9px] font-semibold uppercase tracking-[0.08em]"
          style={{ border: "1px dashed rgba(0,0,0,0.18)", color: "var(--color-on-surface-variant)", opacity: 0.7 }}>
          <Plus size={9} strokeWidth={2.5} /> Link Task
        </button>
      )}
    </div>
  );
}
