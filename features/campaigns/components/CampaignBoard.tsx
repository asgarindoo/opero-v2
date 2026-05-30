"use client";

import React from "react";
import { useCampaigns } from "../context/CampaignsContext";
import { CampaignStatus } from "@/features/campaigns";
import { Megaphone, Users, Plus, MoreHorizontal, Target, Calendar, ListTodo } from "lucide-react";
import UserAvatar from "@/components/common/UserAvatar";
import { getUserDisplayName, type UserIdentity } from "@/lib/user-identity";

interface Props {
  searchQuery: string;
  priorityFilter: string;
  onSelectCampaign: (id: string) => void;
}

const STATUSES: CampaignStatus[] = ["Planning", "Active", "Paused", "Completed"];

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

function formatCurrency(val?: number, curr: string = "USD") {
  if (!val) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: curr, currencyDisplay: "code", maximumFractionDigits: 0 }).format(val);
}

export default function CampaignBoard({ searchQuery, priorityFilter, onSelectCampaign }: Props) {
  const { campaigns } = useCampaigns();

  const filteredCampaigns = campaigns.filter(c => {
    if (priorityFilter !== "all" && c.priority !== priorityFilter) return false;
    const q = searchQuery.toLowerCase();
    return getName(c.name).toLowerCase().includes(q) || getName(c.owner).toLowerCase().includes(q);
  });

  return (
    <div className="flex-1 flex gap-4 p-8 min-h-full overflow-x-auto bg-[#fdf8f8]">
      {STATUSES.map(status => {
        const stageCampaigns = filteredCampaigns.filter(c => c.status === status);

        return (
          <div key={status} className="flex-1 min-w-[280px] max-w-[340px] flex flex-col">
            <div className="flex items-center justify-between px-3 mb-6">
              <div className="flex items-center gap-3">
                <h3 className="font-label-caps text-[9px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.25em]">{status}</h3>
                <span className="font-display text-[10px] font-bold text-on-surface-variant opacity-60 px-2 py-0.5 bg-black/[0.03] rounded-[4px] tabular-nums">{stageCampaigns.length}</span>
              </div>
              <button className="text-on-surface-variant opacity-60 hover:opacity-100 transition-opacity">
                <Plus size={14} />
              </button>
            </div>

            <div className="flex-1 flex flex-col gap-3">
              {stageCampaigns.map(campaign => {
                const isCritical = campaign.priority === "Critical" || campaign.priority === "High";
                return (
                <div
                  key={campaign.id}
                  onClick={() => onSelectCampaign(campaign.id)}
                  className="group relative flex flex-col p-5 bg-white rounded-[10px] border border-black/[0.06] text-left hover:border-black/20 shadow-sm transition-all cursor-pointer animate-fade-in"
                >
                  <div className="flex items-start justify-between mb-3">
                     <div className="min-w-0 pr-4">
                        <div className="flex items-center gap-2 mb-1.5">
                           <span className={`font-label-caps text-[7.5px] font-bold uppercase tracking-widest ${isCritical ? 'text-red-600/80' : 'text-on-surface-variant opacity-50'}`}>
                             {campaign.priority} Priority
                           </span>
                        </div>
                        <h4 className="font-display font-bold text-[14px] text-on-surface leading-tight tracking-tight group-hover:text-primary transition-colors truncate">
                          {getName(campaign.name)}
                        </h4>
                     </div>
                     <button className="opacity-0 group-hover:opacity-20 hover:!opacity-100 transition-opacity p-1">
                        <MoreHorizontal size={14} />
                     </button>
                  </div>

                  <p className="font-body-sm text-[11.5px] text-on-surface-variant opacity-60 line-clamp-2 mb-4 leading-relaxed">
                    {campaign.description || "No description provided."}
                  </p>

                  <div className="space-y-4 mt-auto">
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-1 font-label-caps text-[8px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">
                          <ListTodo size={11} className="opacity-60" />
                          {Array.isArray(campaign.linkedTasks) ? campaign.linkedTasks.length : 0} Tasks
                       </div>
                       <div className="flex items-center gap-2 font-label-caps text-[8px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">
                          <Target size={11} className="opacity-60" />
                          {campaign.campaignAccounts && campaign.campaignAccounts.length > 0
                            ? `${campaign.campaignAccounts.map(a => a.platform).slice(0, 2).join(", ")}${campaign.campaignAccounts.length > 2 ? ` +${campaign.campaignAccounts.length - 2}` : ''}`
                            : "No accounts"}
                       </div>
                       <div className="flex items-center gap-2 font-label-caps text-[8px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">
                          <Calendar size={11} className="opacity-60" />
                          {new Date(campaign.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                       </div>
                     </div>
                     
                     <div className="flex items-center justify-between pt-4 border-t border-black/[0.03]">
                        <div className="flex items-center gap-2.5">
                           <UserAvatar user={toIdentity(campaign.owner)} size="sm" />
                           <span className="font-body-sm text-[12px] font-medium text-on-surface opacity-80">{getName(campaign.owner)}</span>
                        </div>
                        <span className="font-display text-[11px] font-bold text-on-surface opacity-60 tabular-nums">
                          {formatCurrency(campaign.budget, campaign.currency)}
                        </span>
                     </div>
                  </div>
                </div>
              )})}
              
              {stageCampaigns.length === 0 && (
                <div className="py-12 border border-dashed border-black/[0.05] rounded-[10px] flex items-center justify-center italic text-on-surface-variant opacity-60 text-[11px] uppercase tracking-widest">
                   No campaigns
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
