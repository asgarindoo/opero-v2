"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import Button from "./Button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = ""
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-40 text-center ${className}`}>
      <div className="w-16 h-16 rounded-[20px] bg-black/[0.02] border border-black/[0.04] flex items-center justify-center mb-6">
        <Icon size={32} strokeWidth={1} className="text-on-surface-variant opacity-30" />
      </div>
      <h3 className="font-display text-[15px] font-semibold text-on-surface mb-2 tracking-tight">
        {title}
      </h3>
      {description && (
        <p className="font-body-sm text-[12.5px] text-on-surface-variant opacity-50 max-w-[280px] leading-relaxed mb-8">
          {description}
        </p>
      )}
      {action && (
        <Button 
          variant="primary" 
          onClick={action.onClick}
          icon={action.icon}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
