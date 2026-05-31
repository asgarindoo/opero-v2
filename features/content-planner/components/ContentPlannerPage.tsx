"use client";

import React, { useState } from "react";
import ContentCalendar from "@/features/content-planner/components/ContentCalendar";
import ContentQueue from "@/features/content-planner/components/ContentQueue";
import ModuleHeader from "@/components/common/ModuleHeader";
import ModuleTabs from "@/components/common/ModuleTabs";
import SearchInput from "@/components/common/SearchInput";
import Button from "@/components/ui/Button";
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, List, ChevronDown, SlidersHorizontal, Check, X } from "lucide-react";
import { ContentPost, ContentStatus, ContentType } from "@/features/content-planner";
import { useSocialChannels } from "@/features/social-channels";
import { ContentPlannerProvider, useContentPlanner } from "@/features/content-planner/context/ContentPlannerContext";
import ContentDrawer from "./ContentDrawer";
import { ModalShell } from "@/components/ui/global/modal/ModalShell";
import { ModalHeader } from "@/components/ui/global/modal/ModalHeader";
import { ModalContent } from "@/components/ui/global/modal/ModalContent";
import { ModalFooter } from "@/components/ui/global/modal/ModalFooter";
import { GlobalInput } from "@/components/ui/global/form/GlobalInput";
import Dropdown from "@/components/ui/Dropdown";
import DatePicker from "@/components/ui/DatePicker";

const toYMD = (d: Date) => {
  if (!d || isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

import { ContentTagsInput } from "@/features/content-planner/components/ContentTagsInput";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const currentYear = new Date().getFullYear();
const CALENDAR_OPTIONS: { month: number; year: number; label: string }[] = [];
// Limit to 4 years total for a shorter list
for (let y = currentYear - 1; y <= currentYear + 2; y++) {
  for (let m = 0; m < 12; m++) {
    CALENDAR_OPTIONS.push({ month: m, year: y, label: `${MONTHS[m]} ${y}` });
  }
}

const INITIAL_POSTS: ContentPost[] = [];

const TABS = [
  { id: "calendar", label: "Calendar", icon: CalendarIcon },
  { id: "list", label: "List", icon: List },
];

export default function ContentPlannerPageWrapper() {
  return (
    <ContentPlannerProvider>
      <ContentPlannerPage />
    </ContentPlannerProvider>
  );
}

function ContentPlannerPage() {
  const { posts, addPost, updatePost } = useContentPlanner();
  const [viewMode, setViewMode] = useState("calendar");
  const [calView, setCalView] = useState<"month" | "week">("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ContentPost | null>(null);
  const [targetDate, setTargetDate] = useState<Date>(new Date());

  // new entry fields
  const [nTitle, setNTitle] = useState("");
  const [nTargetAccount, setNTargetAccount] = useState("");
  const [nHour, setNHour] = useState("");
  const [nMinute, setNMinute] = useState("");
  const [nMeridiem, setNMeridiem] = useState<"AM" | "PM">("AM");
  const [nType, setNType] = useState("Post");
  const [nTags, setNTags] = useState<string[]>([]);

  const { channels } = useSocialChannels();

  const navigate = (dir: 1 | -1) => {
    const d = new Date(currentDate);
    if (calView === "month") d.setMonth(d.getMonth() + dir);
    else d.setDate(d.getDate() + 7 * dir);
    setCurrentDate(d);
  };

  const monthLabel = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

  const handleUpdate = (up: ContentPost) => updatePost(up.id, up);
  const normalizedHour = nHour.trim().replace(/[^\d]/g, "");
  const normalizedMinute = nMinute.trim().replace(/[^\d]/g, "");
  const parsedHour = Number(normalizedHour);
  const parsedMinute = Number(normalizedMinute);
  const isHourValid = normalizedHour !== "" && Number.isInteger(parsedHour) && parsedHour >= 1 && parsedHour <= 12;
  const isMinuteValid = normalizedMinute !== "" && Number.isInteger(parsedMinute) && parsedMinute >= 0 && parsedMinute <= 59;
  const isTimeValid = isHourValid && isMinuteValid;
  const isAddValid = nTitle.trim() !== "" && isTimeValid;

  const handleAdd = () => {
    if (!isAddValid) return;
    addPost({
      title: nTitle,
      targetAccountId: nTargetAccount || undefined,
      status: "Planned",
      type: (nType as ContentType) || "Post",
      time: `${parsedHour}:${String(parsedMinute).padStart(2, "0")} ${nMeridiem}`,
      date: targetDate.toISOString(),
      tags: nTags,
    });
    setIsAddOpen(false);
    setNTitle(""); setNTargetAccount(""); setNHour(""); setNMinute(""); setNMeridiem("AM"); setNType("Post"); setNTags([]);
  };

  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [platformFilter, setPlatformFilter] = useState<string>("All");

  const filtered = posts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || p.status === statusFilter;
    // We can filter by Target Account here if we update platformFilter to targetAccountFilter
    const targetChannel = channels.find(c => c.id === p.targetAccountId);
    const matchesPlatform = platformFilter === "All" || (targetChannel && targetChannel.name === platformFilter);
    return matchesSearch && matchesStatus && matchesPlatform;
  });

  const openAdd = (date?: Date) => {
    setTargetDate(date ?? new Date());
    setIsAddOpen(true);
  };

  const STATUS_COLORS: Record<ContentStatus, string> = { "Planned": "bg-gray-400", "Ready": "bg-blue-400", "Published": "bg-green-400", "Skipped": "bg-red-400" };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-surface-container-low">

      {/* ── ADD MODAL ── */}
      {isAddOpen && (
        <ModalShell onClose={() => setIsAddOpen(false)} maxWidth={480}>
          <ModalHeader
            title="New Content Entry"
            onClose={() => setIsAddOpen(false)}
          />

          <ModalContent className="db-sidebar space-y-5">
            <GlobalInput
              autoFocus
              required
              maxLength={120}
              placeholder="e.g. Q3 Campaign Launch"
              value={nTitle}
              onChange={e => setNTitle(e.target.value)}
              className="font-display font-semibold"
              style={{ fontSize: "16px", background: "transparent", border: "none", padding: "0" }}
            />

            <div style={{ height: 1, background: "rgba(0,0,0,0.06)" }} />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="font-label-caps text-[9px] uppercase tracking-[0.12em] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }}>Date</span>
                <DatePicker 
                  value={toYMD(targetDate)} 
                  onChange={(val) => val && setTargetDate(new Date(val))} 
                  placeholder="Select Date"
                />
              </div>
              <div className="space-y-1.5">
                <span className="font-label-caps text-[9px] uppercase tracking-[0.12em] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }}>Time</span>
                <div className="flex items-center gap-2">
                  <div className="h-[39px] flex-1 min-w-0 flex items-center rounded-[6px] bg-black/[0.02] border border-black/[0.06] focus-within:bg-white focus-within:border-primary/30 transition-all px-2.5">
                    <input
                      required
                      inputMode="numeric"
                      maxLength={2}
                      placeholder="HH"
                      value={nHour}
                      onChange={e => setNHour(e.target.value.replace(/[^\d]/g, "").slice(0, 2))}
                      className="w-9 bg-transparent outline-none font-display text-[13px] text-center text-on-surface placeholder:text-on-surface-variant placeholder:opacity-35"
                    />
                    <span className="font-display text-[13px] font-semibold text-on-surface-variant opacity-35 px-1">:</span>
                    <input
                      required
                      inputMode="numeric"
                      maxLength={2}
                      placeholder="MM"
                      value={nMinute}
                      onChange={e => setNMinute(e.target.value.replace(/[^\d]/g, "").slice(0, 2))}
                      className="w-9 bg-transparent outline-none font-display text-[13px] text-center text-on-surface placeholder:text-on-surface-variant placeholder:opacity-35"
                    />
                  </div>
                  <div className="h-[39px] shrink-0 flex items-center rounded-[6px] bg-black/[0.03] p-0.5">
                    {(["AM", "PM"] as const).map(period => (
                      <button
                        key={period}
                        type="button"
                        onClick={() => setNMeridiem(period)}
                        className={`h-8 w-10 rounded-[5px] font-label-caps text-[9px] font-bold transition-all ${
                          nMeridiem === period
                            ? "bg-white text-on-surface shadow-sm"
                            : "text-on-surface-variant opacity-55 hover:opacity-90"
                        }`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="font-label-caps text-[9px] uppercase tracking-[0.12em] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }}>Target Account</span>
              <Dropdown
                value={nTargetAccount}
                onChange={(val) => setNTargetAccount(val as string)}
                options={[{ label: "None", value: "" }, ...channels.map(c => ({ label: `${c.name} (${c.platform})`, value: c.id }))]}
              />
            </div>

            <div className="space-y-1.5">
              <span className="font-label-caps text-[9px] uppercase tracking-[0.12em] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }}>Content Type</span>
              <Dropdown
                value={nType}
                onChange={(val) => setNType(val as string)}
                options={["Post", "Story", "Reel", "Carousel", "Video", "Article", "Email", "Other"].map(t => ({ label: t, value: t }))}
              />
            </div>

            <div className="space-y-1.5">
              <span className="font-label-caps text-[9px] uppercase tracking-[0.12em] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }}>Tags</span>
              <div className="pt-1">
                <ContentTagsInput tags={nTags} setTags={setNTags} max={5} />
              </div>
            </div>
          </ModalContent>

          <ModalFooter summary={(nHour.trim() || nMinute.trim()) && !isTimeValid ? (
            <span className="font-body-sm text-[11px] text-on-surface-variant opacity-55">
              Use HH:MM, then choose AM or PM.
            </span>
          ) : null}>
            <button
              onClick={() => setIsAddOpen(false)}
              className="font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold px-3.5 py-2 rounded-[6px] hover:bg-black/[0.05] transition-colors"
              style={{ color: "var(--color-on-surface-variant)", opacity: 0.65 }}
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!isAddValid}
              className="font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold px-4 py-2 rounded-[6px] disabled:opacity-30 hover:-translate-y-px transition-all"
              style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
            >
              Create Entry
            </button>
          </ModalFooter>
        </ModalShell>
      )}

      {/* ── EDIT DRAWER ── */}
      {selectedPost && (
        <ContentDrawer postId={selectedPost.id} onClose={() => setSelectedPost(null)} />
      )}

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
                className={`flex items-center gap-2 px-3 py-1.5 rounded-[6px] transition-all ${isFilterOpen || statusFilter !== "All" || platformFilter !== "All"
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
                        {["All", "Planned", "Ready", "Published", "Skipped"].map(s => (
                          <button
                            key={s}
                            onClick={() => { setStatusFilter(s); setIsFilterOpen(false); }}
                            className={`w-full text-left px-2 py-1.5 rounded-[4px] font-display text-[11px] transition-all ${statusFilter === s ? "bg-black/[0.04] text-black font-bold" : "text-black/60 hover:bg-black/[0.02] hover:text-black"
                              }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="pt-2 border-t border-black/[0.05]">
                      <label className="font-display text-[9px] font-bold uppercase tracking-widest text-black/60 mb-2 block">Target Account</label>
                      <div className="grid grid-cols-1 gap-1">
                        {["All", ...channels.map(c => c.name)].map(p => (
                          <button
                            key={p}
                            onClick={() => { setPlatformFilter(p); setIsFilterOpen(false); }}
                            className={`w-full text-left px-2 py-1.5 rounded-[4px] font-display text-[11px] transition-all ${platformFilter === p ? "bg-black/[0.04] text-black font-bold" : "text-black/60 hover:bg-black/[0.02] hover:text-black"
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
                <div className="flex items-center gap-1">
                  <button onClick={() => navigate(-1)} className="w-7 h-7 flex items-center justify-center text-black/60 hover:text-black hover:bg-black/[0.04] rounded-[6px] transition-colors">
                    <ChevronLeft size={14} />
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
                      className="h-7 min-w-[132px] flex items-center justify-center gap-1.5 px-2 hover:bg-black/[0.04] rounded-[6px] transition-all group"
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
                              className={`w-full text-left px-3 py-2 rounded-[4px] font-display text-[11px] transition-all ${currentDate.getMonth() === opt.month && currentDate.getFullYear() === opt.year
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

                  <button onClick={() => navigate(1)} className="w-7 h-7 flex items-center justify-center text-black/60 hover:text-black hover:bg-black/[0.04] rounded-[6px] transition-colors">
                    <ChevronRight size={14} />
                  </button>
                </div>

                <button onClick={() => setCurrentDate(new Date())}
                  className="font-display text-[10px] font-semibold px-3 py-1.5 border border-black/[0.06] rounded-[6px] text-black/60 hover:text-black hover:border-black/15 transition-all ml-1 bg-white/50">
                  Today
                </button>

                <div className="flex bg-black/[0.03] p-0.5 rounded-[6px] ml-1">
                  {(["month", "week"] as const).map(v => (
                    <button key={v} onClick={() => setCalView(v)}
                      className={`px-4 py-1.5 rounded-[4px] font-display text-[9px] font-bold uppercase tracking-wider transition-all ${calView === v ? "bg-white text-black shadow-sm" : "text-black/60 hover:text-black/80"
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
          <div className="flex flex-col h-full min-w-0">
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

    </div>
  );
}
