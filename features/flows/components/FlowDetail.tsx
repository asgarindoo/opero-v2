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
import type { Flow, FlowStage } from "@/features/flows";
import { CATEGORY_COLORS } from "@/features/flows";

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
    <div className="flex-1 flex flex-col bg-white h-full overflow-hidden animate-fade-in selection:bg-black/10">
      {/* ── Detail Navbar ── */}
      <header className="px-6 py-4 border-b border-black/[0.06] bg-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-black/5 transition-all text-zinc-500 hover:text-zinc-900">
            <X size={18} />
          </button>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-sm font-display text-[10px] font-medium tracking-wide ${CATEGORY_COLORS[flow.category] || "text-zinc-600 bg-zinc-100"}`}>
                {flow.category}
              </span>
              <span className="font-display text-[11px] font-medium text-zinc-300">/</span>
              <span className="font-display text-[11px] font-medium text-zinc-500">Workspace Flow</span>
            </div>
            <h1 className="font-display text-[14px] font-semibold text-zinc-900 tracking-tight">{flow.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-black/[0.08] font-display text-[12px] font-medium text-zinc-700 hover:bg-zinc-50 transition-all shadow-sm">
            <LinkIcon size={14} />
            Share
          </button>
          <button className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-all">
            <MoreVertical size={18} />
          </button>
        </div>
      </header>

      {/* ── Main Detail Workspace ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Stage Navigation */}
        <aside className="w-[280px] border-r border-black/[0.06] bg-[#F9F9F9] flex flex-col overflow-y-auto custom-scrollbar">
           <div className="p-6">
              <h3 className="font-display text-[11px] font-medium text-zinc-400 tracking-wide mb-4">STAGES</h3>
              <div className="py-2 flex flex-col">
                 {flow.stages.map((stage, idx) => {
                   const isActive = activeStageId === stage.id;
                   const isCompleted = stage.isCompleted;
                   const completedTasks = stage.checklist.filter(i => i.isCompleted).length;
                   const totalTasks = stage.checklist.length;
                   const isLast = idx === flow.stages.length - 1;
                   
                   return (
                     <button
                       key={stage.id}
                       onClick={() => setActiveStageId(stage.id)}
                       className={`w-full flex items-stretch text-left group transition-all ${
                         isActive ? "opacity-100" : "opacity-60 hover:opacity-100"
                       }`}
                     >
                        {/* Fixed Rail Column */}
                        <div className="relative w-12 shrink-0 flex flex-col items-center">
                           {/* Stable Connector Line */}
                           {flow.stages.length > 1 && (
                             <div className={`absolute w-[2px] bg-black/[0.06] left-1/2 -translate-x-1/2 ${
                               idx === 0 ? "top-6 bottom-0" : 
                               isLast ? "top-0 h-6" : 
                               "top-0 bottom-0"
                             }`} />
                           )}
                           
                           {/* Fixed Wrapper for Node */}
                           <div className="h-12 w-full flex items-center justify-center relative z-10">
                              <div className={`w-[18px] h-[18px] rounded-full border-[2px] flex items-center justify-center transition-all bg-[#F9F9F9] ${
                                isActive ? "border-zinc-800" : "border-zinc-300 group-hover:border-zinc-400"
                              }`}>
                                {isCompleted && !isActive ? (
                                   <div className="w-2 h-2 rounded-full bg-zinc-300" />
                                ) : isActive ? (
                                   <div className="w-2 h-2 rounded-full bg-zinc-800" />
                                ) : null}
                              </div>
                           </div>
                        </div>

                        {/* Fixed Content Column */}
                        <div className="flex-1 pb-6 pt-[14px] pr-4 flex flex-col justify-start">
                           <h4 className={`font-display text-[13px] leading-tight transition-all ${isActive ? "text-zinc-900 font-semibold" : "text-zinc-700 font-medium"}`}>
                             {stage.name}
                           </h4>
                           
                           {/* Progress Indicator - Integrated and stable */}
                           {isActive && (
                             <div className="flex items-center gap-3 mt-3 opacity-100 animate-in fade-in slide-in-from-top-1 duration-200">
                               <div className="h-[3px] flex-1 bg-black/[0.04] rounded-full overflow-hidden">
                                 <div 
                                   className="h-full rounded-full transition-all duration-500 bg-zinc-800" 
                                   style={{ width: `${(completedTasks / Math.max(totalTasks, 1)) * 100}%` }}
                                 />
                               </div>
                               <span className="font-mono text-[10px] text-zinc-500 font-medium">
                                 {completedTasks}/{totalTasks}
                               </span>
                             </div>
                           )}
                        </div>
                     </button>
                   );
                 })}
              </div>
           </div>
        </aside>

        {/* Center: Stage Contents */}
        <main className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-white">
           <div className="max-w-3xl mx-auto space-y-12 animate-fade-in">
              <section className="space-y-4">
                 <div>
                   <h1 className="font-display text-[32px] font-semibold text-zinc-900 tracking-tight leading-tight mb-3">
                     {activeStage.name}
                   </h1>
                   <p className="font-display text-[15px] text-zinc-500 leading-relaxed max-w-2xl">
                     {activeStage.description || "No detailed description for this stage."}
                   </p>
                 </div>
              </section>

              <section>
                 <div className="flex items-center justify-between border-b border-black/[0.06] pb-3 mb-4">
                    <h3 className="font-display text-[11px] font-medium text-zinc-400 tracking-wide uppercase">Execution Checklist</h3>
                    <button className="text-zinc-400 hover:text-zinc-900 font-display text-[12px] font-medium transition-colors flex items-center gap-1">
                      <Plus size={14} /> Add Task
                    </button>
                 </div>

                 <div className="space-y-1">
                    {activeStage.checklist.map(item => (
                      <div 
                        key={item.id}
                        onClick={() => toggleChecklistItem(activeStage.id, item.id)}
                        className="flex items-start gap-3 p-2 rounded-md hover:bg-zinc-50 cursor-pointer group transition-colors"
                      >
                         <div className={`mt-0.5 w-[16px] h-[16px] rounded border flex items-center justify-center shrink-0 transition-all shadow-sm ${
                           item.isCompleted ? "bg-zinc-800 border-zinc-800 text-white" : "bg-white border-zinc-300 group-hover:border-zinc-400"
                         }`}>
                            {item.isCompleted && <CheckCircle2 size={10} strokeWidth={3} />}
                         </div>
                         <span className={`font-display text-[14px] leading-relaxed transition-all ${
                           item.isCompleted ? "text-zinc-400 line-through decoration-zinc-300" : "text-zinc-700"
                         }`}>
                           {item.text}
                         </span>
                      </div>
                    ))}
                    {activeStage.checklist.length === 0 && (
                      <div className="py-8 flex justify-center border border-dashed border-black/[0.06] rounded-md">
                         <span className="font-display text-[13px] text-zinc-400">No tasks in this stage.</span>
                      </div>
                    )}
                 </div>
              </section>

              {/* Notes Section */}
              <section className="pt-8 border-t border-black/[0.06]">
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display text-[11px] font-medium text-zinc-400 tracking-wide uppercase">Operational Notes</h3>
                    <MessageSquare size={14} className="text-zinc-400" />
                 </div>
                 <div className="space-y-6">
                    <div className="flex items-start gap-3">
                       <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center shrink-0 border border-black/[0.04]">
                         <User size={14} className="text-zinc-400" />
                       </div>
                       <div className="flex-1 relative">
                          <textarea 
                            placeholder="Add a note, update, or log activity..."
                            className="w-full bg-[#F9F9F9] border border-transparent rounded-lg p-3.5 font-display text-[14px] text-zinc-900 outline-none focus:bg-white focus:border-black/[0.1] focus:ring-4 focus:ring-black/[0.02] transition-all resize-none h-24 placeholder:text-zinc-400 shadow-sm"
                          />
                          <button className="absolute right-3 bottom-3 px-3 py-1.5 bg-zinc-900 text-white font-display text-[11px] font-medium rounded-md hover:bg-zinc-700 transition-colors shadow-sm">
                            Comment
                          </button>
                       </div>
                    </div>

                    {flow.notes && flow.notes.length > 0 ? (
                      <div className="space-y-6 pt-4">
                        {flow.notes.map(note => (
                          <div key={note.id} className="flex gap-3">
                             <div className="w-8 h-8 rounded-full bg-[#F9F9F9] shrink-0 border border-black/[0.04] flex items-center justify-center">
                               <span className="font-display text-[11px] font-medium text-zinc-500">{note.user.name.charAt(0)}</span>
                             </div>
                             <div className="flex-1">
                                <div className="flex items-baseline gap-2 mb-1">
                                   <span className="font-display text-[13px] font-medium text-zinc-900">{note.user.name}</span>
                                   <span className="font-display text-[11px] text-zinc-400">
                                     {new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                   </span>
                                </div>
                                <p className="font-display text-[14px] text-zinc-600 leading-relaxed">
                                  {note.text}
                                </p>
                             </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                 </div>
              </section>
           </div>
        </main>

        {/* Right Sidebar: Operational Context */}
        <aside className="w-[260px] border-l border-black/[0.06] bg-[#F9F9F9] flex flex-col overflow-y-auto custom-scrollbar">
           <div className="p-6 space-y-8">
              {/* Overall Progress */}
              <section>
                 <div className="flex items-end justify-between mb-3">
                   <h4 className="font-display text-[11px] font-medium text-zinc-400 tracking-wide uppercase">Execution Overview</h4>
                   <span className="font-display text-[20px] font-semibold text-zinc-900 leading-none tracking-tight">{flow.progress}%</span>
                 </div>
                 <div className="h-1.5 w-full bg-black/[0.06] rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-zinc-800 transition-all duration-700 rounded-full" style={{ width: `${flow.progress}%` }} />
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 animate-pulse" />
                    <span className="font-display text-[11px] font-medium text-zinc-600">Active Execution</span>
                 </div>
              </section>

              {/* Operational Metadata */}
              <section>
                 <h4 className="font-display text-[11px] font-medium text-zinc-400 tracking-wide uppercase mb-4 border-b border-black/[0.06] pb-2">Properties</h4>
                 <div className="space-y-4">
                    <div className="flex items-center">
                       <span className="font-display text-[12px] text-zinc-500 w-24 shrink-0 flex items-center gap-1.5">
                         <User size={12} /> Owner
                       </span>
                       <span className="font-display text-[12px] font-medium text-zinc-900 truncate">{flow.owner.name}</span>
                    </div>
                    <div className="flex items-center">
                       <span className="font-display text-[12px] text-zinc-500 w-24 shrink-0 flex items-center gap-1.5">
                         <Calendar size={12} /> Due Date
                       </span>
                       <span className="font-display text-[12px] font-medium text-zinc-900">{flow.dueDate || "Not set"}</span>
                    </div>
                    <div className="flex items-center">
                       <span className="font-display text-[12px] text-zinc-500 w-24 shrink-0 flex items-center gap-1.5">
                         <FileText size={12} /> Assets
                       </span>
                       <span className="font-display text-[12px] font-medium text-zinc-900">{flow.relatedDocsCount || 0}</span>
                    </div>
                 </div>
              </section>

              {/* Action Sidebar */}
              <section className="pt-4">
                 <button 
                   onClick={() => onDelete(flow.id)}
                   className="w-full flex items-center justify-center gap-2 p-2.5 rounded-md border border-black/[0.08] text-zinc-600 font-display text-[12px] font-medium hover:bg-zinc-100 hover:text-zinc-900 transition-all shadow-sm bg-white"
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
