"use client";

import React from "react";
import { FormField } from "./FormField";

interface Props extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'maxLength'> {
  label?: string;
  icon?: React.ReactNode;
  maxLength?: number;
  error?: string;
  hint?: React.ReactNode;
}

export function GlobalTextarea({ label, icon, maxLength, required, value, error, hint, className = "", rows = 3, ...props }: Props) {
  const strValue = String(value ?? "");
  const chars = strValue.length;

  return (
    <FormField label={label} icon={icon} required={required} maxLength={maxLength} currentLength={chars} error={error} hint={hint} className={className}>
      <textarea
        required={required}
        value={value}
        maxLength={maxLength}
        rows={rows}
        className="w-full font-body-md text-[13px] rounded-[6px] px-3 py-2.5 outline-none transition-all resize-none"
        style={{ border: error ? "1px solid rgba(186,26,26,0.3)" : "1px solid rgba(0,0,0,0.09)", background: "rgba(0,0,0,0.02)", color: "var(--color-on-surface)" }}
        onFocus={(e) => {
          e.target.style.background = "rgba(0,0,0,0.04)";
          e.target.style.borderColor = error ? "rgba(186,26,26,0.5)" : "rgba(0,0,0,0.2)";
        }}
        onBlur={(e) => {
          e.target.style.background = "rgba(0,0,0,0.02)";
          e.target.style.borderColor = error ? "rgba(186,26,26,0.3)" : "rgba(0,0,0,0.09)";
        }}
        {...props}
      />
    </FormField>
  );
}
