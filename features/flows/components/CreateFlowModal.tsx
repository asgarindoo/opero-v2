"use client";

import React, { useState } from "react";
import { X, Plus, Trash2, Layers, Info, ListChecks, Tag } from "lucide-react";
import { FLOW_CATEGORIES, type Flow, type FlowCategory, type FlowStage } from "../types";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[32px] border border-black/[0.08] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
        <header className="px-10 py-8 border-b border-black/[0.04] bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20">
              <Layers size={24} />
            </div>
            <div>
              <h2 className="font-display text-[20px] font-bold text-on-surface tracking-tight">New Operational Flow</h2>
              <p className="font-display text-[13px] text-on-surface-variant opacity-40">Design a reusable execution path for your operations</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 rounded-2xl hover:bg-black/5 transition-all">
            <X size={20} className="text-on-surface-variant opacity-30" />
          </button>
        </header>

        <div className="flex-1 overflow-hidden flex">
          {/* Identity Info */}
          <div className="w-[340px] border-r border-black/[0.04] bg-black/[0.01] p-10 space-y-8 overflow-y-auto custom-scrollbar">
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-primary">
                 <Info size={14} />
                 <span className="font-display text-[10px] font-bold uppercase tracking-widest">Process Details</span>
              </div>
              
              <div className="space-y-2">
                <label className="font-display text-[9px] font-bold text-on-surface-variant opacity-40 uppercase tracking-widest ml-1">Flow Name</label>
                <input 
                  autoFocus
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Employee Onboarding"
                  className="w-full bg-white border border-black/[0.08] rounded-xl px-4 py-3 font-display text-[14px] outline-none focus:border-primary/40 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="font-display text-[9px] font-bold text-on-surface-variant opacity-40 uppercase tracking-widest ml-1">Category</label>
                <div className="relative">
                  <Tag size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-30" />
                  <select 
                    value={category}
                    onChange={e => setCategory(e.target.value as FlowCategory)}
                    className="w-full bg-white border border-black/[0.08] rounded-xl pl-10 pr-4 py-3 font-display text-[14px] outline-none appearance-none cursor-pointer"
                  >
                    {FLOW_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-display text-[9px] font-bold text-on-surface-variant opacity-40 uppercase tracking-widest ml-1">Objective</label>
                <textarea 
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
                  <span className="font-display text-[10px] font-bold uppercase tracking-widest">Execution Stages</span>
               </div>
               <button onClick={addStage} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 text-primary hover:bg-primary/10 transition-all">
                  <Plus size={14} />
                  <span className="font-display text-[10px] font-bold uppercase tracking-wider">Add Stage</span>
               </button>
            </div>

            <div className="space-y-8">
              {stages.map((stage, idx) => (
                <div key={idx} className="relative group">
                  {idx !== stages.length - 1 && (
                    <div className="absolute left-[13.5px] top-10 bottom-[-32px] w-[1px] bg-black/[0.04]" />
                  )}
                  <div className="flex gap-6">
                    <div className="w-7 h-7 rounded-lg bg-black/[0.04] flex items-center justify-center font-mono text-[11px] font-bold text-on-surface-variant opacity-40 shrink-0 mt-1">
                      {idx + 1}
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-4">
                        <input 
                          value={stage.name}
                          onChange={e => updateStage(idx, { name: e.target.value })}
                          placeholder={`Stage ${idx + 1} Title`}
                          className="flex-1 bg-transparent font-display text-[18px] font-semibold text-on-surface outline-none border-b border-transparent focus:border-primary/20 pb-1 transition-all"
                        />
                        <button onClick={() => removeStage(idx)} className="text-red-500 opacity-0 group-hover:opacity-40 hover:opacity-100 transition-opacity">
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="space-y-3 ml-2">
                         {stage.checklist?.map((item, itemIdx) => (
                           <div key={itemIdx} className="flex items-center gap-3 group/item">
                             <div className="w-4 h-4 rounded border-2 border-black/10 shrink-0" />
                             <input 
                               value={item.text}
                               onChange={e => updateChecklistItem(idx, itemIdx, e.target.value)}
                               placeholder="Process item..."
                               className="flex-1 bg-transparent font-display text-[14px] text-on-surface outline-none border-b border-black/[0.03] focus:border-primary/20 transition-all"
                             />
                           </div>
                         ))}
                         <button onClick={() => addChecklistItem(idx)} className="flex items-center gap-2 font-display text-[11px] font-bold text-primary opacity-40 hover:opacity-100 transition-all uppercase tracking-widest">
                           <Plus size={14} />
                           Add item
                         </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <footer className="px-10 py-6 border-t border-black/[0.04] bg-white flex items-center justify-end gap-6 shrink-0">
          <button onClick={onClose} className="font-display text-[12px] font-bold text-on-surface-variant opacity-40 hover:opacity-100 uppercase tracking-widest transition-all">Cancel</button>
          <button 
            onClick={handleCreate}
            className="px-8 py-3 bg-primary text-on-primary rounded-2xl font-display text-[12px] font-bold uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-2xl hover:-translate-y-px transition-all"
          >
            Create Process Flow
          </button>
        </footer>
      </div>
    </div>
  );
}
