"use client";

import React from "react";

interface ModuleHeaderProps {
  title: string;
  count?: number;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  className?: string;
}

export default function ModuleHeader({
  title,
  count,
  leftContent,
  rightContent,
  className = ""
}: ModuleHeaderProps) {
  return (
    <div
      className={`flex items-center justify-between px-6 h-[60px] border-b shrink-0 ${className}`}
      style={{
        borderColor: "rgba(0,0,0,0.07)",
        background: "var(--color-background, #fff)"
      }}
    >
      {/* Left: title + count + custom left content */}
      <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
        <h1 className="font-display text-[16px] font-semibold tracking-tight text-on-surface truncate">
          {title}
        </h1>
        {count !== undefined && (
          <span
            className="font-label-caps text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0"
            style={{
              background: "rgba(0,0,0,0.06)",
              color: "var(--color-on-surface-variant)",
              opacity: 0.6
            }}
          >
            {count}
          </span>
        )}
        {leftContent && (
          <div className="flex items-center gap-3 ml-2 truncate">
            <div className="h-4 w-px bg-black/[0.06] shrink-0" />
            {leftContent}
          </div>
        )}
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-nowrap shrink-0 pl-4 h-full">
        {rightContent}
      </div>
    </div>
  );
}
