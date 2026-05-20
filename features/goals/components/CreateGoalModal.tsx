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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={loading ? undefined : onClose}
    >
      <div
        className="bg-white w-full max-w-3xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-black/[0.08] animate-in slide-in-from-bottom-4 duration-500"
        onClick={e => e.stopPropagation()}
      >

        {/* Modal Header */}
        <header className="px-10 py-8 border-b border-black/[0.04] bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center text-primary shadow-sm">
              <Target size={24} />
            </div>
            <div>
              <h2 className="font-display text-[18px] font-semibold text-zinc-900 tracking-tight">Define Strategic Goal</h2>
              <p className="font-display text-[13px] text-zinc-500">Establish direction, outcome metrics, and key milestones</p>
            </div>
          </div>
          <button
            disabled={loading}
            onClick={onClose}
            className="p-3 rounded-md hover:bg-black/5 transition-all text-zinc-400 hover:text-zinc-600 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </header>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-10 py-10 space-y-10 bg-[#fafafa] custom-scrollbar">

          {/* Section 1: Vision & Objective */}
          <section className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="font-display text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Goal Title</label>
                <span className="font-display text-[10px] font-medium text-zinc-400">{title.length}/50</span>
              </div>
              <input
                maxLength={50}
                autoFocus
                disabled={loading}
                value={title}
                onChange={e => { setTitle(e.target.value); setError(null); }}
                placeholder="e.g. Q3 Sales Expansion"
                className="w-full bg-white border border-black/[0.08] rounded-xl px-4 py-3.5 font-display text-[15px] font-semibold text-zinc-900 outline-none placeholder:text-zinc-300 placeholder:font-normal focus:border-zinc-900/40 transition-all shadow-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Target Outcome */}
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="font-display text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Target Outcome</label>
                  <span className="font-display text-[10px] font-medium text-zinc-400">{targetOutcome.length}/100</span>
                </div>
                <input
                  maxLength={100}
                  disabled={loading}
                  value={targetOutcome}
                  onChange={e => { setTargetOutcome(e.target.value); setError(null); }}
                  placeholder="Measurable success metric..."
                  className="w-full bg-white border border-black/[0.08] rounded-xl px-4 py-3 font-display text-[14px] text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-900/40 transition-all shadow-sm"
                />
              </div>

              {/* Deadline */}
              <div className="space-y-2">
                <label className="font-display text-[11px] font-medium text-zinc-500 uppercase tracking-wider ml-1">Deadline</label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    disabled={loading}
                    type="date"
                    value={targetDate}
                    onChange={e => { setTargetDate(e.target.value); setError(null); }}
                    className="w-full bg-white border border-black/[0.08] rounded-xl pl-10 pr-4 py-3 font-display text-[14px] text-zinc-900 outline-none focus:border-zinc-900/40 transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Context / Purpose */}
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="font-display text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Context & Purpose</label>
                <span className="font-display text-[10px] font-medium text-zinc-400">{description.length}/300</span>
              </div>
              <textarea
                maxLength={300}
                disabled={loading}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Rationale behind this objective and strategic alignment..."
                className="w-full bg-white border border-black/[0.08] rounded-xl px-4 py-3.5 font-display text-[14px] text-zinc-900 placeholder:text-zinc-400 outline-none h-24 resize-none focus:border-zinc-900/40 transition-all shadow-sm leading-relaxed"
              />
            </div>
          </section>

          {/* Section 2: Strategic Metadata */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8 border-t border-black/[0.04]">
            {/* Priority */}
            <div className="space-y-2">
              <label className="font-display text-[11px] font-medium text-zinc-500 uppercase tracking-wider ml-1">Priority / Impact</label>
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
            <div className="space-y-2">
              <label className="font-display text-[11px] font-medium text-zinc-500 uppercase tracking-wider ml-1">Planning Status</label>
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
          <section className="space-y-6 pt-8 border-t border-black/[0.04]">
            <div className="flex items-center justify-between border-b border-black/[0.04] pb-4">
              <div className="flex items-center gap-2 text-zinc-900">
                <Target size={14} className="text-zinc-400" />
                <span className="font-display text-[12px] font-semibold uppercase tracking-wider">Roadmap Checkpoints</span>
              </div>
              <button
                type="button"
                disabled={loading}
                onClick={addMilestone}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-900/5 text-zinc-900 hover:bg-zinc-900/10 transition-all shadow-sm"
              >
                <Plus size={14} />
                <span className="font-display text-[11px] font-medium">Add Checkpoint</span>
              </button>
            </div>

            <div className="py-2 flex flex-col pl-4">
              {tempMilestones.map((m, idx) => {
                const isLast = idx === tempMilestones.length - 1;
                return (
                  <div key={m.id} className="relative w-full flex items-stretch text-left group transition-all">

                    {/* Anchor/Connector Column */}
                    <div className="relative w-10 shrink-0 flex flex-col items-center">
                      {/* Vertical connector line */}
                      {tempMilestones.length > 1 && (
                        <div className={`absolute w-px left-1/2 -translate-x-1/2 bg-gradient-to-b from-black/[0.08] via-black/[0.08] to-transparent ${idx === 0 ? "top-6 bottom-0" :
                          isLast ? "top-0 h-6" :
                            "top-0 bottom-0"
                          }`} />
                      )}

                      {/* Circle Checkpoint Node */}
                      <div className="h-12 w-full flex items-center justify-center relative z-10">
                        <div className="w-[14px] h-[14px] rounded-full border-[2px] bg-white border-zinc-300 group-hover:border-zinc-400 transition-all shadow-sm" />
                      </div>
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 pb-6 pt-[10px] flex flex-col justify-start">
                      <div className="flex items-center gap-4 transition-all">
                        <input
                          disabled={loading}
                          value={m.title}
                          onChange={e => updateMilestone(m.id, { title: e.target.value })}
                          placeholder={`Checkpoint ${idx + 1}`}
                          className="flex-1 bg-transparent font-display text-[14px] font-semibold text-zinc-900 outline-none placeholder:text-zinc-400 placeholder:font-normal"
                        />
                        <div className="flex items-center gap-2 border-l border-black/[0.06] pl-4">
                          <Calendar size={14} className="text-zinc-400 shrink-0" />
                          <input
                            disabled={loading}
                            type="date"
                            value={m.date}
                            onChange={e => updateMilestone(m.id, { date: e.target.value })}
                            className="bg-transparent font-display text-[13px] text-zinc-600 outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          disabled={loading || tempMilestones.length <= 1}
                          onClick={() => removeMilestone(m.id)}
                          className="ml-2 p-1.5 rounded-md text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/5 hover:text-red-500 disabled:opacity-30 disabled:pointer-events-none shrink-0"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </div>

        {/* Error Alert bar inside modal */}
        {error && (
          <div className="px-10 py-3 bg-red-50 border-t border-red-100 text-red-600 font-display text-[12px] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Modal Footer */}
        <footer className="px-10 py-6 border-t border-black/[0.04] bg-white flex items-center justify-end gap-4 shrink-0">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="font-display text-[13px] font-medium text-zinc-500 hover:text-zinc-800 transition-all px-4 py-2 disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!isFormValid || loading}
            onClick={handleSubmit}
            className={`px-6 py-2.5 rounded-md font-display text-[13px] font-medium transition-all flex items-center gap-1.5 ${isFormValid && !loading
              ? "bg-zinc-900 text-white shadow-sm hover:shadow hover:-translate-y-px"
              : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
              }`}
          >
            {loading ? "Establishing..." : "Establish Goal"}
          </button>
        </footer>

      </div>
    </div>
  );
}
