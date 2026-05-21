"use client";

import React from "react";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  maxLength?: number;
}

export default function OperationInput({ label, icon, maxLength, required, value, ...props }: Props) {
  const strValue = String(value || "");
  const chars = strValue.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          {icon && <span style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }}>{icon}</span>}
          <span className="font-label-caps text-[9px] uppercase tracking-[0.12em] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }}>
            {label} {required && "*"}
          </span>
        </div>
        {maxLength !== undefined && chars > 0 && (
          <span className="font-label-caps text-[8.5px] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: chars >= maxLength ? 0.8 : 0.3, color: chars >= maxLength ? "rgba(186,26,26,0.8)" : undefined }}>
            {chars}/{maxLength}
          </span>
        )}
      </div>
      <input
        required={required}
        value={value}
        maxLength={maxLength}
        className="w-full font-body-md text-[13px] rounded-[6px] px-3 py-2.5 outline-none transition-all"
        style={{ border: "1px solid rgba(0,0,0,0.09)", background: "rgba(0,0,0,0.02)", color: "var(--color-on-surface)" }}
        onFocus={(e) => {
          e.target.style.background = "rgba(0,0,0,0.04)";
          e.target.style.borderColor = "rgba(0,0,0,0.2)";
        }}
        onBlur={(e) => {
          e.target.style.background = "rgba(0,0,0,0.02)";
          e.target.style.borderColor = "rgba(0,0,0,0.09)";
        }}
        {...props}
      />
    </div>
  );
}
