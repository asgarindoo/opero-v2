"use client";

import React, { useState } from "react";
import { useCampaigns } from "../context/CampaignsContext";
import { Target, Calendar, Clock, Share2, MoreVertical, Plus, DollarSign, ChevronDown } from "lucide-react";
import type { CampaignStatus, CampaignPriority } from "../types";
import Drawer from "@/components/ui/Drawer";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Dropdown from "@/components/ui/Dropdown";

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

function getDaysRemaining(endDate: string) {
  const end = new Date(endDate);
  const now = new Date();
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function Section({ label, count, children }: { label: string; count?: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="space-y-3">
      <button onClick={() => setOpen(v => !v)} className="flex items-center gap-2 w-full">
        <span className="font-label-caps text-[10px] font-bold text-on-surface-variant opacity-30 uppercase tracking-[0.15em] text-left">
          {label}{count !== undefined && ` ({count})`}
        </span>
        <div className="h-px flex-1 bg-black/[0.03]" />
      </button>
      {open && children}
    </div>
  );
}

export default function CampaignDrawer({ campaignId, onClose }: { campaignId: string; onClose: () => void }) {
  const { campaigns, deleteCampaigns, updateCampaign } = useCampaigns();
  const [tab, setTab] = useState<"details" | "activity">("details");
  const campaign = campaigns.find(c => c.id === campaignId);

  if (!campaign) return null;

  const remainingDays = getDaysRemaining(campaign.endDate);
  const isCritical = campaign.priority === "Critical" || campaign.priority === "High";
  const durationDays = Math.max(1, Math.ceil(
    (new Date(campaign.endDate).getTime() - new Date(campaign.startDate).getTime()) / (1000 * 60 * 60 * 24)
  ));

  const handleDelete = () => {
    if (confirm("Delete this campaign? This action cannot be undone.")) {
      deleteCampaigns([campaign.id]);
      onClose();
    }
  };

  return (
    <Drawer
      isOpen={true}
      onClose={onClose}
      size="sm"
    >
      <div className="space-y-8">

        {/* ── TOP: Title + Badges ── */}
        <div className="space-y-4">
          <h1
            className="font-display text-[26px] font-bold text-on-surface leading-tight tracking-tight break-words line-clamp-3"
            title={getName(campaign.name)}
          >
            {getName(campaign.name)}
          </h1>
          <div className="flex items-center gap-2">
            <Badge variant={campaign.status === "Completed" ? "success" : campaign.status === "Active" ? "info" : "warning"}>
              {campaign.status}
            </Badge>
            <Badge variant={isCritical ? "error" : "info"}>{campaign.priority}</Badge>
          </div>
        </div>

        {/* Meta strip: Status · Priority */}
        <div className="flex items-center gap-8 pt-4 border-t border-black/[0.04]">
          {/* Status dropdown */}
          <div className="space-y-1">
            <span className="block font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-40 uppercase tracking-widest">Status</span>
            <div className="-ml-2">
              <Dropdown
                value={campaign.status}
                onChange={(val) => updateCampaign(campaign.id, { status: val as CampaignStatus })}
                options={(["Planning", "Active", "Paused", "Completed", "Cancelled"] as CampaignStatus[]).map(s => ({ label: s, value: s }))}
              />
            </div>
          </div>

          {/* Priority dropdown */}
          <div className="space-y-1">
            <span className="block font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-40 uppercase tracking-widest">Priority</span>
            <div className="-ml-2">
              <Dropdown
                value={campaign.priority}
                onChange={(val) => updateCampaign(campaign.id, { priority: val as CampaignPriority })}
                options={(["Low", "Medium", "High", "Critical"] as CampaignPriority[]).map(p => ({ label: p, value: p }))}
              />
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="flex gap-6 border-b border-black/[0.04]">
          {(["details", "activity"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-3 font-label-caps text-[10px] font-bold uppercase tracking-wider transition-all relative ${tab === t ? "text-primary" : "text-on-surface-variant opacity-30 hover:opacity-100"
                }`}
            >
              {t}
              {tab === t && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
            </button>
          ))}
        </div>

        {/* ── DETAILS TAB ── */}
        {tab === "details" && (
          <div className="space-y-8 pb-8">

            {/* Overview */}
            <Section label="Overview">
              <p className="font-display text-[13px] leading-relaxed text-on-surface-variant/80 break-words whitespace-pre-wrap">
                {campaign.description || "No objective or description provided."}
              </p>
            </Section>

            {/* Campaign Information */}
            <Section label="Campaign Information">
              <div className="flex flex-col gap-6">
                {/* Duration */}
                <div className="space-y-1">
                  <span className="block font-label-caps text-[9px] font-bold text-on-surface-variant opacity-30 uppercase tracking-widest">Duration</span>
                  <div className="flex items-center gap-1.5 font-display text-[12px] font-medium text-on-surface">
                    <Calendar size={11} className="opacity-40" />
                    {new Date(campaign.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    {" – "}
                    {new Date(campaign.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    <span className="opacity-40 font-bold text-[11px]">• {durationDays} days</span>
                  </div>
                </div>

                {campaign.budget && (
                  <div className="space-y-1">
                    <span className="block font-label-caps text-[9px] font-bold text-on-surface-variant opacity-30 uppercase tracking-widest">Budget</span>
                    <div className="font-display text-[13px] font-semibold text-on-surface">
                      {formatCurrency(campaign.budget, campaign.currency)}
                    </div>
                  </div>
                )}
                {campaign.tags && campaign.tags.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="block font-label-caps text-[9px] font-bold text-on-surface-variant opacity-30 uppercase tracking-widest">Tags</span>
                    <div className="flex flex-wrap gap-1.5">
                      {campaign.tags.map((tag, i) => (
                        <span key={i} className="flex items-center gap-1 font-label-caps text-[9px] font-bold px-2.5 py-1 rounded-full border bg-zinc-900 text-white border-transparent shadow-sm cursor-default tracking-wide">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Section>

            {/* Campaign Accounts */}
            <Section label="Campaign Accounts" count={campaign.campaignAccounts?.length ?? 0}>
              <div className="flex justify-end -mt-1 mb-2">
                <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] font-semibold flex items-center gap-1 border border-black/[0.08]">
                  <Plus size={10} strokeWidth={2.5} /> Add Accounts
                </Button>
              </div>
              {campaign.campaignAccounts && campaign.campaignAccounts.length > 0 ? (
                <div className="space-y-2">
                  {campaign.campaignAccounts.map(channel => (
                    <div
                      key={channel.id}
                      className="group flex items-center gap-3 px-3 py-2.5 rounded-[8px] bg-white cursor-pointer"
                      style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}
                    >
                      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(0,0,0,0.04)" }}>
                        <Share2 size={13} strokeWidth={2} style={{ color: "var(--color-on-surface)", opacity: 0.7 }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-[13px] font-semibold truncate text-on-surface">{channel.name}</p>
                        <p className="font-label-caps text-[8.5px] font-bold uppercase tracking-widest truncate mt-0.5 text-on-surface-variant opacity-50">
                          {channel.platform} • {channel.username}
                        </p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-60 transition-opacity">
                        <MoreVertical size={13} strokeWidth={2} className="text-on-surface-variant" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-body-sm text-[12px] italic text-on-surface-variant opacity-40">No campaign accounts attached.</p>
              )}
            </Section>

            {/* Campaign Tasks */}
            <Section label="Campaign Tasks" count={campaign.linkedTasks?.length ?? 0}>
              <div className="flex justify-end -mt-1 mb-2">
                <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] font-semibold flex items-center gap-1 border border-black/[0.08]">
                  <Plus size={10} strokeWidth={2.5} /> Add Task
                </Button>
              </div>
              {campaign.linkedTasks && campaign.linkedTasks.length > 0 ? (
                <div className="space-y-2">
                  {campaign.linkedTasks.map(task => (
                    <div
                      key={task.id}
                      className="group flex items-center gap-3 px-3 py-2.5 rounded-[8px] bg-white cursor-pointer"
                      style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}
                    >
                      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(0,0,0,0.04)" }}>
                        <Target size={13} strokeWidth={2} style={{ color: "var(--color-on-surface)", opacity: 0.7 }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-[13px] font-semibold truncate text-on-surface">{task.title}</p>
                        <p className="font-label-caps text-[8.5px] font-bold uppercase tracking-widest truncate mt-0.5 text-on-surface-variant opacity-50">
                          {task.id}
                        </p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-60 transition-opacity">
                        <MoreVertical size={13} strokeWidth={2} className="text-on-surface-variant" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 flex flex-col items-center justify-center text-center rounded-[8px] border border-dashed border-black/[0.08]">
                  <div className="w-10 h-10 rounded-[10px] bg-black/5 flex items-center justify-center mb-3">
                    <Target size={16} className="opacity-30" />
                  </div>
                  <p className="font-display text-[13px] font-semibold text-on-surface mb-1">No campaign tasks yet.</p>
                  <p className="font-body-sm text-[11px] text-on-surface-variant opacity-50 max-w-[200px] leading-relaxed">
                    Attach existing tasks or create new tasks related to this campaign.
                  </p>
                </div>
              )}
            </Section>

          </div>
        )}

        {/* ── ACTIVITY TAB ── */}
        {tab === "activity" && (
          <div className="space-y-6 relative pl-4 pb-8">
            <div className="absolute left-[3px] top-2 bottom-2 w-px bg-black/[0.04]" />
            {campaign.activities && campaign.activities.length > 0 ? (
              campaign.activities.map(act => (
                <div key={act.id} className="relative flex items-start gap-4">
                  <div className="absolute -left-[14px] top-1.5 w-2 h-2 rounded-full bg-black/[0.1] border-2 border-white" />
                  <div className="flex-1 space-y-0.5">
                    <p className="font-display text-[12.5px] text-on-surface-variant/80">
                      <span className="font-bold text-on-surface">{act.author}</span>{" "}
                      {act.description}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Clock size={10} className="opacity-20" />
                      <span className="text-[10px] text-on-surface-variant opacity-30">
                        {new Date(act.timestamp).toLocaleDateString()} at{" "}
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="font-body-sm text-[12px] italic text-on-surface-variant opacity-30">No activity recorded.</p>
            )}
          </div>
        )}

      </div>
    </Drawer>
  );
}
