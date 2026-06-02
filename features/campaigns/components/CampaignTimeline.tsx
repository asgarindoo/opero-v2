"use client";

import React, { useMemo } from "react";
import { Activity, CalendarDays } from "lucide-react";
import { useCampaigns } from "../context/CampaignsContext";
import type { Campaign } from "@/features/campaigns";
import UserAvatar from "@/components/common/UserAvatar";
import { getUserDisplayName, type UserIdentity } from "@/lib/user-identity";

interface Props {
  searchQuery: string;
  filterMode: string;
  priorityFilter: string;
  onSelectCampaign: (id: string) => void;
}

function getName(val: unknown): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") return getUserDisplayName(val as UserIdentity, "");
  return String(val);
}

function toIdentity(val: unknown): UserIdentity {
  if (val && typeof val === "object") {
    const user = val as UserIdentity;
    return { ...user, image: user.image ?? user.avatar ?? null };
  }

  return { name: getName(val) || "User" };
}

const DAY_WIDTH = 28;
const LABEL_WIDTH = 300;
const ROW_HEIGHT = 54;

function daysBetween(a: string, b: string) {
  return Math.max(1, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000));
}

function dayOffset(from: string, base: string) {
  return Math.round((new Date(from).getTime() - new Date(base).getTime()) / 86_400_000);
}

export default function CampaignTimeline({ searchQuery, filterMode, priorityFilter, onSelectCampaign }: Props) {
  const { campaigns } = useCampaigns();

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return campaigns.filter(campaign => {
      const matchesSearch =
        getName(campaign.name).toLowerCase().includes(q) ||
        getName(campaign.owner).toLowerCase().includes(q) ||
        campaign.campaignAccounts?.some(acc => acc.platform.toLowerCase().includes(q) || acc.username.toLowerCase().includes(q)) ||
        campaign.tags?.some(tag => tag.toLowerCase().includes(q));

      if (filterMode === "active") return matchesSearch && campaign.status === "Active";
      if (filterMode === "planning") return matchesSearch && campaign.status === "Planning";
      if (filterMode === "paused") return matchesSearch && campaign.status === "Paused";
      if (priorityFilter !== "all" && campaign.priority !== priorityFilter) return false;
      return matchesSearch;
    });
  }, [campaigns, filterMode, priorityFilter, searchQuery]);

  const timeline = useMemo(() => {
    if (!filtered.length) return { baseDate: "", totalDays: 45, rows: [] as Array<{ campaign: Campaign; start: number; width: number }> };

    const dates = filtered.flatMap(campaign => [campaign.startDate, campaign.endDate]);
    const minDate = dates.reduce((a, b) => a < b ? a : b);
    const maxDate = dates.reduce((a, b) => a > b ? a : b);
    const totalDays = Math.max(45, daysBetween(minDate, maxDate) + 8);
    const rows = filtered.map(campaign => {
      const start = Math.max(0, dayOffset(campaign.startDate, minDate));
      const end = Math.max(start + 1, dayOffset(campaign.endDate, minDate));
      return { campaign, start, width: Math.max(2, end - start) };
    });

    return { baseDate: minDate, totalDays, rows };
  }, [filtered]);

  if (!filtered.length || !timeline.baseDate) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-on-surface-variant opacity-60">
        <CalendarDays size={32} className="mb-4 opacity-60" />
        <p className="font-label-caps text-[10px] font-bold uppercase tracking-widest">No active units in schedule</p>
      </div>
    );
  }

  const headers: { offset: number; label: string }[] = [];
  for (let i = 0; i < timeline.totalDays; i += 7) {
    const date = new Date(timeline.baseDate);
    date.setDate(date.getDate() + i);
    headers.push({ offset: i, label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) });
  }

  const today = new Date().toISOString().slice(0, 10);
  const todayOffset = dayOffset(today, timeline.baseDate);
  const timelineWidth = timeline.totalDays * DAY_WIDTH;

  return (
    <div className="h-full overflow-auto bg-[#fdf8f8]">
      <div style={{ minWidth: LABEL_WIDTH + timelineWidth + 32 }}>
        <div className="flex sticky top-0 z-20 bg-white border-b border-black/[0.05] shadow-sm">
          <div className="px-8 py-4 shrink-0 border-r border-black/[0.04]" style={{ width: LABEL_WIDTH }}>
            <span className="font-label-caps text-[9px] font-bold uppercase tracking-[0.2em] text-on-surface-variant opacity-60">Operational Unit</span>
          </div>
          <div className="relative flex-1 h-12">
            {headers.map(header => (
              <div key={header.offset} className="absolute top-0 flex h-full items-center" style={{ left: header.offset * DAY_WIDTH, paddingLeft: 8 }}>
                <span className="font-label-caps text-[9px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">{header.label}</span>
              </div>
            ))}
            {todayOffset >= 0 && todayOffset <= timeline.totalDays && (
              <div className="absolute top-0 bottom-0 w-px bg-black opacity-60 z-10" style={{ left: todayOffset * DAY_WIDTH }} />
            )}
          </div>
        </div>

        <div className="bg-white">
          {timeline.rows.map(({ campaign, start, width }) => {
            return (
              <div key={campaign.id} className="flex border-b border-black/[0.035]" style={{ height: ROW_HEIGHT }}>
                <button
                  onClick={() => onSelectCampaign(campaign.id)}
                  className="px-8 shrink-0 border-r border-black/[0.04] text-left hover:bg-black/[0.005] transition-colors"
                  style={{ width: LABEL_WIDTH }}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <UserAvatar user={toIdentity(campaign.owner)} size="md" />
                    <div className="min-w-0">
                      <h4 className="font-display text-[13px] font-bold text-on-surface truncate tracking-tight">{getName(campaign.name)}</h4>
                      <div className="flex items-center gap-2 mt-1">
                         <span className={`px-1.5 py-0.5 rounded-[3px] font-label-caps text-[6px] font-bold uppercase tracking-widest ${campaign.status === 'Active' ? 'bg-black text-white' : 'bg-black/[0.05] text-on-surface-variant opacity-70'}`}>
                            {campaign.status}
                         </span>
                         <span className="font-label-caps text-[7px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">{campaign.campaignAccounts?.slice(0, 2).map(a => a.platform).join(", ")}</span>
                      </div>
                    </div>
                  </div>
                </button>

                <div className="relative flex-1">
                  <div
                    className="absolute top-0 bottom-0 w-px bg-black/[0.02]"
                    style={{ left: todayOffset * DAY_WIDTH }}
                  />
                  <button
                    onClick={() => onSelectCampaign(campaign.id)}
                    className="absolute top-1/2 -translate-y-1/2 rounded-[6px] border border-black/[0.08] bg-white px-3 py-1.5 text-left shadow-sm hover:border-black/30 hover:shadow-md transition-all group"
                    style={{
                      left: start * DAY_WIDTH + 8,
                      width: Math.max(width * DAY_WIDTH - 16, 160),
                    }}
                  >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="font-body-sm text-[11px] font-bold text-on-surface truncate group-hover:text-primary transition-colors">{getName(campaign.name)}</span>
                      <span className="font-display text-[10px] font-bold text-on-surface opacity-60 tabular-nums">{campaign.status}</span>
                  </div>
                </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
