"use client";

import React from "react";
import { X } from "lucide-react";

interface Props {
  title: React.ReactNode;
  icon?: React.ReactNode;
  onClose: () => void;
  subtitle?: React.ReactNode;
}

export function ModalHeader({ title, icon, onClose, subtitle }: Props) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-b shrink-0" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
      <div className="flex items-center gap-2">
        {icon}
        {subtitle && (
          <span className="font-label-caps text-[9px] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }}>
            {subtitle}
          </span>
        )}
        <span className="font-display text-[14px] font-semibold" style={{ color: "var(--color-on-surface)" }}>
          {title}
        </span>
      </div>
      <button type="button" onClick={onClose} className="p-1.5 rounded-[5px] hover:bg-black/[0.05] transition-colors">
        <X size={14} strokeWidth={1.75} style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }} />
      </button>
    </div>
  );
}
