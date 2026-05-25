"use client";

import React, { useState } from "react";
import { Plus, Trash2, Calendar, Target } from "lucide-react";
import type { Goal, GoalStatus, Priority } from "@/features/goals";
import { useTenant } from "@/components/providers/TenantProvider";
import Dropdown from "@/components/ui/Dropdown";
import DatePicker from "@/components/ui/DatePicker";

import { ModalShell } from "@/components/ui/global/modal/ModalShell";
import { ModalHeader } from "@/components/ui/global/modal/ModalHeader";
import { ModalContent } from "@/components/ui/global/modal/ModalContent";
import { ModalFooter } from "@/components/ui/global/modal/ModalFooter";
import { GlobalInput } from "@/components/ui/global/form/GlobalInput";
import { GlobalTextarea } from "@/components/ui/global/form/GlobalTextarea";

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

interface CreateGoalModalProps {
  onClose: () => void;
  onCreate?: (goal: Goal) => Promise<any> | any;
}

function genId(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export default function CreateGoalModal({ onClose, onCreate }: CreateGoalModalProps) {
  const { user } = useTenant();
  const userName = user?.name || "You";

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

  const addMilestone = () => {
    setTempMilestones(prev => [...prev, { id: genId("ms"), title: "", date: "" }]);
  };

  const updateMilestone = (id: string, updates: Partial<{ title: string; date: string }>) => {
    setTempMilestones(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const removeMilestone = (id: string) => {
    if (tempMilestones.length <= 1) return;
    setTempMilestones(prev => prev.filter(m => m.id !== id));
  };

  const isFormValid = title.trim() !== "" && targetOutcome.trim() !== "" && targetDate !== "" && (status as string) !== "";

  async function handleSubmit() {
    setError(null);
    const trimmedTitle = title.trim();
    if (!trimmedTitle) { setError("Goal title is required."); return; }
    const trimmedOutcome = targetOutcome.trim();
    if (!trimmedOutcome) { setError("Target outcome is required."); return; }
    if (!targetDate) { setError("Deadline is required."); return; }

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
        activities: [{
          id: "a" + Date.now(),
          type: "status_change",
          content: "Goal established",
          timestamp: new Date().toISOString(),
          userId: user?.id || "me"
        }]
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

  const footerSummary = undefined;

  return (
    <ModalShell onClose={onClose} maxWidth={600}>
      <ModalHeader title="New Goal" onClose={onClose} />

      <ModalContent className="db-sidebar space-y-6">
        <div className="space-y-4">
          <GlobalInput
            autoFocus
            required
            maxLength={60}
            placeholder="Goal title…"
            value={title}
            onChange={e => { setTitle(e.target.value); setError(null); }}
            onKeyDown={e => e.key === "Enter" && isFormValid && handleSubmit()}
            className="font-display font-semibold"
            style={{ fontSize: "16px", background: "transparent", border: "none", padding: "0" }}
          />

          <GlobalTextarea
            rows={2}
            maxLength={300}
            placeholder="Context & Purpose (Rationale behind this objective)…"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />

          <div className="pt-2">
            <SL>Due Date</SL>
            <div className="w-48">
              <DatePicker
                value={targetDate}
                onChange={val => { setTargetDate(val || ""); setError(null); }}
                placeholder="Select deadline"
              />
            </div>
          </div>
        </div>

        <div>
          <SL>Target Outcome</SL>
          <GlobalInput
            maxLength={100}
            placeholder="Measurable success metric…"
            value={targetOutcome}
            onChange={e => { setTargetOutcome(e.target.value); setError(null); }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <SL>Priority / Impact</SL>
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
          <div>
            <SL>Planning Status</SL>
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
        </div>

        <div style={{ height: 1, background: "rgba(0,0,0,0.06)" }} />

        {/* Roadmap Checkpoints */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <SL icon={<Target size={11} strokeWidth={1.75} style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }} />}>
              Roadmap Checkpoints
            </SL>
          </div>

          <div className="space-y-0 mt-2 pl-1">
            {tempMilestones.map((m, idx) => {
              const isLast = idx === tempMilestones.length - 1;
              return (
                <div key={m.id} className="relative flex items-center gap-3 px-2 py-2 group/ms transition-colors hover:bg-black/[0.02] rounded-[6px]">
                  <div className="relative flex items-center justify-center w-4 h-full shrink-0">
                    {!isLast && <div className="absolute top-[20px] bottom-[-16px] w-px bg-black/[0.08]" />}
                    <div className="w-2.5 h-2.5 rounded-full border-[2px] border-black/[0.15] bg-white relative z-10" />
                  </div>
                  <input
                    maxLength={100}
                    placeholder={`Checkpoint ${idx + 1}…`}
                    value={m.title}
                    onChange={e => updateMilestone(m.id, { title: e.target.value })}
                    className="flex-1 bg-transparent outline-none font-body-md text-[12.5px]"
                    style={{ color: "var(--color-on-surface)" }}
                  />
                  <div className="w-36 shrink-0">
                    <DatePicker
                      align="right"
                      value={m.date}
                      onChange={val => updateMilestone(m.id, { date: val || "" })}
                      placeholder="Date..."
                    />
                  </div>
                  <button onClick={() => removeMilestone(m.id)} disabled={tempMilestones.length <= 1} className="shrink-0 opacity-60 group-hover/ms:opacity-100 disabled:opacity-60 transition-opacity p-0.5 rounded hover:bg-black/[0.06]">
                    <Trash2 size={11} strokeWidth={1.75} style={{ color: "rgba(186,26,26,0.55)" }} />
                  </button>
                </div>
              );
            })}

            <button
              type="button"
              onClick={addMilestone}
              className="flex items-center gap-1.5 px-3 py-2 rounded-[6px] hover:bg-black/[0.04] transition-colors mt-1"
            >
              <Plus size={14} style={{ color: "var(--color-on-surface-variant)", opacity: 0.6 }} />
              <span className="font-label-caps text-[10px] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.8 }}>Add Checkpoint</span>
            </button>
          </div>
        </div>
      </ModalContent>

      <ModalFooter summary={error || footerSummary}>
        <button onClick={onClose} className="font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold px-3.5 py-2 rounded-[6px] hover:bg-black/[0.05] transition-colors" style={{ color: "var(--color-on-surface-variant)", opacity: 0.65 }}>
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={!isFormValid || loading} className="font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold px-4 py-2 rounded-[6px] disabled:opacity-30 hover:-translate-y-px transition-all" style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
          {loading ? "Establishing..." : "Establish Goal"}
        </button>
      </ModalFooter>
    </ModalShell>
  );
}
