"use client";

import React, { useState } from "react";
import { Plus, Trash2, ListChecks, Square } from "lucide-react";
import { FLOW_CATEGORIES, type Flow, type FlowCategory, type FlowStage } from "@/features/flows";
import Dropdown from "@/components/ui/Dropdown";

import { ModalShell } from "@/components/ui/global/modal/ModalShell";
import { ModalHeader } from "@/components/ui/global/modal/ModalHeader";
import { ModalContent } from "@/components/ui/global/modal/ModalContent";
import { ModalFooter } from "@/components/ui/global/modal/ModalFooter";
import { GlobalInput } from "@/components/ui/global/form/GlobalInput";
import { GlobalTextarea } from "@/components/ui/global/form/GlobalTextarea";
import { useTenant } from "@/components/providers/TenantProvider";
import { getUserDisplayName } from "@/lib/user-identity";

/* ── Section label ───────────────────────────────────────────────────────── */
function SL({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      {icon}
      <span className="font-label-caps text-[9px] uppercase tracking-[0.12em] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }}>
        {children}
      </span>
    </div>
  );
}

interface CreateFlowModalProps {
  onClose: () => void;
  onCreate: (flow: Flow) => void;
}

export default function CreateFlowModal({ onClose, onCreate }: CreateFlowModalProps) {
  const { user } = useTenant();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState<FlowCategory>("Operations");
  const [stages, setStages] = useState<Partial<FlowStage>[]>([
    { id: "s1", name: "", order: 0, checklist: [] }
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

  const removeChecklistItem = (stageIdx: number, itemIdx: number) => {
    const next = [...stages];
    const checklist = [...(next[stageIdx].checklist || [])];
    checklist.splice(itemIdx, 1);
    next[stageIdx].checklist = checklist;
    setStages(next);
  };

  const isFormValid = name.trim() !== "" && stages.length > 0 && stages.every(s => (s.name || "").trim() !== "");

  const handleCreate = () => {
    if (!isFormValid) return;

    const newFlow: Flow = {
      id: `f-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      category,
      status: "Active",
      progress: 0,
      dueDate: dueDate || undefined,
      updated: new Date().toISOString(),
      owner: {
        id: user?.id ?? "me",
        name: getUserDisplayName(user, "Current User"),
        email: user?.email,
        image: user?.image,
      },
      stages: stages.map((s, i) => ({
        id: s.id || `s${i}`,
        name: (s.name || `Stage ${i + 1}`).trim(),
        order: i,
        isCompleted: false,
        checklist: (s.checklist || []).filter(item => item.text.trim() !== "")
      }))
    };

    onCreate(newFlow);
    onClose();
  };

  const totalStages = stages.length;
  const totalItems = stages.reduce((acc, s) => acc + (s.checklist?.length || 0), 0);

  const footerSummary = (
    <>
      <span className="font-label-caps text-[8px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>{category}</span>
      <span className="font-label-caps text-[9px] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.45 }}>{totalStages} stage{totalStages !== 1 ? "s" : ""}</span>
      {totalItems > 0 && <span className="font-label-caps text-[9px] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.45 }}>{totalItems} item{totalItems !== 1 ? "s" : ""}</span>}
    </>
  );

  return (
    <ModalShell onClose={onClose} maxWidth={600}>
      <ModalHeader title="New Operational Flow" onClose={onClose} />
      
      <ModalContent className="db-sidebar space-y-6">
        <div className="space-y-4">
          <GlobalInput
            autoFocus
            required
            maxLength={60}
            placeholder="Flow name…"
            value={name}
            onChange={e => setName(e.target.value)}
            className="font-display font-semibold"
            style={{ fontSize: "16px", background: "transparent", border: "none", padding: "0" }}
          />

          <GlobalTextarea
            rows={2}
            maxLength={300}
            placeholder="Add a description (optional)…"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <SL>Category</SL>
              <Dropdown
                value={category}
                options={FLOW_CATEGORIES.map(cat => ({ value: cat, label: cat }))}
                onChange={(val) => setCategory(val as FlowCategory)}
              />
            </div>
            <div>
              <SL>Due Date</SL>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full h-9 rounded-[6px] border border-black/[0.08] bg-black/[0.02] px-3 font-body-md text-[12.5px] text-on-surface outline-none focus:border-primary/30 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: "rgba(0,0,0,0.06)" }} />

        {/* Stages */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <SL icon={<ListChecks size={11} strokeWidth={1.75} style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }} />}>
              Execution Stages
            </SL>
          </div>

          <div className="space-y-4">
            {stages.map((stage, idx) => (
              <div key={idx} className="relative pl-6">
                {/* Vertical line connecting stages */}
                {idx !== stages.length - 1 && (
                  <div className="absolute left-[3px] top-4 bottom-[-16px] w-[2px]" style={{ background: "rgba(0,0,0,0.06)" }} />
                )}
                <div className="absolute left-0 top-[6px] w-[8px] h-[8px] rounded-full border-[2px] bg-white z-10" style={{ borderColor: "var(--color-primary)" }} />
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 group/stage">
                    <input
                      maxLength={40}
                      value={stage.name}
                      onChange={e => updateStage(idx, { name: e.target.value })}
                      placeholder={`Stage ${idx + 1}`}
                      className="flex-1 bg-transparent font-display text-[13.5px] font-bold text-on-surface outline-none placeholder:opacity-30"
                    />
                    {(stage.name || "").length > 0 && (
                      <span className="font-label-caps text-[8.5px] font-semibold transition-colors" style={{ color: "var(--color-on-surface-variant)", opacity: (stage.name || "").length >= 40 ? 1 : 0.4 }}>
                        {(stage.name || "").length}/40
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeStage(idx)}
                      disabled={stages.length === 1}
                      className="p-1 rounded hover:bg-red-50 disabled:opacity-25 disabled:hover:bg-transparent transition-colors"
                      title={stages.length === 1 ? "At least one stage is required" : "Delete stage"}
                    >
                      <Trash2 size={12} strokeWidth={1.75} style={{ color: "rgba(186,26,26,0.55)" }} />
                    </button>
                  </div>

                  {/* Checklist for Stage */}
                  <div className="space-y-1">
                    {stage.checklist?.map((item, itemIdx) => (
                      <div key={itemIdx} className="flex items-center gap-2.5 px-2 py-1.5 rounded-[6px] hover:bg-black/[0.02] group/ci transition-colors">
                        <Square size={12} strokeWidth={1.75} style={{ color: "var(--color-on-surface-variant)", opacity: 0.38, flexShrink: 0 }} />
                        <input
                          maxLength={80}
                          value={item.text}
                          onChange={e => updateChecklistItem(idx, itemIdx, e.target.value)}
                          placeholder="Process item..."
                          className="flex-1 bg-transparent font-body-md text-[12.5px] text-on-surface outline-none placeholder:opacity-30"
                        />
                        {item.text.length > 0 && (
                          <span className="font-label-caps text-[8.5px] font-semibold transition-colors" style={{ color: "var(--color-on-surface-variant)", opacity: item.text.length >= 80 ? 1 : 0.4 }}>
                            {item.text.length}/80
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeChecklistItem(idx, itemIdx)}
                          className="p-1 rounded hover:bg-red-50 transition-colors"
                          title="Delete item"
                        >
                          <Trash2 size={11} strokeWidth={1.75} style={{ color: "rgba(186,26,26,0.55)" }} />
                        </button>
                      </div>
                    ))}
                    
                    <button type="button" onClick={() => addChecklistItem(idx)} className="flex items-center gap-1.5 px-2 py-1 font-label-caps text-[9px] font-bold uppercase tracking-widest rounded hover:bg-black/[0.04] transition-all" style={{ color: "var(--color-on-surface-variant)", opacity: 0.6 }}>
                      <Plus size={10} strokeWidth={2} /> Add Item
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-black/[0.04]">
            <button type="button" onClick={addStage} className="w-full flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-[6px] hover:bg-black/[0.02] font-label-caps text-[10px] font-bold uppercase tracking-[0.08em] transition-colors" style={{ border: "1px dashed rgba(0,0,0,0.18)", color: "var(--color-on-surface-variant)", opacity: 0.7 }}>
              <Plus size={11} strokeWidth={2} /> Add Stage
            </button>
          </div>
        </div>

      </ModalContent>

      <ModalFooter summary={footerSummary}>
        <button onClick={onClose} className="font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold px-3.5 py-2 rounded-[6px] hover:bg-black/[0.05] transition-colors" style={{ color: "var(--color-on-surface-variant)", opacity: 0.65 }}>
          Cancel
        </button>
        <button onClick={handleCreate} disabled={!isFormValid} className="font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold px-4 py-2 rounded-[6px] disabled:opacity-30 hover:-translate-y-px transition-all" style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
          Create Flow
        </button>
      </ModalFooter>
    </ModalShell>
  );
}
