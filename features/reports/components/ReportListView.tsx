"use client";

import { FileText, Download, Share2, MoreHorizontal, ChevronRight, Clock, User, Shield } from "lucide-react";
import type { Report } from "@/features/reports";

const statusConfig = {
  Draft:      "bg-black/[0.04] text-on-surface-variant opacity-60",
  Ready:      "bg-emerald-50 text-emerald-600",
  Generating: "bg-blue-50 text-blue-600 animate-pulse",
  Scheduled:  "bg-amber-50 text-amber-600",
  Archived:   "bg-black/[0.08] text-on-surface-variant opacity-60",
};

interface ReportListViewProps {
  reports: Report[];
  onReportClick: (report: Report) => void;
}

export default function ReportListView({ reports, onReportClick }: ReportListViewProps) {
  return (
    <div className="w-full animate-fade-in">
      <div className="min-w-full inline-block align-middle">
        <div className="border-b border-black/[0.05]">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-black/[0.01]">
                <th className="px-6 py-4 text-left font-label-caps text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em] sticky top-0 bg-background/80 backdrop-blur-sm z-10">Report Title</th>
                <th className="px-6 py-4 text-left font-label-caps text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em] sticky top-0 bg-background/80 backdrop-blur-sm z-10">Status</th>
                <th className="px-6 py-4 text-left font-label-caps text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em] sticky top-0 bg-background/80 backdrop-blur-sm z-10">Author</th>
                <th className="px-6 py-4 text-left font-label-caps text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em] sticky top-0 bg-background/80 backdrop-blur-sm z-10">Visibility</th>
                <th className="px-6 py-4 text-left font-label-caps text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em] sticky top-0 bg-background/80 backdrop-blur-sm z-10">Last Updated</th>
                <th className="px-6 py-4 text-right font-label-caps text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em] sticky top-0 bg-background/80 backdrop-blur-sm z-10">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {reports.map((report) => {
                const date = new Date(report.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                
                return (
                  <tr 
                    key={report.id} 
                    onClick={() => onReportClick(report)}
                    className="group hover:bg-black/[0.02] cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                         <div className="w-9 h-9 rounded-lg bg-black/[0.03] flex items-center justify-center text-on-surface-variant opacity-60 group-hover:bg-primary/5 group-hover:text-primary group-hover:opacity-100 transition-all">
                            <FileText size={16} />
                         </div>
                         <div>
                            <span className="font-display text-[13px] font-semibold text-on-surface tracking-tight group-hover:text-primary transition-colors block mb-0.5">{report.title}</span>
                            <span className="font-body-sm text-[11px] text-on-surface-variant opacity-60 block truncate max-w-[200px]">{report.description}</span>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                       <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-label-caps text-[9px] font-bold uppercase tracking-wider ${statusConfig[report.status]}`}>
                          {report.status}
                       </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                       <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-black/[0.05] flex items-center justify-center text-[8px] font-bold font-display uppercase">{report.author[0]}</div>
                          <span className="font-body-sm text-[12px] font-medium text-on-surface opacity-60">{report.author}</span>
                       </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                       <div className="flex items-center gap-2 text-on-surface-variant opacity-60">
                          <Shield size={12} />
                          <span className="font-body-sm text-[12px]">{report.visibility}</span>
                       </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-on-surface-variant opacity-60">
                       <div className="flex items-center gap-2">
                          <Clock size={12} />
                          <span className="font-body-sm text-[12px]">{date}</span>
                       </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right">
                       <div className="flex items-center justify-end gap-3">
                          <button className="p-2 rounded-lg hover:bg-black/5 opacity-0 group-hover:opacity-60 transition-all">
                             <Download size={14} />
                          </button>
                          <ChevronRight size={15} className="text-on-surface-variant opacity-60 group-hover:opacity-100 transition-all" />
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
