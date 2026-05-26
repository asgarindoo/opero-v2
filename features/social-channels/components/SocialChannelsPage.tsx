"use client";

import React, { useState } from "react";
import ModuleHeader from "@/components/common/ModuleHeader";
import SearchInput from "@/components/common/SearchInput";
import Button from "@/components/ui/Button";
import { Plus, Globe, Edit2, X, Check, ArrowUpRight, Calendar, Activity, Users, Eye, ChevronDown } from "lucide-react";
import { useSocialChannels, Channel, ChannelStatus } from "../context/SocialChannelsContext";

const SCHEDULED: any[] = [];

const ACTIVITY: any[] = [];

const statusDot = (s: ChannelStatus) =>
   s === "Active" ? "bg-black" : s === "Inactive" ? "bg-black/60" : "bg-black/60";

const statusLabel = (s: ChannelStatus) =>
   s === "Active" ? "bg-black text-white" : "bg-black/[0.05] text-black/100";

const postDot = (s: string) =>
   s === "Ready" ? "bg-black text-white" : s === "Review" ? "bg-black/[0.08] text-black/60" : "bg-black/[0.04] text-black/100";

const PLATFORMS = ["Instagram", "TikTok", "YouTube", "WhatsApp", "Telegram", "Facebook", "X/Twitter", "LinkedIn"];
const STATUSES: ChannelStatus[] = ["Active", "Inactive", "Archived"];

const parseStat = (s: any): number => {
   if (typeof s === 'number') return s;
   if (!s || s === "—") return 0;
   const clean = s.toString().toUpperCase().replace(/[^0-9.KM]/g, '');
   if (clean.endsWith('K')) return parseFloat(clean) * 1000;
   if (clean.endsWith('M')) return parseFloat(clean) * 1000000;
   return parseFloat(clean) || 0;
};

const formatStat = (num: number | undefined) => {
   if (num === undefined || num === 0) return "—";
   if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
   if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
   return Math.round(num).toLocaleString();
};

const calculateEngagement = (followers: number, interactions: number) => {
   if (!followers || !interactions) return "0%";
   return ((interactions / followers) * 100).toFixed(1) + "%";
};

type AddForm = Partial<Channel>;

export default function SocialChannelsPage() {
   const { channels, addChannel, updateChannel, removeChannel } = useSocialChannels();
   const [search, setSearch] = useState("");
   const [showAdd, setShowAdd] = useState(false);
   const [editId, setEditId] = useState<string | null>(null);
   const [form, setForm] = useState<AddForm>({});
   const [activeChannel, setActiveChannel] = useState<string | null>(null);
   const [isStatusOpen, setIsStatusOpen] = useState(false);

   const filtered = channels.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.username.toLowerCase().includes(search.toLowerCase()) ||
      c.platform.toLowerCase().includes(search.toLowerCase())
   );

   const openAdd = () => {
      setForm({
         status: "Active",
         platform: "",
         followers: 0,
         postsThisMonth: 0,
         interactions: 0,
         lastActiveDate: new Date().toISOString().split('T')[0]
      });
      setEditId(null);
      setShowAdd(true);
   };
   const openEdit = (ch: Channel) => { setForm({ ...ch }); setEditId(ch.id); setShowAdd(true); };

   const saveChannel = () => {
      if (!form.name || !form.platform) return;
      if (editId) {
         updateChannel(editId, form);
      } else {
         const newCh: Channel = {
            id: `ch-${Date.now()}`,
            name: form.name || "",
            platform: form.platform || "Instagram",
            username: form.username || "",
            profileLink: form.profileLink || "",
            status: form.status || "Active",
            followers: form.followers || 0,
            postsThisMonth: form.postsThisMonth || 0,
            interactions: form.interactions || 0,
            monthlyReach: form.monthlyReach,
            averageViews: form.averageViews,
            lastActiveDate: form.lastActiveDate || new Date().toISOString().split('T')[0],
            notes: form.notes || "",
         };
         addChannel(newCh);
      }
      setShowAdd(false); setForm({}); setEditId(null);
   };

   const ic = "w-full bg-[#fcfafa] border border-black/[0.06] rounded-[4px] px-4 py-2.5 font-display text-[12.5px] text-on-surface outline-none focus:border-black/[0.15] focus:bg-white transition-all duration-300 placeholder:text-black/100 appearance-none cursor-pointer";
   const lc = "font-label-caps text-[8.5px] font-bold text-on-surface opacity-80 uppercase tracking-[0.12em] mb-1.5 block transition-opacity";
   const hc = "text-[9.5px] text-on-surface opacity-80 mt-1.5 block leading-relaxed";

   const totalFollowersNum = channels.reduce((acc, c) => acc + (c.followers || 0), 0);
   const totalInteractionsNum = channels.reduce((acc, c) => acc + (c.interactions || 0), 0);
   const totalPostsNum = channels.reduce((acc, c) => acc + (c.postsThisMonth || 0), 0);
   const totalReachNum = channels.reduce((acc, c) => acc + (c.monthlyReach || 0), 0);

   const avgEngagement = totalFollowersNum > 0
      ? ((totalInteractionsNum / totalFollowersNum) * 100).toFixed(1) + "%"
      : "0%";

   const activeCount = channels.filter(c => c.status === "Active").length;

   return (
      <div className="flex flex-col h-full bg-[#fdf8f8] overflow-hidden">

         {/* Side Panel */}
         {showAdd && (
            <div className="fixed inset-0 z-[100] flex justify-end">
               <div className="absolute inset-0 bg-black/15 backdrop-blur-[2px]" onClick={() => setShowAdd(false)} />
               <div className="relative bg-white w-full max-w-[460px] h-full shadow-[-10px_0_30px_rgba(0,0,0,0.04)] border-l border-black/[0.06] flex flex-col animate-in slide-in-from-right duration-300">
                  <div className="px-8 py-7 border-b border-black/[0.05] flex items-center justify-between shrink-0">
                     <div className="space-y-0.5">
                        <h2 className="font-display text-[13px] font-bold text-on-surface tracking-tight">{editId ? "Update Channel" : "New Social Channel"}</h2>
                        <p className="text-[11px] text-on-surface opacity-60">Manage your channel details and tracking stats</p>
                     </div>
                     <button onClick={() => setShowAdd(false)} className="p-2 hover:bg-black/[0.05] rounded-full transition-colors opacity-80 hover:opacity-100"><X size={18} /></button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 space-y-8">

                     {/* Identity Section */}
                     <div className="space-y-5">
                        <h3 className="font-display text-[11px] font-bold text-black uppercase tracking-[0.1em]">Identity & Platform</h3>
                        <div className="grid grid-cols-2 gap-5">
                           <div className="space-y-1.5">
                              <label className={lc}>Platform Name</label>
                              <input
                                 className={ic}
                                 placeholder="e.g. Instagram, TikTok, WhatsApp"
                                 value={form.platform || ""}
                                 onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className={lc}>Account Label</label>
                              <input className={ic} placeholder="e.g. Opero" value={form.name || ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                           <div className="space-y-1.5">
                              <label className={lc}>Username / Handle</label>
                              <input className={ic} placeholder="@username" value={form.username || ""} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
                           </div>
                           <div className="space-y-1.5">
                              <label className={lc}>Profile Link</label>
                              <input className={ic} placeholder="https://..." value={form.profileLink || ""} onChange={e => setForm(f => ({ ...f, profileLink: e.target.value }))} />
                           </div>
                        </div>
                     </div>

                     {/* Stats Section */}
                     <div className="space-y-5 pt-2">
                        <h3 className="font-display text-[11px] font-bold text-black/100 uppercase tracking-[0.1em]">Operational Stats</h3>
                        <div className="grid grid-cols-2 gap-5">
                           <div className="space-y-1.5">
                              <label className={lc}>Followers / Subscribers</label>
                              <input type="number" className={ic} placeholder="e.g. 12500" value={form.followers || ""} onChange={e => setForm(f => ({ ...f, followers: parseInt(e.target.value) || 0 }))} />
                              <span className={hc}>Total people following this account</span>
                           </div>
                           <div className="space-y-1.5">
                              <label className={lc}>Total Interactions</label>
                              <input type="number" className={ic} placeholder="e.g. 4300" value={form.interactions || ""} onChange={e => setForm(f => ({ ...f, interactions: parseInt(e.target.value) || 0 }))} />
                              <span className={hc}>Likes, comments, shares, or reactions</span>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                           <div className="space-y-1.5">
                              <label className={lc}>Posts This Month</label>
                              <input type="number" className={ic} placeholder="e.g. 18" value={form.postsThisMonth || ""} onChange={e => setForm(f => ({ ...f, postsThisMonth: parseInt(e.target.value) || 0 }))} />
                              <span className={hc}>Total content published this month</span>
                           </div>
                           <div className="space-y-1.5">
                              <label className={lc}>Average Views <span className="opacity-80 italic ml-1">(Optional)</span></label>
                              <input type="number" className={ic} placeholder="0" value={form.averageViews || ""} onChange={e => setForm(f => ({ ...f, averageViews: parseInt(e.target.value) || 0 }))} />
                              <span className={hc}>Average views per content/post</span>
                           </div>
                        </div>
                     </div>

                     {/* Configuration Section */}
                     <div className="space-y-5 pt-2">
                        <h3 className="font-display text-[11px] font-bold text-black/100 uppercase tracking-[0.1em]">Management</h3>
                        <div className="grid grid-cols-2 gap-5">
                           <div className="space-y-1.5">
                              <label className={lc}>Last Active Date</label>
                              <input type="date" className={ic} value={form.lastActiveDate || ""} onChange={e => setForm(f => ({ ...f, lastActiveDate: e.target.value }))} />
                           </div>
                           <div className="space-y-1.5">
                              <label className={lc}>Status</label>
                              <div className="relative">
                                 <button
                                    onClick={() => setIsStatusOpen(!isStatusOpen)}
                                    className={`${ic} flex items-center justify-between group`}
                                 >
                                    <span className="flex items-center gap-2">
                                       <div className={`w-1.5 h-1.5 rounded-full ${statusLabel(form.status || "Active").split(' ')[1]}`} />
                                       {form.status || "Active"}
                                    </span>
                                    <ChevronDown size={14} className={`opacity-60 group-hover:opacity-80 transition-all ${isStatusOpen ? "rotate-180" : ""}`} />
                                 </button>

                                 {isStatusOpen && (
                                    <>
                                       <div className="fixed inset-0 z-10" onClick={() => setIsStatusOpen(false)} />
                                       <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-black/[0.06] rounded-[4px] shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                          {STATUSES.map(s => (
                                             <button
                                                key={s}
                                                onClick={() => {
                                                   setForm(f => ({ ...f, status: s }));
                                                   setIsStatusOpen(false);
                                                }}
                                                className="w-full text-left px-4 py-2.5 font-display text-[12px] text-on-surface hover:bg-black/[0.03] flex items-center justify-between transition-colors group"
                                             >
                                                <span className="flex items-center gap-2">
                                                   <div className={`w-1.5 h-1.5 rounded-full ${statusLabel(s).split(' ')[1]}`} />
                                                   {s}
                                                </span>
                                                {form.status === s && <Check size={12} className="opacity-80" />}
                                             </button>
                                          ))}
                                       </div>
                                    </>
                                 )}
                              </div>
                           </div>
                        </div>

                        <div className="space-y-1.5">
                           <label className={lc}>Operational Notes</label>
                           <textarea className={`${ic} h-28 resize-none`} placeholder="Channel purpose, strategy, or notes..." value={form.notes || ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                        </div>
                     </div>
                  </div>

                  <div className="p-8 border-t border-black/[0.05] flex gap-3 shrink-0 bg-[#fdf8f8]/50">
                     <button onClick={saveChannel} className="flex-1 bg-black text-white px-6 py-4 rounded-[8px] font-label-caps text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-black/90 transition-all flex items-center justify-center gap-2">
                        <Check size={14} />{editId ? "Update Channel" : "Create Channel"}
                     </button>
                     <button onClick={() => setShowAdd(false)} className="px-6 py-4 border border-black/[0.08] rounded-[8px] font-label-caps text-[10px] font-bold uppercase tracking-[0.15em] text-black/60 hover:text-black hover:border-black/20 transition-all">Cancel</button>
                  </div>
               </div>
            </div>
         )}

         {/* Header */}
         <ModuleHeader
            title="Social Channels"
            count={channels.length}
            leftContent={(
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-black/60" />
                  <span className="font-label-caps text-[9px] font-bold text-on-surface-variant opacity-80 uppercase tracking-widest">Active:</span>
                  <span className="font-display text-[14px] font-bold text-on-surface">{activeCount}</span>
               </div>
            )}
            rightContent={(
               <>
                  <SearchInput value={search} onChange={setSearch} placeholder="Search channels..." width={180} />
                  <Button variant="primary" size="sm" icon={Plus} onClick={openAdd}>ADD CHANNEL</Button>
               </>
            )}
         />

         {/* Main */}
         <main className="flex-1 overflow-y-auto bg-[#fdf8f8]">
            <div className="max-w-[1440px] mx-auto px-10 pt-10 pb-16 space-y-14">

               {/* High-Fidelity Performance Snapshot */}
               <div className="bg-black rounded-[8px] p-10 border border-white/[0.12] shadow-2xl shadow-black/10 relative overflow-hidden group">
                  {/* Subtle Background Glow */}
                  <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/[0.05] rounded-full blur-[80px] group-hover:bg-white/[0.08] transition-colors duration-700" />

                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                     <div className="space-y-2">
                        <div className="flex items-center gap-3">
                           <p className="font-label-caps text-[9px] font-bold text-white/60 uppercase tracking-[0.2em]">Operational Overview</p>
                        </div>
                        <h2 className="font-display text-[32px] font-bold text-white tracking-tighter leading-none">
                           {formatStat(totalInteractionsNum)} <span className="text-white/60 font-medium ml-1">Audience Interactions</span>
                        </h2>
                        <p className="font-body-sm text-[12px] text-white/60 max-w-md leading-relaxed">
                           Tracking content activity and communication updates across <span className="text-white/90 font-bold">{channels.length} connected platforms</span>. Centralized visibility for publishing performance.
                        </p>
                     </div>

                     <div className="flex items-center gap-12 shrink-0">
                        {[
                           { label: "Managed Channels", value: channels.length, trend: "Active Units" },
                           { label: "Content Published", value: formatStat(totalPostsNum), trend: "This Month" },
                           { label: "Global Audience", value: formatStat(totalFollowersNum), trend: "Total reach" },
                        ].map((s, i) => (
                           <div key={i} className="space-y-1">
                              <p className="font-label-caps text-[8px] font-bold text-white/60 uppercase tracking-widest">{s.label}</p>
                              <p className="font-display text-[20px] font-bold text-white tracking-tight">{s.value}</p>
                              <p className="font-display text-[8px] font-bold text-white/60 uppercase tracking-widest">{s.trend}</p>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Main Two-Column Layout */}
               <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-10">

                  {/* Left: Channels */}
                  <div className="space-y-8">
                     <div className="flex items-center justify-between">
                        <h2 className="font-display text-[13px] font-bold text-on-surface tracking-tight">Managed Channels</h2>
                        <span className="font-label-caps text-[8px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">{filtered.length} units</span>
                     </div>

                     <div className="space-y-3">
                        {filtered.map(ch => (
                           <div
                              key={ch.id}
                              onClick={() => setActiveChannel(activeChannel === ch.id ? null : ch.id)}
                              className={`group bg-white border rounded-[8px] transition-all cursor-pointer overflow-hidden ${activeChannel === ch.id ? "border-black/20 shadow-sm" : "border-black/[0.06] hover:border-black/15"}`}
                           >
                              {/* Row */}
                              <div className="flex items-center px-7 py-5 gap-5">
                                 {/* Name & Handle */}
                                 <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-3 mb-0.5">
                                       <h4 className="font-display text-[15px] font-bold text-on-surface tracking-tight leading-none">{ch.name}</h4>
                                       <span className="font-label-caps text-[7.5px] font-bold text-on-surface-variant opacity-80 uppercase tracking-widest">{ch.platform}</span>
                                    </div>
                                    <p className="font-body-sm text-[11.5px] text-on-surface-variant opacity-50">{ch.username || "—"}</p>
                                 </div>

                                 {/* Contextual Platform stats */}
                                 <div className="hidden md:flex items-center gap-10 shrink-0">
                                    {ch.platform.toLowerCase().includes("whatsapp") || ch.platform.toLowerCase().includes("telegram") ? (
                                       <>
                                          <div className="text-right">
                                             <p className="font-label-caps text-[7.5px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest mb-1">Members</p>
                                             <p className="font-display text-[13.5px] font-bold text-on-surface">{formatStat(ch.followers)}</p>
                                          </div>
                                          <div className="text-right">
                                             <p className="font-label-caps text-[7.5px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest mb-1">Broadcast Status</p>
                                             <p className="font-display text-[13.5px] font-bold text-on-surface">{ch.status === "Active" ? "Connected" : "Inactive"}</p>
                                          </div>
                                       </>
                                    ) : ch.platform.toLowerCase().includes("newsletter") || ch.platform.toLowerCase().includes("email") ? (
                                       <>
                                          <div className="text-right">
                                             <p className="font-label-caps text-[7.5px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest mb-1">Subscribers</p>
                                             <p className="font-display text-[13.5px] font-bold text-on-surface">{formatStat(ch.followers)}</p>
                                          </div>
                                          <div className="text-right">
                                             <p className="font-label-caps text-[7.5px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest mb-1">Last Sent</p>
                                             <p className="font-display text-[13.5px] font-bold text-on-surface">{ch.lastActiveDate.split('-').slice(1).join('/') || "—"}</p>
                                          </div>
                                       </>
                                    ) : (
                                       <>
                                          <div className="text-right">
                                             <p className="font-label-caps text-[7.5px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest mb-1">Followers</p>
                                             <p className="font-display text-[13.5px] font-bold text-on-surface">{formatStat(ch.followers)}</p>
                                          </div>
                                          <div className="text-right">
                                             <p className="font-label-caps text-[7.5px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest mb-1">{ch.platform.toLowerCase().includes("linkedin") ? "Updates" : "Posts"}</p>
                                             <p className="font-display text-[13.5px] font-bold text-on-surface">{ch.postsThisMonth}</p>
                                          </div>
                                          <div className="text-right">
                                             <p className="font-label-caps text-[7.5px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest mb-1">Reactions</p>
                                             <p className="font-display text-[13.5px] font-bold text-on-surface">{formatStat(ch.interactions)}</p>
                                          </div>
                                       </>
                                    )}
                                 </div>

                                 {/* actions */}
                                 <div className="flex items-center gap-4 shrink-0 ml-4">
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <button onClick={(e) => { e.stopPropagation(); openEdit(ch); }} className="p-1.5 text-black/100 hover:text-black transition-colors rounded-[4px] hover:bg-black/[0.04]"><Edit2 size={12} /></button>
                                       <button onClick={(e) => { e.stopPropagation(); removeChannel(ch.id); }} className="p-1.5 text-black/60 hover:text-red-500 transition-colors rounded-[4px] hover:bg-red-50"><X size={12} /></button>
                                    </div>
                                 </div>
                              </div>

                              {/* Expanded Detail */}
                              {activeChannel === ch.id && (
                                 <div className="border-t border-black/[0.04] bg-[#fdf8f8]/60 px-7 py-6 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-start">
                                    <div className="space-y-3">
                                       {ch.notes && <p className="font-body-sm text-[12.5px] text-on-surface opacity-60 leading-relaxed">{ch.notes}</p>}
                                       <div className="flex items-center gap-4 pt-1">
                                          <span className={`px-2 py-0.5 rounded-[4px] font-label-caps text-[8.5px] font-bold uppercase tracking-widest ${statusLabel(ch.status)}`}>{ch.status}</span>
                                          <span className="font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-80 uppercase tracking-widest italic">Last Active: {ch.lastActiveDate}</span>
                                          <span className="font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-80 uppercase tracking-widest">{ch.postsThisMonth} posts this month</span>
                                       </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                       {ch.profileLink && (
                                          <a href={ch.profileLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 font-label-caps text-[9px] font-bold text-black/100 hover:text-black transition-colors uppercase tracking-widest">
                                             <Globe size={12} /> Open <ArrowUpRight size={10} />
                                          </a>
                                       )}
                                       <button onClick={() => openEdit(ch)} className="font-label-caps text-[9px] font-bold text-black/100 hover:text-black uppercase tracking-widest transition-colors">Update Stats</button>
                                    </div>
                                 </div>
                              )}
                           </div>
                        ))}

                        {/* Ghost Add */}
                        <button onClick={openAdd} className="w-full border border-dashed border-black/[0.07] rounded-[8px] py-6 flex items-center justify-center gap-3 group hover:border-black/15 transition-all bg-white/30">
                           <div className="w-6 h-6 rounded-full border border-dashed border-black/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Plus size={12} className="text-black/60 group-hover:text-black" />
                           </div>
                           <span className="font-label-caps text-[9px] font-bold text-black/60 group-hover:text-black/80 uppercase tracking-[0.2em]">Add Channel</span>
                        </button>
                     </div>
                  </div>

                  {/* Right: Sidebar */}
                  <div className="space-y-2">

                     {/* Upcoming Content */}
                     <div className="space-y-4">
                        <div className="flex items-center justify-between">
                           <h2 className="font-display text-[13px] font-bold text-on-surface tracking-tight">Upcoming Content</h2>
                           <span className="font-label-caps text-[8px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">{SCHEDULED.length} items</span>
                        </div>

                        <div className="space-y-2">
                           {SCHEDULED.length > 0 ? SCHEDULED.map(post => (
                              <div key={post.id} className="bg-white border border-black/[0.06] rounded-[8px] px-5 py-4 group hover:border-black/15 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                                 <div className="flex items-start justify-between gap-3 mb-2.5">
                                    <h4 className="font-display text-[12.5px] font-bold text-on-surface tracking-tight leading-snug line-clamp-2">{post.title}</h4>
                                    <span className={`px-1.5 py-0.5 rounded-[4px] font-label-caps text-[7.5px] font-bold uppercase tracking-widest shrink-0 ${postDot(post.status)}`}>{post.status}</span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-[4px] bg-black/[0.04] flex items-center justify-center font-display font-bold text-[8px] text-black/60">{(post as any).type?.[0]}</div>
                                    <span className="font-label-caps text-[7.5px] font-bold text-on-surface-variant opacity-80 uppercase tracking-widest">{post.channel}</span>
                                    <div className="w-0.5 h-0.5 rounded-full bg-black/10" />
                                    <span className="font-body-sm text-[10.5px] text-on-surface-variant opacity-80">{post.date}</span>
                                 </div>
                              </div>
                           )) : (
                              <div className="py-10 px-6 border border-dashed border-black/[0.08] rounded-[8px] bg-black/[0.01] text-center">
                                 <p className="font-body-sm text-[11px] text-on-surface-variant opacity-80 leading-relaxed">No upcoming content scheduled yet. Planned posts and campaigns will appear here.</p>
                              </div>
                           )}
                        </div>
                        <button className="w-full py-2.5 font-label-caps text-[8px] font-bold text-on-surface-variant opacity-60 hover:opacity-100 uppercase tracking-widest transition-opacity text-center">Open Content Planner →</button>
                     </div>

                     {/* Recent Activity */}
                     <div className="space-y-4">
                        <div className="flex items-center justify-between">
                           <h2 className="font-display text-[13px] font-bold text-on-surface tracking-tight">Recent Activity</h2>
                        </div>

                        <div className="space-y-px bg-white border border-black/[0.06] rounded-[8px] overflow-hidden divide-y divide-black/[0.03] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                           {ACTIVITY.length > 0 ? ACTIVITY.map(act => (
                              <div key={act.id} className="px-5 py-4 group hover:bg-black/[0.01] transition-colors">
                                 <div className="flex items-start justify-between gap-3 mb-1.5">
                                    <h4 className="font-display text-[12px] font-bold text-on-surface tracking-tight leading-snug">{act.action}</h4>
                                    <span className="font-label-caps text-[7.5px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest shrink-0 mt-0.5">{act.time}</span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <div className="w-3.5 h-3.5 rounded-[4px] bg-black/[0.04] flex items-center justify-center font-display font-bold text-[7px] text-black/60">{act.channel[0]}</div>
                                    <span className="font-label-caps text-[7.5px] font-bold text-on-surface-variant opacity-80 uppercase tracking-widest">{act.channel}</span>
                                    <div className="w-0.5 h-0.5 rounded-full bg-black/10" />
                                    <span className="font-body-sm text-[10.5px] text-on-surface-variant opacity-80">by {act.user}</span>
                                 </div>
                              </div>
                           )) : (
                              <div className="py-12 px-6 text-center">
                                 <p className="font-body-sm text-[11px] text-on-surface-variant opacity-80 leading-relaxed">No recent channel activity yet. Updates will appear here when channels are added, edited, or linked to campaigns.</p>
                              </div>
                           )}
                        </div>
                     </div>

                  </div>
               </div>
            </div>
         </main>
      </div>
   );
}
