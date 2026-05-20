"use client";

import { useState } from "react";
import { X, FileText, Download, Printer, Share2, Calendar, Filter, ChevronLeft, ChevronRight, MoreHorizontal, Layout, Table, PieChart } from "lucide-react";
import type { Report } from "@/features/reports";

interface ReportDetailProps {
  report: Report;
  onClose: () => void;
}

export default function ReportDetail({ report, onClose }: ReportDetailProps) {
  const [viewType, setViewType] = useState<"table" | "visual">("table");
  const createdDate = new Date(report.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="flex-1 flex flex-col h-full bg-background animate-fade-in overflow-hidden">
      {/* Header */}
      <header className="px-8 py-5 border-b border-black/[0.05] flex items-center justify-between bg-white/60 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-6">
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-black/5 transition-all text-on-surface-variant opacity-60 hover:opacity-100"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="h-8 w-px bg-black/[0.05]" />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-label-caps text-[9px] font-bold text-primary uppercase tracking-widest">{report.type} Report</span>
              <span className="w-1 h-1 rounded-full bg-black/10" />
              <span className="font-label-caps text-[9px] font-semibold text-on-surface-variant opacity-60 uppercase tracking-widest">ID: {report.id}</span>
            </div>
            <h1 className="font-display text-[18px] font-semibold text-on-surface tracking-tight">{report.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-black/5 text-on-surface-variant opacity-60 hover:opacity-100 transition-all font-label-caps text-[10px] font-bold uppercase tracking-widest">
              <Share2 size={14} /> Share
           </button>
           <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary font-label-caps text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-xl transition-all">
              <Download size={14} /> Export PDF
           </button>
        </div>
      </header>

      {/* Report Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Report Content & Preview */}
        <div className="flex-1 overflow-y-auto bg-black/[0.01] p-12">
          <div className="max-w-5xl mx-auto space-y-10">
            {/* Report Metadata Summary */}
            <div className="grid grid-cols-4 gap-8 p-8 rounded-2xl bg-white border border-black/[0.03] shadow-sm">
               <div className="space-y-1">
                  <span className="font-label-caps text-[8px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">Generated On</span>
                  <p className="font-display text-[13px] font-semibold text-on-surface">{createdDate}</p>
               </div>
               <div className="space-y-1">
                  <span className="font-label-caps text-[8px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">Data Range</span>
                  <p className="font-display text-[13px] font-semibold text-on-surface">{report.parameters.dateRange}</p>
               </div>
               <div className="space-y-1">
                  <span className="font-label-caps text-[8px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">Author</span>
                  <p className="font-display text-[13px] font-semibold text-on-surface">{report.author}</p>
               </div>
               <div className="space-y-1">
                  <span className="font-label-caps text-[8px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">Visibility</span>
                  <p className="font-display text-[13px] font-semibold text-on-surface">{report.visibility}</p>
               </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center justify-between">
               <div className="flex p-1 bg-black/[0.04] rounded-lg">
                  <button 
                    onClick={() => setViewType("table")}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-md font-label-caps text-[9px] font-bold uppercase tracking-widest transition-all ${viewType === "table" ? "bg-white text-primary shadow-sm" : "text-on-surface-variant opacity-60"}`}
                  >
                     <Table size={12} /> Data Table
                  </button>
                  <button 
                    onClick={() => setViewType("visual")}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-md font-label-caps text-[9px] font-bold uppercase tracking-widest transition-all ${viewType === "visual" ? "bg-white text-primary shadow-sm" : "text-on-surface-variant opacity-60"}`}
                  >
                     <PieChart size={12} /> Visual Insights
                  </button>
               </div>
               <div className="flex items-center gap-4 text-on-surface-variant opacity-60 font-label-caps text-[9px] font-bold uppercase tracking-widest">
                  <span>Page 1 of 4</span>
                  <div className="flex gap-1">
                     <button className="p-1 hover:bg-black/5 rounded"><ChevronLeft size={14} /></button>
                     <button className="p-1 hover:bg-black/5 rounded"><ChevronRight size={14} /></button>
                  </div>
               </div>
            </div>

            {/* Mock Report Table Preview */}
            <div className="bg-white border border-black/[0.04] rounded-2xl overflow-hidden shadow-sm">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-black/[0.01] border-b border-black/[0.03]">
                        <th className="px-6 py-4 font-label-caps text-[9px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">Metric ID</th>
                        <th className="px-6 py-4 font-label-caps text-[9px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">Component</th>
                        <th className="px-6 py-4 font-label-caps text-[9px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">Current Value</th>
                        <th className="px-6 py-4 font-label-caps text-[9px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">Baseline</th>
                        <th className="px-6 py-4 font-label-caps text-[9px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest text-right">Variance</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.03]">
                     {[1,2,3,4,5,6,7,8].map(i => {
                        const current = 62 + i * 4.37;
                        const variance = i % 2 === 0 ? i * 1.4 : -i * 1.1;
                        return (
                           <tr key={i} className="hover:bg-black/[0.01] transition-colors">
                              <td className="px-6 py-4 font-display text-[12px] text-on-surface-variant opacity-60">#MET-{1000+i}</td>
                              <td className="px-6 py-4 font-display text-[13px] font-semibold text-on-surface">Core Performance Node {i}</td>
                              <td className="px-6 py-4 font-display text-[13px] text-on-surface">{current.toFixed(2)} units</td>
                              <td className="px-6 py-4 font-display text-[13px] text-on-surface-variant opacity-60">85.00 units</td>
                              <td className={`px-6 py-4 font-display text-[12px] font-bold text-right ${variance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                 {variance >= 0 ? '+' : '-'}{Math.abs(variance).toFixed(1)}%
                              </td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Context & Actions */}
        <aside className="w-[320px] bg-white/20 backdrop-blur-xl border-l border-black/[0.04] p-8 space-y-10">
           <section className="space-y-6">
              <h4 className="font-label-caps text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em]">Report Settings</h4>
              <div className="space-y-4">
                 <div className="space-y-1.5">
                    <label className="font-label-caps text-[8px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest ml-1">Data Range</label>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-black/[0.05] cursor-pointer hover:border-primary/20 transition-all">
                       <span className="font-display text-[12px] text-on-surface">Last 30 Days</span>
                       <Calendar size={12} className="opacity-60" />
                    </div>
                 </div>
                 <div className="space-y-1.5">
                    <label className="font-label-caps text-[8px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest ml-1">Focus Filters</label>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-black/[0.05] cursor-pointer hover:border-primary/20 transition-all">
                       <span className="font-display text-[12px] text-on-surface">Regional: All</span>
                       <Filter size={12} className="opacity-60" />
                    </div>
                 </div>
              </div>
           </section>

           <section className="pt-10 border-t border-black/[0.04] space-y-6">
              <h4 className="font-label-caps text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em]">Export Formats</h4>
              <div className="grid grid-cols-2 gap-3">
                 <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-black/[0.05] bg-white hover:bg-black/[0.02] transition-all group">
                    <Download size={20} className="text-on-surface-variant opacity-60 group-hover:text-primary group-hover:opacity-100 mb-2 transition-all" />
                    <span className="font-label-caps text-[8px] font-bold tracking-widest uppercase">CSV Data</span>
                 </button>
                 <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-black/[0.05] bg-white hover:bg-black/[0.02] transition-all group">
                    <Printer size={20} className="text-on-surface-variant opacity-60 group-hover:text-primary group-hover:opacity-100 mb-2 transition-all" />
                    <span className="font-label-caps text-[8px] font-bold tracking-widest uppercase">Print Doc</span>
                 </button>
              </div>
           </section>

           <section className="pt-10 border-t border-black/[0.04] space-y-6">
              <h4 className="font-label-caps text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em]">Recent Activity</h4>
              <div className="space-y-4">
                 <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" />
                    <div>
                       <p className="font-body-sm text-[12px] text-on-surface">Report generated by <span className="font-bold">System</span></p>
                       <span className="text-[10px] opacity-60">2 hours ago</span>
                    </div>
                 </div>
              </div>
           </section>
        </aside>
      </div>
    </div>
  );
}
