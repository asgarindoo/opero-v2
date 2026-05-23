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
  Clock
} from "lucide-react";
import type { Task, Comment } from "@/features/tasks";
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
  const [tab, setTab]       = useState<"details"|"activity">("details");
  const [comment, setComment] = useState("");
  const [editTitle, setEditTitle] = useState(false);
  const [titleVal, setTitleVal]   = useState(task.title);

  const done     = task.checklist.filter(c => c.done).length;
  const total    = task.checklist.length;
  const checkPct = total > 0 ? Math.round((done / total) * 100) : 0;

  useEffect(() => {
    let cancelled = false;

    Promise.resolve().then(() => {
      if (cancelled) return;
      setTitleVal(task.title);
      setEditTitle(false);
    });

    return () => {
      cancelled = true;
    };
  }, [task.id, task.title]);

  function submitComment() {
    if (!comment.trim()) return;
    const c: Comment = { id: `c${Date.now()}`, author: "You", initials: "ME", body: comment.trim(), timestamp: "Just now" };
    onUpdate(task.id, { comments: [...task.comments, c], activity: [...task.activity, { id: `a${Date.now()}`, actor: "ME", action: "commented", timestamp: "Just now" }] });
    setComment("");
  }

  function toggleCheck(id: string) {
    const checklist = task.checklist.map(c => c.id === id ? { ...c, done: !c.done } : c);
    onUpdate(task.id, { checklist });
  }

  function handleCommentReaction(commentId: string, emoji: string) {
    const comments = task.comments.map(c => {
      if (c.id !== commentId) return c;
      return { ...c, reactions: toggleReaction(c.reactions ?? {}, emoji) };
    });
    onUpdate(task.id, { comments });
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
              onBlur={() => { onUpdate(task.id, { title: titleVal.trim() || task.title }); setEditTitle(false); }}
              onKeyDown={e => { 
                if (e.key === "Enter") { onUpdate(task.id, { title: titleVal.trim() || task.title }); setEditTitle(false); } 
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
             <MemberPicker selected={task.assignees} onChange={a => onUpdate(task.id, { assignees: a })} />
          </div>
          <div className="space-y-1">
             <span className="font-label-caps text-[8px] font-bold text-on-surface-variant opacity-30 uppercase tracking-widest">Due Date</span>
             <div className="flex items-center gap-2 px-2 py-1.5 rounded-[6px] bg-black/[0.02] border border-black/[0.04]">
               <CalendarDays size={12} className="opacity-30" />
               <input 
                 type="date" 
                 value={task.due ?? ""} 
                 onChange={e => onUpdate(task.id, { due: e.target.value || null })} 
                 className="bg-transparent outline-none font-display text-[12px] text-on-surface-variant" 
               />
             </div>
          </div>
        </div>

        {/* Labels */}
        <Section label="Labels">
           <LabelManager selected={task.labels} onChange={l => onUpdate(task.id, { labels: l })} />
        </Section>

        {/* Tabs for Details/Activity */}
        <div className="flex gap-6 border-b border-black/[0.04]">
          {(["details","activity"] as const).map(t => (
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
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              <Section label="Links" count={task.externalLinks?.length || 0}>
                <ExternalLinksPanel links={task.externalLinks || []} onChange={l => onUpdate(task.id, { externalLinks: l })} />
              </Section>

              <Section label="Attachments" count={task.attachments.length}>
                <AttachmentZone attachments={task.attachments} onChange={a => onUpdate(task.id, { attachments: a })} />
              </Section>

              <Section label="Discussion" count={task.comments.length}>
                <div className="space-y-6">
                  {task.comments.map(c => (
                    <div key={c.id} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-black/[0.04] border border-black/[0.04] flex items-center justify-center font-bold text-[10px] text-on-surface-variant shrink-0">
                        {c.initials}
                      </div>
                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-display text-[13px] font-bold">{c.author}</span>
                          <span className="text-[10px] text-on-surface-variant opacity-30">{c.timestamp}</span>
                        </div>
                        <p className="font-display text-[13px] text-on-surface-variant/80 leading-relaxed break-words break-all whitespace-pre-wrap">{c.body}</p>
                        <ReactionsBar reactions={c.reactions ?? {}} onToggle={e => handleCommentReaction(c.id, e)} />
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-4 pt-4 border-t border-black/[0.04]">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-[10px] text-on-primary shrink-0">ME</div>
                    <div className="flex-1 space-y-2">
                      <textarea 
                        rows={2} 
                        placeholder="Add a comment..." 
                        value={comment} 
                        onChange={e => setComment(e.target.value)}
                        className="w-full bg-black/[0.02] border border-black/[0.06] rounded-[8px] p-3 font-display text-[13px] outline-none focus:bg-white focus:border-primary/30 transition-all"
                      />
                      <div className="flex items-center justify-end">
                        <Button 
                          variant="primary" 
                          size="sm" 
                          disabled={!comment.trim()} 
                          onClick={submitComment}
                        >
                          POST COMMENT
                        </Button>
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
                      <span className="font-bold text-on-surface">{a.actor}</span> {a.action} {a.detail && <span className="font-bold text-on-surface">{a.detail}</span>}
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
