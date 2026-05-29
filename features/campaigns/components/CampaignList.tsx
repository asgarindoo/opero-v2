"use client";

import React, { useMemo, useState } from "react";
import { Trash2, ChevronRight, ListTodo } from "lucide-react";
import { useCampaigns } from "../context/CampaignsContext";
import type { Campaign, CampaignStatus } from "@/features/campaigns";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { EmptyState } from "@/components/common/DataState";
import SelectionBar from "@/components/common/SelectionBar";
import ConfirmationModal from "@/components/common/ConfirmationModal";

interface Props {
  searchQuery: string;
  filterMode: string;
  priorityFilter: string;
  onSelectCampaign: (id: string) => void;
}

function getName(val: any): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object" && val.name) return String(val.name);
  return String(val);
}

function formatCurrency(val?: number, curr: string = "USD") {
  if (!val) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: curr, currencyDisplay: "code", maximumFractionDigits: 0 }).format(val);
}

export default function CampaignList({ searchQuery, filterMode, priorityFilter, onSelectCampaign }: Props) {
  const { campaigns, deleteCampaigns, loading } = useCampaigns();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);

  const filteredCampaigns = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return campaigns.filter(campaign => {
      const matchesSearch =
        getName(campaign.name).toLowerCase().includes(q) ||
        getName(campaign.owner).toLowerCase().includes(q);

      if (filterMode === "active") return matchesSearch && campaign.status === "Active";
      if (filterMode === "planning") return matchesSearch && campaign.status === "Planning";
      if (filterMode === "paused") return matchesSearch && campaign.status === "Paused";

      if (priorityFilter !== "all" && campaign.priority !== priorityFilter) return false;

      return matchesSearch;
    });
  }, [campaigns, filterMode, priorityFilter, searchQuery]);

  const toggleAll = () => {
    if (selectedIds.size === filteredCampaigns.length && filteredCampaigns.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCampaigns.map(c => c.id)));
    }
  };

  const toggleOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
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

  if (!loading && filteredCampaigns.length === 0) {
    return (
      <EmptyState
        icon="campaigns"
        title="No campaigns found"
        description="Try adjusting your filters or create a new campaign."
      />
    );
  }

  const getStatusVariant = (status: CampaignStatus | string): any => {
    switch (status) {
      case "Active": return "success";
      case "Planning": return "info";
      case "Paused": return "warning";
      case "Completed": return "slate";
      case "Cancelled": return "error";
      default: return "neutral";
    }
  };

  return (
    <div className="flex flex-col h-full bg-background relative min-w-0">
      <div className="flex-1 overflow-auto">
        <Table className="min-w-[800px]">
          <TableHeader className="bg-[#fbf5f5]">
            <TableRow className="h-10">
              <TableHead className="w-10 px-4">
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.size > 0 && selectedIds.size === filteredCampaigns.length}
                    onChange={toggleAll}
                    className="w-3 h-3 rounded-[3px] border-black/10 accent-primary cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                  />
                </div>
              </TableHead>
              <TableHead className="w-[30%] px-4 text-left font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em]">Campaign Unit</TableHead>
              <TableHead className="w-[20%] px-4 text-left font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em]">Accounts</TableHead>
              <TableHead className="w-[10%] px-4 text-left font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em]">Tasks</TableHead>
              <TableHead className="w-[15%] px-4 text-left font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em]">Owner</TableHead>
              <TableHead className="w-[10%] px-4 text-left font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em]">Schedule</TableHead>
              <TableHead className="w-[10%] px-4 text-left font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em]">Status</TableHead>
              <TableHead className="w-[5%] px-4"><div className="w-full text-center font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em]">Actions</div></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i} className="h-12 hover:bg-black/[0.015] transition-colors">
                  <TableCell className="px-4">
                    <div className="w-full flex justify-center">
                      <div className="w-3 h-3 rounded-[3px] bg-black/[0.04] animate-pulse" />
                    </div>
                  </TableCell>
                  <TableCell className="px-4">
                    <div className="flex flex-col gap-1 w-full">
                      <div className="h-3 w-32 bg-black/[0.04] rounded animate-pulse" />
                      <div className="h-2 w-20 bg-black/[0.04] rounded animate-pulse" />
                    </div>
                  </TableCell>
                  <TableCell className="px-4">
                    <div className="h-3 w-24 bg-black/[0.04] rounded animate-pulse" />
                  </TableCell>
                  <TableCell className="px-4">
                    <div className="flex items-center gap-1.5 w-full">
                      <div className="w-2.5 h-2.5 rounded-full bg-black/[0.04] animate-pulse shrink-0" />
                      <div className="h-3 w-8 bg-black/[0.04] rounded animate-pulse" />
                    </div>
                  </TableCell>
                  <TableCell className="px-4">
                    <div className="h-3 w-20 bg-black/[0.04] rounded animate-pulse" />
                  </TableCell>
                  <TableCell className="px-4">
                    <div className="flex flex-col gap-1 w-full">
                      <div className="h-3 w-16 bg-black/[0.04] rounded animate-pulse" />
                      <div className="h-2 w-24 bg-black/[0.04] rounded animate-pulse" />
                    </div>
                  </TableCell>
                  <TableCell className="px-4">
                    <div className="h-4.5 w-16 bg-black/[0.04] rounded-sm animate-pulse" />
                  </TableCell>
                  <TableCell className="px-4 text-center">
                    <div className="w-full flex justify-center items-center gap-1">
                      <div className="h-5 w-5 bg-black/[0.04] rounded animate-pulse" />
                      <div className="h-4 w-4 bg-black/[0.04] rounded animate-pulse" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              filteredCampaigns.map((campaign) => {
                const isSelected = selectedIds.has(campaign.id);

                return (
                  <TableRow
                    key={campaign.id}
                    onClick={() => onSelectCampaign(campaign.id)}
                    className={`group h-12 hover:bg-black/[0.015] cursor-pointer transition-colors ${isSelected ? "bg-primary/[0.02]" : ""}`}
                  >
                    <TableCell className="px-4" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => toggleOne(campaign.id, e as any)}
                          className={`w-3 h-3 rounded-[3px] border-black/10 accent-primary cursor-pointer transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-60"}`}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="px-4 whitespace-nowrap">
                      <div className="flex flex-col min-w-0 gap-0.5">
                        <span
                          className="font-display font-semibold text-[12px] text-on-surface opacity-90 group-hover:text-primary transition-colors leading-tight truncate block max-w-[150px] md:max-w-[200px] lg:max-w-[250px] xl:max-w-[320px]"
                          title={getName(campaign.name)}
                        >
                          {getName(campaign.name)}
                        </span>
                        <p className={`font-body-sm text-[7px] truncate uppercase font-bold tracking-[0.2em] leading-none mt-1 ${campaign.priority === 'Critical' || campaign.priority === 'High' ? 'text-red-500 opacity-80' : 'text-on-surface-variant opacity-60'}`}>
                          {campaign.priority} PRIORITY
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 whitespace-nowrap">
                      <div className="flex flex-col min-w-0 gap-1.5">
                        {campaign.campaignAccounts && campaign.campaignAccounts.length > 0 ? (
                          <span className="font-display font-medium text-[11px] text-on-surface truncate block max-w-[150px]">
                            {campaign.campaignAccounts.map(a => a.platform).slice(0, 2).join(", ")}
                            {campaign.campaignAccounts.length > 2 && ", ..."}
                          </span>
                        ) : (
                          <span className="font-body-sm text-[10px] text-on-surface-variant opacity-40 italic">No campaign accounts</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-display text-[11px] text-on-surface opacity-80">
                        <ListTodo size={10} className="opacity-50" />
                        {Array.isArray(campaign.linkedTasks) ? campaign.linkedTasks.length : 0}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 whitespace-nowrap">
                      <span className="font-display font-medium text-[11px] text-on-surface truncate block max-w-[150px]">
                        {getName(campaign.owner)}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 whitespace-nowrap">
                      <span className="font-display text-[11px] text-on-surface-variant opacity-80">
                        {new Date(campaign.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                      <span className="font-body-sm text-[9px] text-on-surface-variant opacity-50 block mt-0.5">
                        to {new Date(campaign.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 whitespace-nowrap">
                      <Badge variant={getStatusVariant(campaign.status)} className="text-[10px] py-0 px-1.5 h-4.5">
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-0.5 opacity-30 group-hover:opacity-100 transition-all">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6.5 w-6.5 text-on-surface-variant hover:text-red-500 hover:bg-red-50"
                          onClick={(e) => handleDeleteOne(e, campaign.id)}
                        >
                          <Trash2 size={12} />
                        </Button>
                        <ChevronRight size={13} className="text-on-surface-variant ml-0.5" />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
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
        onClose={() => {
          setIsDeleteModalOpen(false);
          setCampaignToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title={campaignToDelete ? "Delete Campaign" : "Delete Selected Campaigns"}
        description={campaignToDelete ? "Are you sure you want to delete this campaign? All tasks and activity will be permanently removed." : `Are you sure you want to delete ${selectedIds.size} selected campaigns? This action cannot be undone.`}
      />
    </div>
  );
}
