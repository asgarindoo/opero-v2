"use client";

import { useState } from "react";
import { X, Plus, Trash2, Calendar, Target } from "lucide-react";
import type { Goal, GoalStatus, Priority } from "@/features/goals";
import Dropdown from "@/components/ui/Dropdown";

interface CreateGoalModalProps {
  onClose: () => void;
  onCreate?: (goal: Goal) => Promise<any> | any;
}

function genId(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export default function CreateGoalModal({ onClose, onCreate }: CreateGoalModalProps) {
  const [title, setTitle] = useState("");
  const [targetOutcome, setTargetOutcome] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [status, setStatus] = useState<GoalStatus>("on-track");
  const [tempMilestones, setTempMilestones] = useState<{ id: string; title: string; date: string }[]>([
    { id: genId("ms"), title: "", date: "" }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const isFormValid = title.trim() !== "" && targetOutcome.trim() !== "" && targetDate !== "" && (status as string) !== "";

  async function handleSubmit() {
    setError(null);
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Goal title is required.");
      return;
    }
    const trimmedOutcome = targetOutcome.trim();
    if (!trimmedOutcome) {
      setError("Target outcome is required.");
      return;
    }
    if (!targetDate) {
      setError("Deadline is required.");
      return;
    }
    if (!status) {
      setError("Planning status is required.");
      return;
    }

    setLoading(true);
    try {
      const now = new Date().toISOString().slice(0, 10);
      const newGoal: Goal = {
        id: genId("goal"),
        title: trimmedTitle,
        description: description.trim(),
        targetOutcome: trimmedOutcome,
        status: status,
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
      
      if (onCreate) {
        await onCreate(newGoal);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to establish goal.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-zinc-900/30 backdrop-blur-[2px] animate-in fade-in duration-200" 
      onClick={loading ? undefined : onClose}
    >
      <div 
        className="bg-white w-full max-w-3xl h-[85vh] rounded-lg shadow-lg flex flex-col overflow-hidden border border-black/10 animate-in zoom-in-95 duration-100" 
        onClick={e => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <header className="px-8 py-5 border-b border-black/[0.05] bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-900">
              <Target size={16} />
            </div>
            <div>
              <h2 className="font-display text-[14px] font-semibold text-zinc-950 tracking-tight leading-tight">Define Strategic Goal</h2>
              <p className="font-display text-[11px] text-zinc-400 mt-0.5">Establish direction, outcome metrics, and key milestones</p>
            </div>
          </div>
          <button 
            disabled={loading}
            onClick={onClose} 
            className="p-1.5 rounded hover:bg-zinc-50 text-zinc-400 hover:text-zinc-900 transition-colors disabled:opacity-50"
          >
            <X size={15} />
          </button>
        </header>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 bg-[#fafafa] custom-scrollbar">
          
          {/* Section 1: Vision & Objective */}
          <section className="space-y-5">
            <div className="space-y-1.5">
              <label className="font-display text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                Goal Title <span className="text-zinc-900">*</span>
              </label>
              <input
                autoFocus
                disabled={loading}
                value={title}
                onChange={e => { setTitle(e.target.value); setError(null); }}
                placeholder="e.g. Q3 Sales Expansion"
                className="w-full bg-transparent font-display text-[20px] font-bold text-zinc-950 outline-none placeholder:text-zinc-300 border-b border-black/[0.05] focus:border-zinc-900 pb-1.5 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Target Outcome */}
              <div className="space-y-1.5">
                <label className="font-display text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Target Outcome <span className="text-zinc-900">*</span>
                </label>
                <input
                  disabled={loading}
                  value={targetOutcome}
                  onChange={e => { setTargetOutcome(e.target.value); setError(null); }}
                  placeholder="Define concrete, measurable success..."
                  className="w-full bg-white border border-black/[0.06] rounded px-3 py-2 font-display text-[13px] text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-900 transition-all shadow-sm"
                />
              </div>

              {/* Deadline */}
              <div className="space-y-1.5">
                <label className="font-display text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Deadline <span className="text-zinc-900">*</span>
                </label>
                <div className="relative">
                  <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    disabled={loading}
                    type="date"
                    value={targetDate}
                    onChange={e => { setTargetDate(e.target.value); setError(null); }}
                    className="w-full bg-white border border-black/[0.06] rounded pl-9 pr-3 py-2 font-display text-[13px] text-zinc-900 outline-none focus:border-zinc-900 transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Context / Purpose */}
            <div className="space-y-1.5">
              <label className="font-display text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                Context & Purpose
              </label>
              <textarea
                disabled={loading}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Rationale behind this objective, strategic alignment, and context..."
                className="w-full bg-white border border-black/[0.06] rounded px-3 py-2 font-display text-[13px] text-zinc-900 placeholder:text-zinc-400 outline-none h-20 resize-none focus:border-zinc-900 transition-all shadow-sm"
              />
            </div>
          </section>

          {/* Section 2: Strategic Metadata */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-black/[0.04]">
            {/* Priority */}
            <div className="space-y-1.5">
              <label className="font-display text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                Priority / Impact
              </label>
              <Dropdown
                disabled={loading}
                value={priority}
                onChange={(val) => setPriority(val as Priority)}
                options={[
                  { value: "low", label: "Low Impact" },
                  { value: "medium", label: "Medium Impact" },
                  { value: "high", label: "High Impact" },
                  { value: "critical", label: "Critical Priority" },
                ]}
              />
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="font-display text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                Planning Status <span className="text-zinc-900">*</span>
              </label>
              <Dropdown
                disabled={loading}
                value={status}
                onChange={(val) => { setStatus(val as GoalStatus); setError(null); }}
                options={[
                  { value: "on-track", label: "On Track" },
                  { value: "at-risk", label: "At Risk" },
                  { value: "behind", label: "Behind" },
                  { value: "completed", label: "Completed" },
                ]}
              />
            </div>
          </section>

          {/* Section 3: Roadmap Checkpoints */}
          <section className="space-y-4 pt-4 border-t border-black/[0.04]">
            <div className="flex items-center justify-between border-b border-black/[0.04] pb-2">
              <div className="space-y-0.5">
                <h3 className="font-display text-[12px] font-semibold text-zinc-950">Roadmap Checkpoints</h3>
                <p className="font-display text-[11px] text-zinc-400">Establish key achievement milestones along the path</p>
              </div>
              <button 
                type="button"
                disabled={loading}
                onClick={addMilestone}
                className="flex items-center gap-1 px-2 py-1 rounded border border-black/[0.06] bg-white text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors shadow-sm text-[11px] font-medium font-display"
              >
                <Plus size={12} />
                <span>Add Checkpoint</span>
              </button>
            </div>

            {/* Checkpoint list - Calm, lightweight, horizontal, no connectors */}
            <div className="space-y-2">
              {tempMilestones.map((m, idx) => (
                <div key={m.id} className="flex items-center gap-3 py-1.5 px-2 hover:bg-zinc-50 rounded transition-colors group bg-white border border-black/[0.02]">
                  {/* Subtle Achievement Marker - Diamond-like Dot */}
                  <div className="w-1.5 h-1.5 rotate-45 bg-zinc-900 shrink-0" />
                  
                  <div className="flex-1 grid grid-cols-5 gap-3">
                    <input
                      disabled={loading}
                      value={m.title}
                      onChange={e => updateMilestone(m.id, { title: e.target.value })}
                      placeholder="Checkpoint description..."
                      className="col-span-3 bg-transparent font-display text-[13px] font-semibold text-zinc-900 outline-none border-b border-transparent focus:border-zinc-300 pb-0.5 transition-colors"
                    />
                    <div className="col-span-2 flex items-center gap-1.5 border-b border-transparent focus-within:border-zinc-300 pb-0.5 transition-colors">
                      <Calendar size={11} className="text-zinc-400 shrink-0" />
                      <input
                        disabled={loading}
                        type="date"
                        value={m.date}
                        onChange={e => updateMilestone(m.id, { date: e.target.value })}
                        className="bg-transparent font-display text-[12px] text-zinc-500 outline-none w-full"
                      />
                    </div>
                  </div>

                  <button 
                    type="button"
                    disabled={loading || tempMilestones.length <= 1}
                    onClick={() => removeMilestone(m.id)}
                    className="p-1 rounded text-zinc-300 hover:text-red-500 disabled:opacity-30 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Error Alert bar inside modal */}
        {error && (
          <div className="px-8 py-2 bg-red-50 border-t border-red-100 text-red-600 font-display text-[11px] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Modal Footer */}
        <footer className="px-8 py-3.5 border-t border-black/[0.05] bg-zinc-50 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="px-3.5 py-1.5 font-display text-[12px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!isFormValid || loading}
            onClick={handleSubmit}
            className="px-4 py-1.5 bg-zinc-900 text-white rounded font-display text-[12px] font-medium hover:bg-zinc-800 transition-all disabled:opacity-30 disabled:hover:bg-zinc-900 flex items-center gap-1.5 shadow-sm"
          >
            {loading ? "Establishing..." : "Establish Goal"}
          </button>
        </footer>

      </div>
    </div>
  );
}
