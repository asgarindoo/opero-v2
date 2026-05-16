"use client";

import React, { useState, useRef, useEffect } from "react";
import { Filter, ChevronDown, Check } from "lucide-react";

export type DateRange = "All" | "7d" | "30d" | "90d" | "1y";

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (value: DateRange) => void;
  className?: string;
  width?: string | number;
}

const dateRangeOptions: { value: DateRange; label: string }[] = [
  { value: "All", label: "All Time" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
  { value: "1y", label: "Last Year" },
];

export default function DateRangeFilter({ 
  value, 
  onChange,
  className = "",
  width
}: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef} style={{ width }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-[6px] group transition-all duration-200 cursor-pointer"
        style={{ 
          border: "1px solid rgba(0,0,0,0.09)", 
          background: "rgba(0,0,0,0.025)" 
        }}
      >
        <Filter size={12} strokeWidth={1.75} style={{ color: "var(--color-on-surface-variant)", opacity: 0.45 }} />
        <span className="font-body-md text-[12px] font-semibold text-on-surface whitespace-nowrap overflow-hidden text-ellipsis">
          {dateRangeOptions.find(o => o.value === value)?.label}
        </span>
        <ChevronDown size={10} className={`opacity-30 group-hover:opacity-60 transition-all ml-auto ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 top-full mt-1.5 p-1 rounded-[8px] min-w-[160px] z-50 animate-in fade-in slide-in-from-top-1 duration-200 shadow-xl"
          style={{ 
            background: "#fff", 
            border: "1px solid rgba(0,0,0,0.08)", 
            boxShadow: "0 10px 30px -10px rgba(0,0,0,0.12)"
          }}
        >
          {dateRangeOptions.map(option => (
             <button
               key={option.value}
               onClick={() => { onChange(option.value); setIsOpen(false); }}
               className="w-full flex items-center justify-between px-3 py-2 rounded-[6px] hover:bg-black/[0.03] transition-colors group text-left"
             >
               <span className={`font-display text-[12px] ${value === option.value ? 'font-semibold text-primary' : 'text-on-surface opacity-60 group-hover:opacity-100'}`}>
                 {option.label}
               </span>
               {value === option.value && <Check size={12} className="text-primary" />}
             </button>
          ))}
        </div>
      )}
    </div>
  );
}
