"use client";

import { useState } from "react";
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

  return (
    <div className="flex-1 flex flex-col h-full bg-background animate-fade-in overflow-hidden">
      {/* Header */}
      <header className="px-8 py-5 border-b border-black/[0.05] flex items-center justify-between bg-white/60 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-6">
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-black/5 transition-all text-on-surface-variant opacity-40 hover:opacity-100"
          >
            <X size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-label-caps text-[9px] font-bold text-primary uppercase tracking-widest">Operational Goal</span>
              <span className="w-1 h-1 rounded-full bg-black/10" />
              <span className="font-label-caps text-[9px] font-semibold text-on-surface-variant opacity-30 uppercase tracking-widest">Target: {goal.targetDate}</span>
            </div>
            {isEditing ? (
              <input
                value={goal.title}
                onChange={e => handleUpdate({ title: e.target.value })}
                className="font-display text-[18px] font-semibold text-on-surface bg-transparent outline-none border-b border-primary/20 pb-0.5"
                autoFocus
              />
            ) : (
              <h1 className="font-display text-[18px] font-semibold text-on-surface tracking-tight">{goal.title}</h1>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-black/5 text-on-surface-variant opacity-60 hover:opacity-100 transition-all font-label-caps text-[10px] font-bold uppercase tracking-widest"
          >
            {isEditing ? <><Save size={14} /> Save Changes</> : <><Edit3 size={14} /> Edit Goal</>}
          </button>
          <div className="w-px h-4 bg-black/[0.1]" />
          <button
            onClick={() => onDelete(goal.id)}
            className="p-2 rounded-lg hover:bg-red-50 text-red-500 opacity-40 hover:opacity-100 transition-all"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </header>

      {/* Main Content Split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Content */}
        <div className="flex-1 overflow-y-auto p-12 border-r border-black/[0.04]">
          <div className="max-w-3xl mx-auto">
            {/* Overview */}
            <div className="mb-14">
              <h2 className="font-label-caps text-[10px] font-bold text-on-surface-variant opacity-30 uppercase tracking-[0.2em] mb-4">Goal Context</h2>
              {isEditing ? (
                <textarea
                  value={goal.description}
                  onChange={e => handleUpdate({ description: e.target.value })}
                  className="w-full font-body-md text-[14px] text-on-surface bg-black/[0.02] rounded-lg p-4 outline-none focus:bg-white border border-transparent focus:border-primary/10 transition-all"
                  rows={3}
                />
              ) : (
                <p className="font-body-md text-[14px] text-on-surface opacity-80 leading-relaxed">{goal.description || "No context provided for this goal."}</p>
              )}
            </div>

            {/* Milestones */}
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-label-caps text-[10px] font-bold text-on-surface-variant opacity-30 uppercase tracking-[0.2em]">Execution Milestones</h2>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 text-primary font-label-caps text-[9px] font-bold uppercase">
                  <Plus size={12} /> Add Milestone
                </button>
              </div>

              <div className="space-y-4">
                {goal.milestones.map((m, idx) => {
                  const isLast = idx === goal.milestones.length - 1;
                  return (
                    <div key={m.id} className="relative flex gap-6 group">
                      {!isLast && (
                        <div className="absolute left-[13.5px] top-8 bottom-[-16px] w-[1px] bg-black/[0.05]" />
                      )}

                      <div className="shrink-0 pt-1.5 relative z-10">
                        <button
                          onClick={() => toggleMilestone(m.id)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${m.completed ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white border border-black/10 text-black/20 hover:border-primary hover:text-primary'}`}
                        >
                          {m.completed ? <CheckCircle2 size={16} /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                        </button>
                      </div>

                      <div className="flex-1 pb-8">
                        <div className={`p-5 rounded-xl border border-black/[0.04] transition-all group-hover:bg-white group-hover:border-black/[0.08] ${m.completed ? 'bg-black/[0.01] opacity-60' : 'bg-white/40'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className={`font-display text-[14px] font-semibold ${m.completed ? 'line-through' : 'text-on-surface'}`}>{m.title}</h3>
                            <span className="font-label-caps text-[8px] font-bold text-on-surface-variant opacity-30 uppercase tracking-widest">{m.date}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <aside className="w-[340px] bg-white/10 backdrop-blur-xl flex flex-col overflow-y-auto">
          <div className="p-8 space-y-12">
            {/* Progress Radial */}
            <section>
              <h4 className="font-label-caps text-[10px] font-bold text-on-surface-variant opacity-30 uppercase tracking-[0.2em] mb-8">Goal Progress</h4>
              <div className="relative w-36 h-36 mx-auto mb-8">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="72" cy="72" r="64" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-black/[0.03]" />
                  <circle
                    cx="72" cy="72" r="64" stroke="currentColor" strokeWidth="8" fill="transparent"
                    strokeDasharray={402}
                    strokeDashoffset={402 - (402 * goal.progress) / 100}
                    className="text-primary transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display text-[32px] font-bold text-on-surface tracking-tighter">{goal.progress}%</span>
                  <span className="font-label-caps text-[8px] font-bold text-on-surface-variant opacity-40 uppercase">Reached</span>
                </div>
              </div>
            </section>

            {/* Details */}
            <section className="pt-10 border-t border-black/[0.04] space-y-6">
              <h4 className="font-label-caps text-[10px] font-bold text-on-surface-variant opacity-30 uppercase tracking-[0.2em]">Operational Info</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-body-sm text-[12px] text-on-surface-variant opacity-40">Status</span>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 font-label-caps text-[9px] font-bold uppercase">
                    <TrendingUp size={10} /> On Track
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-body-sm text-[12px] text-on-surface-variant opacity-40">Priority</span>
                  <span className="font-label-caps text-[9px] font-bold text-on-surface uppercase">{goal.priority}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-body-sm text-[12px] text-on-surface-variant opacity-40">Deadline</span>
                  <span className="font-display text-[12px] font-semibold text-on-surface">{goal.targetDate}</span>
                </div>
              </div>
            </section>

            {/* Related Tasks */}
            <section className="pt-10 border-t border-black/[0.04]">
              <div className="flex items-center justify-between mb-5">
                <h4 className="font-label-caps text-[10px] font-bold text-on-surface-variant opacity-30 uppercase tracking-[0.2em]">Linked Tasks</h4>
                <Plus size={14} className="text-on-surface-variant opacity-30 hover:opacity-100 cursor-pointer" />
              </div>
              <div className="space-y-3">
                {goal.linkedItems.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border border-black/[0.03] bg-white/50 hover:bg-white transition-all cursor-pointer">
                    <CheckCircle2 size={14} className="opacity-20" />
                    <span className="font-body-sm text-[12px] text-on-surface truncate">{item.title}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="mt-auto p-6 border-t border-black/[0.04]">
            <button 
              onClick={() => {
                onUpdate({ ...goal, status: "completed" });
                onClose();
              }}
              className="w-full py-3 rounded-lg border border-black/[0.06] font-label-caps text-[10px] font-bold text-on-surface-variant opacity-40 hover:opacity-100 hover:bg-black/5 transition-all uppercase tracking-widest"
            >
              Archive Goal
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
