"use client";

import { useState, useEffect } from "react";
import { X, Target, CheckCircle2, Circle, Clock, MoreHorizontal, Trash2, Edit3, Save, Plus, FileText, MessageSquare, TrendingUp, AlertCircle, Archive } from "lucide-react";
import type { Goal, Milestone, GoalStatus, Priority } from "@/features/goals";
import Dropdown from "@/components/ui/Dropdown";
import DatePicker from "@/components/ui/DatePicker";
import ConfirmationModal from "@/components/common/ConfirmationModal";

interface GoalDetailProps {
  goal: Goal;
  onClose: () => void;
  onUpdate: (updated: Goal) => void;
  onDelete: (id: string) => void;
}

export default function GoalDetail({ goal: initialGoal, onClose, onUpdate, onDelete }: GoalDetailProps) {
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [goal, setFlow] = useState<Goal>(initialGoal);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [milestoneToDelete, setMilestoneToDelete] = useState<Milestone | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setFlow(initialGoal);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [initialGoal]);

  function handleUpdate(updates: Partial<Goal>) {
    const next = { ...goal, ...updates };
    setFlow(next);
    onUpdate(next);
  }

  function toggleMilestone(milestoneId: string) {
    const nextMilestones = goal.milestones.map(m =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );

    // Calculate new progress based on milestones
    const completedCount = nextMilestones.filter(m => m.completed).length;
    const progress = nextMilestones.length === 0 ? 0 : Math.round((completedCount / nextMilestones.length) * 100);

    handleUpdate({ milestones: nextMilestones, progress });
  }

  function updateMilestone(milestoneId: string, updates: Partial<Milestone>) {
    const nextMilestones = goal.milestones.map(m =>
      m.id === milestoneId ? { ...m, ...updates } : m
    );
    handleUpdate({ milestones: nextMilestones });
  }

  function removeMilestone(milestoneId: string) {
    const nextMilestones = goal.milestones.filter(m => m.id !== milestoneId);
    
    const completedCount = nextMilestones.filter(m => m.completed).length;
    const progress = nextMilestones.length === 0 ? 0 : Math.round((completedCount / nextMilestones.length) * 100);
    
    handleUpdate({ milestones: nextMilestones, progress });
  }

  function confirmRemoveMilestone() {
    if (!milestoneToDelete) return;
    removeMilestone(milestoneToDelete.id);
    setMilestoneToDelete(null);
  }

  function addMilestone() {
    const newId = `ms-${Date.now()}`;
    const newMilestone: Milestone = {
      id: newId,
      title: "",
      date: goal.targetDate || "",
      completed: false
    };
    handleUpdate({ milestones: [...goal.milestones, newMilestone] });
    setEditingMilestoneId(newId);
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white animate-fade-in overflow-hidden selection:bg-black/10">
      {/* Header */}
      <header className="px-6 h-[60px] border-b border-black/[0.06] flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-black/5 transition-all text-zinc-500 hover:text-zinc-900"
          >
            <X size={18} />
          </button>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-sm font-display text-[10px] font-medium tracking-wide text-zinc-600 bg-zinc-100 uppercase">
                Operational Goal
              </span>
              {goal.archived ? (
                <span className="px-2 py-0.5 rounded-sm font-display text-[10px] font-semibold tracking-wide text-amber-800 bg-amber-50 border border-amber-100 uppercase">
                  Archived
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-sm font-display text-[10px] font-semibold tracking-wide text-emerald-800 bg-emerald-50 border border-emerald-100 uppercase">
                  Active
                </span>
              )}
              <span className="font-display text-[11px] font-medium text-zinc-300">/</span>
              <span className="font-display text-[11px] font-medium text-zinc-500">
                Target: {goal.targetDate ? new Date(goal.targetDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="p-1.5 rounded hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-all"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </header>

      {/* Main Content Split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Content */}
        <div className="flex-1 overflow-y-auto p-10 bg-white custom-scrollbar">
          <div className="max-w-3xl mx-auto space-y-12">

            {/* Header Content */}
            <div className="space-y-4">
              <h1 className="font-display text-[32px] font-semibold text-zinc-900 tracking-tight leading-tight">
                {goal.title}
              </h1>
            </div>

            {/* Target Outcome */}
            <div className="space-y-3">
              <h2 className="font-display text-[11px] font-medium text-zinc-400 tracking-wide uppercase border-b border-black/[0.06] pb-2">
                Target Outcome
              </h2>
              <p className="font-display text-[15px] text-zinc-800 font-medium leading-relaxed max-w-2xl">
                {goal.targetOutcome || "No concrete target outcome defined."}
              </p>
            </div>

            {/* Overview */}
            <div className="space-y-3">
              <h2 className="font-display text-[11px] font-medium text-zinc-400 tracking-wide uppercase border-b border-black/[0.06] pb-2">Goal Context</h2>
              <p className="font-display text-[15px] text-zinc-600 leading-relaxed max-w-2xl">
                {goal.description || "No context provided for this goal."}
              </p>
            </div>

            {/* Milestones */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between border-b border-black/[0.06] pb-3 mb-2">
                <h2 className="font-display text-[11px] font-medium text-zinc-400 tracking-wide uppercase">Execution Milestones</h2>
                <button onClick={addMilestone} className="text-zinc-400 hover:text-zinc-900 font-display text-[12px] font-medium transition-colors flex items-center gap-1">
                  <Plus size={14} /> Add Milestone
                </button>
              </div>

              <div className="relative pl-6 space-y-8 pt-4 pb-8">
                {/* Roadmap Spine */}
                <div className="absolute left-[7px] top-6 bottom-6 w-px bg-gradient-to-b from-black/[0.08] via-black/[0.08] to-transparent" />

                {goal.milestones.map((m) => (
                  <div key={m.id} className="relative flex items-start gap-6 group">
                    {/* Roadmap Node */}
                    <button
                      onClick={() => toggleMilestone(m.id)}
                      className="absolute -left-[27px] top-[5px] z-10 w-[20px] h-[20px] bg-white rounded-full flex items-center justify-center cursor-pointer"
                    >
                      <div className={`w-[14px] h-[14px] rounded-full border-[2px] flex items-center justify-center transition-all ${m.completed ? "border-zinc-800 bg-zinc-800" : "border-zinc-300 bg-white group-hover:border-zinc-400"
                        }`}>
                        {m.completed && <CheckCircle2 size={10} strokeWidth={4} className="text-white" />}
                      </div>
                    </button>

                    <div className="flex-1 flex flex-col pt-0.5">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="font-display text-[10px] font-bold text-zinc-400 tracking-[0.1em] uppercase">
                          Target:
                        </span>
                        <DatePicker
                          variant="minimal"
                          value={m.date}
                          onChange={val => updateMilestone(m.id, { date: val || "" })}
                          placeholder="Set date..."
                        />
                      </div>
                      {editingMilestoneId === m.id ? (
                        <textarea 
                          maxLength={100}
                          rows={1}
                          value={m.title}
                          onChange={e => {
                            updateMilestone(m.id, { title: e.target.value });
                            e.target.style.height = 'auto';
                            e.target.style.height = `${e.target.scrollHeight}px`;
                          }}
                          onBlur={() => setEditingMilestoneId(null)}
                          autoFocus
                          ref={el => {
                            if (el) {
                              el.style.height = 'auto';
                              el.style.height = `${el.scrollHeight}px`;
                            }
                          }}
                          placeholder="Milestone title..."
                          className={`font-display text-[16px] leading-snug bg-transparent border border-primary/30 rounded p-1 outline-none w-full resize-none overflow-hidden ${m.completed ? "text-zinc-400" : "text-zinc-900 font-medium"
                            }`}
                        />
                      ) : (
                        <span 
                          onClick={() => toggleMilestone(m.id)}
                          className={`font-display text-[16px] leading-snug w-full cursor-pointer hover:opacity-70 ${m.completed ? "text-zinc-400 line-through decoration-zinc-300" : "text-zinc-900 font-medium"
                            }`}
                        >
                          {m.title || <span className="text-zinc-400 italic">Untitled Milestone</span>}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity mt-1">
                      <button onClick={() => setMilestoneToDelete(m)} className="p-1.5 rounded hover:bg-black/5 text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                {goal.milestones.length === 0 && (
                  <div className="py-8 flex justify-center border border-dashed border-black/[0.06] rounded-md">
                    <span className="font-display text-[13px] text-zinc-400">No milestones set.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <aside className="w-[280px] bg-[#F9F9F9] border-l border-black/[0.06] flex flex-col justify-between overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-8">
            {/* Progress Bar */}
            <section>
              <div className="flex items-end justify-between mb-3">
                <h4 className="font-display text-[11px] font-medium text-zinc-400 tracking-wide uppercase">Goal Progress</h4>
                <span className="font-display text-[14px] font-semibold text-zinc-700 leading-none tracking-tight">{goal.progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-black/[0.06] rounded-full overflow-hidden">
                <div className="h-full bg-zinc-700 transition-all duration-700 rounded-full" style={{ width: `${goal.progress}%` }} />
              </div>
            </section>

            {/* Details */}
            <section>
              <h4 className="font-display text-[11px] font-medium text-zinc-400 tracking-wide uppercase mb-4 border-b border-black/[0.06] pb-2">Operational Info</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-display text-[12px] text-zinc-500 w-20 shrink-0">Status</span>
                  <Dropdown
                    value={goal.status || "on-track"}
                    options={[
                      { value: "on-track", label: "On Track" },
                      { value: "at-risk", label: "At Risk" },
                      { value: "behind", label: "Behind" },
                      { value: "completed", label: "Completed" }
                    ]}
                    onChange={val => handleUpdate({ status: val as GoalStatus })}
                    align="right"
                    variant="minimal"
                    className="w-[140px]"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-display text-[12px] text-zinc-500 w-20 shrink-0">Priority</span>
                  <Dropdown
                    value={goal.priority || "medium"}
                    options={[
                      { value: "low", label: "Low" },
                      { value: "medium", label: "Medium" },
                      { value: "high", label: "High" },
                      { value: "critical", label: "Critical" }
                    ]}
                    onChange={val => handleUpdate({ priority: val as Priority })}
                    align="right"
                    variant="minimal"
                    className="w-[140px]"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-display text-[12px] text-zinc-500 w-20 shrink-0">Deadline</span>
                  <div className="w-[140px]">
                    <DatePicker
                      align="right"
                      position="top"
                      variant="ghost"
                      value={goal.targetDate || null}
                      onChange={val => handleUpdate({ targetDate: val || "" })}
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Bottom Actions */}
          <div className="p-6 border-t border-black/[0.06] bg-black/[0.01]">
            <button
              onClick={() => handleUpdate({ archived: !goal.archived })}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-transparent hover:bg-black/[0.04] text-zinc-600 hover:text-zinc-900 border border-black/[0.08] rounded-md font-display text-[12px] font-medium transition-colors"
            >
              <Archive size={14} />
              {goal.archived ? "Unarchive Goal" : "Archive Goal"}
            </button>
          </div>
        </aside>
      </div>
      
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          onDelete(goal.id);
          setIsDeleteModalOpen(false);
        }}
        title="Delete goal?"
        description="This action permanently removes this operational goal and its associated milestones. This action cannot be undone."
        confirmLabel="Delete Goal"
      />
      <ConfirmationModal
        isOpen={!!milestoneToDelete}
        onClose={() => setMilestoneToDelete(null)}
        onConfirm={confirmRemoveMilestone}
        title="Delete milestone?"
        description={`This action permanently removes "${milestoneToDelete?.title || "Untitled Milestone"}" from this goal. This action cannot be undone.`}
        confirmLabel="Delete Milestone"
        variant="danger"
      />
    </div>
  );
}
