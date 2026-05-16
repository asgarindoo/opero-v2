"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "soft";
  size?: "sm" | "md" | "lg" | "icon";
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  isLoading?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  isLoading,
  className = "",
  style,
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center gap-2 rounded-[6px] font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-primary text-on-primary hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:-translate-y-px active:translate-y-0",
    secondary: "bg-black/[0.04] text-on-surface hover:bg-black/[0.07] border border-black/[0.06]",
    ghost: "bg-transparent text-on-surface-variant hover:bg-black/[0.04] hover:text-on-surface",
    danger: "bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white",
    soft: "bg-black/[0.02] text-on-surface-variant hover:bg-black/[0.04] hover:text-on-surface border border-black/[0.04]",
  };

  const sizes = {
    sm: "px-2.5 py-1.5 text-[10px] font-label-caps tracking-wider",
    md: "px-4 py-2 text-[12px] font-display",
    lg: "px-6 py-3 text-[14px] font-display",
    icon: "p-2",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {Icon && iconPosition === "left" && <Icon size={size === "sm" ? 12 : 14} strokeWidth={2.5} />}
          {children}
          {Icon && iconPosition === "right" && <Icon size={size === "sm" ? 12 : 14} strokeWidth={2.5} />}
        </>
      )}
    </button>
  );
}
