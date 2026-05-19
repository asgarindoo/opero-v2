"use client";

import React, { useState } from "react";
import { 
  X, 
  CheckCircle2, 
  MessageSquare, 
  Plus, 
  Trash2, 
  Calendar,
  User,
  MoreVertical,
  Link as LinkIcon,
  FileText
} from "lucide-react";
import type { Flow, FlowStage } from "../types";
import { CATEGORY_COLORS } from "../types";

interface FlowDetailProps {
  flow: Flow;
  onClose: () => void;
  onUpdate: (updated: Flow) => void;
  onDelete: (id: string) => void;
}

export default function FlowDetail({ flow: initialFlow, onClose, onUpdate, onDelete }: FlowDetailProps) {
  const [flow, setFlow] = useState<Flow>(initialFlow);
  const [activeStageId, setActiveStageId] = useState<string | null>(flow.stages[0]?.id || null);

  const activeStage = flow.stages.find(s => s.id === activeStageId) || flow.stages[0];

  const handleUpdateStage = (stageId: string, updates: Partial<FlowStage>) => {
    const nextStages = flow.stages.map(s => s.id === stageId ? { ...s, ...updates } : s);
    
    // Simple progress calculation based on completed stages
    const completedStages = nextStages.filter(s => s.isCompleted).length;
    const progress = Math.round((completedStages / nextStages.length) * 100);
    
    const nextFlow = { ...flow, stages: nextStages, progress, updated: new Date().toISOString() };
    setFlow(nextFlow);
    onUpdate(nextFlow);
  };

  const toggleChecklistItem = (stageId: string, itemId: string) => {
    const stage = flow.stages.find(s => s.id === stageId);
    if (!stage) return;

    const nextChecklist = stage.checklist.map(item => 
      item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
    );

    // If all items in checklist are completed, mark stage as completed (auto-operational help)
    const isStageCompleted = nextChecklist.length > 0 && nextChecklist.every(i => i.isCompleted);

    handleUpdateStage(stageId, { checklist: nextChecklist, isCompleted: isStageCompleted });
  };

  return (
    <div className="flex-1 flex flex-col bg-[#fef8f8] h-full overflow-hidden animate-fade-in">
      {/* ── Detail Navbar ── */}
      <header className="px-8 py-5 border-b border-black/[0.04] bg-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-black/5 transition-all text-on-surface-variant opacity-60 hover:opacity-100">
            <X size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-1.5 py-0.5 rounded font-display text-[9px] font-bold uppercase tracking-wider ${CATEGORY_COLORS[flow.category] || "text-slate-500 bg-slate-50"}`}>
                {flow.category}
              </span>
              <span className="w-1 h-1 rounded-full bg-black/10" />
              <span className="font-display text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">Workspace Flow</span>
            </div>
            <h1 className="font-display text-[18px] font-semibold text-on-surface tracking-tight">{flow.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-black/[0.08] font-display text-[12px] font-bold text-on-surface-variant hover:border-black/[0.15] transition-all">
            <LinkIcon size={14} />
            SHARE
          </button>
          <button className="p-2.5 rounded-xl hover:bg-black/5 text-on-surface-variant opacity-60 hover:opacity-100 transition-all">
            <MoreVertical size={20} />
          </button>
        </div>
      </header>

      {/* ── Main Detail Workspace ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Stage Navigation */}
        <aside className="w-[300px] border-r border-black/[0.04] bg-white/40 flex flex-col overflow-hidden">
           <div className="p-8 space-y-8">
              <div>
                 <h3 className="font-display text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest mb-6">Workflow Progress</h3>
                 <div className="space-y-3">
                    {flow.stages.map((stage, idx) => (
                      <button
                        key={stage.id}
                        onClick={() => setActiveStageId(stage.id)}
                        className={`w-full flex items-start gap-4 p-3 rounded-2xl transition-all text-left ${
                          activeStageId === stage.id ? "bg-white border-black/[0.08] shadow-sm" : "hover:bg-black/[0.02] border-transparent"
                        } border`}
                      >
                         <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                           stage.isCompleted ? "bg-emerald-500 text-white" : activeStageId === stage.id ? "bg-primary text-white" : "bg-black/[0.04] text-on-surface-variant opacity-60"
                         }`}>
                           {stage.isCompleted ? <CheckCircle2 size={14} /> : <span className="font-mono text-[11px] font-bold">{idx + 1}</span>}
                         </div>
                         <div className="flex-1 min-w-0">
                            <h4 className={`font-display text-[13px] font-semibold truncate ${activeStageId === stage.id ? "text-on-surface" : "text-on-surface-variant opacity-60"}`}>
                              {stage.name}
                            </h4>
                            <p className="font-display text-[10px] text-on-surface-variant opacity-60 font-medium">
                              {stage.checklist.filter(i => i.isCompleted).length} / {stage.checklist.length} Tasks
                            </p>
                         </div>
                      </button>
                    ))}
                 </div>
              </div>
           </div>
        </aside>

        {/* Center: Stage Contents */}
        <main className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-white/20">
           <div className="max-w-3xl mx-auto space-y-12 animate-fade-in">
              <section className="space-y-6">
                 <div>
                   <h2 className="font-display text-[24px] font-bold text-on-surface tracking-tight mb-2">{activeStage.name}</h2>
                   <p className="font-display text-[14px] text-on-surface-variant opacity-60 leading-relaxed">
                     {activeStage.description || "No detailed description for this stage."}
                   </p>
                 </div>

                 <div className="bg-white border border-black/[0.06] rounded-3xl p-8 space-y-8 shadow-sm shadow-black/[0.02]">
                    <div className="flex items-center justify-between">
                       <h3 className="font-display text-[12px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">Stage Checklist</h3>
                       <button className="text-primary font-display text-[12px] font-bold hover:underline transition-opacity">
                         + Add Item
                       </button>
                    </div>

                    <div className="space-y-4">
                       {activeStage.checklist.map(item => (
                         <div 
                           key={item.id}
                           onClick={() => toggleChecklistItem(activeStage.id, item.id)}
                           className="flex items-center gap-4 group cursor-pointer"
                         >
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                              item.isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : "border-black/[0.12] group-hover:border-primary/40"
                            }`}>
                               {item.isCompleted && <CheckCircle2 size={12} strokeWidth={3} />}
                            </div>
                            <span className={`font-display text-[14px] transition-all ${item.isCompleted ? "text-on-surface-variant opacity-60 line-through" : "text-on-surface opacity-80"}`}>
                              {item.text}
                            </span>
                         </div>
                       ))}
                    </div>
                 </div>
              </section>

              {/* Notes Section */}
              <section className="pt-12 border-t border-black/[0.06] space-y-8">
                 <div className="flex items-center justify-between">
                    <h3 className="font-display text-[12px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">Operational Notes</h3>
                    <MessageSquare size={16} className="text-on-surface-variant opacity-60" />
                 </div>

                 <div className="space-y-6">
                    <div className="relative">
                       <textarea 
                         placeholder="Add a note or update..."
                         className="w-full bg-white border border-black/[0.06] rounded-2xl p-4 font-display text-[14px] outline-none focus:border-primary/20 transition-all resize-none h-24"
                       />
                       <button className="absolute right-4 bottom-4 px-4 py-1.5 bg-primary text-on-primary font-display text-[11px] font-bold rounded-lg uppercase tracking-wider shadow-lg shadow-primary/20">
                         Post
                       </button>
                    </div>

                    {flow.notes && flow.notes.length > 0 ? (
                      <div className="space-y-6">
                        {flow.notes.map(note => (
                          <div key={note.id} className="flex gap-4">
                             <div className="w-8 h-8 rounded-full bg-black/[0.04] shrink-0" />
                             <div>
                                <div className="flex items-center gap-2 mb-1">
                                   <span className="font-display text-[13px] font-bold text-on-surface">{note.user.name}</span>
                                   <span className="font-display text-[11px] text-on-surface-variant opacity-60">{new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p className="font-display text-[13px] text-on-surface-variant opacity-70 leading-relaxed">
                                  {note.text}
                                </p>
                             </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 border border-dashed border-black/[0.08] rounded-2xl flex flex-col items-center justify-center opacity-60">
                         <MessageSquare size={24} className="mb-2" />
                         <span className="font-display text-[10px] font-bold uppercase tracking-widest">No notes yet</span>
                      </div>
                    )}
                 </div>
              </section>
           </div>
        </main>

        {/* Right Sidebar: Operational Context */}
        <aside className="w-[320px] border-l border-black/[0.04] bg-white/40 flex flex-col overflow-y-auto custom-scrollbar">
           <div className="p-8 space-y-10">
              {/* Overall Progress */}
              <section>
                 <h4 className="font-display text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest mb-6">Execution Overview</h4>
                 <div className="bg-white border border-black/[0.04] rounded-2xl p-6 shadow-sm shadow-black/[0.01]">
                    <div className="flex items-end justify-between mb-4">
                       <span className="font-display text-[32px] font-bold text-on-surface tracking-tighter leading-none">{flow.progress}%</span>
                       <span className="font-display text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1.5">Active</span>
                    </div>
                    <div className="h-2 w-full bg-black/[0.03] rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${flow.progress}%` }} />
                    </div>
                 </div>
              </section>

              {/* Operational Metadata */}
              <section className="space-y-6">
                 <h4 className="font-display text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">Flow Details</h4>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2.5">
                          <User size={14} className="text-on-surface-variant opacity-60" />
                          <span className="font-display text-[12px] text-on-surface-variant opacity-60">Owner</span>
                       </div>
                       <span className="font-display text-[12px] font-bold text-on-surface">{flow.owner.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2.5">
                          <Calendar size={14} className="text-on-surface-variant opacity-60" />
                          <span className="font-display text-[12px] text-on-surface-variant opacity-60">Due Date</span>
                       </div>
                       <span className="font-display text-[12px] font-bold text-on-surface">{flow.dueDate || "Not set"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2.5">
                          <FileText size={14} className="text-on-surface-variant opacity-60" />
                          <span className="font-display text-[12px] text-on-surface-variant opacity-60">Assets</span>
                       </div>
                       <span className="font-display text-[12px] font-bold text-on-surface">{flow.relatedDocsCount || 0}</span>
                    </div>
                 </div>
              </section>

              {/* Action Sidebar */}
              <section className="pt-10 border-t border-black/[0.04] space-y-4">
                 <button 
                   onClick={() => onDelete(flow.id)}
                   className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-50 text-red-500 font-display text-[11px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100 transition-all"
                 >
                   <Trash2 size={14} />
                   Archive Flow
                 </button>
              </section>
           </div>
        </aside>
      </div>
    </div>
  );
}
