"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, RefreshCw } from "lucide-react";
import type { RecurringSchedule } from "@/features/tasks";
import { ALL_RECURRING } from "@/features/tasks";

interface Props {
  value: RecurringSchedule;
  onChange: (v: RecurringSchedule) => void;
}

export default function RecurringPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const current = ALL_RECURRING.find(r => r.value === value) ?? ALL_RECURRING[0];
  const isActive = value !== "none";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-[5px] hover:bg-black/[0.05] transition-colors"
        style={{ border: "1px solid rgba(0,0,0,0.08)", background: isActive ? "rgba(0,0,0,0.03)" : "transparent" }}
      >
        <RefreshCw size={10} strokeWidth={2} style={{ color: isActive ? "var(--color-primary)" : "var(--color-on-surface-variant)", opacity: isActive ? 1 : 0.5 } as React.CSSProperties} />
        <span className="font-label-caps text-[10px] font-semibold" style={{ color: isActive ? "var(--color-on-surface)" : "var(--color-on-surface-variant)", opacity: isActive ? 0.8 : 0.55 }}>
          {current.label}
        </span>
        <ChevronDown size={9} strokeWidth={2} style={{ color: "var(--color-on-surface-variant)", opacity: 0.4 }} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 rounded-[8px] overflow-hidden py-1 shadow-xl" style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.1)", minWidth: 140 }}>
          {ALL_RECURRING.map(r => (
            <button
              key={r.value}
              onClick={() => { onChange(r.value); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-black/[0.04] transition-colors text-left"
            >
              <RefreshCw size={10} strokeWidth={2} style={{ color: r.value === "none" ? "rgba(0,0,0,0.3)" : "var(--color-on-surface)", opacity: r.value === "none" ? 0.5 : 0.7 } as React.CSSProperties} />
              <span className="font-body-md text-[12px]" style={{ color: "var(--color-on-surface)", opacity: 0.85 }}>{r.label}</span>
              {value === r.value && <span className="ml-auto text-[10px]" style={{ color: "var(--color-primary)" }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
