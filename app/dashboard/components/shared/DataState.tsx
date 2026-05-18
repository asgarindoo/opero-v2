"use client";

import { AlertCircle } from "lucide-react";

export function EmptyState({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] gap-4 p-8">
      <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.02)" }}>
        <span className="material-symbols-outlined" style={{ fontSize: 32, color: "var(--color-on-surface-variant)", opacity: 0.3 }}>
          {icon}
        </span>
      </div>
      <div className="text-center space-y-1 max-w-xs">
        <p className="font-display font-bold text-[14px] text-on-surface">{title}</p>
        <p className="font-body-sm text-[12px] text-on-surface-variant opacity-60 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] gap-3 p-8 text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center bg-red-500/5 text-red-600">
        <AlertCircle size={28} strokeWidth={1.75} />
      </div>
      <div className="space-y-1 max-w-xs">
        <p className="font-display font-bold text-[14px] text-on-surface">Could not load data</p>
        <p className="font-body-sm text-[12px] text-on-surface-variant opacity-60 leading-relaxed">{message}</p>
      </div>
    </div>
  );
}

export function RowSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="flex-1 overflow-y-auto">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-2.5 border-b" style={{ borderColor: "rgba(0,0,0,0.05)" }}>
          <div className="w-2 h-2 rounded-full bg-black/[0.06] animate-pulse shrink-0" />
          <div className="flex-1 h-3 rounded bg-black/[0.06] animate-pulse" />
          <div className="h-4 w-14 rounded bg-black/[0.05] animate-pulse" />
          <div className="h-4 w-20 rounded bg-black/[0.04] animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export function CardGridSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="bg-white border border-black/[0.06] rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-4 w-16 bg-black/[0.04] rounded animate-pulse" />
            <div className="h-4 w-12 bg-black/[0.04] rounded animate-pulse" />
          </div>
          <div className="space-y-2 pt-2">
            <div className="h-5 w-3/4 bg-black/[0.04] rounded animate-pulse" />
            <div className="h-3 w-full bg-black/[0.04] rounded animate-pulse" />
            <div className="h-3 w-5/6 bg-black/[0.04] rounded animate-pulse" />
          </div>
          <div className="space-y-2 pt-4 border-t border-black/[0.03]">
            <div className="h-2 w-full bg-black/[0.04] rounded-full animate-pulse" />
            <div className="flex justify-between items-center pt-2">
              <div className="h-4 w-20 bg-black/[0.04] rounded animate-pulse" />
              <div className="h-5 w-5 bg-black/[0.04] rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
