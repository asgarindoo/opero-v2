"use client";

import React, { useMemo, useState } from "react";
import { Activity, CalendarDays, CheckCircle2, MessageSquare, Trash2, Inbox, ChevronRight, User } from "lucide-react";
import { useCampaigns } from "../context/CampaignsContext";
import type { Campaign, CampaignStatus } from "@/features/campaigns";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import { EmptyState } from "@/components/common/DataState";
import Button from "@/components/ui/Button";
import SelectionBar from "@/components/common/SelectionBar";
import ConfirmationModal from "@/components/common/ConfirmationModal";

interface Props {
  searchQuery: string;
  filterMode: string;
  onSelectCampaign: (id: string) => void;
}

function progressFor(campaign: Campaign) {
  if (!campaign.goals.length) return 0;
  return Math.round((campaign.goals.filter(goal => goal.isCompleted).length / campaign.goals.length) * 100);
}

function initials(name: string) {
  return name.split(" ").map(part => part[0]).join("").slice(0, 2).toUpperCase();
}

export default function CampaignList({ searchQuery, filterMode, onSelectCampaign }: Props) {
  const { campaigns, deleteCampaigns } = useCampaigns();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);

  const filteredCampaigns = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return campaigns.filter(campaign => {
      const matchesSearch =
        campaign.name.toLowerCase().includes(q) ||
        campaign.owner.toLowerCase().includes(q) ||
        campaign.channel.toLowerCase().includes(q);

      if (filterMode === "active") return matchesSearch && campaign.status === "Active";
      if (filterMode === "planning") return matchesSearch && campaign.status === "Planning";
      if (filterMode === "paused") return matchesSearch && campaign.status === "Paused";
      return matchesSearch;
    });
  }, [campaigns, filterMode, searchQuery]);

  const toggleAll = () => {
    if (selectedIds.size === filteredCampaigns.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCampaigns.map(c => c.id)));
    }
  };

  const toggleOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const handleDeleteOne = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setCampaignToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (campaignToDelete) {
      deleteCampaigns([campaignToDelete]);
      setCampaignToDelete(null);
    } else {
      deleteCampaigns(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
    setIsDeleteModalOpen(false);
  };

  const getStatusVariant = (status: CampaignStatus): any => {
    switch (status) {
      case "Active": return "primary";
      case "Planning": return "warning";
      case "Paused": return "neutral";
      case "Completed": return "success";
      default: return "neutral";
    }
  };

  if (!filteredCampaigns.length) {
    return (
      <EmptyState 
        icon="campaign"
        title="No campaigns found"
        description="Try adjusting your filters or create a new campaign."
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#fef8f8] relative">
      <div className="flex-1 overflow-y-auto">
        <Table>
          <TableHeader className="bg-[#f9f5f5] border-b border-black/[0.04] sticky top-0 z-10">
            <TableRow className="bg-[#f9f5f5] border-none hover:bg-[#f9f5f5]">
              <TableHead className="w-12">
                <div className="flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.size > 0 && selectedIds.size === filteredCampaigns.length}
                    onChange={toggleAll}
                    className="w-3.5 h-3.5 rounded-sm border-black/10 accent-black cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                  />
                </div>
              </TableHead>
              <TableHead className="font-label-caps text-[9px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em] py-4">Campaign Unit</TableHead>
              <TableHead className="font-label-caps text-[9px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em] py-4">Status</TableHead>
              <TableHead className="font-label-caps text-[9px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em] py-4">Fulfillment</TableHead>
              <TableHead className="font-label-caps text-[9px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em] py-4">Owner</TableHead>
              <TableHead className="font-label-caps text-[9px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em] py-4 text-right">Schedule</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCampaigns.map((campaign) => {
              const isSelected = selectedIds.has(campaign.id);
              const progress = progressFor(campaign);

              return (
                <TableRow 
                  key={campaign.id}
                  onClick={() => onSelectCampaign(campaign.id)}
                  className={`group transition-colors ${isSelected ? "bg-black/[0.01]" : "bg-[#fef8f8] hover:bg-black/[0.005]"}`}
                >
                  <TableCell onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={(e) => toggleOne(campaign.id, e as any)}
                        className={`w-3.5 h-3.5 rounded-sm border-black/10 accent-black cursor-pointer transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-60"}`}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5 py-1">
                      <span className="font-display font-bold text-[13px] text-on-surface tracking-tight group-hover:text-primary transition-colors">
                        {campaign.name}
                      </span>
                      <span className="font-label-caps text-[7px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">
                        {campaign.id} • {campaign.channel}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex">
                       <span className={`px-2 py-0.5 rounded-[4px] font-label-caps text-[8px] font-bold uppercase tracking-widest ${campaign.status === 'Active' ? 'bg-black text-white' : 'bg-black/[0.05] text-on-surface-variant opacity-70'}`}>
                          {campaign.status}
                       </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-4 min-w-[120px]">
                      <div className="flex-1 h-1 rounded-full bg-black/[0.04] overflow-hidden">
                        <div className="h-full bg-black opacity-60 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="font-display text-[11px] font-bold text-on-surface opacity-60 tabular-nums">{progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                       <div className="h-6 w-6 rounded-full bg-black/[0.04] border border-black/[0.04] flex items-center justify-center font-display font-bold text-[8px] text-on-surface-variant opacity-60">
                          {initials(campaign.owner)}
                       </div>
                       <span className="font-body-sm text-[12.5px] font-medium text-on-surface opacity-60">{campaign.owner}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-label-caps text-[9px] font-bold text-on-surface-variant opacity-60 uppercase tracking-tight">
                      {new Date(campaign.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {new Date(campaign.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-all pr-4">
                       <button 
                         className="p-1.5 text-on-surface-variant opacity-60 hover:opacity-100 hover:text-red-500 transition-all"
                         onClick={(e) => handleDeleteOne(e, campaign.id)}
                       >
                         <Trash2 size={13} />
                       </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <SelectionBar
        count={selectedIds.size}
        onClear={() => setSelectedIds(new Set())}
        onDelete={() => setIsDeleteModalOpen(true)}
        label="campaigns"
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setCampaignToDelete(null); }}
        onConfirm={handleConfirmDelete}
        title={campaignToDelete ? "Delete Campaign" : "Delete Selected Campaigns"}
        description={campaignToDelete
          ? "This will permanently remove this campaign and its linked workspace data."
          : `Delete ${selectedIds.size} selected campaigns? This cannot be undone.`}
      />
    </div>
  );
}
