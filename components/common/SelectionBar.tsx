"use client";

import React from "react";
import { Trash2, X, Archive, Download, Tag } from "lucide-react";
import Button from "../ui/Button";

interface SelectionBarProps {
  count: number;
  onClear: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  onExport?: () => void;
  onTag?: () => void;
  label?: string;
}

export default function SelectionBar({ 
  count, 
  onClear, 
  onDelete, 
  onArchive,
  onExport,
  onTag,
  label = "items" 
}: SelectionBarProps) {
  if (count === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300 ease-out">
      <div className="bg-on-surface text-surface flex items-center gap-2 px-3 py-2 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.15)] backdrop-blur-md border border-white/10">
        <div className="flex items-center gap-3 px-3 border-r border-white/10 mr-1">
          <span className="font-display text-[12.5px] font-bold text-white whitespace-nowrap">
            {count} <span className="opacity-60 font-medium">{label} selected</span>
          </span>
          <button 
            onClick={onClear}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={14} className="text-white/40 hover:text-white" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          {onArchive && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onArchive}
              className="h-8 px-3 text-white/80 hover:text-white hover:bg-white/10 gap-2 border-0"
            >
              <Archive size={14} />
              <span className="font-label-caps text-[9px] font-bold">Archive</span>
            </Button>
          )}
          {onTag && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onTag}
              className="h-8 px-3 text-white/80 hover:text-white hover:bg-white/10 gap-2 border-0"
            >
              <Tag size={14} />
              <span className="font-label-caps text-[9px] font-bold">Tag</span>
            </Button>
          )}
          {onExport && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onExport}
              className="h-8 px-3 text-white/80 hover:text-white hover:bg-white/10 gap-2 border-0"
            >
              <Download size={14} />
              <span className="font-label-caps text-[9px] font-bold">Export</span>
            </Button>
          )}
          {onDelete && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onDelete}
              className="h-8 px-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-2 border-0"
            >
              <Trash2 size={14} />
              <span className="font-label-caps text-[9px] font-bold">Delete</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
