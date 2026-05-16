"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  error?: string;
  label?: string;
  containerClassName?: string;
}

export default function Input({
  icon: Icon,
  error,
  label,
  containerClassName = "",
  className = "",
  ...props
}: InputProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label className="font-label-caps text-[9px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      <div 
        className="relative flex items-center group transition-all duration-200"
      >
        {Icon && (
          <Icon 
            size={12} 
            className="absolute left-3 text-on-surface-variant opacity-60 group-focus-within:opacity-80 transition-opacity" 
            strokeWidth={1.75}
          />
        )}
        <input
          className={`
            w-full bg-black/[0.02] border border-black/[0.09] rounded-[6px] 
            py-1.5 ${Icon ? 'pl-9' : 'px-3'} pr-3
            font-body-md text-[12px] text-on-surface placeholder:opacity-30
            focus:bg-white focus:border-primary/40
            outline-none transition-all duration-200
            ${error ? 'border-red-500/50' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <span className="font-body-sm text-[10px] text-red-500 opacity-80 ml-1">
          {error}
        </span>
      )}
    </div>
  );
}
