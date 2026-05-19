"use client";

import { useState } from "react";
import { X, FileText, Download, Share2, Star, Trash2, Clock, User, Shield, Info, MoreHorizontal, ChevronLeft, Eye, ExternalLink } from "lucide-react";
import { useDocuments } from "../context/DocumentsContext";

interface DocumentDetailProps {
  fileId: string;
  onClose: () => void;
}

export default function DocumentDetail({ fileId, onClose }: DocumentDetailProps) {
  const { files, deleteFiles, updateFile } = useDocuments();
  const file = files.find(f => f.id === fileId);

  if (!file) return null;

  const dateStr = new Date(file.updatedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="flex-1 flex flex-col h-full bg-background animate-fade-in overflow-hidden">
      {/* Header */}
      <header className="px-8 py-5 border-b border-black/[0.05] flex items-center justify-between bg-white/60 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-6">
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-black/5 transition-all text-on-surface-variant opacity-40 hover:opacity-100"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="h-8 w-px bg-black/[0.05]" />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-label-caps text-[9px] font-bold text-primary uppercase tracking-widest">{file.type}</span>
              <span className="w-1 h-1 rounded-full bg-black/10" />
              <span className="font-label-caps text-[9px] font-semibold text-on-surface-variant opacity-30 uppercase tracking-widest">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
            <h1 className="font-display text-[18px] font-semibold text-on-surface tracking-tight">{file.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-black/5 text-on-surface-variant opacity-60 hover:opacity-100 transition-all font-label-caps text-[10px] font-bold uppercase tracking-widest">
              <Share2 size={14} /> Share
           </button>
           <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary font-label-caps text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-xl transition-all">
              <Download size={14} /> Download
           </button>
        </div>
      </header>

      {/* Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Preview Area */}
        <div className="flex-1 overflow-y-auto bg-black/[0.02] p-12 flex items-center justify-center">
           <div className="w-full max-w-4xl aspect-[3/4] bg-white border border-black/[0.05] rounded-2xl shadow-2xl flex flex-col items-center justify-center text-center p-20">
              <div className="w-24 h-24 rounded-3xl bg-primary/5 flex items-center justify-center text-primary mb-8">
                 <FileText size={48} />
              </div>
              <h2 className="font-display text-[24px] font-bold text-on-surface mb-4">{file.name}</h2>
              <p className="font-body-md text-[14px] text-on-surface-variant opacity-60 leading-relaxed max-w-md">
                 Preview is currently unavailable for this file type. You can download the file to view its full content.
              </p>
              <div className="flex items-center gap-4 mt-12">
                 <button className="flex items-center gap-2 px-6 py-3 rounded-xl border border-black/[0.08] hover:bg-black/[0.02] transition-all font-label-caps text-[11px] font-bold uppercase tracking-widest">
                    <ExternalLink size={16} /> Open in New Tab
                 </button>
              </div>
           </div>
        </div>

        {/* Info Sidebar */}
        <aside className="w-[340px] bg-white/20 backdrop-blur-xl border-l border-black/[0.04] p-8 space-y-12">
           <section className="space-y-6">
              <h4 className="font-label-caps text-[10px] font-bold text-on-surface-variant opacity-30 uppercase tracking-[0.2em]">Document Info</h4>
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="font-body-sm text-[12px] text-on-surface-variant opacity-40">Owner</span>
                    <span className="font-display text-[12px] font-semibold text-on-surface">{file.author}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="font-body-sm text-[12px] text-on-surface-variant opacity-40">Modified</span>
                    <span className="font-display text-[12px] font-semibold text-on-surface">{dateStr}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="font-body-sm text-[12px] text-on-surface-variant opacity-40">Permissions</span>
                    <div className="flex items-center gap-1 text-emerald-600 font-label-caps text-[9px] font-bold">
                       <Shield size={10} /> Full Access
                    </div>
                 </div>
              </div>
           </section>

           <section className="pt-10 border-t border-black/[0.04] space-y-6">
              <h4 className="font-label-caps text-[10px] font-bold text-on-surface-variant opacity-30 uppercase tracking-[0.2em]">Metadata Tags</h4>
              <div className="flex flex-wrap gap-2">
                 {file.tags?.map(tag => (
                   <span key={tag} className="px-2 py-1 rounded bg-black/[0.04] text-on-surface-variant font-label-caps text-[8px] font-bold uppercase tracking-widest">{tag}</span>
                 ))}
                 <button className="px-2 py-1 rounded border border-dashed border-black/[0.1] text-on-surface-variant opacity-30 hover:opacity-100 font-label-caps text-[8px] font-bold uppercase">+</button>
              </div>
           </section>

           <section className="pt-10 border-t border-black/[0.04] space-y-6">
              <h4 className="font-label-caps text-[10px] font-bold text-on-surface-variant opacity-30 uppercase tracking-[0.2em]">Recent Logs</h4>
              <div className="space-y-5">
                 {file.activities.slice(0, 3).map(act => (
                   <div key={act.id} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" />
                      <div>
                         <p className="font-body-sm text-[12px] text-on-surface">{act.description} by <span className="font-bold">{act.author}</span></p>
                         <span className="text-[10px] opacity-30">{new Date(act.timestamp).toLocaleDateString()}</span>
                      </div>
                   </div>
                 ))}
              </div>
           </section>

           <div className="mt-auto pt-10 border-t border-black/[0.04]">
              <button 
                onClick={() => {
                  deleteFiles([file.id]);
                  onClose();
                }}
                className="w-full py-3 rounded-xl border border-red-500/10 text-red-500 font-label-caps text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 transition-all"
              >
                 Move to Trash
              </button>
           </div>
        </aside>
      </div>
    </div>
  );
}
