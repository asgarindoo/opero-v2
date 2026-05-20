"use client";

import React, { useState } from "react";
import { X, Plus, Trash2, Layers, Info, ListChecks, Tag } from "lucide-react";
import { FLOW_CATEGORIES, type Flow, type FlowCategory, type FlowStage } from "@/features/flows";
import Dropdown from "@/components/ui/Dropdown";

interface CreateFlowModalProps {
  onClose: () => void;
  onCreate: (flow: Flow) => void;
}

export default function CreateFlowModal({ onClose, onCreate }: CreateFlowModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<FlowCategory>("Operations");
  const [stages, setStages] = useState<Partial<FlowStage>[]>([
    { id: "s1", name: "", order: 0, checklist: [] }
  ]);

  const addStage = () => {
    setStages([...stages, { id: `s${stages.length + 1}`, name: "", order: stages.length, checklist: [] }]);
  };

  const updateStage = (idx: number, updates: Partial<FlowStage>) => {
    const next = [...stages];
    next[idx] = { ...next[idx], ...updates };
    setStages(next);
  };

  const removeStage = (idx: number) => {
    if (stages.length === 1) return;
    setStages(stages.filter((_, i) => i !== idx));
  };

  const addChecklistItem = (stageIdx: number) => {
    const next = [...stages];
    const checklist = next[stageIdx].checklist || [];
    next[stageIdx].checklist = [...checklist, { id: `c${checklist.length + 1}`, text: "", isCompleted: false }];
    setStages(next);
  };

  const updateChecklistItem = (stageIdx: number, itemIdx: number, text: string) => {
    const next = [...stages];
    const checklist = [...(next[stageIdx].checklist || [])];
    checklist[itemIdx] = { ...checklist[itemIdx], text };
    next[stageIdx].checklist = checklist;
    setStages(next);
  };

  const isFormValid = name.trim() !== "" && stages.length > 0 && stages.every(s => (s.name || "").trim() !== "");

  const handleCreate = () => {
    if (!isFormValid) return;

    const newFlow: Flow = {
      id: `f-${Date.now()}`,
      name,
      description,
      category,
      status: "Active",
      progress: 0,
      updated: new Date().toISOString(),
      owner: { id: "me", name: "Current User" },
      stages: stages.map((s, i) => ({
        id: s.id || `s${i}`,
        name: s.name || `Stage ${i + 1}`,
        order: i,
        isCompleted: false,
        checklist: (s.checklist || []).filter(item => item.text.trim() !== "")
      }))
    };

    onCreate(newFlow);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-xl border border-black/[0.08] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
        <header className="px-10 py-8 border-b border-black/[0.04] bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center text-primary">
              <Layers size={24} />
            </div>
            <div>
              <h2 className="font-display text-[18px] font-semibold text-zinc-900 tracking-tight">New Operational Flow</h2>
              <p className="font-display text-[13px] text-zinc-500">Design a reusable execution path for your operations</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 rounded-md hover:bg-black/5 transition-all">
            <X size={20} className="text-on-surface-variant opacity-30" />
          </button>
        </header>

        <div className="flex-1 overflow-hidden flex">
          {/* Identity Info */}
          <div className="w-[340px] border-r border-black/[0.04] bg-black/[0.01] p-10 space-y-8 overflow-y-auto custom-scrollbar">
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-primary">
                <Info size={14} />
                <span className="font-display text-[11px] font-medium uppercase tracking-wider">Process Details</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="font-display text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Flow Name</label>
                  <span className="font-display text-[10px] font-medium text-zinc-400">{name.length}/50</span>
                </div>
                <input
                  maxLength={50}
                  autoFocus
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Employee Onboarding"
                  className="w-full bg-white border border-black/[0.08] rounded-xl px-4 py-3 font-display text-[14px] outline-none focus:border-primary/40 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="font-display text-[11px] font-medium text-zinc-500 uppercase tracking-wider ml-1">Category</label>
                <Dropdown
                  value={category}
                  options={FLOW_CATEGORIES.map(cat => ({ value: cat, label: cat }))}
                  onChange={(val) => setCategory(val as FlowCategory)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="font-display text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Description (Objective)</label>
                  <span className="font-display text-[10px] text-zinc-400">{description.length}/300</span>
                </div>
                <textarea
                  maxLength={300}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe the process objective..."
                  className="w-full bg-white border border-black/[0.08] rounded-xl px-4 py-3 font-display text-[14px] outline-none h-32 resize-none leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Stage Builder */}
          <div className="flex-1 p-10 overflow-y-auto custom-scrollbar bg-white">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2 text-primary">
                <ListChecks size={14} />
                <span className="font-display text-[11px] font-medium uppercase tracking-wider">Execution Stages</span>
              </div>
              <button onClick={addStage} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/5 text-primary hover:bg-primary/10 transition-all">
                <Plus size={14} />
                <span className="font-display text-[11px] font-medium uppercase tracking-wider">Add Stage</span>
              </button>
            </div>

            <div className="py-2 flex flex-col">
              {stages.map((stage, idx) => {
                const isLast = idx === stages.length - 1;
                return (
                  <div key={idx} className="w-full flex items-stretch text-left group transition-all">

                    {/* Fixed Rail Column (Matches FlowDetail) */}
                    <div className="relative w-12 shrink-0 flex flex-col items-center">
                      {/* Stable Connector Line */}
                      {stages.length > 1 && (
                        <div className={`absolute w-[2px] bg-black/[0.06] left-1/2 -translate-x-1/2 ${idx === 0 ? "top-6 bottom-0" :
                          isLast ? "top-0 h-6" :
                            "top-0 bottom-0"
                          }`} />
                      )}

                      {/* Fixed Wrapper for Node */}
                      <div className="h-12 w-full flex items-center justify-center relative z-10">
                        <div className="w-[18px] h-[18px] rounded-full border-[2px] flex items-center justify-center transition-all bg-white border-zinc-300 group-hover:border-zinc-400">
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 pb-8 pt-[12px] pr-4 flex flex-col justify-start">
                      <div className="flex items-center gap-4">
                        <input
                          value={stage.name}
                          onChange={e => updateStage(idx, { name: e.target.value })}
                          placeholder={`Stage ${idx + 1}`}
                          className="flex-1 bg-transparent font-display text-[15px] font-semibold text-zinc-900 outline-none border-b border-transparent focus:border-zinc-300 pb-1 transition-all placeholder:text-zinc-400"
                        />
                        <button onClick={() => removeStage(idx)} className="text-zinc-400 opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity hover:text-red-500">
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="space-y-3 mt-4">
                        {stage.checklist?.map((item, itemIdx) => (
                          <div key={itemIdx} className="flex items-center gap-3 group/item">
                            <div className="w-3.5 h-3.5 rounded border border-zinc-300 bg-zinc-50 shrink-0" />
                            <input
                              value={item.text}
                              onChange={e => updateChecklistItem(idx, itemIdx, e.target.value)}
                              placeholder="Process item..."
                              className="flex-1 bg-transparent font-display text-[13px] text-zinc-700 outline-none border-b border-black/[0.03] focus:border-zinc-300 transition-all placeholder:text-zinc-400"
                            />
                          </div>
                        ))}
                        <button onClick={() => addChecklistItem(idx)} className="flex items-center gap-1.5 font-display text-[11px] font-bold text-zinc-400 hover:text-zinc-800 transition-all uppercase tracking-widest mt-2">
                          <Plus size={12} />
                          Add item
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <footer className="px-10 py-6 border-t border-black/[0.04] bg-white flex items-center justify-end gap-4 shrink-0">
          <button onClick={onClose} className="font-display text-[13px] font-medium text-zinc-500 hover:text-zinc-800 transition-all px-4 py-2">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!isFormValid}
            className={`px-5 py-2 rounded-md font-display text-[13px] font-medium transition-all ${isFormValid
              ? "bg-primary text-on-primary shadow-sm hover:shadow hover:-translate-y-px"
              : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
              }`}
          >
            Create Process Flow
          </button>
        </footer>
      </div>
    </div>
  );
}
