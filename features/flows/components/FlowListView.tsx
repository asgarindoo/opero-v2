"use client";

import React, { useState } from "react";
import { ChevronRight, Clock, Activity, MoreHorizontal, Layers, Trash2 } from "lucide-react";
import type { Flow } from "../types";
import { CATEGORY_COLORS } from "../types";
import SelectionBar from "@/components/common/SelectionBar";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import Button from "@/components/ui/Button";

interface FlowListViewProps {
  flows: Flow[];
  onFlowClick: (flow: Flow) => void;
  onBulkDelete?: (ids: string[]) => void;
}

export default function FlowListView({ flows, onFlowClick, onBulkDelete }: FlowListViewProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [flowToDelete, setFlowToDelete] = useState<string | null>(null);

  const toggleAll = () => {
    if (selectedIds.size === flows.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(flows.map(f => f.id)));
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
    setFlowToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    const ids = flowToDelete ? [flowToDelete] : Array.from(selectedIds);
    onBulkDelete?.(ids);
    setSelectedIds(new Set());
    setFlowToDelete(null);
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="w-full animate-fade-in relative">
      <div className="min-w-full inline-block align-middle">
        <div className="border border-black/[0.06] rounded-2xl overflow-hidden bg-white">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-[#fbf5f5] border-b border-black/[0.05]">
                <th className="px-6 py-4 text-left font-display text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em]">Process Name</th>
                <th className="px-6 py-4 text-left font-display text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em]">Completion</th>
                <th className="px-6 py-4 text-left font-display text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em]">Stages</th>
                <th className="px-6 py-4 text-left font-display text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em]">Updated</th>
                <th className="px-6 py-4 text-right font-display text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {flows.map((flow) => {
                const updatedDate = new Date(flow.updated).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                const isSelected = selectedIds.has(flow.id);
                const progress = flow.progress;

                return (
                  <tr 
                    key={flow.id} 
                    onClick={() => onFlowClick(flow)}
                    className={`group hover:bg-black/[0.015] cursor-pointer transition-colors ${isSelected ? "bg-primary/[0.02]" : ""}`}
                  >
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                         <div className="w-9 h-9 rounded-xl bg-black/[0.03] flex items-center justify-center text-on-surface-variant opacity-60 group-hover:bg-primary/5 group-hover:text-primary group-hover:opacity-100 transition-all">
                            <Layers size={15} />
                         </div>
                         <div>
                            <div className="flex items-center gap-2 mb-0.5">
                               <span className={`px-1.5 py-0.5 rounded font-display text-[8px] font-bold uppercase tracking-wider ${CATEGORY_COLORS[flow.category] || "text-slate-500 bg-slate-50"}`}>
                                 {flow.category}
                               </span>
                               {flow.status === "Active" && <span className="w-1 h-1 rounded-full bg-emerald-500" />}
                            </div>
                            <span className="font-display text-[14px] font-semibold text-on-surface tracking-tight transition-colors opacity-90 group-hover:text-primary">{flow.name}</span>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-3 w-32">
                         <div className="flex-1 h-1 bg-black/[0.05] rounded-full overflow-hidden">
                            <div className="h-full bg-primary/60 transition-all duration-700" style={{ width: `${progress}%` }} />
                         </div>
                         <span className="font-display text-[11px] font-bold text-on-surface-variant opacity-60 leading-none">{progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                       <div className="flex items-center gap-2 text-on-surface opacity-60 font-display">
                          <Activity size={11} className="opacity-60" />
                          <span className="font-display text-[12px] font-bold">{flow.stages.length} <span className="opacity-60 font-medium">Stages</span></span>
                       </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                       <div className="flex items-center gap-2 text-on-surface-variant opacity-60 font-display">
                          <Clock size={11} className="opacity-60" />
                          <span className="font-display text-[12px] font-medium">{updatedDate}</span>
                       </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right">
                       <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-on-surface-variant opacity-60 hover:text-red-500 hover:opacity-100 hover:bg-red-50"
                            onClick={(e) => handleDeleteOne(e, flow.id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-on-surface-variant opacity-60">
                            <MoreHorizontal size={14} />
                          </Button>
                          <ChevronRight size={14} className="text-on-surface-variant opacity-60 ml-1" />
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
        label="flows"
      />

      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setFlowToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title={flowToDelete ? "Delete Flow" : "Delete Selected Flows"}
        description={flowToDelete ? "Are you sure you want to delete this operational flow? All associated stages and history data will be permanently removed." : `Are you sure you want to delete ${selectedIds.size} selected flows? This action cannot be undone.`}
      />
    </div>
  );
}
