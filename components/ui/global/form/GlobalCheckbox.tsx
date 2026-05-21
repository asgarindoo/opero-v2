"use client";

import React from "react";
import { CheckSquare, Square } from "lucide-react";
import { FormField, ValidationMessage, GlobalFieldHint } from "./FormField";

interface Props {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  hint?: React.ReactNode;
  className?: string;
}

export function GlobalCheckbox({ label, checked, onChange, error, hint, className = "" }: Props) {
  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className="flex items-center gap-2 group transition-colors text-left"
      >
        {checked ? (
          <CheckSquare size={14} strokeWidth={2} style={{ color: "rgba(0,120,60,0.8)" }} className="shrink-0" />
        ) : (
          <Square size={14} strokeWidth={1.75} style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }} className="shrink-0" />
        )}
        <span className="font-body-md text-[12px]" style={{ color: "var(--color-on-surface-variant)", opacity: checked ? 0.8 : 0.6 }}>
          {label}
        </span>
      </button>
      <ValidationMessage error={error} />
      {hint && !error && <GlobalFieldHint>{hint}</GlobalFieldHint>}
    </div>
  );
}
