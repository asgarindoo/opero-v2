"use client";

import React, { useState } from "react";
import ContentCalendar from "./components/ContentCalendar";
import ContentQueue from "./components/ContentQueue";
import ModuleHeader from "../components/shared/ModuleHeader";
import ModuleTabs from "../components/shared/ModuleTabs";
import SearchInput from "../components/shared/SearchInput";
import Button from "../components/ui/Button";
import { Plus, X, ChevronLeft, ChevronRight, Calendar as CalendarIcon, List, ChevronDown, SlidersHorizontal } from "lucide-react";
import { ContentPost, Asset, ContentStatus, Platform } from "./types";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const currentYear = new Date().getFullYear();
const CALENDAR_OPTIONS: { month: number; year: number; label: string }[] = [];
// Limit to 4 years total for a shorter list
for (let y = currentYear - 1; y <= currentYear + 2; y++) {
  for (let m = 0; m < 12; m++) {
    CALENDAR_OPTIONS.push({ month: m, year: y, label: `${MONTHS[m]} ${y}` });
  }
}

const INITIAL_POSTS: ContentPost[] = [];

const INITIAL_ASSETS: Asset[] = [];

const TABS = [
  { id: "calendar", label: "Calendar", icon: CalendarIcon },
  { id: "list",     label: "List",     icon: List },
];

export default function ContentPlannerPage() {
  const [viewMode,     setViewMode]     = useState("calendar");
  const [calView,      setCalView]      = useState<"month" | "week">("month");
  const [currentDate,  setCurrentDate]  = useState(new Date(2026, 4, 1));
  const [posts,        setPosts]        = useState<ContentPost[]>(INITIAL_POSTS);
  const [search,       setSearch]       = useState("");
  const [isAddOpen,    setIsAddOpen]    = useState(false);
  const [selectedPost, setSelectedPost] = useState<ContentPost | null>(null);
  const [targetDate,   setTargetDate]   = useState<Date>(new Date());

  // new entry fields
  const [nTitle,    setNTitle]    = useState("");
  const [nChannel,  setNChannel]  = useState("");
  const [nCategory, setNCategory] = useState("");
  const [nTime,     setNTime]     = useState("09:00 AM");
  const [nType,     setNType]     = useState("");

  const navigate = (dir: 1 | -1) => {
    const d = new Date(currentDate);
    if (calView === "month") d.setMonth(d.getMonth() + dir);
    else d.setDate(d.getDate() + 7 * dir);
    setCurrentDate(d);
  };

  const monthLabel = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

  const handleUpdate = (up: ContentPost) =>
    setPosts(prev => prev.map(p => p.id === up.id ? up : p));

  const handleAdd = () => {
    if (!nTitle.trim()) return;
    setPosts(prev => [...prev, {
      id: `cnt-${Date.now()}`,
      title: nTitle,
      platform: (nChannel || "Web") as Platform,
      status: "Draft",
      type: nType || "Article" as any,
      category: nCategory,
      assignee: "Alex Rivera",
      time: nTime,
      date: targetDate,
      description: "",
      tags: [],
      assets: [],
    }]);
    setIsAddOpen(false);
    setNTitle(""); setNChannel(""); setNCategory(""); setNTime("09:00 AM"); setNType("");
  };

  const handleDelete = (id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
    setSelectedPost(null);
  };

  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [platformFilter, setPlatformFilter] = useState<string>("All");

  const filtered = posts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.platform.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || p.status === statusFilter;
    const matchesPlatform = platformFilter === "All" || p.platform === platformFilter;
    return matchesSearch && matchesStatus && matchesPlatform;
  });

  const openAdd = (date?: Date) => {
    setTargetDate(date ?? new Date());
    setIsAddOpen(true);
  };

  function StatusDot({ status }: { status: ContentStatus }) {
    const colors = { "Draft": "bg-gray-400", "In Review": "bg-yellow-400", "Approved": "bg-blue-400", "Scheduled": "bg-green-400", "Published": "bg-purple-400" };
    return <div className={`w-1.5 h-1.5 rounded-full ${colors[status] || "bg-black"}`} />;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-surface-container-low">

      {/* ── ADD PANEL ── */}
      {isAddOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <div className="absolute inset-0 bg-black/[0.08] backdrop-blur-[3px]" onClick={() => setIsAddOpen(false)} />
          <div className="relative z-10 w-full max-w-[400px] h-full bg-white border-l border-black/[0.06] flex flex-col shadow-[-16px_0_40px_rgba(0,0,0,0.08)] animate-in slide-in-from-right duration-300">
            <div className="px-6 py-5 border-b border-black/[0.05] flex items-center justify-between shrink-0">
              <div>
                <p className="font-display text-[13px] font-bold text-black tracking-tight">New Content Entry</p>
                <p className="font-display text-[10px] text-black/60 mt-0.5">
                  {targetDate.toLocaleDateString("default", { weekday: "long", month: "long", day: "numeric" })}
                </p>
              </div>
              <button onClick={() => setIsAddOpen(false)} className="p-1.5 text-black/60 hover:text-black rounded-sm transition-all">
                <X size={14} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <Field label="Title">
                <input autoFocus value={nTitle} onChange={e => setNTitle(e.target.value)}
                  placeholder="e.g. Q3 Campaign Launch"
                  className="field-input text-[16px] font-bold" />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Date">
                  <div className="field-input opacity-70 pointer-events-none text-[13px]">
                    {targetDate.toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                </Field>
                <Field label="Time">
                  <input value={nTime} onChange={e => setNTime(e.target.value)} className="field-input text-[13px]" />
                </Field>
              </div>

              <Field label="Category / Series">
                <input value={nCategory} onChange={e => setNCategory(e.target.value)}
                  placeholder="e.g. Thought Leadership"
                  className="field-input text-[13px]" />
              </Field>

              <Field label="Content Type">
                <input value={nType} onChange={e => setNType(e.target.value)}
                  placeholder="e.g. Video, Article, Thread…"
                  className="field-input text-[13px]" />
              </Field>

              <Field label="Channel / Platform">
                <input value={nChannel} onChange={e => setNChannel(e.target.value)}
                  placeholder="e.g. Instagram, LinkedIn, Web…"
                  className="field-input text-[13px]" />
              </Field>
            </div>

            <div className="p-6 border-t border-black/[0.05] shrink-0">
              <Button variant="primary" size="md" className="w-full justify-center" onClick={handleAdd} disabled={!nTitle.trim()}>
                Create Entry
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT PANEL ── */}
      {selectedPost && (() => {
        const post = selectedPost;
        return (
          <div className="fixed inset-0 z-[200] flex justify-end">
            <div className="absolute inset-0 bg-black/[0.08] backdrop-blur-[3px]" onClick={() => setSelectedPost(null)} />
            <div className="relative z-10 w-full max-w-[460px] h-full bg-white border-l border-black/[0.06] flex flex-col shadow-[-16px_0_40px_rgba(0,0,0,0.1)] animate-in slide-in-from-right duration-300">
              <div className="px-6 py-5 border-b border-black/[0.05] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <StatusDot status={post.status} />
                  <span className="font-display text-[9px] font-bold uppercase tracking-[0.18em] text-black/60">{post.status}</span>
                </div>
                <button onClick={() => setSelectedPost(null)} className="p-1.5 text-black/60 hover:text-black rounded-sm transition-all">
                  <X size={14} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <input
                    className="w-full bg-transparent font-display text-[20px] font-bold text-black tracking-tight focus:outline-none placeholder:text-black/15"
                    defaultValue={post.title}
                    placeholder="Entry Title"
                    onBlur={e => handleUpdate({ ...post, title: e.target.value })}
                  />
                  <div className="flex flex-wrap gap-2 mt-3">
                    {[post.platform, post.type, post.category].filter(Boolean).map((t, i) => (
                      <span key={i} className="font-display text-[9px] font-semibold uppercase tracking-[0.1em] px-2 py-1 border border-black/[0.07] rounded-[3px] text-black/60">{t}</span>
                    ))}
                    <span className="font-display text-[9px] text-black/60 ml-auto self-center">
                      {post.date.toLocaleDateString("default", { month: "long", day: "numeric" })} · {post.time}
                    </span>
                  </div>
                </div>

                <Field label="Editorial Notes">
                  <textarea
                    className="w-full bg-black/[0.01] border border-black/[0.06] rounded-[3px] p-3.5 font-display text-[13px] text-black/70 leading-relaxed min-h-[110px] resize-none focus:outline-none focus:border-black/[0.15] transition-all"
                    defaultValue={post.description}
                    placeholder="Add production notes or editorial context..."
                    onBlur={e => handleUpdate({ ...post, description: e.target.value })}
                  />
                </Field>

                <Field label="Workflow Stage">
                  <div className="space-y-1.5">
                    {(["Draft", "In Review", "Approved", "Scheduled", "Published"] as ContentStatus[]).map(s => (
                      <button key={s} onClick={() => handleUpdate({ ...post, status: s })}
                        className={`w-full px-4 py-2.5 rounded-[3px] border font-display text-[11px] text-left flex items-center justify-between transition-all ${
                          post.status === s
                            ? "border-black/80 bg-black/[0.02] text-black font-bold"
                            : "border-black/[0.05] text-black/60 hover:border-black/[0.12] hover:text-black"
                        }`}>
                        {s}
                        {post.status === s && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>

              <div className="p-6 border-t border-black/[0.05] flex items-center gap-3 shrink-0">
                <Button variant="primary" size="md" className="flex-1 justify-center" onClick={() => setSelectedPost(null)}>
                  Save Changes
                </Button>
                <Button variant="ghost" size="md" onClick={() => handleDelete(post.id)}
                  className="text-red-500 hover:bg-red-50 hover:text-red-600">
                  Delete
                </Button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── HEADER (Business section style) ── */}
      <ModuleHeader
        title="Content Planner"
        count={posts.length}
        rightContent={(
          <>
            <SearchInput value={search} onChange={setSearch} placeholder="Search content..." width={180} />
            
            {/* Global Filter Dropdown */}
            <div className="relative flex items-center">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-[6px] transition-all ${
                  isFilterOpen || statusFilter !== "All" || platformFilter !== "All"
                    ? "bg-black text-white"
                    : "text-black/60 hover:bg-black/[0.04] hover:text-black"
                }`}
              >
                <SlidersHorizontal size={13} strokeWidth={2.5} />
                <span className="font-display text-[11px] font-bold uppercase tracking-wider">Filter</span>
              </button>

              {isFilterOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                  <div className="absolute top-full right-0 mt-1 w-[220px] bg-white border border-black/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.12)] rounded-[6px] z-50 p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div>
                      <label className="font-display text-[9px] font-bold uppercase tracking-widest text-black/60 mb-2 block">Status</label>
                      <div className="grid grid-cols-1 gap-1">
                        {["All", "Scheduled", "Approved", "In Review", "Draft", "Published"].map(s => (
                          <button
                            key={s}
                            onClick={() => { setStatusFilter(s); setIsFilterOpen(false); }}
                            className={`w-full text-left px-2 py-1.5 rounded-[4px] font-display text-[11px] transition-all ${
                              statusFilter === s ? "bg-black/[0.04] text-black font-bold" : "text-black/60 hover:bg-black/[0.02] hover:text-black"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="pt-2 border-t border-black/[0.05]">
                      <label className="font-display text-[9px] font-bold uppercase tracking-widest text-black/60 mb-2 block">Platform</label>
                      <div className="grid grid-cols-1 gap-1">
                        {["All", "Instagram", "LinkedIn", "Web", "Twitter", "Email"].map(p => (
                          <button
                            key={p}
                            onClick={() => { setPlatformFilter(p); setIsFilterOpen(false); }}
                            className={`w-full text-left px-2 py-1.5 rounded-[4px] font-display text-[11px] transition-all ${
                              platformFilter === p ? "bg-black/[0.04] text-black font-bold" : "text-black/60 hover:bg-black/[0.02] hover:text-black"
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <Button variant="primary" size="sm" icon={Plus} onClick={() => openAdd()}>
              NEW CONTENT
            </Button>
          </>
        )}
      />

      {/* ── TABS + calendar nav ── */}
      <ModuleTabs
        tabs={TABS}
        activeTab={viewMode}
        onTabChange={setViewMode}
        rightContent={(
          <div className="flex items-center gap-3">
            {/* Calendar specific nav */}
            {viewMode === "calendar" && (
              <>
                <div className="flex items-center gap-0">
                  <button onClick={() => navigate(-1)} className="p-1 text-black/60 hover:text-black transition-colors">
                    <ChevronLeft size={14} />
                  </button>
                  <button onClick={() => navigate(1)} className="p-1 text-black/60 hover:text-black transition-colors">
                    <ChevronRight size={14} />
                  </button>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
                    className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-black/[0.04] rounded-[6px] transition-all group"
                  >
                    <span className="font-display text-[12px] font-bold text-black/70 group-hover:text-black transition-colors">
                      {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </span>
                    <ChevronDown size={14} className={`text-black/60 group-hover:text-black/80 transition-all ${isDateDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isDateDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsDateDropdownOpen(false)} />
                      <div className="absolute top-full left-0 mt-1 w-[160px] max-h-[280px] overflow-y-auto bg-white border border-black/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.08)] rounded-[6px] z-50 p-1 no-scrollbar animate-in fade-in zoom-in-95 duration-150">
                        {CALENDAR_OPTIONS.map(opt => (
                          <button
                            key={`${opt.month}-${opt.year}`}
                            onClick={() => {
                              const d = new Date(currentDate);
                              d.setFullYear(opt.year);
                              d.setMonth(opt.month);
                              setCurrentDate(d);
                              setIsDateDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-[4px] font-display text-[11px] transition-all ${
                              currentDate.getMonth() === opt.month && currentDate.getFullYear() === opt.year
                                ? 'bg-black text-white font-bold'
                                : 'text-black/60 hover:bg-black/[0.03] hover:text-black'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <button onClick={() => setCurrentDate(new Date())}
                  className="font-display text-[10px] font-semibold px-3 py-1.5 border border-black/[0.06] rounded-[6px] text-black/60 hover:text-black hover:border-black/15 transition-all ml-1 bg-white/50">
                  Today
                </button>

                <div className="flex bg-black/[0.03] p-0.5 rounded-[6px] ml-1">
                  {(["month", "week"] as const).map(v => (
                    <button key={v} onClick={() => setCalView(v)}
                      className={`px-4 py-1.5 rounded-[4px] font-display text-[9px] font-bold uppercase tracking-wider transition-all ${
                        calView === v ? "bg-white text-black shadow-sm" : "text-black/60 hover:text-black/80"
                      }`}>
                      {v}
                    </button>
                  ))}
                </div>
              </>
            )}

          </div>
        )}
      />

      {/* ── CONTENT ── */}
      <div className="flex-1 overflow-auto bg-[#fef8f8]">
        {viewMode === "calendar" && (
          <div className="min-h-full">
            <ContentCalendar
              posts={filtered}
              onUpdatePost={handleUpdate}
              onSelectPost={setSelectedPost}
              onCreateAtDate={openAdd}
              viewMode={calView}
              currentDate={currentDate}
              onNavigate={setCurrentDate}
            />
          </div>
        )}
        {viewMode === "list" && (
          <div className="flex flex-col">
            <ContentQueue
              posts={filtered}
              onSelectPost={setSelectedPost}
              onStatusChange={(id, status) => {
                const p = posts.find(p => p.id === id);
                if (p) handleUpdate({ ...p, status });
              }}
            />
          </div>
        )}
      </div>

      <style jsx global>{`
        .field-input {
          width: 100%;
          background: transparent;
          border-bottom: 1px solid rgba(0,0,0,0.08);
          padding: 8px 0;
          font-family: var(--font-display, inherit);
          color: black;
          outline: none;
          transition: border-color 0.2s;
        }
        .field-input:focus { border-color: rgba(0,0,0,0.3); }
        .field-input::placeholder { color: rgba(0,0,0,0.2); }
      `}</style>
    </div>
  );
}

// ── Helpers ──
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="font-display text-[8.5px] font-bold uppercase tracking-[0.18em] text-black/60">{label}</label>
      {children}
    </div>
  );
}

function StatusDot({ status }: { status: ContentStatus }) {
  const opacity = status === "Published" ? "opacity-100" : status === "Scheduled" ? "opacity-90" : status === "Approved" ? "opacity-80" : status === "In Review" ? "opacity-70" : "opacity-60";
  return <div className={`w-1.5 h-1.5 rounded-full bg-black ${opacity}`} />;
}
