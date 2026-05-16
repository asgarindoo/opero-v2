"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown } from "lucide-react";

interface DateRangePickerProps {
  value: string;
  onChange: (value: string) => void;
  options?: string[];
  align?: "left" | "right";
}

export default function DateRangePicker({ 
  value, 
  onChange, 
  options = ["Today", "Last 7 Days", "Last 30 Days", "Last 12 Months", "All Time"],
  align = "right"
}: DateRangePickerProps) {
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
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-black/[0.04] transition-all text-on-surface-variant group"
      >
        <Calendar size={13} className="opacity-40 group-hover:opacity-100 transition-opacity" />
        <span className="font-display text-[12px] font-semibold">{value}</span>
        <ChevronDown size={12} className={`opacity-30 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className={`absolute ${align === "right" ? "right-0" : "left-0"} top-full mt-2 w-44 bg-white border border-black/[0.08] rounded-xl shadow-xl z-50 py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200`}>
          {options.map(range => (
            <button
              key={range}
              onClick={() => {
                onChange(range);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 font-display text-[11.5px] transition-colors hover:bg-black/[0.03] ${value === range ? "text-primary font-bold" : "text-on-surface-variant opacity-60"
                }`}
            >
              {range}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
