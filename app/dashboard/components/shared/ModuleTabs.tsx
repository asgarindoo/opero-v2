"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface TabItem {
  id: string;
  label: string;
  icon?: LucideIcon;
}

interface ModuleTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  rightContent?: React.ReactNode;
  className?: string;
  background?: string;
}

export default function ModuleTabs({ 
  tabs, 
  activeTab, 
  onTabChange,
  rightContent,
  className = "",
  background = "bg-white/20"
}: ModuleTabsProps) {
  return (
    <div className={`px-6 py-3 border-b border-black/[0.03] shrink-0 flex items-center justify-between ${background} ${className}`}>
      <div className="flex gap-8">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative py-1 group flex items-center gap-2"
            >
              {Icon && <Icon size={12} className={isActive ? "text-primary" : "text-on-surface-variant opacity-45 group-hover:opacity-100"} />}
              <span className={`font-display text-[12px] font-semibold transition-all ${
                isActive ? "text-primary" : "text-on-surface-variant group-hover:opacity-100"
              }`} style={{ opacity: isActive ? 0.9 : 0.45 }}>
                {tab.label}
              </span>
              {isActive && <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-8">
        {rightContent}
      </div>
    </div>
  );
}
