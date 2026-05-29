"use client";
import { useState, useRef, useEffect } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckSquare,
  Paperclip,
  Link,
  MessageSquare,
  Trash2,
  Square,
  Clock,
  Target,
  X
} from "lucide-react";
import type { Task, Comment } from "@/features/tasks";
import { getCampaign } from "@/features/campaigns/services/campaigns.client";
import { PRIORITY_META, STATUS_META, ALL_STATUSES, ALL_PRIORITIES } from "@/features/tasks";
import AttachmentZone from "./AttachmentZone";
import LabelManager from "./LabelManager";
import MemberPicker from "@/features/tasks/components/MemberPicker";
import DependencyPanel from "@/features/tasks/components/DependencyPanel";
import RecurringPicker from "@/features/tasks/components/RecurringPicker";
import ExternalLinksPanel from "@/features/tasks/components/ExternalLinksPanel";
import ReactionsBar, { toggleReaction } from "@/features/tasks/components/ReactionsBar";

import Drawer from "@/components/ui/Drawer";
import Button from "@/components/ui/Button";
import Dropdown from "@/components/ui/Dropdown";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import DatePicker from "@/components/ui/DatePicker";
import { useTenant } from "@/components/providers/TenantProvider";

interface Props {
  task: Task;
  allTasks: Task[];
  onClose: () => void;
  onUpdate: (id: string, patch: Partial<Task>) => void;
  onDelete: (id: string) => void;
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

export default function TaskDrawer({ task, allTasks, onClose, onUpdate, onDelete }: Props) {
  const { user } = useTenant();
  const [tab, setTab] = useState<"details" | "activity">("details");
  const [comment, setComment] = useState("");
  const [editTitle, setEditTitle] = useState(false);
  const [titleVal, setTitleVal] = useState(task.title);
  const [campaignName, setCampaignName] = useState<string | null>(null);

  const done = task.checklist.filter(c => c.done).length;
  const total = task.checklist.length;
  const checkPct = total > 0 ? Math.round((done / total) * 100) : 0;

  useEffect(() => {
    let cancelled = false;

    Promise.resolve().then(() => {
      if (cancelled) return;
      setTitleVal(task.title);
      setEditTitle(false);
    });

    if (task.campaignId) {
      getCampaign<{ name?: string }>(task.campaignId)
        .then((c) => {
          if (!cancelled && c?.name) setCampaignName(c.name);
        })
        .catch(console.error);
    } else {
      setCampaignName(null);
    }

    return () => {
      cancelled = true;
    };
  }, [task.id, task.title, task.campaignId]);

  const handleUpdate = (patch: Partial<Task>, actionDesc?: string, detailDesc?: string) => {
    const actor = user?.name || "System";
    const timestamp = new Date().toLocaleString();
    
    // Only log if there's a specific action to describe
    if (actionDesc) {
      const newActivity = { 
        id: `a${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, 
        actor, 
        action: actionDesc, 
        detail: detailDesc, 
        timestamp 
      };
      patch.activity = [...task.activity, newActivity];
    }
    onUpdate(task.id, patch);
  };

  function submitComment() {
    if (!comment.trim()) return;
    const author = user?.name || "Current User";
    const initials = author.substring(0, 2).toUpperCase();
    const c: Comment = { id: `c${Date.now()}`, author, initials, avatar: user?.image, body: comment.trim(), timestamp: new Date().toLocaleString() };
    handleUpdate({ comments: [...task.comments, c] }, "added a note", comment.trim());
    setComment("");
  }

  function toggleCheck(id: string) {
    const item = task.checklist.find(c => c.id === id);
    const checklist = task.checklist.map(c => c.id === id ? { ...c, done: !c.done } : c);
    handleUpdate({ checklist }, item ? (item.done ? "uncompleted item" : "completed item") : undefined, item?.text);
  }

  function handleCommentReaction(commentId: string, emoji: string) {
    const comments = task.comments.map(c => {
      if (c.id !== commentId) return c;
      return { ...c, reactions: toggleReaction(c.reactions ?? {}, emoji) };
    });
    handleUpdate({ comments }); // Intentionally no activity log for reactions
  }

  const otherTasks = allTasks.filter(t => t.id !== task.id);

  return (
    <Drawer
      isOpen={true}
      onClose={onClose}
      title={task.id}
      size="md"
      footer={(
        <div className="flex items-center justify-between w-full">
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            className="text-red-500 hover:bg-red-50"
            onClick={() => { if (confirm("Delete this task?")) { onDelete(task.id); onClose(); } }}
          >
            DELETE TASK
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>CLOSE</Button>
            <Button variant="primary" size="sm" onClick={onClose}>SAVE CHANGES</Button>
          </div>
        </div>
      )}
    >
      <div className="space-y-8">
        {/* Title */}
        <div className="space-y-2">
          {editTitle ? (
            <Input
              autoFocus
              value={titleVal}
              onChange={e => setTitleVal(e.target.value)}
              onBlur={() => { handleUpdate({ title: titleVal.trim() || task.title }, "changed title to", titleVal.trim()); setEditTitle(false); }}
              onKeyDown={e => {
                if (e.key === "Enter") { handleUpdate({ title: titleVal.trim() || task.title }, "changed title to", titleVal.trim()); setEditTitle(false); }
                if (e.key === "Escape") { setTitleVal(task.title); setEditTitle(false); }
              }}
              className="font-display text-[22px] font-bold p-0 bg-transparent border-none focus:shadow-none focus:bg-transparent h-auto"
            />
          ) : (
            <h1
              onClick={() => setEditTitle(true)}
              className="font-display text-[22px] font-bold text-on-surface tracking-tight cursor-text hover:opacity-70 transition-opacity break-words break-all line-clamp-3"
              title={task.title}
            >
              {task.title}
            </h1>
          )}
          <div className="flex items-center gap-2">
            <Badge variant={task.status === "Done" ? "success" : "warning"}>{task.status}</Badge>
            <Badge variant={task.priority === "high" || task.priority === "urgent" ? "error" : "info"}>{task.priority}</Badge>
            {task.project && <span className="font-label-caps text-[9px] font-bold text-on-surface-variant opacity-30">{task.project}</span>}
          </div>
        </div>

        {/* Quick Meta */}
        <div className="grid grid-cols-2 gap-4 py-4 border-y border-black/[0.04]">
          <div className="space-y-1">
            <span className="font-label-caps text-[8px] font-bold text-on-surface-variant opacity-30 uppercase tracking-widest">Assignees</span>
            <MemberPicker selected={task.assignees} onChange={a => handleUpdate({ assignees: a }, "updated assignees")} />
          </div>
          <div className="space-y-1">
            <span className="font-label-caps text-[8px] font-bold text-on-surface-variant opacity-30 uppercase tracking-widest">Due Date</span>
            <DatePicker
              value={task.due}
              onChange={date => handleUpdate({ due: date }, "changed due date to", date ? new Date(date).toLocaleDateString() : "None")}
            />
          </div>
        </div>

        {/* Campaign Linkage */}
        {task.campaignId && (
          <div className="flex items-center gap-3 group pb-2">
            <span className="font-label-caps text-[10px] font-bold text-on-surface-variant opacity-40 uppercase tracking-[0.15em]">
              Campaign
            </span>
            <span className="w-1 h-1 rounded-full bg-black/[0.1]" />
            <span className="font-display text-[13px] font-medium text-on-surface">
              {campaignName || "Loading..."}
            </span>
            <button 
              onClick={() => {
                if (confirm("Remove task from campaign?")) {
                  handleUpdate({ campaignId: null }, "removed from campaign");
                }
              }}
              className="opacity-0 group-hover:opacity-100 font-label-caps text-[9px] font-bold uppercase tracking-widest text-on-surface-variant opacity-50 hover:opacity-100 transition-opacity ml-auto"
            >
              Detach
            </button>
          </div>
        )}

        {/* Labels */}
        <Section label="Labels">
          <LabelManager selected={task.labels} onChange={l => handleUpdate({ labels: l }, "updated labels")} />
        </Section>

        {/* Tabs for Details/Activity */}
        <div className="flex gap-6 border-b border-black/[0.04]">
          {(["details", "activity"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-3 font-label-caps text-[10px] font-bold uppercase tracking-wider transition-all relative ${tab === t ? 'text-primary' : 'text-on-surface-variant opacity-30 hover:opacity-100'}`}
            >
              {t}
              {tab === t && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full animate-fade-in" />}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in duration-300">
          {tab === "details" && (
            <div className="space-y-8">
              <Section label="Description">
                <p className="font-display text-[13.5px] leading-relaxed text-on-surface-variant/80 break-words break-all whitespace-pre-wrap">
                  {task.description || "No description provided."}
                </p>
              </Section>

              <Section label="Checklist" count={total}>
                {total > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex-1 h-1.5 bg-black/[0.04] rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${checkPct}%` }} />
                      </div>
                      <span className="font-display text-[11px] font-bold opacity-30">{checkPct}%</span>
                    </div>
                    {task.checklist.map(item => (
                      <div
                        key={item.id}
                        onClick={() => toggleCheck(item.id)}
                        className="flex items-start gap-3 p-2 rounded-[8px] hover:bg-black/[0.02] cursor-pointer transition-all group"
                      >
                        {item.done ? <CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> : <Square size={16} className="text-on-surface-variant opacity-20 group-hover:opacity-40 mt-0.5 shrink-0" />}
                        <span className={`font-display text-[13.5px] break-words break-all ${item.done ? 'text-on-surface-variant opacity-40 line-through' : 'text-on-surface'}`}>
                          {item.text}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); if(confirm("Delete item?")) handleUpdate({ checklist: task.checklist.filter(c => c.id !== item.id) }, "deleted checklist item", item.text); }}
                          className="text-red-500 opacity-20 hover:opacity-100 p-1 rounded transition-all ml-auto"
                          title="Delete item"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              <Section label="Links" count={task.externalLinks?.length || 0}>
                <ExternalLinksPanel links={task.externalLinks || []} onChange={l => handleUpdate({ externalLinks: l }, "updated external links")} />
              </Section>

              <Section label="Attachments" count={task.attachments.length}>
                <AttachmentZone attachments={task.attachments} onChange={a => handleUpdate({ attachments: a }, "updated attachments")} />
              </Section>

              <Section label="Notes" count={task.comments.length}>
                <div className="space-y-6">
                  {task.comments.map(c => (
                    <div key={c.id} className="flex gap-4 group">
                      {c.avatar ? (
                        <img src={c.avatar} className="w-8 h-8 rounded-full object-cover shrink-0" alt="" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-black/[0.04] border border-black/[0.04] flex items-center justify-center font-bold text-[10px] text-on-surface-variant shrink-0">
                          {c.initials}
                        </div>
                      )}
                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-display text-[13px] font-bold">{c.author}</span>
                            <span className="text-[10px] text-on-surface-variant opacity-30">{c.timestamp}</span>
                          </div>
                          <button
                            onClick={() => { if (confirm("Delete this note?")) handleUpdate({ comments: task.comments.filter(comment => comment.id !== c.id) }, "deleted a note") }}
                            className="text-red-500 opacity-20 hover:opacity-100 hover:bg-red-50 p-1 rounded transition-all"
                            title="Delete note"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <p className="font-display text-[13px] text-on-surface-variant/80 leading-relaxed break-words break-all whitespace-pre-wrap">{c.body}</p>
                        <ReactionsBar reactions={c.reactions ?? {}} onToggle={e => handleCommentReaction(c.id, e)} />
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-black/[0.04]">
                    <div className="flex gap-4">
                      {user?.image ? (
                        <img src={user.image} className="w-8 h-8 rounded-full object-cover shrink-0" alt="" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-[10px] text-on-primary shrink-0">
                          {(user?.name || "U").substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 space-y-2">
                        <textarea
                          rows={2}
                          placeholder="Add a note, update, or log activity..."
                          value={comment}
                          onChange={e => setComment(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              submitComment();
                            }
                          }}
                          className="w-full bg-black/[0.02] border border-black/[0.06] rounded-[8px] p-3 font-display text-[13px] outline-none focus:bg-white focus:border-primary/30 transition-all"
                        />
                        <div className="flex items-center justify-end">
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={!comment.trim()}
                            onClick={submitComment}
                          >
                            POST NOTE
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Section>
            </div>
          )}

          {tab === "activity" && (
            <div className="space-y-6 relative pl-4">
              <div className="absolute left-[3px] top-2 bottom-2 w-px bg-black/[0.04]" />
              {[...task.activity].reverse().map(a => (
                <div key={a.id} className="relative flex items-start gap-4">
                  <div className="absolute -left-[14px] top-1.5 w-2 h-2 rounded-full bg-black/[0.1] border-2 border-white" />
                  <div className="flex-1 space-y-0.5">
                    <p className="font-display text-[12.5px] text-on-surface-variant/80">
                      <span className="font-bold text-on-surface">{a.actor}</span>
                      {' '}
                      {a.action === 'added a note' ? (
                        <>
                          added a note:{" "}
                          {a.detail && (
                            <span className="whitespace-pre-wrap font-normal opacity-90 text-on-surface">
                              "{a.detail}"
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          {a.action} {a.detail && <span className="font-bold text-on-surface">{a.detail}</span>}
                        </>
                      )}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Clock size={10} className="opacity-20" />
                      <span className="text-[10px] text-on-surface-variant opacity-30">{a.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}
