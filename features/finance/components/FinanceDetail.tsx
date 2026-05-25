"use client";

import { X, Trash2, ArrowUpRight, ArrowDownLeft, RotateCcw } from "lucide-react";
import type { Transaction } from "@/features/finance";

interface FinanceDetailProps {
  transaction: Transaction;
  onClose: () => void;
  onDelete: () => void;
}

export default function FinanceDetail({ transaction, onClose, onDelete }: FinanceDetailProps) {
  const txDateStr = transaction.transactionDate || (transaction as any).date || transaction.createdAt || new Date().toISOString();
  const dateStr = new Date(txDateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  
  const createdDateStr = transaction.createdAt ? new Date(transaction.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }) : "-";
  const updatedDateStr = transaction.updatedAt ? new Date(transaction.updatedAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }) : "-";

  return (
    <div className="flex-1 flex flex-col h-full bg-white animate-fade-in overflow-hidden selection:bg-black/10">
      {/* Header */}
      <header className="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-black/5 transition-all text-zinc-500 hover:text-zinc-900"
          >
            <X size={18} />
          </button>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-sm font-display text-[10px] font-medium tracking-wide text-zinc-600 bg-zinc-100 uppercase">
                Transaction
              </span>
              {transaction.status === 'Completed' ? (
                <span className="px-2 py-0.5 rounded-sm font-display text-[10px] font-semibold tracking-wide text-emerald-800 bg-emerald-50 border border-emerald-100 uppercase">
                  Completed
                </span>
              ) : transaction.status === 'Cancelled' ? (
                <span className="px-2 py-0.5 rounded-sm font-display text-[10px] font-semibold tracking-wide text-red-800 bg-red-50 border border-red-100 uppercase">
                  Cancelled
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-sm font-display text-[10px] font-semibold tracking-wide text-amber-800 bg-amber-50 border border-amber-100 uppercase">
                  Pending
                </span>
              )}
              <span className="font-display text-[11px] font-medium text-zinc-300">/</span>
              <span className="font-display text-[11px] font-medium text-zinc-500">{(transaction.reference || transaction.id).toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onDelete}
            className="p-1.5 rounded hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-all"
            title="Delete Transaction"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </header>

      {/* Main Content Split */}
      <div className="flex-1 flex overflow-hidden lg:flex-row flex-col">
        {/* Left Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 bg-white custom-scrollbar">
          <div className="max-w-3xl mx-auto space-y-12">

            {/* Header Content & Amount */}
            <div className="space-y-6">
              <h1 className="font-display text-[32px] font-semibold text-zinc-900 tracking-tight leading-tight">
                {transaction.title || "Untitled Transaction"}
              </h1>

              <div className="flex items-baseline gap-2">
                <span className="font-display text-[24px] font-medium text-zinc-400 shrink-0">{transaction.currency || "USD"}</span>
                <span 
                  className="font-display text-[48px] font-bold text-zinc-900 tracking-tighter leading-none truncate"
                  title={transaction.amount.toLocaleString()}
                >
                  {transaction.amount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Notes / Context */}
            <div className="space-y-3">
              <h2 className="font-display text-[11px] font-medium text-zinc-400 tracking-wide uppercase border-b border-black/[0.06] pb-2">
                Operational Notes
              </h2>
              <p className="font-display text-[15px] text-zinc-800 font-medium leading-relaxed max-w-2xl whitespace-pre-wrap">
                {transaction.notes ? transaction.notes : <span className="text-zinc-400 italic font-normal">No additional notes provided.</span>}
              </p>
            </div>

          </div>
        </div>

        {/* Right Sidebar */}
        <aside className="w-full lg:w-[280px] bg-[#F9F9F9] border-t lg:border-t-0 lg:border-l border-black/[0.06] flex flex-col justify-between overflow-y-auto custom-scrollbar shrink-0">
          <div className="p-6 space-y-8">

            {/* Details */}
            <section>
              <h4 className="font-display text-[11px] font-medium text-zinc-400 tracking-wide uppercase mb-4 border-b border-black/[0.06] pb-2">Operational Info</h4>
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <span className="font-display text-[12px] text-zinc-500 w-24 shrink-0">Type</span>
                  <div className="flex items-center gap-1.5 font-display text-[13px] font-medium text-zinc-900">
                    {transaction.type === 'Income' && <ArrowDownLeft size={14} className="text-emerald-600" />}
                    {transaction.type === 'Expense' && <ArrowUpRight size={14} className="text-red-600" />}
                    {transaction.type === 'Refund' && <RotateCcw size={14} className="text-amber-600" />}
                    {transaction.type}
                  </div>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="font-display text-[12px] text-zinc-500 w-24 shrink-0">Date</span>
                  <span className="font-display text-[13px] font-medium text-zinc-900 text-right">
                    {dateStr}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="font-display text-[12px] text-zinc-500 w-24 shrink-0">Category</span>
                  <span className="font-display text-[13px] font-medium text-zinc-900 text-right break-words">
                    {transaction.category || "-"}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="font-display text-[12px] text-zinc-500 w-24 shrink-0">Method</span>
                  <span className="font-display text-[13px] font-medium text-zinc-900 text-right">
                    {transaction.paymentMethod || "-"}
                  </span>
                </div>
                {transaction.contactName && (
                  <div className="flex items-start justify-between gap-4">
                    <span className="font-display text-[12px] text-zinc-500 w-24 shrink-0">Contact</span>
                    <span className="font-display text-[13px] font-medium text-zinc-900 text-right break-words">
                      {transaction.contactName}
                    </span>
                  </div>
                )}
              </div>
            </section>

            {/* System Metadata */}
            <section>
              <h4 className="font-display text-[11px] font-medium text-zinc-400 tracking-wide uppercase mb-4 border-b border-black/[0.06] pb-2">System Metadata</h4>
              <div className="space-y-4">
                {transaction.sourceType && transaction.sourceType !== "Manual" && (
                  <div className="flex items-start justify-between gap-4">
                    <span className="font-display text-[12px] text-zinc-500 w-24 shrink-0">Generated By</span>
                    <span className="font-display text-[13px] font-medium text-zinc-900 text-right">
                      {transaction.sourceType}
                    </span>
                  </div>
                )}
                <div className="flex items-start justify-between gap-4">
                  <span className="font-display text-[12px] text-zinc-500 w-24 shrink-0">Created</span>
                  <span className="font-display text-[11px] font-medium text-zinc-600 text-right">
                    {createdDateStr}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="font-display text-[12px] text-zinc-500 w-24 shrink-0">Last Updated</span>
                  <span className="font-display text-[11px] font-medium text-zinc-600 text-right">
                    {updatedDateStr}
                  </span>
                </div>
              </div>
            </section>

          </div>
        </aside>
      </div>
    </div>
  );
}
