"use client";

import React from "react";
import { useActivity } from "../context/ActivityContext";
import { ActivityCategory } from "@/features/activity";
import ActivityEmptyState from "./ActivityEmptyState";
import UserAvatar from "@/components/common/UserAvatar";
import { getUserDisplayName } from "@/lib/user-identity";

const CATEGORY_COLORS: Record<ActivityCategory, { text: string; dot: string }> = {
  INFO: { text: "text-blue-500", dot: "bg-blue-400" },
  UPDATE: { text: "text-emerald-500", dot: "bg-emerald-400" },
  WARNING: { text: "text-amber-500", dot: "bg-amber-400" },
  AUTOMATION: { text: "text-indigo-500", dot: "bg-indigo-400" },
  SECURITY: { text: "text-purple-500", dot: "bg-purple-400" },
};

function actionVerb(action: string) {
  const normalized = action.toLowerCase();
  if (normalized.includes("added")) return "added";
  if (normalized.includes("created")) return "created";
  if (normalized.includes("updated")) return "updated";
  if (normalized.includes("deleted")) return "deleted";
  if (normalized.includes("completed")) return "completed";
  if (normalized.includes("uploaded")) return "uploaded";
  if (normalized.includes("published")) return "published";
  if (normalized.includes("archived")) return "archived";
  if (normalized.includes("approved")) return "approved";
  if (normalized.includes("sent")) return "sent";
  if (normalized.includes("invited")) return "invited";
  if (normalized.includes("connected")) return "connected";
  return normalized;
}

function entityLabel(entityType: string) {
  return entityType.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
}

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
            <div className="px-8 py-2.5 bg-black/1 border-y border-black/3 flex items-center gap-4">
              <div className="h-3 w-32 bg-black/4 rounded" />
              <div className="h-px flex-1 bg-black/3" />
            </div>
            <div className="flex flex-col divide-y divide-black/2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-8 py-3.5">
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="h-3 w-16 bg-black/4 rounded" />
                    <div className="h-3 w-20 bg-black/4 rounded" />
                  </div>
                  <div className="w-1 h-1 rounded-full bg-black/4 shrink-0" />
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="h-3 w-2/3 bg-black/4 rounded" />
                    <div className="h-2 w-1/3 bg-black/4 rounded" />
                  </div>
                  <div className="h-3 w-16 bg-black/4 rounded ml-4 shrink-0" />
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
      {groupedActivities.map((group) => (
        <div key={group.date} className="flex flex-col mb-8">
          <div className="px-8 py-2.5 bg-[#fef8f8] border-y border-black/3 flex items-center gap-4 sticky top-0 z-10">
            <span className="font-label-caps text-[9.5px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em]">
              {group.date}
            </span>
            <div className="h-px flex-1 bg-black/3" />
          </div>

          <div className="flex flex-col divide-y divide-black/2">
            {group.activities.map((activity) => {
              const config = CATEGORY_COLORS[activity.category] || CATEGORY_COLORS.INFO;
              return (
                <button
                  key={activity.id}
                  onClick={() => onSelect(activity.id)}
                  className="group grid grid-cols-[auto_auto_auto_1fr_auto] items-start gap-4 px-8 py-3.5 text-left hover:bg-black/[0.015] transition-all cursor-pointer border-l-2 border-l-transparent hover:border-l-primary/40"
                >
                  <div className="flex items-center gap-3 shrink-0 pt-0.5">
                    <span className="font-mono text-[10.5px] text-on-surface-variant opacity-60">
                      [{new Date(activity.timestamp).toLocaleTimeString([], { hour12: true, hour: "2-digit", minute: "2-digit" })}]
                    </span>
                    <span className="font-mono text-[10.5px] font-bold text-on-surface-variant opacity-60 tracking-tight min-w-22.5">
                      [{activity.module}]
                    </span>
                  </div>

                  <div className={`w-1.5 h-1.5 rounded-full ${config.dot} opacity-70 shrink-0 group-hover:opacity-100 transition-opacity mt-2`} />

                  <UserAvatar user={activity.user} size="md" className="h-6 w-6 bg-white text-[9px]" />

                  <div className="min-w-0 space-y-1">
                    <p className="font-body text-[12.5px] text-on-surface-variant opacity-85 leading-relaxed break-words">
                      <span className="font-display font-bold text-on-surface opacity-95">{getUserDisplayName(activity.user, "Workspace")}</span>{" "}
                      {actionVerb(activity.action)}{" "}
                      <span className="font-label-caps text-[8px] font-bold uppercase tracking-widest text-on-surface-variant opacity-55">
                        {entityLabel(activity.entityType)}
                      </span>{" "}
                      <span className="font-display font-semibold text-on-surface">&quot;{activity.entityName}&quot;</span>
                    </p>
                    {activity.description && (
                      <p className="font-body-sm text-[11.5px] text-on-surface-variant opacity-60 leading-relaxed break-words group-hover:opacity-80 transition-opacity">
                        {activity.description}
                      </p>
                    )}
                  </div>

                  <span className={`font-mono text-[9px] font-bold uppercase tracking-widest ${config.text} opacity-60 group-hover:opacity-80 transition-opacity whitespace-nowrap ml-4 mt-1`}>
                    {activity.category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
