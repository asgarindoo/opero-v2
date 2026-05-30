"use client";

import React, { useEffect } from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  isLoading = false
}: ConfirmationModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);

  if (!isOpen) return null;

  const isDanger = variant === "danger";
  const isWarning = variant === "warning";

  return (
    <>
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-150"
        onClick={onClose}
      >
        <div 
          className="relative w-full max-w-[400px] bg-white rounded-[6px] shadow-[0_12px_32px_-8px_rgba(0,0,0,0.12)] border border-black/[0.06] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          onClick={e => e.stopPropagation()}
        >
          <div className="px-5 pt-5 pb-4 flex flex-col gap-2">
            <h2 className="font-display text-[15px] font-semibold text-on-surface tracking-tight">
              {title}
            </h2>
            <p className="font-body-md text-[13px] leading-[1.5] text-on-surface-variant opacity-85">
              {description}
            </p>
          </div>

          <div className="px-5 pb-5 flex items-center justify-end gap-2.5">
            <button 
              onClick={onClose}
              disabled={isLoading}
              className="h-8 px-3 font-body-sm text-[12.5px] font-medium rounded-[4px] text-on-surface-variant hover:text-on-surface hover:bg-black/[0.04] transition-colors disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button 
              onClick={onConfirm}
              disabled={isLoading}
              className={`h-8 px-3.5 font-body-sm text-[12.5px] font-medium rounded-[4px] text-white shadow-sm transition-colors flex items-center justify-center min-w-[72px] disabled:opacity-50 ${
                isDanger 
                  ? "bg-[#c03434] hover:bg-[#a12c2c] border border-black/10" 
                  : isWarning 
                    ? "bg-[#d98c1c] hover:bg-[#b87617] border border-black/10" 
                    : "bg-[#111111] hover:bg-black border border-black/10"
              }`}
            >
              {isLoading ? (
                <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                confirmLabel
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
