"use client";

import { useState } from "react";
import { X, Plus, Trash2, CheckCircle2, Calendar, Target, AlignLeft, ListChecks } from "lucide-react";
import type { Goal, Milestone, GoalStatus, Priority } from "../types";

interface CreateGoalModalProps {
  onClose: () => void;
  onCreate?: (goal: Goal) => void;
}

function genId(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export default function CreateGoalModal({ onClose, onCreate }: CreateGoalModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [tempMilestones, setTempMilestones] = useState<{ id: string; title: string; date: string }[]>([
    { id: genId("ms"), title: "", date: "" }
  ]);
  const [error, setError] = useState("");

  function addMilestone() {
    setTempMilestones(prev => [...prev, { id: genId("ms"), title: "", date: "" }]);
  }

  function updateMilestone(id: string, updates: Partial<{ title: string; date: string }>) {
    setTempMilestones(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  }

  function removeMilestone(id: string) {
    if (tempMilestones.length <= 1) return;
    setTempMilestones(prev => prev.filter(m => m.id !== id));
  }

  function handleSubmit() {
    if (!title.trim()) { setError("Goal title is required."); return; }
    if (!targetDate) { setError("Target date is required."); return; }

    const now = new Date().toISOString().slice(0, 10);
    const newGoal: Goal = {
      id: genId("goal"),
      title: title.trim(),
      description: description.trim(),
      status: "on-track",
      priority,
      ownerId: "me",
      collaboratorIds: [],
      startDate: now,
      targetDate,
      progress: 0,
      keyResults: [],
      milestones: tempMilestones
        .filter(m => m.title.trim() !== "")
        .map(m => ({ id: m.id, title: m.title, date: m.date || targetDate, completed: false })),
      linkedItems: [],
      activities: []
    };
    
    if (onCreate) onCreate(newGoal);
    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-[4px] animate-in fade-in duration-300" onClick={onClose} />

      <div
        className="fixed z-[70] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex flex-col animate-in zoom-in-95 duration-300 shadow-2xl"
        style={{
          maxWidth: 640,
          maxHeight: "85vh",
          background: "var(--color-background)",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-black/[0.06] bg-white">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <Target size={20} />
             </div>
             <div>
                <h2 className="font-display text-[17px] font-semibold text-on-surface tracking-tight">New Operational Goal</h2>
                <p className="font-body-sm text-[12px] text-on-surface-variant opacity-40">Define a clear target and track its progress</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/5 transition-colors">
            <X size={18} className="text-on-surface-variant opacity-40" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-8 py-8 space-y-10 custom-scrollbar">
          {/* Identity Section */}
          <section className="space-y-6">
            <div className="space-y-2">
              <label className="font-label-caps text-[9px] font-bold text-on-surface-variant opacity-40 uppercase tracking-widest ml-1">Goal Title</label>
              <input
                autoFocus
                value={title}
                onChange={e => { setTitle(e.target.value); setError(""); }}
                placeholder="e.g. Q3 Sales Expansion"
                className="w-full px-4 py-3.5 rounded-lg border border-black/[0.08] bg-white font-display text-[14px] font-medium outline-none focus:border-primary/40 transition-all text-on-surface"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="font-label-caps text-[9px] font-bold text-on-surface-variant opacity-40 uppercase tracking-widest ml-1">Deadline</label>
                  <div className="relative">
                     <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-30" />
                     <input
                       type="date"
                       value={targetDate}
                       onChange={e => setTargetDate(e.target.value)}
                       className="w-full pl-10 pr-4 py-3.5 rounded-lg border border-black/[0.08] bg-white font-display text-[14px] outline-none text-on-surface"
                     />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="font-label-caps text-[9px] font-bold text-on-surface-variant opacity-40 uppercase tracking-widest ml-1">Priority</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as Priority)}
                    className="w-full px-4 py-3.5 rounded-lg border border-black/[0.08] bg-white font-display text-[14px] outline-none appearance-none cursor-pointer text-on-surface"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
               </div>
            </div>

            <div className="space-y-2">
              <label className="font-label-caps text-[9px] font-bold text-on-surface-variant opacity-40 uppercase tracking-widest ml-1">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Briefly describe the objective and context..."
                rows={2}
                className="w-full px-4 py-3.5 rounded-lg border border-black/[0.08] bg-white font-display text-[14px] outline-none resize-none focus:border-primary/40 transition-all text-on-surface"
              />
            </div>
          </section>

          {/* Milestones Section */}
          <section className="space-y-6 pt-10 border-t border-black/[0.04]">
            <div className="flex items-center justify-between mb-4">
               <h3 className="font-label-caps text-[10px] font-bold text-on-surface-variant opacity-30 uppercase tracking-[0.2em] ml-1">Key Milestones</h3>
               <button onClick={addMilestone} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/[0.04] hover:bg-black/[0.08] text-on-surface-variant opacity-60 hover:opacity-100 transition-all">
                  <Plus size={14} />
                  <span className="font-label-caps text-[9px] font-bold uppercase">Add Milestone</span>
               </button>
            </div>

            <div className="space-y-4">
               {tempMilestones.map((m, idx) => (
                 <div key={m.id} className="group flex items-start gap-4 bg-black/[0.01] border border-black/[0.05] rounded-xl p-5 transition-all hover:bg-white hover:shadow-lg">
                    <div className="w-6 h-6 rounded-full bg-black/[0.06] flex items-center justify-center font-display text-[11px] font-bold text-on-surface-variant opacity-40 mt-1 shrink-0">
                       {idx + 1}
                    </div>
                    <div className="flex-1 grid grid-cols-5 gap-4">
                       <input 
                         value={m.title}
                         onChange={e => updateMilestone(m.id, { title: e.target.value })}
                         placeholder="Milestone title..."
                         className="col-span-3 bg-transparent font-display text-[14px] font-semibold text-on-surface outline-none border-b border-transparent focus:border-primary/20 pb-0.5 transition-all"
                       />
                       <input 
                         type="date"
                         value={m.date}
                         onChange={e => updateMilestone(m.id, { date: e.target.value })}
                         className="col-span-2 bg-transparent font-body-sm text-[12px] text-on-surface-variant outline-none border-b border-black/[0.03] focus:border-primary/20 transition-all"
                       />
                    </div>
                    <button onClick={() => removeMilestone(m.id)} className="p-1.5 rounded-lg text-red-500 opacity-0 group-hover:opacity-40 hover:opacity-100 transition-opacity mt-1">
                       <Trash2 size={14} />
                    </button>
                 </div>
               ))}
            </div>
          </section>

          {error && <div className="p-4 rounded-lg bg-red-50 border border-red-100 text-red-600 font-body-sm text-[12px] flex items-center gap-2"><X size={14} /> {error}</div>}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-black/[0.06] bg-black/[0.01] flex items-center justify-end gap-3">
           <button onClick={onClose} className="px-5 py-2.5 rounded-lg font-label-caps text-[10px] font-bold text-on-surface-variant opacity-40 hover:opacity-100 transition-all uppercase tracking-widest">Cancel</button>
           <button onClick={handleSubmit} className="px-6 py-2.5 rounded-lg bg-primary text-on-primary font-label-caps text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-px transition-all active:scale-[0.98]">Set Goal</button>
        </div>
      </div>
    </>
  );
}
