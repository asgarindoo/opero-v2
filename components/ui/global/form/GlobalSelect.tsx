"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { FormField } from "./FormField";

interface Option {
  label: string;
  value: string;
}

interface Props extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'maxLength'> {
  label?: string;
  icon?: React.ReactNode;
  options: Option[];
  error?: string;
  hint?: React.ReactNode;
}

export function GlobalSelect({ label, icon, required, options, value, error, hint, className = "", ...props }: Props) {
  return (
    <FormField label={label} icon={icon} required={required} error={error} hint={hint} className={className}>
      <div className="relative">
        <select
          required={required}
          value={value}
          className="w-full appearance-none font-body-md text-[13px] rounded-[6px] pl-3 pr-8 py-2.5 outline-none transition-all cursor-pointer"
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
        >
          <option value="" disabled>Select an option...</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }} />
      </div>
    </FormField>
  );
}
