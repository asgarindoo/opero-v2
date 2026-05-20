"use client";

import React, { useState } from "react";
import { ChevronRight, Target, Clock, TrendingUp, AlertCircle, CheckCircle2, Trash2 } from "lucide-react";
import type { Goal } from "@/features/goals";
import { useGoals } from "../context/GoalsContext";
import SelectionBar from "@/components/common/SelectionBar";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import Button from "@/components/ui/Button";

const statusConfig = {
  "on-track": { icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", label: "On Track" },
  "at-risk": { icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50", label: "At Risk" },
  "behind": { icon: Clock, color: "text-red-600", bg: "bg-red-50", label: "Behind" },
  "completed": { icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50", label: "Completed" },
};

interface GoalListViewProps {
  goals: Goal[];
  onGoalClick: (goal: Goal) => void;
}

export default function GoalListView({ goals, onGoalClick }: GoalListViewProps) {
  const { deleteGoals } = useGoals();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null);

  const toggleAll = () => {
    if (selectedIds.size === goals.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(goals.map(g => g.id)));
    }
  };

  const toggleOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleDeleteOne = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setGoalToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (goalToDelete) {
      deleteGoals([goalToDelete]);
      setGoalToDelete(null);
    } else {
      deleteGoals(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="w-full animate-fade-in relative">
      <div className="min-w-full inline-block align-middle">
        <div className="border-b border-black/[0.05]">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-[#fbf5f5] border-b border-black/[0.05]">
                <th className="px-6 py-4 text-left font-label-caps text-[9px] font-bold text-on-surface-variant opacity-30 uppercase tracking-[0.2em]">Operational Goal</th>
                <th className="px-6 py-4 text-left font-label-caps text-[9px] font-bold text-on-surface-variant opacity-30 uppercase tracking-[0.2em]">Status</th>
                <th className="px-6 py-4 text-left font-label-caps text-[9px] font-bold text-on-surface-variant opacity-30 uppercase tracking-[0.2em]">Progress</th>
                <th className="px-6 py-4 text-left font-label-caps text-[9px] font-bold text-on-surface-variant opacity-30 uppercase tracking-[0.2em]">Milestones</th>
                <th className="px-6 py-4 text-left font-label-caps text-[9px] font-bold text-on-surface-variant opacity-30 uppercase tracking-[0.2em]">Deadline</th>
                <th className="px-6 py-4 text-right font-label-caps text-[9px] font-bold text-on-surface-variant opacity-30 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {goals.map((goal) => {
                const conf = statusConfig[goal.status];
                const StatusIcon = conf.icon;
                const completedMilestones = goal.milestones.filter(m => m.completed).length;
                const isSelected = selectedIds.has(goal.id);

                return (
                  <tr 
                    key={goal.id} 
                    onClick={() => onGoalClick(goal)}
                    className={`group hover:bg-black/[0.015] cursor-pointer transition-colors ${isSelected ? "bg-primary/[0.02]" : ""}`}
                  >
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                         <div className="w-9 h-9 rounded-lg bg-black/[0.03] flex items-center justify-center text-on-surface-variant opacity-30 group-hover:bg-primary/5 group-hover:text-primary group-hover:opacity-100 transition-all">
                            <Target size={15} />
                         </div>
                         <div>
                            <span className="font-display text-[13px] font-semibold text-on-surface tracking-tight group-hover:text-primary transition-colors block mb-0.5 opacity-90">{goal.title}</span>
                            <span className="font-body-sm text-[11px] text-on-surface-variant opacity-40 block truncate max-w-[200px] leading-tight">{goal.description}</span>
                         </div>
                      </div>
                    </td>
                     <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                           <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-label-caps text-[8.5px] font-bold uppercase tracking-widest ${conf.bg} ${conf.color}`}>
                              <StatusIcon size={9} strokeWidth={2.5} />
                              {conf.label}
                           </div>
                           {goal.archived && (
                              <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-label-caps text-[8px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-100">
                                 Archived
                              </div>
                           )}
                        </div>
                     </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                       <div className="flex items-center gap-3 w-32">
                          <div className="flex-1 h-1 bg-black/[0.04] rounded-full overflow-hidden">
                             <div className="h-full bg-zinc-700 transition-all" style={{ width: `${goal.progress}%` }} />
                          </div>
                          <span className="font-display text-[11px] font-semibold text-zinc-500 tabular-nums w-8 leading-none">{goal.progress}%</span>
                       </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                       <span className="font-body-sm text-[12px] font-medium text-on-surface opacity-50 font-display">
                          {completedMilestones} <span className="opacity-40 font-normal">/</span> {goal.milestones.length}
                       </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-on-surface-variant opacity-40">
                       <span className="font-body-sm text-[11.5px] font-display">{goal.targetDate}</span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right">
                       <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-on-surface-variant opacity-40 hover:text-red-500 hover:opacity-100 hover:bg-red-50"
                            onClick={(e) => handleDeleteOne(e, goal.id)}
                          >
                            <Trash2 size={13} />
                          </Button>
                          <ChevronRight size={14} className="text-on-surface-variant opacity-10 ml-1" />
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <SelectionBar 
        count={selectedIds.size}
        onClear={() => setSelectedIds(new Set())}
        onDelete={() => setIsDeleteModalOpen(true)}
        label="goals"
      />

      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setGoalToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title={goalToDelete ? "Delete Goal" : "Delete Selected Goals"}
        description={goalToDelete ? "Are you sure you want to delete this operational goal? This will remove all associated key results and milestone tracking." : `Are you sure you want to delete ${selectedIds.size} selected goals? This action cannot be undone.`}
      />
    </div>
  );
}
