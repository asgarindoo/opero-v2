"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
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
}

export default function Dropdown({
  value,
  options,
  onChange,
  label,
  className = "",
  align = "left"
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

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] 
          bg-black/[0.02] border border-black/[0.06] hover:bg-black/[0.04] 
          transition-all font-display text-[12px] font-medium text-on-surface
        "
      >
        {label && <span className="opacity-40 font-label-caps text-[9px] font-bold uppercase tracking-wider mr-0.5">{label}:</span>}
        <span>{selectedOption?.label}</span>
        <ChevronDown 
          size={12} 
          className={`opacity-30 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className={`
          absolute top-full mt-1.5 z-[100] py-1 rounded-[8px] shadow-xl bg-white 
          border border-black/[0.08] min-w-[160px] animate-in fade-in slide-in-from-top-1
          ${align === "right" ? "right-0" : "left-0"}
        `}>
          {options.map(option => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`
                w-full flex items-center justify-between px-3 py-2 
                hover:bg-black/[0.03] transition-colors text-left
                ${value === option.value ? 'bg-primary/[0.03]' : ''}
              `}
            >
              <div className="flex items-center gap-2">
                {option.icon && <span className="opacity-40">{option.icon}</span>}
                <span className={`font-display text-[12.5px] ${value === option.value ? 'font-semibold text-primary' : 'text-on-surface opacity-80'}`}>
                  {option.label}
                </span>
              </div>
              {value === option.value && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
