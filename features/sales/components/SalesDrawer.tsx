"use client";

import React, { useState } from "react";
import { useSales } from "../context/SalesContext";
import { X, Clock, User, DollarSign, Euro, PoundSterling, JapaneseYen, TrendingUp, FileText, Truck, Package, CheckCircle2, Trash2, MessageSquare } from "lucide-react";
import { SaleStatus, SaleType } from "@/features/sales";
import { createInvoice } from "@/features/invoices/services/invoices.client";
import type { Invoice, InvoiceItem } from "@/features/invoices/types";

import Drawer from "@/components/ui/Drawer";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Dropdown from "@/components/ui/Dropdown";
import { useTenant } from "@/components/providers/TenantProvider";

function formatCurrency(val: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(val);
}

function CurrencyIcon({ currency, size = 10 }: { currency: string, size?: number }) {
  switch (currency.toUpperCase()) {
    case "EUR": return <Euro size={size} />;
    case "GBP": return <PoundSterling size={size} />;
    case "JPY": return <JapaneseYen size={size} />;
    case "USD":
    default:
      return <DollarSign size={size} />;
  }
}

const STATUSES: SaleStatus[] = ["Pending", "Processing", "Completed", "Cancelled"];

const SALE_TYPE_LABELS: Record<SaleType, string> = {
  "Product Sale": "Product Sale",
  "Service Order": "Service Order",
  "Retail": "Retail",
  "Manual": "Manual Entry",
};

function Section({ label, count, children, defaultOpen = true }: { label: string; count?: number; children: React.ReactNode; defaultOpen?: boolean }) {
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

export default function SalesDrawer({ saleId, onClose }: { saleId: string; onClose: () => void }) {
  const { sales, addActivity, updateSale } = useSales();
  const { user } = useTenant();
  const sale = sales.find(s => s.id === saleId);
  const [newNote, setNewNote] = useState("");
  const [tab, setTab] = useState<"details" | "activity">("details");

  if (!sale) return null;

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    addActivity(sale.id, { 
      type: "note", 
      description: newNote
    });
    setNewNote("");
  };

  const handleMarkPaid = () => {
    updateSale(sale.id, { paymentStatus: "Paid", status: "Completed" });
    addActivity(sale.id, { type: "payment", description: "marked sale as Paid and Completed" });
  };

  const handleGenerateInvoice = async () => {
    const issuedAt = new Date();
    const dueAt = new Date(issuedAt);
    dueAt.setDate(dueAt.getDate() + 14);
    const totalAmount = sale.items.reduce((acc, curr) => acc + curr.subtotal, 0);
    const invoiceItems: InvoiceItem[] = sale.items.map(it => ({
      id: crypto.randomUUID(),
      description: it.name,
      quantity: it.quantity,
      unitPrice: it.price,
      discount: it.discount,
      amount: it.subtotal
    }));

    const newInvoice: Invoice = {
      id: `inv-${crypto.randomUUID()}`,
      invoiceNumber: `INV-${issuedAt.getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      contactName: sale.contactName,
      contactId: sale.contactId,
      saleId: sale.id,
      saleOrderNumber: sale.orderNumber,
      issueDate: issuedAt.toISOString().split("T")[0],
      dueDate: dueAt.toISOString().split("T")[0],
      status: "Unpaid",
      items: invoiceItems,
      subtotal: totalAmount,
      taxTotal: 0,
      discountTotal: sale.discountTotal,
      totalAmount: sale.total,
      currency: "USD",
      notes: "Auto-generated from sale " + sale.orderNumber,
      activities: [],
      attachments: [],
      createdAt: issuedAt.toISOString(),
      updatedAt: issuedAt.toISOString(),
    };

    try {
      await createInvoice<Invoice>(newInvoice);
      addActivity(sale.id, { type: "status_change", description: `generated invoice ${newInvoice.invoiceNumber}` });
      alert(`Invoice ${newInvoice.invoiceNumber} generated successfully!`);
    } catch (err) {
      console.error("Failed to generate invoice", err);
      alert("Failed to generate invoice");
    }
  };

  return (
    <Drawer
      isOpen={true}
      onClose={onClose}
      title={sale.orderNumber}
      size="sm"
      footer={(
        <div className="flex items-center justify-end w-full">
          <Button variant="ghost" size="sm" onClick={onClose}>CLOSE</Button>
        </div>
      )}
    >
      <div className="space-y-8">
        {/* Title & Top Meta */}
        <div className="space-y-2">
          <h1
            className="font-display text-[22px] font-bold text-on-surface tracking-tight break-words break-all line-clamp-3"
            title={sale.title}
          >
            {sale.title}
          </h1>
          <div className="flex items-center gap-2">
            <Badge variant={sale.status === "Completed" ? "success" : sale.status === "Cancelled" ? "error" : "warning"}>{sale.status}</Badge>
            <Badge variant={sale.paymentStatus === "Paid" ? "success" : sale.paymentStatus === "Unpaid" ? "error" : "warning"}>{sale.paymentStatus}</Badge>
            <span className="font-label-caps text-[9px] font-bold text-on-surface-variant opacity-30">{SALE_TYPE_LABELS[sale.saleType]}</span>
          </div>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-4 py-4 border-y border-black/[0.04]">
          <div className="space-y-1">
             <span className="font-label-caps text-[8px] font-bold text-on-surface-variant opacity-30 uppercase tracking-widest">Customer</span>
             <div className="font-body-sm text-[12px] text-on-surface flex items-center gap-1.5"><User size={13}/> {sale.contactName || "Walk-in Customer"}</div>
          </div>
          <div className="space-y-1">
             <span className="font-label-caps text-[8px] font-bold text-on-surface-variant opacity-30 uppercase tracking-widest">Date</span>
             <div className="font-body-sm text-[12px] text-on-surface flex items-center gap-1.5"><Clock size={13}/> {new Date(sale.createdAt).toLocaleDateString()}</div>
          </div>
        </div>

        {/* Tabs for Details/Activity */}
        <div className="flex gap-6 border-b border-black/[0.04]">
          {(["details", "activity"] as const).map(t => (
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

              <Section label="Properties">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                     <span className="font-label-caps text-[9px] font-bold text-on-surface-variant opacity-40 uppercase tracking-widest">Status</span>
                     <Dropdown 
                       value={sale.status}
                       options={STATUSES.map(s => ({ value: s, label: s }))}
                       onChange={val => {
                         updateSale(sale.id, { status: val as SaleStatus });
                         addActivity(sale.id, { type: "status_change", description: `changed status to ${val}` });
                       }}
                     />
                   </div>
                   <div className="space-y-1.5">
                     <span className="font-label-caps text-[9px] font-bold text-on-surface-variant opacity-40 uppercase tracking-widest">Payment</span>
                     <Dropdown 
                       value={sale.paymentStatus}
                       options={["Paid", "Unpaid", "Partial"].map(s => ({ value: s, label: s }))}
                       onChange={val => {
                         updateSale(sale.id, { paymentStatus: val as any });
                         addActivity(sale.id, { type: "payment", description: `changed payment status to ${val}` });
                       }}
                     />
                   </div>
                </div>
              </Section>

              {/* Financial Actions */}
              <Section label="Financials">
                 <div className="space-y-4">
                    {/* Financial Summary - Cleaner List View */}
                    <div className="space-y-2 py-2 px-1">
                      <div className="flex justify-between items-center font-body-sm text-[12px] text-on-surface-variant">
                        <span className="flex items-center gap-1.5"><CurrencyIcon currency={sale.currency} size={11} /> Subtotal</span>
                        <span className="font-medium text-on-surface">{formatCurrency(sale.subtotal, sale.currency)}</span>
                      </div>
                      {sale.discountTotal > 0 && (
                        <div className="flex justify-between items-center font-body-sm text-[12px] text-red-500/80">
                          <span>Discount</span>
                          <span className="font-medium">−{formatCurrency(sale.discountTotal, sale.currency)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2 mt-1 border-t border-black/[0.04]">
                        <span className="font-label-caps text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Total</span>
                        <span className="font-display text-[16px] font-bold text-on-surface">{formatCurrency(sale.total, sale.currency)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                       {sale.paymentStatus !== "Paid" && (
                         <Button variant="primary" className="flex-1" icon={CheckCircle2} onClick={handleMarkPaid}>
                           MARK PAID
                         </Button>
                       )}
                       {sale.paymentStatus === "Paid" && (
                         <div className="flex-1 px-4 py-2 flex items-center justify-center gap-2 rounded-[6px] font-semibold text-[12px] font-display bg-emerald-50 border border-emerald-200 text-emerald-700">
                           <CheckCircle2 size={14} className="text-emerald-600" />
                           <span className="font-label-caps text-[10px] tracking-widest mt-[1px]">PAID</span>
                         </div>
                       )}
                       <Button variant="secondary" className="flex-1" icon={FileText} onClick={handleGenerateInvoice}>
                         INVOICE
                       </Button>
                    </div>
                 </div>
              </Section>

              <Section label="Line Items" count={sale.items.length}>
                <div className="space-y-1">
                  {sale.items.length === 0 ? (
                    <p className="font-body-sm text-[11px] text-on-surface-variant opacity-40">No line items recorded.</p>
                  ) : (
                    sale.items.map(item => (
                      <div key={item.id} className="flex items-center justify-between py-2.5 px-1 border-b border-black/[0.02] last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded bg-black/5 flex items-center justify-center text-on-surface-variant opacity-60">
                            <Package size={12} />
                          </div>
                          <div>
                            <p className="font-display font-medium text-[12.5px] text-on-surface opacity-90">{item.name}</p>
                            <p className="font-body-sm text-[10px] text-on-surface-variant opacity-50 flex items-center gap-2">
                              {item.sku && <span>SKU: {item.sku}</span>}
                              {item.sku && <span>•</span>}
                              <span>Qty: {item.quantity}</span>
                              {item.discount > 0 && <span>• {item.discount}% off</span>}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 min-w-[60px]">
                          <p className="font-body-sm font-semibold text-[12px] text-on-surface opacity-80 truncate" title={formatCurrency(item.subtotal, sale.currency)}>
                            {formatCurrency(item.subtotal, sale.currency)}
                          </p>
                          <p className="font-body-sm text-[9px] text-on-surface-variant opacity-60 truncate">{formatCurrency(item.price, sale.currency)} ea</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Section>

              <Section label="Notes" count={sale.activities.filter(a => a.type === 'note').length}>
                <div className="space-y-6">
                  {sale.activities.filter(a => a.type === 'note').map(c => (
                     <div key={c.id} className="flex gap-4 group">
                        <div className="w-8 h-8 rounded-full bg-black/[0.04] border border-black/[0.04] flex items-center justify-center font-bold text-[10px] text-on-surface-variant shrink-0">
                           {c.author ? c.author.substring(0, 2).toUpperCase() : "U"}
                        </div>
                        <div className="flex-1 space-y-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                               <span className="font-display text-[13px] font-bold">{c.author || "User"}</span>
                               <span className="text-[10px] text-on-surface-variant opacity-30">{new Date(c.timestamp).toLocaleString()}</span>
                            </div>
                          </div>
                          <p className="font-display text-[13px] text-on-surface-variant/80 leading-relaxed break-words break-all whitespace-pre-wrap">{c.description}</p>
                        </div>
                     </div>
                  ))}

                  <div className="pt-4 border-t border-black/[0.04]">
                     <div className="flex gap-4">
                       {user?.image ? (
                         <img src={user.image} className="w-8 h-8 rounded-full object-cover shrink-0" alt="" />
                       ) : (
                         <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-[10px] text-on-primary shrink-0">
                           {(user?.name || "U").substring(0, 2).toUpperCase()}
                         </div>
                       )}
                       <div className="flex-1 space-y-2">
                         <textarea
                           rows={2}
                           placeholder="Add a note, update, or log activity..."
                           value={newNote}
                           onChange={e => setNewNote(e.target.value)}
                           onKeyDown={e => {
                             if (e.key === "Enter" && !e.shiftKey) {
                               e.preventDefault();
                               handleAddNote();
                             }
                           }}
                           className="w-full bg-black/[0.02] border border-black/[0.06] rounded-[8px] p-3 font-display text-[13px] outline-none focus:bg-white focus:border-primary/30 transition-all"
                         />
                         <div className="flex items-center justify-end">
                           <Button
                             variant="primary"
                             size="sm"
                             disabled={!newNote.trim()}
                             onClick={handleAddNote}
                           >
                             POST NOTE
                           </Button>
                         </div>
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
              {[...sale.activities].reverse().map(a => {
                const Icon = a.type === "payment" ? DollarSign : a.type === "shipping" ? Truck : a.type === "status_change" ? TrendingUp : a.type === "note" ? MessageSquare : FileText;
                return (
                  <div key={a.id} className="relative flex items-start gap-4">
                    <div className="absolute -left-[14px] top-1.5 w-2 h-2 rounded-full bg-black/[0.1] border-2 border-white" />
                    <div className="flex-1 space-y-0.5">
                      <p className="font-display text-[12.5px] text-on-surface-variant/80">
                        <span className="font-bold text-on-surface">{a.author || "System"}</span>
                        {' '}
                        {a.type === 'note' ? (
                          <>
                            added a note
                            <span className="whitespace-pre-wrap block mt-1 font-normal opacity-90 text-on-surface">
                              {a.description}
                            </span>
                          </>
                        ) : (
                          <>{a.description}</>
                        )}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <Clock size={10} className="opacity-20" />
                        <span className="text-[10px] text-on-surface-variant opacity-30">{new Date(a.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}
