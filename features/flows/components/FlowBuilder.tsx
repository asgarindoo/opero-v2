"use client";

import { X, CheckCircle2, Clock, GitBranch, ShieldCheck } from "lucide-react";
import type { Flow, WorkflowStage } from "../types";
import { STAGE_TYPE_META } from "../types";
import PipelinePreview from "./PipelinePreview";

interface FlowBuilderProps {
  flow: Flow | null;
  onClose: () => void;
  onUpdate: (flow: Flow) => void;
}

function stageMeta(stage: WorkflowStage) {
  const stageType = stage.stageType ?? "task";
  if (stage.approvalRequired || stageType === "approval") return { icon: ShieldCheck, label: "Approval" };
  if (stage.slaHours) return { icon: Clock, label: `${stage.slaHours}h SLA` };
  if (stage.isCompletion) return { icon: CheckCircle2, label: "Completion" };
  return { icon: GitBranch, label: STAGE_TYPE_META[stageType].label };
}

export default function FlowBuilder({ flow, onClose, onUpdate }: FlowBuilderProps) {
  if (!flow) return null;

  const currentFlow = flow;
  const orderedStages = [...currentFlow.stages].sort((a, b) => a.order - b.order);

  function toggleActive() {
    onUpdate({
      ...currentFlow,
      isActive: !currentFlow.isActive,
      updated: new Date().toISOString().slice(0, 10),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px]" onClick={onClose} />

      <aside className="relative flex h-full w-full max-w-[640px] flex-col border-l border-black/[0.06] bg-surface-container-lowest shadow-2xl">
        <div className="flex items-center justify-between border-b border-black/[0.05] px-6 py-4">
          <div className="min-w-0">
            <div className="mb-1.5 flex items-center gap-2">
              <span className="font-label-caps text-[8px] font-bold uppercase tracking-widest text-on-surface-variant opacity-45">
                Flow Builder
              </span>
              <span className="rounded-[5px] border border-black/[0.06] bg-black/[0.04] px-1.5 py-0.5 font-label-caps text-[8px] font-semibold uppercase tracking-wider text-on-surface-variant opacity-70">
                {currentFlow.isActive !== false ? "Active" : "Inactive"}
              </span>
            </div>
            <h2 className="truncate font-display text-[18px] font-semibold text-on-surface">{currentFlow.name}</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleActive}
              className="rounded-[6px] border border-black/[0.08] bg-black/[0.02] px-3 py-1.5 font-label-caps text-[9px] font-semibold uppercase tracking-widest text-on-surface-variant transition-colors hover:bg-black/[0.05] hover:text-on-surface"
            >
              {currentFlow.isActive !== false ? "Pause" : "Activate"}
            </button>
            <button
              onClick={onClose}
              className="rounded-[6px] p-1.5 text-on-surface-variant opacity-50 transition-colors hover:bg-black/[0.04] hover:opacity-100"
              aria-label="Close flow builder"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto db-main px-6 py-6">
          <section className="mb-8">
            <p className="mb-4 font-body-sm text-[12px] leading-relaxed text-on-surface-variant opacity-65">
              {currentFlow.description}
            </p>
            <div className="rounded-[8px] border border-black/[0.06] bg-black/[0.015] p-4">
              <PipelinePreview stages={orderedStages} />
            </div>
          </section>

          <section className="mb-8 grid grid-cols-3 gap-3">
            <div className="rounded-[8px] border border-black/[0.06] bg-white p-3">
              <p className="mb-1 font-label-caps text-[8px] font-semibold uppercase tracking-widest text-on-surface-variant opacity-40">Stages</p>
              <p className="font-display text-[18px] font-semibold text-on-surface">{orderedStages.length}</p>
            </div>
            <div className="rounded-[8px] border border-black/[0.06] bg-white p-3">
              <p className="mb-1 font-label-caps text-[8px] font-semibold uppercase tracking-widest text-on-surface-variant opacity-40">Tasks</p>
              <p className="font-display text-[18px] font-semibold text-on-surface">{currentFlow.tasksCount ?? currentFlow.relatedTasksCount ?? 0}</p>
            </div>
            <div className="rounded-[8px] border border-black/[0.06] bg-white p-3">
              <p className="mb-1 font-label-caps text-[8px] font-semibold uppercase tracking-widest text-on-surface-variant opacity-40">Success</p>
              <p className="font-display text-[18px] font-semibold text-on-surface">
                {currentFlow.usageStats ? `${Math.round(currentFlow.usageStats.successRate * 100)}%` : "N/A"}
              </p>
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-label-caps text-[9px] font-bold uppercase tracking-widest text-on-surface-variant opacity-45">Workflow Stages</h3>
              <span className="font-body-sm text-[11px] text-on-surface-variant opacity-40">Updated {new Date(currentFlow.updated).toLocaleDateString()}</span>
            </div>

            <div className="space-y-2">
              {orderedStages.map((stage, index) => {
                const meta = stageMeta(stage);
                const Icon = meta.icon;

                return (
                  <div key={stage.id} className="rounded-[8px] border border-black/[0.06] bg-white p-3 transition-colors hover:border-black/[0.12]">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-black/[0.08] bg-black/[0.03] font-label-caps text-[9px] font-bold text-on-surface-variant">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <h4 className="font-display text-[12.5px] font-semibold text-on-surface">{stage.name}</h4>
                          <span className="inline-flex items-center gap-1 rounded-[5px] bg-black/[0.04] px-1.5 py-0.5 font-label-caps text-[8px] font-semibold uppercase tracking-wider text-on-surface-variant opacity-65">
                            <Icon size={10} strokeWidth={2} />
                            {meta.label}
                          </span>
                        </div>
                        {stage.description && (
                          <p className="font-body-sm text-[11px] leading-relaxed text-on-surface-variant opacity-55">{stage.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}
