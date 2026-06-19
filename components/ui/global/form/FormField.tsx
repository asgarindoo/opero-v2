"use client";

import React from "react";

export function FormSection({ children, title, className = "" }: { children: React.ReactNode; title?: React.ReactNode; className?: string }) {
  return (
    <div className={`p-4 rounded-[8px] space-y-4 ${className}`} style={{ background: "rgba(0,0,0,0.01)", border: "1px dashed rgba(0,0,0,0.09)" }}>
      {title && (
        <div className="flex items-center gap-1.5 mb-1">
          <span className="font-label-caps text-[9px] uppercase tracking-[0.12em] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }}>
            {title}
          </span>
        </div>
      )}
      {children}
    </div>
  );
}

export function RequiredIndicator() {
  return <span className="ml-0.5" style={{ color: "var(--color-primary)" }}>*</span>;
}

export function FormLabel({ children, required, icon }: { children: React.ReactNode; required?: boolean; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      {icon && <span style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }}>{icon}</span>}
      <span className="font-label-caps text-[9px] uppercase tracking-[0.12em] font-semibold flex items-center" style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }}>
        {children} {required && <RequiredIndicator />}
      </span>
    </div>
  );
}

export function CharacterCounter({ current, max }: { current: number; max: number }) {
  if (current === 0) return null;
  const isNear = current >= max * 0.9;
  const isOver = current >= max;
  return (
    <span
      className="font-label-caps text-[8.5px] font-semibold transition-colors"
      style={{
        color: isOver ? "rgba(186,26,26,0.8)" : "var(--color-on-surface-variant)",
        opacity: isOver ? 1 : isNear ? 0.7 : 0.3
      }}
    >
      {current}/{max}
    </span>
  );
}

export function ValidationMessage({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <div className="mt-1 font-body-sm text-[11px]" style={{ color: "rgba(186,26,26,0.9)" }}>
      {error}
    </div>
  );
}

export function GlobalFieldHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-1 font-body-sm text-[11px]" style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }}>
      {children}
    </div>
  );
}

interface FormFieldProps {
  label?: string;
  icon?: React.ReactNode;
  required?: boolean;
  maxLength?: number;
  currentLength?: number;
  error?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, icon, required, maxLength, currentLength = 0, error, hint, children, className = "" }: FormFieldProps) {
  return (
    <div className={className}>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <FormLabel icon={icon} required={required}>{label}</FormLabel>
        </div>
      )}
      {children}
      <div className="flex items-start justify-between mt-1">
        <div>
          <ValidationMessage error={error} />
          {hint && !error && <GlobalFieldHint>{hint}</GlobalFieldHint>}
        </div>
        {maxLength !== undefined && (
          <div className="mt-1">
            <CharacterCounter current={currentLength} max={maxLength} />
          </div>
        )}
      </div>
    </div>
  );
}
