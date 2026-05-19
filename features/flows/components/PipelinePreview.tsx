"use client";

import type { WorkflowStage } from "../types";

interface PipelinePreviewProps {
  stages: WorkflowStage[];
  compact?: boolean;
}

function getStageFill(stage: WorkflowStage) {
  const stageType = stage.stageType ?? "task";
  if (stage.isCompletion) return "bg-black/70";
  if (stage.approvalRequired || stageType === "approval") return "bg-black/45";
  if (stageType === "decision") return "bg-black/35";
  if (stageType === "start") return "bg-black/25";
  return "bg-black/30";
}

export default function PipelinePreview({ stages, compact = false }: PipelinePreviewProps) {
  const orderedStages = [...stages].sort((a, b) => a.order - b.order);
  const visibleStages = compact ? orderedStages.slice(0, 6) : orderedStages;
  const hiddenCount = Math.max(0, orderedStages.length - visibleStages.length);

  if (!orderedStages.length) {
    return (
      <div className="rounded-[8px] border border-dashed border-black/[0.08] px-3 py-2">
        <span className="font-body-sm text-[11px] text-on-surface-variant opacity-40">No stages configured</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        {visibleStages.map((stage, index) => (
          <div key={stage.id} className="flex flex-1 items-center gap-1.5 min-w-0">
            <div
              className={`h-2 rounded-full ${getStageFill(stage)} transition-all`}
              style={{
                width: "100%",
                opacity: stage.isDefault || stage.isCompletion ? 0.85 : 0.55,
              }}
              title={stage.name}
            />
            {index < visibleStages.length - 1 && <div className="h-px w-2 shrink-0 bg-black/[0.08]" />}
          </div>
        ))}
        {hiddenCount > 0 && (
          <span className="shrink-0 font-label-caps text-[8px] font-semibold text-on-surface-variant opacity-45">
            +{hiddenCount}
          </span>
        )}
      </div>

      {!compact && (
        <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${Math.min(orderedStages.length, 5)}, minmax(0, 1fr))` }}>
          {orderedStages.slice(0, 5).map(stage => (
            <span key={stage.id} className="truncate font-label-caps text-[8px] font-semibold uppercase tracking-wider text-on-surface-variant opacity-45">
              {stage.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
