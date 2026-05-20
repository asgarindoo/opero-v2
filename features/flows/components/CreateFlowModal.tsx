"use client";

import React, { useState } from "react";
import { X, Plus, Trash2, Layers, Info, ListChecks, Tag } from "lucide-react";
import { FLOW_CATEGORIES, type Flow, type FlowCategory, type FlowStage } from "@/features/flows";

interface CreateFlowModalProps {
  onClose: () => void;
  onCreate: (flow: Flow) => void;
}

export default function CreateFlowModal({ onClose, onCreate }: CreateFlowModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<FlowCategory>("Operations");
  const [stages, setStages] = useState<Partial<FlowStage>[]>([
    { id: "s1", name: "Initial Stage", order: 0, checklist: [] }
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

  const handleCreate = () => {
    if (!name) return;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-black/5 animate-in zoom-in-95 duration-200">

        {/* Modal Header */}
        <header className="px-8 py-5 border-b border-black/[0.06] bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-900 border border-black/5">
              <Layers size={20} />
            </div>
            <div>
              <h2 className="font-display text-[16px] font-semibold text-zinc-900 tracking-tight leading-tight">New Operational Flow</h2>
              <p className="font-display text-[13px] text-zinc-500 mt-0.5">Design a repeatable execution pipeline</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-colors">
            <X size={18} />
          </button>
        </header>

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden flex bg-[#fcfcfc]">

          {/* Left Configuration */}
          <div className="w-[320px] border-r border-black/[0.06] bg-white p-8 space-y-8 overflow-y-auto custom-scrollbar">
            <div className="space-y-6">

              <div className="space-y-2">
                <label className="font-display text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Flow Name</label>
                <input
                  autoFocus
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Employee Onboarding"
                  className="w-full bg-[#fcfcfc] border border-black/[0.08] rounded-md px-3 py-2.5 font-display text-[14px] text-zinc-900 placeholder:text-zinc-400 outline-none focus:bg-white focus:border-zinc-300 focus:ring-4 focus:ring-zinc-100 transition-all shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="font-display text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Category</label>
                <div className="relative">
                  <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as FlowCategory)}
                    className="w-full bg-[#fcfcfc] border border-black/[0.08] rounded-md pl-9 pr-3 py-2.5 font-display text-[14px] text-zinc-900 outline-none appearance-none cursor-pointer focus:bg-white focus:border-zinc-300 focus:ring-4 focus:ring-zinc-100 transition-all shadow-sm"
                  >
                    {FLOW_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-display text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Objective</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Define the purpose of this execution pipeline..."
                  className="w-full bg-[#fcfcfc] border border-black/[0.08] rounded-md px-3 py-2.5 font-display text-[14px] text-zinc-900 placeholder:text-zinc-400 outline-none h-28 resize-none focus:bg-white focus:border-zinc-300 focus:ring-4 focus:ring-zinc-100 transition-all shadow-sm"
                />
              </div>

            </div>
          </div>

          {/* Right Stage Builder */}
          <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">

            <div className="max-w-3xl space-y-8 pb-12 mx-auto">
              <div className="flex items-center justify-between border-b border-black/[0.06] pb-4">
                <div className="flex items-center gap-2 text-zinc-900">
                  <ListChecks size={16} />
                  <span className="font-display text-[13px] font-semibold">Execution Pipeline</span>
                </div>
                <button onClick={addStage} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-black/[0.06] bg-white text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors shadow-sm">
                  <Plus size={14} />
                  <span className="font-display text-[11px] font-medium">Add Stage</span>
                </button>
              </div>

              <div className="relative pl-2">
                {/* Continuous Pipeline Rail */}
                <div className="absolute left-[15px] top-4 bottom-0 w-[2px] bg-black/[0.04]" />

                {stages.map((stage, idx) => (
                  <div key={idx} className="relative flex items-start gap-6 group mb-10 last:mb-0">

                    {/* Stage Node */}
                    <div className="relative z-10 flex flex-col items-center shrink-0 mt-1">
                      <div className="w-4 h-4 rounded-full border-[2px] border-zinc-300 bg-[#fcfcfc] flex items-center justify-center group-hover:border-zinc-400 transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 group-hover:bg-zinc-400 transition-colors" />
                      </div>
                    </div>

                    {/* Stage Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 group/header">
                        <input
                          value={stage.name}
                          onChange={e => updateStage(idx, { name: e.target.value })}
                          placeholder={`Stage ${idx + 1}`}
                          className="flex-1 bg-transparent font-display text-[16px] font-semibold text-zinc-900 outline-none placeholder:text-zinc-300 transition-colors border-b border-transparent focus:border-zinc-300 pb-0.5"
                        />
                        <button onClick={() => removeStage(idx)} className="text-zinc-300 hover:text-red-500 opacity-0 group-hover/header:opacity-100 transition-all p-1">
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Subtasks (Checklist) */}
                      <div className="mt-3 space-y-1">
                        {stage.checklist?.map((item, itemIdx) => (
                          <div key={itemIdx} className="flex items-center gap-3 group/item py-1">
                            <div className="w-[14px] h-[14px] rounded-[3px] border border-zinc-300 shrink-0 bg-white shadow-sm" />
                            <input
                              value={item.text}
                              onChange={e => updateChecklistItem(idx, itemIdx, e.target.value)}
                              placeholder="Add a required action..."
                              className="flex-1 bg-transparent font-display text-[13px] text-zinc-700 outline-none placeholder:text-zinc-300 border-b border-transparent focus:border-zinc-300 transition-colors"
                            />
                          </div>
                        ))}

                        <button onClick={() => addChecklistItem(idx)} className="flex items-center gap-2 mt-2 font-display text-[12px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors px-1">
                          <Plus size={12} />
                          Add subtask
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Modal Footer */}
        <footer className="px-8 py-4 border-t border-black/[0.06] bg-zinc-50 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 font-display text-[13px] font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="px-5 py-2 bg-zinc-900 text-white rounded-md font-display text-[13px] font-medium hover:bg-zinc-800 transition-all shadow-sm flex items-center gap-2"
          >
            Create Pipeline
          </button>
        </footer>
      </div>
    </div>
  );
}
