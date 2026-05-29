"use client";

import React from "react";
import { useActivity } from "../context/ActivityContext";
import { ActivityCategory } from "@/features/activity";
import ActivityEmptyState from "./ActivityEmptyState";

const CATEGORY_COLORS: Record<ActivityCategory, { text: string; dot: string }> = {
  INFO: { text: "text-blue-500", dot: "bg-blue-400" },
  UPDATE: { text: "text-emerald-500", dot: "bg-emerald-400" },
  WARNING: { text: "text-amber-500", dot: "bg-amber-400" },
  AUTOMATION: { text: "text-indigo-500", dot: "bg-indigo-400" },
  SECURITY: { text: "text-purple-500", dot: "bg-purple-400" },
};

interface Props {
  onSelect: (id: string) => void;
}

export default function ActivityTimeline({ onSelect }: Props) {
  const { groupedActivities, loading } = useActivity();

  if (loading) {
    return (
      <div className="flex flex-col w-full pb-20">
        {[...Array(2)].map((_, groupIdx) => (
          <div key={groupIdx} className="flex flex-col mb-8 animate-pulse">
            <div className="px-8 py-2.5 bg-black/[0.01] border-y border-black/[0.03] flex items-center gap-4">
               <div className="h-3 w-32 bg-black/[0.04] rounded" />
               <div className="h-px flex-1 bg-black/[0.03]" />
            </div>
            <div className="flex flex-col divide-y divide-black/[0.02]">
               {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-8 py-2.5">
                     <div className="flex items-center gap-3 shrink-0">
                        <div className="h-3 w-16 bg-black/[0.04] rounded" />
                        <div className="h-3 w-20 bg-black/[0.04] rounded" />
                     </div>
                     <div className="w-1 h-1 rounded-full bg-black/[0.04] shrink-0" />
                     <div className="flex-1 flex items-center gap-2">
                        <div className="h-3 w-2/3 bg-black/[0.04] rounded" />
                     </div>
                     <div className="h-3 w-16 bg-black/[0.04] rounded ml-4 shrink-0" />
                  </div>
               ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (groupedActivities.length === 0) {
    return <ActivityEmptyState />;
  }

  return (
    <div className="flex flex-col w-full pb-20">
      {groupedActivities.map(group => (
        <div key={group.date} className="flex flex-col mb-8">
          {/* Minimal Date Header */}
          <div className="px-8 py-2.5 bg-black/[0.01] border-y border-black/[0.03] flex items-center gap-4">
             <span className="font-label-caps text-[9.5px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em]">
                {group.date}
             </span>
             <div className="h-px flex-1 bg-black/[0.03]" />
          </div>

          {/* Log Stream */}
          <div className="flex flex-col divide-y divide-black/[0.02]">
             {group.activities.map(activity => {
                const config = CATEGORY_COLORS[activity.category] || CATEGORY_COLORS.INFO;
                
                return (
                  <div 
                    key={activity.id}
                    onClick={() => onSelect(activity.id)}
                    className="group flex items-center gap-4 px-8 py-2.5 hover:bg-black/[0.015] transition-all cursor-pointer border-l-2 border-l-transparent hover:border-l-primary/40"
                  >
                    {/* Log Prefix: Timestamp & Module */}
                    <div className="flex items-center gap-3 shrink-0">
                       <span className="font-mono text-[10.5px] text-on-surface-variant opacity-60">
                          [{new Date(activity.timestamp).toLocaleTimeString([], { hour12: true, hour: '2-digit', minute: '2-digit' })}]
                       </span>
                       <span className="font-mono text-[10.5px] font-bold text-on-surface-variant opacity-60 tracking-tight min-w-[90px]">
                          [{activity.module}]
                       </span>
                    </div>

                    {/* Status Indicator */}
                    <div className={`w-1 h-1 rounded-full ${config.dot} opacity-60 shrink-0 group-hover:opacity-100 transition-opacity`} />

                    {/* Action Message */}
                    <div className="flex-1 flex items-center gap-2 overflow-hidden">
                       <span className="font-body text-[12.5px] text-on-surface-variant opacity-80 whitespace-nowrap overflow-hidden text-ellipsis">
                          <span className="font-display font-bold text-on-surface opacity-90">{activity.user.name}</span>
                          {" "} marked {activity.entityType.toLowerCase()} <span className="font-display font-semibold text-on-surface italic">“{activity.entityName}”</span> as {activity.action.toLowerCase()}.
                       </span>
                       <span className="font-body-sm text-[12px] text-on-surface-variant opacity-60 whitespace-nowrap overflow-hidden text-ellipsis group-hover:opacity-80 transition-opacity">
                          — {activity.description}
                       </span>
                    </div>

                    {/* Category Label: Subtle Log Meta */}
                    <span className={`font-mono text-[9px] font-bold uppercase tracking-widest ${config.text} opacity-60 group-hover:opacity-80 transition-opacity whitespace-nowrap ml-4`}>
                       {activity.category}
                    </span>
                  </div>
                );
             })}
          </div>
        </div>
      ))}
    </div>
  );
}
