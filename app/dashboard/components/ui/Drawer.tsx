"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import Button from "./Button";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export default function Drawer({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md"
}: DrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);

  const sizes = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-2xl",
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`
          fixed inset-0 z-[100] bg-black/10 backdrop-blur-[2px] transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className={`
        fixed top-0 right-0 z-[101] h-full w-full ${sizes[size]} bg-white shadow-2xl
        flex flex-col transition-transform duration-500 ease-out border-l border-black/[0.04]
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-black/[0.04]">
          <div>
            {title && (
              <h2 className="font-display text-[17px] font-semibold text-on-surface tracking-tight">
                {title}
              </h2>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="-mr-3">
            <X size={18} strokeWidth={2.5} className="opacity-40" />
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-8 py-5 border-t border-black/[0.04] bg-black/[0.01] flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </>
  );
}
