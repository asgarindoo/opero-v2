"use client";

import { Target, TrendingUp, AlertCircle, Clock, CheckCircle2, ChevronRight } from "lucide-react";
import type { Goal } from "@/features/goals";

const statusConfig = {
  "on-track": { icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", label: "On Track" },
  "at-risk": { icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50", label: "At Risk" },
  "behind": { icon: Clock, color: "text-red-600", bg: "bg-red-50", label: "Behind" },
  "completed": { icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50", label: "Completed" },
};

interface GoalCardProps {
  goal: Goal;
  onClick: () => void;
}

export default function GoalCard({ goal, onClick }: GoalCardProps) {
  const conf = statusConfig[goal.status];
  const StatusIcon = conf.icon;
  const completedMilestones = goal.milestones.filter(m => m.completed).length;

  return (
    <div 
      onClick={onClick}
      className="group bg-white/40 border border-black/[0.04] rounded-xl p-6 hover:bg-white hover:shadow-xl hover:shadow-black/5 hover:-translate-y-px transition-all cursor-pointer relative overflow-hidden"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-label-caps text-[8px] font-bold uppercase tracking-wider ${conf.bg} ${conf.color}`}>
          <StatusIcon size={10} strokeWidth={2.5} />
          {conf.label}
        </div>
        <ChevronRight size={14} className="text-on-surface-variant opacity-10 group-hover:opacity-100 transition-all" />
      </div>

      <div className="mb-6">
        <h3 className="font-display text-[15px] font-semibold text-on-surface tracking-tight mb-2 group-hover:text-primary transition-colors line-clamp-1">{goal.title}</h3>
        <p className="font-body-md text-[12px] text-on-surface-variant opacity-60 leading-relaxed line-clamp-2">{goal.description}</p>
      </div>

      <div className="space-y-3">
        <div className="flex items-end justify-between">
           <span className="font-label-caps text-[9px] font-bold text-on-surface-variant opacity-30 uppercase tracking-widest">Progress</span>
           <span className="font-display text-[13px] font-bold text-on-surface">{goal.progress}%</span>
        </div>
        <div className="h-1 w-full bg-black/[0.04] rounded-full overflow-hidden">
           <div className="h-full bg-primary/70 transition-all duration-700" style={{ width: `${goal.progress}%` }} />
        </div>
      </div>

      <div className="flex items-center justify-between mt-8 pt-4 border-t border-black/[0.03]">
         <div className="flex items-center gap-2">
            <Target size={12} className="text-on-surface-variant opacity-20" />
            <span className="font-label-caps text-[9px] font-bold text-on-surface-variant opacity-50 uppercase tracking-widest">{completedMilestones}/{goal.milestones.length} Milestones</span>
         </div>
         <span className="font-label-caps text-[9px] font-bold text-on-surface-variant opacity-30 uppercase tracking-widest">{goal.targetDate}</span>
      </div>
    </div>
  );
}
