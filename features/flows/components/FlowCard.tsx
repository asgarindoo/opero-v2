"use client";

import { ChevronRight, ListChecks, Calendar, User, Clock } from "lucide-react";
import type { Flow } from "@/features/flows";
import { CATEGORY_COLORS } from "@/features/flows";

interface FlowCardProps {
  flow: Flow;
  onClick: () => void;
}

export default function FlowCard({ flow, onClick }: FlowCardProps) {
  const lastUpdate = new Date(flow.updated).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div
      onClick={onClick}
      className="group bg-white/40 border border-black/[0.04] rounded-xl p-6 hover:bg-white hover:shadow-xl hover:shadow-black/5 hover:-translate-y-px transition-all cursor-pointer relative overflow-hidden flex flex-col"
    >
      {/* Header: Category & Status */}
      <div className="flex items-start justify-between mb-4">
        <div className={`px-2 py-0.5 rounded-md font-display text-[9px] font-bold uppercase tracking-wider ${CATEGORY_COLORS[flow.category] || "text-slate-500 bg-slate-50"}`}>
          {flow.category}
        </div>
        <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
          <ChevronRight size={10} className="text-on-surface-variant" />
        </div>
      </div>

      {/* Main Info */}
      <div className="flex-1 mb-6 min-w-0">
        <h3 className="font-display text-[15px] font-semibold text-on-surface leading-tight mb-1.5 group-hover:text-primary transition-colors truncate">
          {flow.name}
        </h3>
        <p className="font-display text-[12px] text-on-surface-variant opacity-60 line-clamp-2 break-words leading-relaxed">
          {flow.description}
        </p>
      </div>

      {/* Progress & Stats */}
      <div className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-end justify-between text-[10px] uppercase tracking-wider">
            <span className="font-display font-semibold text-zinc-400">Progress</span>
            <span className="font-display text-[11px] font-semibold text-zinc-500 leading-none">{flow.progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-black/[0.04] rounded-full overflow-hidden">
            <div
              className="h-full bg-zinc-700 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${flow.progress}%` }}
            />
          </div>
        </div>

        {/* Footer Meta */}
        <div className="flex items-center justify-between pt-4 border-t border-black/[0.03]">
          <div className="flex items-center gap-4">
            {/* Stages Count */}
            <div className="flex items-center gap-1.5 text-on-surface-variant opacity-60 group-hover:opacity-100 transition-opacity">
              <ListChecks size={12} strokeWidth={2.5} />
              <span className="font-display text-[10px] font-bold">{flow.stages.length}</span>
            </div>
            {/* Last Updated / Due Date */}
            <div className="flex items-center gap-1.5 text-on-surface-variant opacity-60 group-hover:opacity-100 transition-opacity">
              <Clock size={12} strokeWidth={2.5} />
              <span className="font-display text-[10px] font-bold tracking-tight">{lastUpdate}</span>
            </div>
          </div>

          {/* Creator Profile */}
          <div className="flex items-center gap-1.5 text-on-surface-variant opacity-60 group-hover:opacity-100 transition-opacity">
            <User size={12} strokeWidth={2.5} />
            <span className="font-display text-[10px] font-bold truncate max-w-[80px]">{flow.owner.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
