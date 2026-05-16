"use client";

import React from "react";
import { History } from "lucide-react";

export default function ActivityEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-40 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="w-16 h-16 rounded-3xl bg-black/[0.02] border border-black/[0.04] flex items-center justify-center mb-8">
        <History size={24} strokeWidth={1.5} className="text-on-surface-variant opacity-20" />
      </div>
      <h3 className="font-display text-[15px] font-semibold text-on-surface mb-2 tracking-tight">
        Quiet day in the workspace
      </h3>
      <p className="font-body-sm text-[12.5px] text-on-surface-variant opacity-50 text-center max-w-[280px] leading-relaxed">
        No operational activity recorded yet. Team actions and system events will appear here in real-time.
      </p>
    </div>
  );
}
