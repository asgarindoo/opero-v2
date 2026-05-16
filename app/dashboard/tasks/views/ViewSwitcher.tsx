"use client";

import React from "react";
import { LayoutList, Columns, Table2, Calendar, GanttChartSquare } from "lucide-react";
import Button from "../../components/ui/Button";

export type ViewType = "list" | "kanban" | "table" | "calendar" | "timeline";

const VIEWS: { id: ViewType; label: string; icon: any }[] = [
  { id: "list",     label: "List",     icon: LayoutList },
  { id: "kanban",   label: "Kanban",   icon: Columns },
  { id: "table",    label: "Table",    icon: Table2 },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "timeline", label: "Timeline", icon: GanttChartSquare },
];

interface Props {
  active: ViewType;
  onChange: (v: ViewType) => void;
}

export default function ViewSwitcher({ active, onChange }: Props) {
  return (
    <div className="flex items-center gap-0.5 p-1 bg-black/[0.03] border border-black/[0.05] rounded-[8px]">
      {VIEWS.map(v => {
        const isActive = active === v.id;
        return (
          <button
            key={v.id}
            onClick={() => onChange(v.id)}
            title={v.label}
            className={`
              flex items-center justify-center p-1.5 rounded-[6px] transition-all duration-200
              ${isActive 
                ? 'bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08)] text-on-surface' 
                : 'text-on-surface-variant opacity-40 hover:opacity-100 hover:bg-white/50'
              }
            `}
          >
            <v.icon size={13} strokeWidth={isActive ? 2.5 : 2} />
          </button>
        );
      })}
    </div>
  );
}
