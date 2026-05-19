"use client";

import React from "react";
import { useCampaigns } from "../context/CampaignsContext";
import { CampaignStatus } from "../types";
import { Megaphone, Users, Plus, MoreHorizontal, Target } from "lucide-react";

interface Props {
  searchQuery: string;
  onSelectCampaign: (id: string) => void;
}

const STATUSES: CampaignStatus[] = ["Planning", "Active", "Paused", "Completed"];

export default function CampaignBoard({ searchQuery, onSelectCampaign }: Props) {
  const { campaigns } = useCampaigns();

  const filteredCampaigns = campaigns.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.owner.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              {stageCampaigns.map(campaign => (
                <div
                  key={campaign.id}
                  onClick={() => onSelectCampaign(campaign.id)}
                  className="group relative flex flex-col p-5 bg-white rounded-[10px] border border-black/[0.06] text-left hover:border-black/20 shadow-sm transition-all cursor-pointer animate-fade-in"
                >
                  <div className="flex items-start justify-between mb-4">
                     <div className="min-w-0 pr-4">
                        <h4 className="font-display font-bold text-[14px] text-on-surface leading-tight tracking-tight group-hover:text-primary transition-colors">
                          {campaign.name}
                        </h4>
                        <p className="font-label-caps text-[7px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest mt-1.5">{campaign.id}</p>
                     </div>
                     <button className="opacity-0 group-hover:opacity-20 hover:!opacity-100 transition-opacity p-1">
                        <MoreHorizontal size={14} />
                     </button>
                  </div>

                  <div className="space-y-4">
                     <div className="flex items-center gap-2 font-label-caps text-[8px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">
                        <Target size={11} className="opacity-60" />
                        {campaign.channel}
                     </div>
                     
                     <div className="flex items-center justify-between pt-4 border-t border-black/[0.03]">
                        <div className="flex items-center gap-2.5">
                           <div className="h-6 w-6 rounded-full bg-black/[0.04] border border-black/[0.04] flex items-center justify-center font-display font-bold text-[8px] text-on-surface-variant opacity-60">
                              {campaign.owner.split(" ").map(n => n[0]).join("").toUpperCase()}
                           </div>
                           <span className="font-body-sm text-[12px] font-medium text-on-surface opacity-80">{campaign.owner}</span>
                        </div>
                        <span className="font-display text-[11px] font-bold text-on-surface opacity-60 tabular-nums">{campaign.linkedTasks}t</span>
                     </div>
                  </div>
                </div>
              ))}
              
              {stageCampaigns.length === 0 && (
                <div className="py-12 border border-dashed border-black/[0.05] rounded-[10px] flex items-center justify-center italic text-on-surface-variant opacity-60 text-[11px] uppercase tracking-widest">
                   No active units
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
