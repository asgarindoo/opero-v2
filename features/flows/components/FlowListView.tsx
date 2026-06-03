"use client";

import React, { useState } from "react";
import { ChevronRight, Clock, Waypoints, Layers, Trash2 } from "lucide-react";
import type { Flow } from "@/features/flows";
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
    if (!onBulkDelete) return;
    setFlowToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    const ids = flowToDelete ? [flowToDelete] : Array.from(selectedIds);
    if (!onBulkDelete || ids.length === 0) return;
    onBulkDelete?.(ids);
    setSelectedIds(new Set());
    setFlowToDelete(null);
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="w-full animate-fade-in relative">
      <div className="w-full">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="border-b bg-[#fcf5f5] border-black/[0.04]">
              <th className="px-8 py-2.5 text-left font-display text-[9px] font-bold text-on-surface-variant opacity-50 uppercase tracking-[0.15em] w-[40%]">Process Name</th>
              <th className="px-6 py-2.5 text-left font-display text-[9px] font-bold text-on-surface-variant opacity-50 uppercase tracking-[0.15em] w-[20%]">Completion</th>
              <th className="px-6 py-2.5 text-left font-display text-[9px] font-bold text-on-surface-variant opacity-50 uppercase tracking-[0.15em] w-[15%]">Stages</th>
              <th className="px-6 py-2.5 text-left font-display text-[9px] font-bold text-on-surface-variant opacity-50 uppercase tracking-[0.15em] w-[15%]">Updated</th>
              <th className="px-8 py-2.5 text-right font-display text-[9px] font-bold text-on-surface-variant opacity-50 uppercase tracking-[0.15em] w-[10%]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.03]">
            {flows.map((flow) => {
              const updatedDate = new Date(flow.updated).toLocaleDateString("en-US", { month: "short", day: "numeric" });
              const isSelected = selectedIds.has(flow.id);
              const progress = flow.progress;

              return (
                <tr
                  key={flow.id}
                  onClick={() => onFlowClick(flow)}
                  className={`group hover:bg-zinc-50/80 cursor-pointer transition-colors ${isSelected ? "bg-zinc-50" : ""}`}
                >
                  <td className="px-8 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-md bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-zinc-200/60 group-hover:text-zinc-600 transition-colors shrink-0">
                        <Layers size={13} />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded-[3px] font-display text-[8px] font-bold uppercase tracking-wider text-zinc-500 bg-zinc-100/80">
                            {flow.category}
                          </span>
                        </div>
                        <span className="font-display text-[13px] font-medium text-zinc-800 group-hover:text-black transition-colors">{flow.name}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3 w-28">
                      <div className="flex-1 h-1 bg-black/[0.04] rounded-full overflow-hidden shrink-0">
                        <div className="h-full bg-zinc-700 transition-all duration-700" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="font-display text-[11px] font-semibold text-zinc-500 tabular-nums w-8">{progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <Waypoints size={12} strokeWidth={2.5} />
                      <span className="font-display text-[12px] font-medium text-zinc-600">{flow.stages.length} <span className="text-zinc-400">Stages</span></span>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <Clock size={12} strokeWidth={2.5} />
                      <span className="font-display text-[12px] font-medium text-zinc-500">{updatedDate}</span>
                    </div>
                  </td>
                  <td className="px-8 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {onBulkDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-zinc-300 hover:text-red-600 hover:bg-red-50 transition-colors"
                          onClick={(e) => handleDeleteOne(e, flow.id)}
                        >
                          <Trash2 size={13} />
                        </Button>
                      )}
                      <ChevronRight size={13} className="text-zinc-300 ml-1 group-hover:text-zinc-600 transition-colors" />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {onBulkDelete && (
        <SelectionBar
          count={selectedIds.size}
          onClear={() => setSelectedIds(new Set())}
          onDelete={() => setIsDeleteModalOpen(true)}
          label="flows"
        />
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setFlowToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title={flowToDelete ? "Delete flow?" : "Delete selected flows?"}
        description={flowToDelete ? "This action permanently removes the operational flow, associated stages, and history data." : `This action permanently removes ${selectedIds.size} flows. This action cannot be undone.`}
        confirmLabel={flowToDelete ? "Delete Flow" : "Delete Flows"}
      />
    </div>
  );
}
