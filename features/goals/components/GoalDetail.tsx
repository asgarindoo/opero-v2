"use client";

import { useState, useEffect } from "react";
import { X, Target, CheckCircle2, Circle, Clock, MoreHorizontal, Trash2, Edit3, Save, Plus, FileText, MessageSquare, TrendingUp, AlertCircle } from "lucide-react";
import type { Goal, Milestone } from "@/features/goals";

interface GoalDetailProps {
  goal: Goal;
  onClose: () => void;
  onUpdate: (updated: Goal) => void;
  onDelete: (id: string) => void;
}

export default function GoalDetail({ goal: initialGoal, onClose, onUpdate, onDelete }: GoalDetailProps) {
  const [goal, setFlow] = useState<Goal>(initialGoal);
  const [isEditing, setIsEditing] = useState(false);
  
  // Local edit states
  const [editTitle, setEditTitle] = useState(initialGoal.title);
  const [editTargetOutcome, setEditTargetOutcome] = useState(initialGoal.targetOutcome || "");
  const [editDescription, setEditDescription] = useState(initialGoal.description || "");
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    setFlow(initialGoal);
    setEditTitle(initialGoal.title);
    setEditTargetOutcome(initialGoal.targetOutcome || "");
    setEditDescription(initialGoal.description || "");
    setEditError(null);
    setIsEditing(false);
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

  const isEditValid = editTitle.trim() !== "" && editTargetOutcome.trim() !== "";

  const handleToggleEdit = () => {
    if (isEditing) {
      // Validate
      const trimmedTitle = editTitle.trim();
      const trimmedOutcome = editTargetOutcome.trim();
      if (!trimmedTitle) {
        setEditError("Goal title is required.");
        return;
      }
      if (!trimmedOutcome) {
        setEditError("Target outcome is required.");
        return;
      }
      setEditError(null);
      const next = {
        ...goal,
        title: trimmedTitle,
        targetOutcome: trimmedOutcome,
        description: editDescription.trim()
      };
      setFlow(next);
      onUpdate(next);
      setIsEditing(false);
    } else {
      setEditTitle(goal.title);
      setEditTargetOutcome(goal.targetOutcome || "");
      setEditDescription(goal.description || "");
      setEditError(null);
      setIsEditing(true);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white animate-fade-in overflow-hidden selection:bg-black/10">
      {/* Header */}
      <header className="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between bg-white shrink-0">
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
              <span className="font-display text-[11px] font-medium text-zinc-300">/</span>
              <span className="font-display text-[11px] font-medium text-zinc-500">Target: {goal.targetDate}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleEdit}
            disabled={isEditing && !isEditValid}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-black/[0.08] font-display text-[12px] font-medium text-zinc-700 hover:bg-zinc-50 transition-all shadow-sm disabled:opacity-40"
          >
            {isEditing ? <><Save size={14} /> Save</> : <><Edit3 size={14} /> Edit</>}
          </button>
          <div className="w-px h-4 bg-black/[0.1]" />
          <button
            onClick={() => onDelete(goal.id)}
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
            
            {/* Error banner */}
            {isEditing && editError && (
              <div className="p-3 py-2 bg-red-50 border border-red-100 rounded text-red-600 font-display text-[12px] flex items-center gap-2 animate-in fade-in duration-200">
                <AlertCircle size={14} className="shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            {/* Header Content */}
            <div className="space-y-4">
              {isEditing ? (
                <div className="space-y-1">
                  <label className="font-display text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                    Goal Title <span className="text-zinc-900">*</span>
                  </label>
                  <input
                    value={editTitle}
                    onChange={e => { setEditTitle(e.target.value); setEditError(null); }}
                    className="w-full font-display text-[32px] font-semibold text-zinc-900 bg-transparent outline-none border-b border-black/[0.1] pb-1 placeholder:text-zinc-300 focus:border-zinc-900 transition-colors"
                    placeholder="Goal Title *"
                    autoFocus
                  />
                </div>
              ) : (
                <h1 className="font-display text-[32px] font-semibold text-zinc-900 tracking-tight leading-tight">
                  {goal.title}
                </h1>
              )}
            </div>

            {/* Target Outcome */}
            <div className="space-y-3">
              <h2 className="font-display text-[11px] font-medium text-zinc-400 tracking-wide uppercase border-b border-black/[0.06] pb-2">
                Target Outcome {isEditing && <span className="text-zinc-900">*</span>}
              </h2>
              {isEditing ? (
                <input
                  value={editTargetOutcome}
                  onChange={e => { setEditTargetOutcome(e.target.value); setEditError(null); }}
                  className="w-full font-display text-[15px] text-zinc-700 bg-[#F9F9F9] rounded px-4 py-2.5 outline-none focus:bg-white border border-transparent focus:border-black/[0.1] focus:ring-4 focus:ring-black/[0.02] transition-all shadow-sm"
                  placeholder="Define concrete, measurable success *..."
                />
              ) : (
                <p className="font-display text-[15px] text-zinc-800 font-medium leading-relaxed max-w-2xl">
                  {goal.targetOutcome || "No concrete target outcome defined."}
                </p>
              )}
            </div>

            {/* Overview */}
            <div className="space-y-3">
              <h2 className="font-display text-[11px] font-medium text-zinc-400 tracking-wide uppercase border-b border-black/[0.06] pb-2">Goal Context</h2>
              {isEditing ? (
                <textarea
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  className="w-full font-display text-[15px] text-zinc-700 bg-[#F9F9F9] rounded p-4 outline-none focus:bg-white border border-transparent focus:border-black/[0.1] focus:ring-4 focus:ring-black/[0.02] transition-all resize-none shadow-sm h-32"
                  placeholder="Provide context and strategy for this goal..."
                />
              ) : (
                <p className="font-display text-[15px] text-zinc-600 leading-relaxed max-w-2xl">
                  {goal.description || "No context provided for this goal."}
                </p>
              )}
            </div>

            {/* Milestones */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between border-b border-black/[0.06] pb-3 mb-2">
                <h2 className="font-display text-[11px] font-medium text-zinc-400 tracking-wide uppercase">Execution Milestones</h2>
                <button className="text-zinc-400 hover:text-zinc-900 font-display text-[12px] font-medium transition-colors flex items-center gap-1">
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
                       <div className={`w-[14px] h-[14px] rounded-full border-[2px] flex items-center justify-center transition-all ${
                         m.completed ? "border-zinc-800 bg-zinc-800" : "border-zinc-300 bg-white group-hover:border-zinc-400"
                       }`}>
                          {m.completed && <CheckCircle2 size={10} strokeWidth={4} className="text-white" />}
                       </div>
                     </button>
                     
                     <div className="flex-1 flex flex-col pt-0.5">
                       <span className="font-display text-[10px] font-bold text-zinc-400 tracking-[0.1em] uppercase mb-1.5">
                         Target: {m.date}
                       </span>
                       <span className={`font-display text-[16px] leading-snug transition-all ${
                         m.completed ? "text-zinc-400 line-through decoration-zinc-300" : "text-zinc-900 font-medium"
                       }`}>
                         {m.title}
                       </span>
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
        <aside className="w-[280px] bg-[#F9F9F9] border-l border-black/[0.06] flex flex-col overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-8">
            {/* Progress Bar */}
            <section>
              <div className="flex items-end justify-between mb-3">
                <h4 className="font-display text-[11px] font-medium text-zinc-400 tracking-wide uppercase">Goal Progress</h4>
                <span className="font-display text-[20px] font-semibold text-zinc-900 leading-none tracking-tight">{goal.progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-black/[0.06] rounded-full overflow-hidden mb-3">
                <div className="h-full bg-zinc-800 transition-all duration-700 rounded-full" style={{ width: `${goal.progress}%` }} />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 animate-pulse" />
                <span className="font-display text-[11px] font-medium text-zinc-600">Active Execution</span>
              </div>
            </section>

            {/* Details */}
            <section>
              <h4 className="font-display text-[11px] font-medium text-zinc-400 tracking-wide uppercase mb-4 border-b border-black/[0.06] pb-2">Operational Info</h4>
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="font-display text-[12px] text-zinc-500 w-20 shrink-0">Status</span>
                  <div className="flex items-center gap-1.5 text-zinc-900 font-display text-[12px] font-medium">
                    <TrendingUp size={12} className="text-zinc-500" /> On Track
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="font-display text-[12px] text-zinc-500 w-20 shrink-0">Priority</span>
                  <span className="font-display text-[12px] font-medium text-zinc-900 uppercase">{goal.priority}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-display text-[12px] text-zinc-500 w-20 shrink-0">Deadline</span>
                  <span className="font-display text-[12px] font-medium text-zinc-900">{goal.targetDate}</span>
                </div>
              </div>
            </section>

            {/* Related Tasks */}
            <section>
              <div className="flex items-center justify-between border-b border-black/[0.06] pb-2 mb-3">
                <h4 className="font-display text-[11px] font-medium text-zinc-400 tracking-wide uppercase">Linked Tasks</h4>
                <button className="text-zinc-400 hover:text-zinc-900 transition-colors">
                  <Plus size={14} />
                </button>
              </div>
              <div className="space-y-1">
                {goal.linkedItems.map(item => (
                  <div key={item.id} className="flex items-center gap-2.5 p-2 rounded-md hover:bg-black/[0.03] transition-all cursor-pointer group">
                    <CheckCircle2 size={12} className="text-zinc-400 group-hover:text-zinc-600" />
                    <span className="font-display text-[13px] text-zinc-700 group-hover:text-zinc-900 truncate">{item.title}</span>
                  </div>
                ))}
                {goal.linkedItems.length === 0 && (
                  <div className="pt-2">
                     <span className="font-display text-[12px] text-zinc-400">No linked tasks.</span>
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="mt-auto p-6">
            <button 
              onClick={() => {
                onUpdate({ ...goal, status: "completed" });
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-md border border-black/[0.08] text-zinc-600 font-display text-[12px] font-medium hover:bg-zinc-100 hover:text-zinc-900 transition-all shadow-sm bg-white"
            >
              Archive Goal
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
