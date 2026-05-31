"use client";

import React, { useState } from "react";
import { useCampaigns } from "../context/CampaignsContext";
import { Target, Calendar, Clock, Share2, MoreVertical, Plus, DollarSign, ChevronDown, X } from "lucide-react";
import type { CampaignStatus, CampaignPriority } from "../types";
import Drawer from "@/components/ui/Drawer";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Dropdown from "@/components/ui/Dropdown";
import { CampaignChannelPicker } from "./CampaignChannelPicker";
import { TaskSelector } from "./TaskSelector";
import { listCampaignTasks, updateTask, type Task } from "@/features/tasks";
import { useTenant } from "@/components/providers/TenantProvider";
import { getUserDisplayName, type UserIdentity } from "@/lib/user-identity";

function getName(val: unknown): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") return getUserDisplayName(val as UserIdentity, "");
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
          {label}{count !== undefined && ` (${count})`}
        </span>
        <div className="h-px flex-1 bg-black/[0.03]" />
      </button>
      {open && children}
    </div>
  );
}

export default function CampaignDrawer({ campaignId, onClose }: { campaignId: string; onClose: () => void }) {
  const { campaigns, deleteCampaigns, updateCampaign } = useCampaigns();
  const { user } = useTenant();
  const [tab, setTab] = useState<"details" | "activity">("details");
  const [campaignTasks, setCampaignTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const campaign = campaigns.find(c => c.id === campaignId);

  React.useEffect(() => {
    let cancelled = false;

    if (campaignId) {
      setIsLoadingTasks(true);
      listCampaignTasks<Task>(campaignId)
        .then((tasks) => {
          if (!cancelled) setCampaignTasks(tasks);
        })
        .catch((err) => {
          console.error("Failed to load campaign tasks", err);
          if (!cancelled) setCampaignTasks([]);
        })
        .finally(() => {
          if (!cancelled) setIsLoadingTasks(false);
        });
    }

    return () => {
      cancelled = true;
    };
  }, [campaignId]);

  if (!campaign) return null;

  async function handleAttachTask(task: Task) {
    if (!task.recordId) return;
    try {
      await updateTask(task.recordId, { campaignId });
      setCampaignTasks(prev => [{ ...task, campaignId }, ...prev]);
    } catch (err) {
      console.error("Failed to attach task", err);
    }
  }

  async function handleRemoveTask(task: Task) {
    if (!task.recordId) return;
    try {
      // Pass null to remove
      await updateTask(task.recordId, { campaignId: null });
      setCampaignTasks(prev => prev.filter(t => t.id !== task.id));
    } catch (err) {
      console.error("Failed to remove task", err);
    }
  }

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

        {/* Meta strip: Status · Priority — same layout as TaskDrawer */}
        <div className="flex items-center gap-2 py-2 border-y border-black/[0.04] relative z-20">
          {/* Status dropdown */}
          <div className="space-y-1 relative z-30">
            <span className="block font-label-caps text-[8px] font-bold text-on-surface-variant opacity-30 uppercase tracking-widest">Status</span>
            <div className="w-[100px]">
              <Dropdown
                value={campaign.status}
                onChange={(val) => updateCampaign(campaign.id, { status: val as CampaignStatus })}
                options={(["Planning", "Active", "Paused", "Completed", "Cancelled"] as CampaignStatus[]).map(s => ({ label: s, value: s }))}
              />
            </div>
          </div>

          {/* Priority dropdown */}
          <div className="space-y-1 relative z-20">
            <span className="block font-label-caps text-[8px] font-bold text-on-surface-variant opacity-30 uppercase tracking-widest">Priority</span>
            <div className="w-[100px]">
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
              <div className="pt-2">
                <CampaignChannelPicker
                  selected={campaign.campaignAccounts || []}
                  onChange={(accounts) => updateCampaign(campaign.id, { campaignAccounts: accounts })}
                />
              </div>
            </Section>

            {/* Campaign Tasks */}
            <Section label="Campaign Tasks" count={isLoadingTasks ? undefined : campaignTasks.length}>
              <div className="flex justify-start -mt-1 mb-2">
                <TaskSelector
                  selectedTasks={campaignTasks}
                  onSelect={handleAttachTask}
                />
              </div>
              {isLoadingTasks ? (
                <div className="flex flex-col">
                  {[0, 1, 2].map((item) => (
                    <div
                      key={item}
                      className={`flex items-start gap-3 py-3 px-2 -mx-2 ${item !== 2 ? "border-b border-black/[0.04]" : ""}`}
                    >
                      <div className="mt-0.5 w-4 h-4 rounded-full bg-black/[0.04] animate-pulse" />
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="h-3 w-2/3 rounded bg-black/[0.04] animate-pulse" />
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-12 rounded bg-black/[0.035] animate-pulse" />
                          <div className="h-1 w-1 rounded-full bg-black/[0.06]" />
                          <div className="h-2 w-16 rounded bg-black/[0.035] animate-pulse" />
                          <div className="h-1 w-1 rounded-full bg-black/[0.06]" />
                          <div className="h-2 w-8 rounded bg-black/[0.035] animate-pulse" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : campaignTasks.length > 0 ? (
                <div className="flex flex-col">
                  {campaignTasks.map((task, idx) => {
                    const totalCheck = task.checklist?.length || 0;
                    const doneCheck = task.checklist?.filter(c => c.done).length || 0;
                    const progressPct = totalCheck > 0 ? Math.round((doneCheck / totalCheck) * 100) : (task.status === "Done" ? 100 : 0);

                    return (
                      <div
                        key={task.id}
                        onClick={() => {
                          window.location.href = `/dashboard/tasks?taskId=${task.id}`;
                        }}
                        className={`group flex items-start gap-3 py-3 cursor-pointer hover:bg-black/[0.02] px-2 -mx-2 rounded-lg ${idx !== campaignTasks.length - 1 ? 'border-b border-black/[0.04]' : ''}`}
                      >
                        <div className="mt-0.5">
                          <div className="w-4 h-4 rounded-full border-[1.5px] border-black/[0.15] flex items-center justify-center bg-transparent transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className={`font-display text-[13px] font-medium leading-tight truncate ${task.status === "Done" ? "text-on-surface-variant opacity-50 line-through" : "text-on-surface"}`}>{task.title}</p>
                          <div className="flex items-center gap-2">
                            <span className="font-label-caps text-[9px] font-bold uppercase tracking-widest text-on-surface-variant opacity-40">{task.id}</span>
                            <span className="w-1 h-1 rounded-full bg-black/[0.1]" />
                            <span className="font-label-caps text-[9px] font-bold uppercase tracking-widest text-on-surface-variant opacity-40">{task.status}</span>
                            <span className="w-1 h-1 rounded-full bg-black/[0.1]" />
                            <span className="font-label-caps text-[9px] font-bold uppercase tracking-widest text-on-surface-variant opacity-40">{progressPct}%</span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRemoveTask(task); }}
                          className="opacity-0 group-hover:opacity-100 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-50 hover:opacity-100 hover:bg-black/[0.04] rounded transition-all"
                          title="Remove task from campaign"
                        >
                          <X size={12} strokeWidth={2} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="py-8 flex flex-col items-center justify-center text-center rounded-[8px] border border-dashed border-black/[0.08]">
                  <div className="w-10 h-10 rounded-[10px] bg-black/5 flex items-center justify-center mb-3">
                    <Target size={16} className="opacity-30" />
                  </div>
                  <p className="font-display text-[13px] font-semibold text-on-surface mb-1">No campaign tasks yet.</p>
                  <p className="font-body-sm text-[11px] text-on-surface-variant opacity-50 max-w-[200px] leading-relaxed">
                    Attach existing tasks to this campaign.
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
                      <span className="font-bold text-on-surface">
                        {act.userId === user?.id ? getUserDisplayName(user, act.author) : getUserDisplayName({ name: act.author, email: act.email }, "System")}
                      </span>{" "}
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
