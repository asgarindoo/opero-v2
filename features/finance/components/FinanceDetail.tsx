"use client";

import { useState } from "react";
import { X, Receipt, Download, Share2, Calendar, Filter, ChevronLeft, ChevronRight, MoreHorizontal, Shield, CreditCard, Banknote, Trash2, Edit3, CheckCircle2, AlertCircle, FileText, History } from "lucide-react";
import type { Transaction } from "../types";

interface FinanceDetailProps {
  transaction: Transaction;
  onClose: () => void;
}

export default function FinanceDetail({ transaction, onClose }: FinanceDetailProps) {
  const dateStr = new Date(transaction.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  
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
              <span className={`font-label-caps text-[9px] font-bold uppercase tracking-widest ${transaction.type === 'Income' ? 'text-emerald-600' : 'text-red-600'}`}>
                {transaction.type}
              </span>
              <span className="w-1 h-1 rounded-full bg-black/10" />
              <span className="font-label-caps text-[9px] font-semibold text-on-surface-variant opacity-60 uppercase tracking-widest">Ref: {transaction.reference}</span>
            </div>
            <h1 className="font-display text-[18px] font-semibold text-on-surface tracking-tight">
              {transaction.contactName || "Untitled Transaction"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-black/5 text-on-surface-variant opacity-60 hover:opacity-100 transition-all font-label-caps text-[10px] font-bold uppercase tracking-widest">
              <Share2 size={14} /> Share
           </button>
           <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary font-label-caps text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-xl transition-all">
              <FileText size={14} /> Export Receipt
           </button>
        </div>
      </header>

      {/* Finance Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Transaction Details */}
        <div className="flex-1 overflow-y-auto bg-black/[0.01] p-12">
          <div className="max-w-4xl mx-auto space-y-12">
            
            {/* Amount Summary Card */}
            <div className="p-10 rounded-[32px] bg-white border border-black/[0.03] shadow-sm flex flex-col items-center justify-center text-center">
               <span className="font-label-caps text-[9px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em] mb-4">Total Amount</span>
               <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-display text-[16px] font-medium text-on-surface-variant opacity-60">{transaction.currency}</span>
                  <span className="font-display text-[48px] font-bold text-on-surface tracking-tighter leading-none">
                    {transaction.amount.toLocaleString()}
                  </span>
               </div>
               <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-label-caps text-[9px] font-bold uppercase tracking-wider ${
                 transaction.status === 'Paid' || transaction.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
               }`}>
                  {transaction.status === 'Paid' ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                  {transaction.status}
               </div>
            </div>

            {/* Core Info Grid */}
            <div className="grid grid-cols-2 gap-8">
               <section className="space-y-6">
                  <h4 className="font-label-caps text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em]">Transaction Context</h4>
                  <div className="p-6 rounded-2xl border border-black/[0.04] bg-white/50 space-y-5">
                     <div className="flex items-center justify-between">
                        <span className="font-body-sm text-[12px] text-on-surface-variant opacity-40">Date</span>
                        <span className="font-display text-[13px] font-semibold text-on-surface">{dateStr}</span>
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="font-body-sm text-[12px] text-on-surface-variant opacity-40">Category</span>
                        <span className="font-display text-[13px] font-semibold text-on-surface">{transaction.category}</span>
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="font-body-sm text-[12px] text-on-surface-variant opacity-40">Payment Method</span>
                        <div className="flex items-center gap-2">
                           <CreditCard size={14} className="opacity-60" />
                           <span className="font-display text-[13px] font-semibold text-on-surface">{transaction.paymentMethod}</span>
                        </div>
                     </div>
                  </div>
               </section>

               <section className="space-y-6">
                  <h4 className="font-label-caps text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em]">Compliance & Safety</h4>
                  <div className="p-6 rounded-2xl border border-black/[0.04] bg-white/50 space-y-5">
                     <div className="flex items-center justify-between">
                        <span className="font-body-sm text-[12px] text-on-surface-variant opacity-40">Reference</span>
                        <span className="font-display text-[13px] font-semibold text-on-surface select-all">{transaction.reference}</span>
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="font-body-sm text-[12px] text-on-surface-variant opacity-40">Verification</span>
                        <div className="flex items-center gap-1.5 text-emerald-600 font-label-caps text-[9px] font-bold uppercase">
                           <Shield size={12} /> SECURE
                        </div>
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="font-body-sm text-[12px] text-on-surface-variant opacity-40">Internal ID</span>
                        <span className="font-display text-[11px] text-on-surface-variant opacity-60">{transaction.id}</span>
                     </div>
                  </div>
               </section>
            </div>

            {/* Notes Section */}
            <section className="space-y-6">
               <h4 className="font-label-caps text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em]">Operational Notes</h4>
               <div className="p-8 rounded-2xl border border-black/[0.04] bg-white/50">
                  <p className="font-body-md text-[14px] text-on-surface-variant leading-relaxed italic">
                     {transaction.notes || "No additional notes provided for this transaction."}
                  </p>
               </div>
            </section>
          </div>
        </div>

        {/* Right Sidebar: Timeline & Audit */}
        <aside className="w-[340px] bg-white/20 backdrop-blur-xl border-l border-black/[0.04] flex flex-col">
           <div className="p-8 space-y-12 overflow-y-auto">
              {/* Audit Timeline */}
              <section className="space-y-8">
                 <div className="flex items-center justify-between">
                    <h4 className="font-label-caps text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em]">Transaction Audit</h4>
                    <History size={14} className="opacity-60" />
                 </div>
                 
                 <div className="space-y-8 relative">
                    <div className="absolute left-[7px] top-2 bottom-2 w-[1px] bg-black/[0.05]" />
                    {transaction.activities.map((act, idx) => (
                      <div key={act.id} className="relative flex gap-4 pl-6 group">
                         <div className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-background bg-black/5 group-hover:bg-primary transition-colors z-10" />
                         <div className="space-y-1">
                            <p className="font-display text-[12px] font-semibold text-on-surface leading-tight">{act.description}</p>
                            <div className="flex items-center gap-2 opacity-60">
                               <span className="font-label-caps text-[8px] font-bold uppercase">{act.author}</span>
                               <span className="w-1 h-1 rounded-full bg-current" />
                               <span className="text-[10px] font-medium">{new Date(act.timestamp).toLocaleDateString()}</span>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </section>

              {/* Attachments */}
              <section className="pt-10 border-t border-black/[0.04] space-y-6">
                 <h4 className="font-label-caps text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em]">Linked Resources</h4>
                 {transaction.attachments.length > 0 ? (
                    <div className="space-y-3">
                       {transaction.attachments.map((file, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white border border-black/[0.03] hover:border-primary/20 cursor-pointer transition-all">
                             <FileText size={14} className="opacity-60" />
                             <span className="font-display text-[12px] text-on-surface truncate">{file}</span>
                          </div>
                       ))}
                    </div>
                 ) : (
                    <p className="font-body-sm text-[11px] text-on-surface-variant opacity-60 italic">No attachments found.</p>
                 )}
              </section>
           </div>

           <div className="mt-auto p-6 border-t border-black/[0.04] space-y-3">
              <button className="w-full py-3 rounded-xl border border-black/[0.06] font-label-caps text-[10px] font-bold text-on-surface-variant opacity-60 hover:opacity-100 hover:bg-black/5 transition-all uppercase tracking-widest">
                 Reject Transaction
              </button>
              <button className="w-full py-3 rounded-xl bg-primary text-on-primary font-label-caps text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-xl transition-all">
                 Approve & Close
              </button>
           </div>
        </aside>
      </div>
    </div>
  );
}
