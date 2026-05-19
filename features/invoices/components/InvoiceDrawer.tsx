import React, { useState } from "react";
import { useInvoices } from "../context/InvoicesContext";
import { X, Building2, Clock, Tag, User, CheckCircle2, ChevronRight, MessageSquare, Briefcase, Star, DollarSign, ListTodo, CalendarClock, MoreHorizontal, TrendingUp, Layers, Paperclip, FileText, Download, Printer, Mail, Share2, History, AlertCircle } from "lucide-react";
import { InvoiceStatus, InvoiceActivity } from "../types";

function formatCurrency(val: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(val);
}

const STATUSES: InvoiceStatus[] = ["Draft", "Unpaid", "Paid", "Overdue", "Cancelled"];

export default function InvoiceDrawer({ invoiceId, onClose }: { invoiceId: string, onClose: () => void }) {
  const { invoices, updateInvoice, markAsPaid } = useInvoices();
  const inv = invoices.find(i => i.id === invoiceId);

  if (!inv) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px] animate-fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-[620px] h-full bg-surface-container-lowest shadow-2xl flex flex-col animate-slide-in-right border-l border-black/[0.05]">
        {/* Header Actions */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0 bg-surface-container-lowest z-10 sticky top-0 border-b border-black/[0.02]">
          <div className="flex items-center gap-4">
             <div className="px-2 py-1 rounded bg-black/5 font-mono text-[10px] font-bold text-on-surface-variant opacity-60">
               {inv.invoiceNumber}
             </div>
             <div className="flex items-center gap-1">
                <button className="p-1.5 rounded-md hover:bg-black/5 text-on-surface-variant transition-colors" title="Download PDF"><Download size={14} /></button>
                <button className="p-1.5 rounded-md hover:bg-black/5 text-on-surface-variant transition-colors" title="Print"><Printer size={14} /></button>
                <button className="p-1.5 rounded-md hover:bg-black/5 text-on-surface-variant transition-colors" title="Send via Email"><Mail size={14} /></button>
             </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md text-on-surface-variant opacity-70 hover:opacity-100 hover:bg-black/5 transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 pb-12 pt-6">
          
          <div className="mb-10 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className={`font-label-caps text-[9px] font-bold px-2 py-0.5 rounded bg-black/5 border border-black/[0.03] ${inv.status === "Paid" ? "text-on-surface opacity-90" : inv.status === "Overdue" ? "text-red-600" : "text-on-surface opacity-60"}`}>
                  {inv.status.toUpperCase()}
                </span>
                <span className="font-body-sm text-[11px] text-on-surface-variant opacity-60">Issue Date: {new Date(inv.issueDate).toLocaleDateString()}</span>
              </div>
              <h3 className="font-display font-bold text-[24px] text-on-surface leading-tight mb-1">{inv.contactName}</h3>
              <p className="font-body-sm text-[12px] text-on-surface-variant opacity-60 flex items-center gap-2">
                <CalendarClock size={12} /> Due on {new Date(inv.dueDate).toLocaleDateString()}
              </p>
            </div>
            {inv.status !== "Paid" && (
              <button 
                onClick={() => markAsPaid(inv.id)}
                className="px-4 py-2 rounded-xl bg-on-surface text-surface-container-lowest font-label-caps text-[9px] font-bold tracking-wide hover:opacity-90 transition-opacity"
              >
                MARK AS PAID
              </button>
            )}
          </div>

          {/* Itemized Table */}
          <section className="mb-8 overflow-hidden rounded-xl border border-black/[0.03]">
             <table className="w-full text-left border-collapse">
               <thead className="bg-surface-container-low/50 border-b border-black/[0.03]">
                 <tr>
                   <th className="px-4 py-2.5 font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">Description</th>
                   <th className="px-3 py-2.5 font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest text-center">Qty</th>
                   <th className="px-3 py-2.5 font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest text-right">Price</th>
                   <th className="px-4 py-2.5 font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest text-right">Total</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-black/[0.02]">
                 {inv.items.map(item => (
                   <tr key={item.id}>
                     <td className="px-4 py-3 font-body-sm text-[12px] text-on-surface opacity-80">{item.description}</td>
                     <td className="px-3 py-3 font-body-sm text-[12px] text-on-surface opacity-60 text-center">{item.quantity}</td>
                     <td className="px-3 py-3 font-body-sm text-[12px] text-on-surface opacity-60 text-right">{formatCurrency(item.unitPrice, inv.currency)}</td>
                     <td className="px-4 py-3 font-display font-medium text-[12px] text-on-surface opacity-90 text-right">{formatCurrency(item.amount, inv.currency)}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </section>

          {/* Financial Summary */}
          <div className="flex justify-end mb-10">
            <div className="w-[240px] space-y-2">
               <div className="flex justify-between items-center px-1">
                 <span className="font-body-sm text-[12px] text-on-surface-variant opacity-60">Subtotal</span>
                 <span className="font-body-sm text-[12px] text-on-surface opacity-80">{formatCurrency(inv.subtotal, inv.currency)}</span>
               </div>
               <div className="flex justify-between items-center px-1">
                 <span className="font-body-sm text-[12px] text-on-surface-variant opacity-60">Tax (10%)</span>
                 <span className="font-body-sm text-[12px] text-on-surface opacity-80">{formatCurrency(inv.taxTotal, inv.currency)}</span>
               </div>
               {inv.discountTotal > 0 && (
                 <div className="flex justify-between items-center px-1 text-red-500">
                   <span className="font-body-sm text-[12px] opacity-60">Discount</span>
                   <span className="font-body-sm text-[12px] opacity-80">-{formatCurrency(inv.discountTotal, inv.currency)}</span>
                 </div>
               )}
               <div className="h-px bg-black/5 my-2" />
               <div className="flex justify-between items-center px-1 pt-1">
                 <span className="font-display font-bold text-[14px] text-on-surface opacity-90">Total Amount</span>
                 <span className="font-display font-bold text-[18px] text-on-surface">{formatCurrency(inv.totalAmount, inv.currency)}</span>
               </div>
            </div>
          </div>

          <div className="w-full h-px bg-black/5 mb-8" />

          {/* Notes & Activity */}
          <div className="grid grid-cols-2 gap-8 mb-8">
             <section>
                 <h4 className="font-label-caps text-[9px] text-on-surface-variant opacity-60 uppercase tracking-wider mb-3">Invoice Notes</h4>
                <div className="p-3 rounded-lg bg-surface-container-low/30 border border-black/[0.02] font-body-sm text-[11.5px] text-on-surface-variant opacity-70 leading-relaxed">
                  {inv.notes || "No special instructions."}
                </div>
             </section>
             <section>
                 <h4 className="font-label-caps text-[9px] text-on-surface-variant opacity-60 uppercase tracking-wider mb-3">Billing Timeline</h4>
                <div className="space-y-4">
                   {inv.activities.map(activity => {
                     const Icon = activity.type === "payment" ? CheckCircle2 : activity.type === "reminder" ? AlertCircle : History;
                     return (
                       <div key={activity.id} className="flex gap-2.5">
                          <div className="mt-0.5 opacity-60"><Icon size={11} /></div>
                          <div>
                            <div className="flex justify-between items-center gap-4 mb-0.5">
                               <p className="font-display font-medium text-[11px] text-on-surface opacity-90 leading-none">{activity.description}</p>
                               <span className="font-body-sm text-[9px] text-on-surface-variant opacity-60 shrink-0">{new Date(activity.timestamp).toLocaleDateString()}</span>
                            </div>
                            <p className="font-body-sm text-[10px] text-on-surface-variant opacity-60">by {activity.author}</p>
                          </div>
                       </div>
                     )
                   })}
                </div>
             </section>
          </div>
          
        </div>
      </div>
    </div>
  );
}
