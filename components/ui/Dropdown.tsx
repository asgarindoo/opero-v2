"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import Button from "./Button";

interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface DropdownProps {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  label?: string;
  className?: string;
  align?: "left" | "right";
  disabled?: boolean;
  variant?: "default" | "minimal";
}

export default function Dropdown({
  value,
  options,
  onChange,
  label,
  className = "",
  align = "left",
  disabled = false,
  variant = "default"
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);
  const isMinimal = variant === "minimal";

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={isMinimal ? `
          w-full flex items-center justify-between px-2 py-1 rounded
          bg-transparent hover:bg-black/[0.04] transition-all font-display text-[12px] text-zinc-900 font-medium
          disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer outline-none
        ` : `
          w-full flex items-center justify-between px-3 py-2.5 rounded-md
          bg-[#fcfcfc] border border-black/[0.08] focus:bg-white focus:border-zinc-300 focus:ring-4 focus:ring-zinc-100
          transition-all font-display text-[14px] text-zinc-900 shadow-sm
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        <div className="flex items-center gap-1.5 overflow-hidden">
          {label && <span className="text-zinc-400 font-medium text-[11px] uppercase tracking-wide mr-1">{label}:</span>}
          <span className="truncate">{selectedOption?.label || "Select..."}</span>
        </div>
        <ChevronDown 
          size={14} 
          className={`text-zinc-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className={`
          absolute top-full mt-1.5 z-[100] py-1 rounded-lg shadow-lg bg-white 
          border border-black/[0.08] min-w-full w-max animate-in fade-in zoom-in-95 duration-100
          ${align === "right" ? "right-0" : "left-0"}
        `}>
          {options.map(option => (
            <button
              type="button"
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`
                w-full flex items-center justify-between px-3 py-2 
                hover:bg-zinc-50 transition-colors text-left
              `}
            >
              <div className="flex items-center gap-2">
                {option.icon && <span className="text-zinc-400">{option.icon}</span>}
                <span className={`font-display text-[13px] ${value === option.value ? 'font-medium text-zinc-900' : 'text-zinc-600'}`}>
                  {option.label}
                </span>
              </div>
              {value === option.value && <Check size={14} className="text-zinc-900 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
