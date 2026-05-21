"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface Props {
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: number;
}

export default function OperationModal({ onClose, title, icon, children, footer, maxWidth = 600 }: Props) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "auto"; };
  }, []);

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(3px)" }}
        onClick={onClose}
      >
        <div
          className="flex flex-col w-full overflow-hidden"
          style={{
            maxWidth, maxHeight: "94vh",
            background: "#fff", borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.09)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.18)",
            animation: "modalPop 0.18s cubic-bezier(0.16,1,0.3,1)",
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b shrink-0" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
            <div className="flex items-center gap-2">
              {icon}
              <span className="font-display text-[14px] font-semibold" style={{ color: "var(--color-on-surface)" }}>
                {title}
              </span>
            </div>
            <button type="button" onClick={onClose} className="p-1.5 rounded-[5px] hover:bg-black/[0.05] transition-colors">
              <X size={14} strokeWidth={1.75} style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 } as React.CSSProperties} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-between px-5 py-3 border-t shrink-0" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
              {footer}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes modalPop {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1)   translateY(0); }
        }
      `}</style>
    </>
  );
}
