"use client";

import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "error" | "info" | "neutral" | "primary" | "purple" | "slate";
  dot?: boolean;
  className?: string;
}

export default function Badge({
  children,
  variant = "neutral",
  dot = false, // Default to false for a cleaner look
  className = ""
}: BadgeProps) {
  const variants = {
    success: "bg-emerald-500/10 text-emerald-700",
    warning: "bg-amber-500/10 text-amber-700",
    error: "bg-red-500/10 text-red-700",
    info: "bg-blue-500/10 text-blue-700",
    neutral: "bg-black/[0.04] text-on-surface opacity-70",
    primary: "bg-primary/10 text-primary",
    purple: "bg-purple-500/10 text-purple-700",
    slate: "bg-slate-500/10 text-slate-700",
  };

  const dotColors = {
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    error: "bg-red-500",
    info: "bg-blue-500",
    neutral: "bg-on-surface-variant",
    primary: "bg-primary",
    purple: "bg-purple-500",
    slate: "bg-slate-500",
  };

  return (
    <div className={`
      inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[5px] 
      font-display text-[10.5px] font-bold tracking-tight
      ${variants[variant]} ${className}
    `}>
      {dot && <div className={`w-1 h-1 rounded-full ${dotColors[variant]} opacity-70`} />}
      {children}
    </div>
  );
}

export function Tag({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`
      inline-flex items-center px-1.5 py-0.5 rounded-[4px] 
      bg-black/[0.04] text-on-surface-variant opacity-60
      font-label-caps text-[9px] font-bold uppercase tracking-widest
      ${className}
    `}>
      {children}
    </div>
  );
}
