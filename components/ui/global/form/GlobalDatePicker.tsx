"use client";

import React from "react";
import { FormField } from "./FormField";
import { Calendar } from "lucide-react";

interface Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'maxLength'> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  hint?: React.ReactNode;
}

export function GlobalDatePicker({ label, icon, required, value, error, hint, className = "", ...props }: Props) {
  return (
    <FormField label={label} icon={icon || <Calendar size={11} strokeWidth={1.75} />} required={required} error={error} hint={hint} className={className}>
      <input
        type="date"
        required={required}
        value={value}
        className="w-full font-body-md text-[13px] rounded-[6px] px-3 py-2.5 outline-none transition-all"
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
