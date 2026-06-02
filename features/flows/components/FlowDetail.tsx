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
import Button from "@/components/ui/Button";
import { useTenant } from "@/components/providers/TenantProvider";
import UserAvatar from "@/components/common/UserAvatar";
import { getUserDisplayName } from "@/lib/user-identity";
import ConfirmationModal from "@/components/common/ConfirmationModal";

interface FlowDetailProps {
  flow: Flow;
  onClose: () => void;
  onUpdate: (updated: Flow) => void;
  onDelete: (id: string) => void;
}

function calculateProgress(stages: FlowStage[]) {
  let totalUnits = 0;
  let completedUnits = 0;

  stages.forEach(s => {
    const checklist = Array.isArray(s.checklist) ? s.checklist : [];
    if (checklist.length > 0) {
      totalUnits += checklist.length;
      completedUnits += checklist.filter(i => i.isCompleted).length;
    } else {
      totalUnits += 1;
      if (s.isCompleted) completedUnits += 1;
    }
  });

  return totalUnits === 0 ? 0 : Math.round((completedUnits / totalUnits) * 100);
}

export default function FlowDetail({ flow: initialFlow, onClose, onUpdate, onDelete }: FlowDetailProps) {
  const { user } = useTenant();
  const fallbackNoteUser = React.useCallback(() => ({
    id: user?.id || "system",
    name: getUserDisplayName(user, "System"),
    email: user?.email,
    image: user?.image,
  }), [user]);

  const normalizeFlow = React.useCallback((input: Flow): Flow => {
    const rawStages = input.stages?.length
      ? input.stages
      : [{ id: "stage-1", name: "Stage 1", isCompleted: false, checklist: [], order: 0 }];

    return {
    ...input,
    stages: rawStages.map((stage, index) => ({
      ...stage,
      id: stage.id || `stage-${index + 1}`,
      name: stage.name || `Stage ${index + 1}`,
      isCompleted: Boolean(stage.isCompleted),
      checklist: Array.isArray(stage.checklist) ? stage.checklist : [],
      order: typeof stage.order === "number" ? stage.order : index,
    })),
    notes: (input.notes || []).map((note, index) => ({
      ...note,
      id: note.id || `note-${index + 1}`,
      user: note.user?.id ? note.user : fallbackNoteUser(),
      text: note.text || "",
      timestamp: note.timestamp || new Date().toISOString(),
    })),
    };
  }, [fallbackNoteUser]);
  const [flow, setFlow] = useState<Flow>(() => normalizeFlow(initialFlow));
  const flowRef = React.useRef(flow);
  const [activeStageId, setActiveStageId] = useState<string | null>(() => normalizeFlow(initialFlow).stages[0]?.id || null);

  const [newItemText, setNewItemText] = useState("");
  const [newNoteText, setNewNoteText] = useState("");
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{stageId: string, itemId: string} | null>(null);

  React.useEffect(() => {
    const normalized = normalizeFlow(initialFlow);
    flowRef.current = normalized;
    setFlow(normalized);
    setActiveStageId((current) => normalized.stages.some((stage) => stage.id === current) ? current : normalized.stages[0]?.id || null);
  }, [initialFlow, normalizeFlow]);

  const activeStage = flow.stages.find(s => s.id === activeStageId) || flow.stages[0];

  const commitFlowUpdate = React.useCallback((updater: (current: Flow) => Flow) => {
    const nextFlow = updater(flowRef.current);
    flowRef.current = nextFlow;
    setFlow(nextFlow);
    onUpdate(nextFlow);
  }, [onUpdate]);

  const handleUpdateStage = React.useCallback((stageId: string, updates: Partial<FlowStage>) => {
    commitFlowUpdate((current) => {
      const nextStages = current.stages.map(s => s.id === stageId ? { ...s, ...updates } : s);
      return { ...current, stages: nextStages, progress: calculateProgress(nextStages), updated: new Date().toISOString() };
    });
  }, [commitFlowUpdate]);

  const toggleChecklistItem = (stageId: string, itemId: string) => {
    commitFlowUpdate((current) => {
      const nextStages = current.stages.map(stage => {
        if (stage.id !== stageId) return stage;
        const checklist = Array.isArray(stage.checklist) ? stage.checklist : [];
        const nextChecklist = checklist.map(item =>
          item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
        );

        return {
          ...stage,
          checklist: nextChecklist,
          isCompleted: nextChecklist.length > 0 && nextChecklist.every(i => i.isCompleted),
        };
      });

      return { ...current, stages: nextStages, progress: calculateProgress(nextStages), updated: new Date().toISOString() };
    });
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    const targetStageId = activeStageId;
    if (!targetStageId) return;

    const newItem = {
      id: `item-${Date.now()}`,
      text: newItemText.trim(),
      isCompleted: false
    };

    commitFlowUpdate((current) => {
      const nextStages = current.stages.map(stage => {
        if (stage.id !== targetStageId) return stage;
        return {
          ...stage,
          checklist: [...(Array.isArray(stage.checklist) ? stage.checklist : []), newItem],
          isCompleted: false,
        };
      });

      return { ...current, stages: nextStages, progress: calculateProgress(nextStages), updated: new Date().toISOString() };
    });
    setNewItemText("");
    setIsAddingItem(false);
  };

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;

    const newNote = {
      id: `note-${Date.now()}`,
      user: {
        id: user?.id || "u1",
        name: getUserDisplayName(user, "Current User"),
        email: user?.email,
        image: user?.image,
      },
      text: newNoteText.trim(),
      timestamp: new Date().toISOString()
    };

    commitFlowUpdate((current) => ({
      ...current,
      notes: [...(current.notes || []), newNote],
      updated: new Date().toISOString()
    }));
    setNewNoteText("");
  };

  return (
    <div className="flex-1 flex flex-col bg-white h-full overflow-hidden animate-fade-in selection:bg-black/10">
      {/* ── Detail Navbar ── */}
      <header className="px-6 h-[60px] border-b border-black/[0.06] bg-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-black/5 transition-all text-zinc-500 hover:text-zinc-900">
            <X size={18} />
          </button>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 shrink-0">
              <span className={`px-2 py-0.5 rounded-sm font-display text-[10px] font-medium tracking-wide ${CATEGORY_COLORS[flow.category] || "text-zinc-600 bg-zinc-100"}`}>
                {flow.category}
              </span>
              <span className="font-display text-[11px] font-medium text-zinc-300">/</span>
              <span className="font-display text-[11px] font-medium text-zinc-500 shrink-0">Workspace Flow</span>
            </div>
            <h1 className="font-display text-[14px] font-semibold text-zinc-900 tracking-tight break-words line-clamp-2 max-w-[600px] leading-snug">{flow.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-all"
          >
            <Trash2 size={16} />
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
                const checklist = Array.isArray(stage.checklist) ? stage.checklist : [];
                const completedTasks = checklist.filter(i => i.isCompleted).length;
                const totalTasks = checklist.length;
                const isLast = idx === flow.stages.length - 1;

                return (
                  <button
                    key={stage.id}
                    onClick={() => setActiveStageId(stage.id)}
                    className={`w-full flex items-stretch text-left group transition-all ${isActive ? "opacity-100" : "opacity-60 hover:opacity-100"
                      }`}
                  >
                    {/* Fixed Rail Column */}
                    <div className="relative w-12 shrink-0 flex flex-col items-center">
                      {/* Stable Connector Line */}
                      {flow.stages.length > 1 && (
                        <div className={`absolute w-[2px] bg-black/[0.06] left-1/2 -translate-x-1/2 ${idx === 0 ? "top-6 bottom-0" :
                          isLast ? "top-0 h-6" :
                            "top-0 bottom-0"
                          }`} />
                      )}

                      {/* Fixed Wrapper for Node */}
                      <div className="h-12 w-full flex items-center justify-center relative z-10">
                        <div className={`w-[18px] h-[18px] rounded-full border-[2px] flex items-center justify-center transition-all bg-[#F9F9F9] ${isActive ? "border-zinc-800" : "border-zinc-300 group-hover:border-zinc-400"
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
                      <h4 className={`font-display text-[13px] leading-tight break-all transition-all ${isActive ? "text-zinc-900 font-semibold" : "text-zinc-700 font-medium"}`}>
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
                <h1 className="font-display text-[32px] font-semibold text-zinc-900 tracking-tight leading-tight mb-3 break-all">
                  {activeStage.name}
                </h1>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between border-b border-black/[0.06] pb-3 mb-4">
                <h3 className="font-display text-[11px] font-medium text-zinc-400 tracking-wide uppercase">Execution Checklist</h3>
                <button
                  onClick={() => setIsAddingItem(!isAddingItem)}
                  className="text-zinc-400 hover:text-zinc-900 font-display text-[12px] font-medium transition-colors flex items-center gap-1"
                >
                  <Plus size={14} /> Add Item
                </button>
              </div>

              <div className="space-y-1">
                {(activeStage?.checklist || []).map(item => (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklistItem(activeStage.id, item.id)}
                    className="flex items-start gap-3 p-2 rounded-md hover:bg-zinc-50 cursor-pointer group transition-colors"
                  >
                    <div className={`mt-0.5 w-[16px] h-[16px] rounded border flex items-center justify-center shrink-0 transition-all shadow-sm ${item.isCompleted ? "bg-zinc-800 border-zinc-800 text-white" : "bg-white border-zinc-300 group-hover:border-zinc-400"
                      }`}>
                      {item.isCompleted && <CheckCircle2 size={10} strokeWidth={3} />}
                    </div>
                    <span className={`font-display text-[14px] leading-relaxed break-all transition-all ${item.isCompleted ? "text-zinc-400 line-through decoration-zinc-300" : "text-zinc-700"
                      }`}>
                      {item.text}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setItemToDelete({ stageId: activeStage.id, itemId: item.id }); }}
                      className="text-red-500 opacity-20 hover:opacity-100 p-1 rounded transition-all ml-auto"
                      title="Delete item"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                {isAddingItem && (
                  <form onSubmit={handleAddItem} className="flex items-center gap-2 mt-2 p-1">
                    <input
                      autoFocus
                      maxLength={80}
                      value={newItemText}
                      onChange={e => setNewItemText(e.target.value)}
                      placeholder="New item description..."
                      className="flex-1 font-display text-[13px] text-zinc-900 bg-[#F9F9F9] rounded px-3 py-2 outline-none border border-transparent focus:bg-white focus:border-black/[0.1] focus:ring-4 focus:ring-black/[0.02] transition-all"
                    />
                    <button type="submit" disabled={!newItemText.trim()} className="px-3 py-1.5 bg-zinc-900 text-white font-display text-[11px] font-medium rounded-md hover:bg-zinc-700 transition-colors disabled:opacity-50">
                      Add
                    </button>
                  </form>
                )}
                {(activeStage?.checklist || []).length === 0 && (
                  <div className="py-4 px-5 flex items-center justify-between border border-dashed border-black/[0.06] rounded-md">
                    <span className="font-display text-[13px] text-zinc-400">No items in this stage.</span>
                    <button
                      onClick={() => handleUpdateStage(activeStage.id, { isCompleted: !activeStage.isCompleted })}
                      className={`px-3 py-1.5 font-display text-[11px] font-medium rounded-md transition-all shadow-sm ${activeStage.isCompleted
                        ? 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                        : 'bg-zinc-800 text-white hover:bg-zinc-700'
                        }`}
                    >
                      {activeStage.isCompleted ? "Mark as Incomplete" : "Mark as Completed"}
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Notes Section */}
            <section className="pt-8 border-t border-black/[0.06]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-[11px] font-medium text-zinc-400 tracking-wide uppercase">
                  Notes {flow.notes && flow.notes.length > 0 ? `(${flow.notes.length})` : ""}
                </h3>
                <MessageSquare size={14} className="text-zinc-400" />
              </div>
              <div className="space-y-6">
                {/* Notes List */}
                {flow.notes && flow.notes.length > 0 ? (
                  <div className="space-y-6">
                    {flow.notes.map(note => {
                      const noteUser = note.user?.id === user?.id ? user : note.user || fallbackNoteUser();
                      return (
                        <div key={note.id} className="flex gap-4 group">
                          <UserAvatar user={noteUser} size="lg" />
                          <div className="flex-1 space-y-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-display text-[13px] font-bold">{getUserDisplayName(noteUser, "User")}</span>
                                <span className="text-[10px] text-on-surface-variant opacity-30">
                                  {new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <button
                                onClick={() => setNoteToDelete(note.id)}
                                className="text-red-500 opacity-20 hover:opacity-100 hover:bg-red-50 p-1 rounded transition-all"
                                title="Delete note"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                            <p className="font-display text-[13px] text-on-surface-variant/80 leading-relaxed whitespace-pre-wrap break-all">
                              {note.text}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}

                {/* Input Area */}
                <div className="flex gap-4 pt-4 border-t border-black/[0.04]">
                  <UserAvatar user={user} size="lg" className="bg-primary text-on-primary" />
                  <div className="flex-1 space-y-2">
                    <textarea
                      rows={2}
                      value={newNoteText}
                      onChange={e => setNewNoteText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAddNote();
                        }
                      }}
                      placeholder="Add a note, update, or log activity..."
                      className="w-full bg-black/[0.02] border border-black/[0.06] rounded-[8px] p-3 font-display text-[13px] outline-none focus:bg-white focus:border-primary/30 transition-all resize-none h-20 placeholder:text-zinc-400"
                    />
                    <div className="flex items-center justify-end">
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={!newNoteText.trim()}
                        onClick={handleAddNote}
                      >
                        POST NOTE
                      </Button>
                    </div>
                  </div>
                </div>
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
                <span className="font-display text-[14px] font-semibold text-zinc-700 leading-none tracking-tight">{flow.progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-black/[0.06] rounded-full overflow-hidden">
                <div className="h-full bg-zinc-700 transition-all duration-700 rounded-full" style={{ width: `${flow.progress}%` }} />
              </div>
            </section>

            {/* Operational Metadata */}
            <section>
              <h4 className="font-display text-[11px] font-medium text-zinc-400 tracking-wide uppercase mb-4 border-b border-black/[0.06] pb-2">Flow Details</h4>
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <span className="font-display text-[12px] text-zinc-500 flex items-center gap-1.5">
                    Objective
                  </span>
                  <span className="font-display text-[13px] text-zinc-700 leading-relaxed break-all">{flow.description || "No objective set."}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="font-display text-[12px] text-zinc-500 flex items-center gap-1.5">
                    Due Date
                  </span>
                  <span className="font-display text-[13px] text-zinc-700 leading-relaxed">
                    {flow.dueDate ? new Date(flow.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "No due date"}
                  </span>
                </div>
                <div className="flex items-center pt-2">
                  <span className="font-display text-[12px] text-zinc-500 w-24 shrink-0 flex items-center gap-1.5">
                    <User size={12} /> Created by
                  </span>
                  <span className="flex min-w-0 items-center gap-2">
                    <UserAvatar user={flow.owner} size="sm" />
                    <span className="font-display text-[12px] font-medium text-zinc-900 truncate">{getUserDisplayName(flow.owner)}</span>
                  </span>
                </div>
              </div>
            </section>
          </div>
        </aside>
      </div>
      
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          onDelete(flow.id);
          setIsDeleteModalOpen(false);
        }}
        title="Delete flow?"
        description="This action permanently removes this flow and all its stages, checklist items, and notes. This action cannot be undone."
        confirmLabel="Delete Flow"
      />
      
      <ConfirmationModal
        isOpen={!!noteToDelete}
        onClose={() => setNoteToDelete(null)}
        onConfirm={() => {
          if (noteToDelete) {
            commitFlowUpdate((current) => ({
              ...current,
              notes: (current.notes || []).filter(n => n.id !== noteToDelete),
              updated: new Date().toISOString(),
            }));
            setNoteToDelete(null);
          }
        }}
        title="Delete note?"
        description="This action permanently removes this note. This action cannot be undone."
        confirmLabel="Delete Note"
      />
      
      <ConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => {
          if (itemToDelete) {
            const stage = flow.stages.find(s => s.id === itemToDelete.stageId);
            if (stage) {
              handleUpdateStage(itemToDelete.stageId, { checklist: (stage.checklist || []).filter(c => c.id !== itemToDelete.itemId) });
            }
            setItemToDelete(null);
          }
        }}
        title="Delete checklist item?"
        description="This action permanently removes this item from the stage checklist. This action cannot be undone."
        confirmLabel="Delete Item"
      />
    </div>
  );
}
