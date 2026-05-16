"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import Button from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md"
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-3xl",
    xl: "max-w-5xl",
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Content */}
      <div className={`
        relative w-full ${sizes[size]} bg-white rounded-[12px] shadow-2xl 
        flex flex-col max-h-[90vh] overflow-hidden
        animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300
      `}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.04]">
          {title && (
            <h2 className="font-display text-[15px] font-semibold text-on-surface leading-none">
              {title}
            </h2>
          )}
          <Button variant="ghost" size="icon" onClick={onClose} className="-mr-2">
            <X size={16} strokeWidth={2.5} className="opacity-40" />
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-black/[0.04] bg-black/[0.01] flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
