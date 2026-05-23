"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";

interface Props {
  value: string | null;
  onChange: (date: string | null) => void;
  placeholder?: string;
  className?: string;
  align?: "left" | "right";
  position?: "top" | "bottom";
  variant?: "default" | "minimal" | "ghost";
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function DatePicker({ value, onChange, placeholder = "Select date", className = "", align = "left", position = "bottom", variant = "default" }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number, left: number, bottom: number, width: number } | null>(null);
  
  const updateCoords = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top,
        left: rect.left,
        bottom: rect.bottom,
        width: rect.width
      });
    }
  };

  useEffect(() => {
    if (open) {
      window.addEventListener("scroll", updateCoords, true);
      window.addEventListener("resize", updateCoords);
      return () => {
        window.removeEventListener("scroll", updateCoords, true);
        window.removeEventListener("resize", updateCoords);
      };
    }
  }, [open]);

  const handleOpen = () => {
    if (!open) {
      updateCoords();
    }
    setOpen(!open);
  };
  // Current view month/year
  const [viewDate, setViewDate] = useState(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current && !containerRef.current.contains(e.target as Node) &&
        (!portalRef.current || !portalRef.current.contains(e.target as Node))
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedDate = value ? new Date(value) : null;
  
  const handleSelect = (day: number) => {
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    // Format to YYYY-MM-DD
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    onChange(`${yyyy}-${mm}-${dd}`);
    setOpen(false);
  };

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const clearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const displayFormat = selectedDate && !isNaN(selectedDate.getTime()) 
    ? selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : placeholder;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div 
        onClick={handleOpen}
        className={`flex items-center cursor-pointer transition-colors ${
          variant === "minimal" ? "gap-1.5 group" : variant === "ghost" ? "w-full justify-between px-2 py-1 rounded hover:bg-black/[0.04] group" : "gap-2 px-2.5 py-1.5 rounded-[6px] hover:bg-black/[0.04]"
        }`}
        style={variant === "minimal" || variant === "ghost" ? {} : { border: "1px solid rgba(0,0,0,0.06)", background: "rgba(0,0,0,0.02)" }}
      >
        {variant === "minimal" ? (
          <>
            <span className="font-display text-[10px] font-bold text-zinc-400 tracking-[0.1em] uppercase group-hover:text-zinc-600 transition-colors">
              {displayFormat}
            </span>
            <CalendarDays size={12} className="text-zinc-300 group-hover:text-zinc-500 transition-colors" />
          </>
        ) : variant === "ghost" ? (
          <>
            <span className="font-display text-[12px] flex-1 text-zinc-900 font-medium group-hover:text-black transition-colors text-left truncate">
              {displayFormat}
            </span>
            <CalendarDays size={13} className="text-zinc-400 group-hover:text-zinc-600 transition-colors shrink-0" />
          </>
        ) : (
          <>
            <CalendarDays size={13} style={{ color: "var(--color-primary)" }} />
            <span className="font-display text-[12px] flex-1 truncate" style={{ color: value ? "var(--color-on-surface)" : "var(--color-on-surface-variant)", opacity: value ? 1 : 0.6 }}>
              {displayFormat}
            </span>
            {value && (
              <div onClick={clearDate} className="p-0.5 rounded hover:bg-black/[0.05] transition-colors">
                <X size={12} style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }} />
              </div>
            )}
          </>
        )}
      </div>

      {open && coords && createPortal(
        <div 
          ref={portalRef}
          className="fixed z-[9999] p-3 bg-white rounded-[12px] shadow-[0_8px_24px_rgba(0,0,0,0.12)] border border-black/[0.06] w-64 animate-in fade-in zoom-in-95 duration-200"
          style={{
            ...(position === "top" ? { bottom: window.innerHeight - coords.top + 4 } : { top: coords.bottom + 4 }),
            ...(align === "right" ? { left: coords.left + coords.width - 256 } : { left: coords.left })
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <button onClick={prevMonth} className="p-1 rounded-[6px] hover:bg-black/[0.04] transition-colors">
              <ChevronLeft size={16} />
            </button>
            <span className="font-display font-semibold text-[13px]">
              {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button onClick={nextMonth} className="p-1 rounded-[6px] hover:bg-black/[0.04] transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS.map(d => (
              <div key={d} className="text-center font-label-caps text-[10px] font-bold text-on-surface-variant opacity-40">
                {d}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {blanks.map(b => (
              <div key={`blank-${b}`} className="w-7 h-7" />
            ))}
            {days.map(d => {
              const isSelected = selectedDate?.getDate() === d && selectedDate?.getMonth() === viewDate.getMonth() && selectedDate?.getFullYear() === viewDate.getFullYear();
              const isToday = new Date().getDate() === d && new Date().getMonth() === viewDate.getMonth() && new Date().getFullYear() === viewDate.getFullYear();
              
              return (
                <button
                  key={d}
                  onClick={() => handleSelect(d)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-display text-[12px] transition-all
                    ${isSelected ? 'bg-primary text-on-primary font-bold shadow-md' : 
                      isToday ? 'bg-primary/10 text-primary font-semibold hover:bg-primary/20' : 
                      'text-on-surface hover:bg-black/[0.04]'}`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
