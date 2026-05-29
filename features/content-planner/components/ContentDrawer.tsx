"use client";

import React, { useState } from "react";
import { useContentPlanner } from "../context/ContentPlannerContext";
import { useSocialChannels } from "@/features/social-channels";
import { ContentStatus, ContentType } from "../types";
import Drawer from "@/components/ui/Drawer";
import Badge from "@/components/ui/Badge";
import Dropdown from "@/components/ui/Dropdown";
import DatePicker from "@/components/ui/DatePicker";
import { GlobalInput } from "@/components/ui/global/form/GlobalInput";
import Input from "@/components/ui/Input";
import { ContentTagsInput } from "@/features/content-planner/components/ContentTagsInput";

function getName(val: any): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object" && val.name) return String(val.name);
  return String(val);
}

function toYMD(d: Date): string {
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function Section({ label, icon, count, children, defaultOpen = true }: { label: string; icon?: React.ReactNode; count?: number; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="space-y-3">
      <button onClick={() => setOpen(v => !v)} className="flex items-center gap-2 group w-full">
        <span className="font-label-caps text-[10px] font-bold text-on-surface-variant opacity-30 uppercase tracking-[0.15em] flex-1 text-left">
          {label} {count !== undefined && `(${count})`}
        </span>
        <div className="h-px flex-1 bg-black/[0.03]" />
      </button>
      {open && children}
    </div>
  );
}

export default function ContentDrawer({ postId, onClose }: { postId: string; onClose: () => void }) {
  const { posts, deletePosts, updatePost } = useContentPlanner();
  const { channels } = useSocialChannels();
  const [tab, setTab] = useState<"details" | "activity">("details");
  const [editTitle, setEditTitle] = useState(false);
  
  const post = posts.find(p => p.id === postId);
  
  const [titleVal, setTitleVal] = useState(post ? getName(post.title) : "");

  React.useEffect(() => {
    if (post) setTitleVal(getName(post.title));
  }, [post?.title]);

  if (!post) return null;

  const handleDelete = () => {
    if (confirm("Delete this content entry? This action cannot be undone.")) {
      deletePosts([post.id]);
      onClose();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Published": return "success";
      case "Ready": return "info";
      case "Skipped": return "error";
      default: return "warning";
    }
  };

  const getTargetAccountName = (id: string) => {
    const channel = channels.find(c => c.id === id);
    return channel ? `${channel.name} (${channel.platform})` : "Unassigned";
  };

  return (
    <Drawer
      isOpen={true}
      onClose={onClose}
      size="sm"
    >
      <div className="space-y-8">

        {/* Title */}
        <div className="space-y-2">
          {editTitle ? (
            <Input
              autoFocus
              value={titleVal}
              onChange={e => setTitleVal(e.target.value)}
              onBlur={() => { updatePost(post.id, { title: titleVal.trim() || getName(post.title) }); setEditTitle(false); }}
              onKeyDown={e => {
                if (e.key === "Enter") { updatePost(post.id, { title: titleVal.trim() || getName(post.title) }); setEditTitle(false); }
                if (e.key === "Escape") { setTitleVal(getName(post.title)); setEditTitle(false); }
              }}
              className="font-display text-[22px] font-bold p-0 bg-transparent border-none focus:shadow-none focus:bg-transparent h-auto"
            />
          ) : (
            <h1
              onClick={() => setEditTitle(true)}
              className="font-display text-[22px] font-bold text-on-surface tracking-tight cursor-text hover:opacity-70 transition-opacity break-words break-all line-clamp-3"
              title={getName(post.title)}
            >
              {getName(post.title) || "Untitled Content"}
            </h1>
          )}
          <div className="flex items-center gap-2">
            <Badge variant={getStatusColor(post.status)}>
              {post.status}
            </Badge>
            <Badge variant="info">{post.type}</Badge>
          </div>
        </div>

        {/* Quick Meta */}
        <div className="flex flex-col gap-5 py-4 border-y border-black/[0.04] relative z-20">
          <div className="flex items-center gap-2 relative z-30">
            {/* Status dropdown */}
            <div className="space-y-0.5 relative z-30">
              <span className="block font-label-caps text-[8px] font-bold text-on-surface-variant opacity-30 uppercase tracking-widest">Status</span>
              <div className="-ml-2 scale-[0.85] origin-left w-32">
                <Dropdown
                  value={post.status}
                  onChange={(val) => updatePost(post.id, { status: val as ContentStatus })}
                  options={(["Planned", "Ready", "Published", "Skipped"] as ContentStatus[]).map(s => ({ label: s, value: s }))}
                />
              </div>
            </div>

            {/* Account dropdown */}
            <div className="space-y-0.5 relative z-20">
              <span className="block font-label-caps text-[8px] font-bold text-on-surface-variant opacity-30 uppercase tracking-widest">Target Account</span>
              <div className="-ml-2 scale-[0.85] origin-left w-36">
                <Dropdown
                  value={post.targetAccountId || ""}
                  onChange={(val) => updatePost(post.id, { targetAccountId: val as string })}
                  options={[{ label: "None", value: "" }, ...channels.map(c => ({ label: `${c.name} (${c.platform})`, value: c.id }))]}
                />
              </div>
            </div>

            {/* Type dropdown */}
            <div className="space-y-0.5 relative z-10">
              <span className="block font-label-caps text-[8px] font-bold text-on-surface-variant opacity-30 uppercase tracking-widest">Type</span>
              <div className="-ml-2 scale-[0.85] origin-left w-28">
                <Dropdown
                  value={post.type}
                  onChange={(val) => updatePost(post.id, { type: val as ContentType })}
                  options={["Post", "Story", "Reel", "Carousel", "Video", "Article", "Email", "Other"].map(t => ({ label: t, value: t }))}
                />
              </div>
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

            {/* Schedule Information */}
            <Section label="Schedule Information">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="block font-label-caps text-[9px] font-bold text-on-surface-variant opacity-30 uppercase tracking-widest">Publish Date</span>
                  <DatePicker 
                    value={toYMD(new Date(post.date))} 
                    onChange={(val: string | null) => val && updatePost(post.id, { date: new Date(val).toISOString() })} 
                    placeholder="Select Date"
                  />
                </div>
                <div className="space-y-1.5">
                  <span className="block font-label-caps text-[9px] font-bold text-on-surface-variant opacity-30 uppercase tracking-widest">Time</span>
                  <GlobalInput 
                    value={post.time} 
                    onChange={(e: any) => updatePost(post.id, { time: e.target.value })} 
                    placeholder="e.g. 09:00 AM"
                  />
                </div>
              </div>
            </Section>

            {/* Metadata */}
            <Section label="Metadata">
              <div className="space-y-1.5">
                <span className="block font-label-caps text-[9px] font-bold text-on-surface-variant opacity-30 uppercase tracking-widest mb-1">Tags</span>
                <ContentTagsInput 
                  tags={post.tags || []} 
                  setTags={(newTags: string[]) => updatePost(post.id, { tags: newTags })} 
                  max={5} 
                />
              </div>
            </Section>

            <div className="pt-8 flex justify-center pb-4">
              <button
                onClick={handleDelete}
                className="font-label-caps text-[10px] font-bold text-red-500 opacity-50 hover:opacity-100 uppercase tracking-widest transition-opacity"
              >
                Delete Entry
              </button>
            </div>
          </div>
        )}

        {/* ── ACTIVITY TAB ── */}
        {tab === "activity" && (
          <div className="space-y-6 relative pl-4 pb-8">
            <div className="absolute left-[3px] top-2 bottom-2 w-px bg-black/[0.04]" />
            <div className="relative flex items-start gap-4">
              <div className="absolute -left-[14px] top-1.5 w-2 h-2 rounded-full bg-black/[0.1] border-2 border-white" />
              <div className="flex-1 space-y-0.5">
                <p className="font-display text-[12.5px] text-on-surface-variant/80">
                  <span className="font-bold text-on-surface">System</span>{" "}
                  Content post created.
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-on-surface-variant opacity-30">
                    {new Date(post.createdAt).toLocaleDateString()} at{" "}
                    {new Date(post.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </Drawer>
  );
}
