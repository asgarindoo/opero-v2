import React, { useState } from "react";
import { useSales } from "../context/SalesContext";
import { X, Clock, User, DollarSign, TrendingUp, FileText, Truck, Package, CheckCircle2, Star } from "lucide-react";
import { SaleStatus, PaymentStatus, SaleType } from "@/features/sales";
import { createInvoice } from "@/features/invoices/services/invoices.client";
import type { Invoice, InvoiceItem } from "@/features/invoices/types";
import Dropdown from "@/components/ui/Dropdown";

function formatCurrency(val: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(val);
}

const STATUSES: SaleStatus[] = ["Pending", "Processing", "Completed", "Cancelled"];

const SALE_TYPE_LABELS: Record<SaleType, string> = {
  "Product Sale": "Product Sale",
  "Service Order": "Service Order",
  "Retail": "Retail",
  "Manual": "Manual Entry",
};

export default function SalesDrawer({ saleId, onClose }: { saleId: string; onClose: () => void }) {
  const { sales, addActivity, updateSale } = useSales();
  const sale = sales.find(s => s.id === saleId);
  const [newNote, setNewNote] = useState("");

  if (!sale) return null;

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    addActivity(sale.id, { type: "note", description: newNote });
    setNewNote("");
  };

  const handleMarkPaid = () => {
    updateSale(sale.id, { paymentStatus: "Paid", status: "Completed" });
  };

  const handleGenerateInvoice = async () => {
    const totalAmount = sale.items.reduce((acc, curr) => acc + curr.subtotal, 0);
    const invoiceItems: InvoiceItem[] = sale.items.map(it => ({
      id: Math.random().toString(36).substring(7),
      description: it.name,
      quantity: it.quantity,
      unitPrice: it.price,
      discount: it.discount,
      amount: it.subtotal
    }));

    const newInvoice: Invoice = {
      id: "inv" + Date.now(),
      invoiceNumber: "INV-" + new Date().getFullYear() + "-" + Math.floor(Math.random() * 1000),
      contactName: sale.contactName,
      contactId: sale.contactId,
      saleId: sale.id,
      saleOrderNumber: sale.orderNumber,
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 14 days
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await createInvoice<Invoice>(newInvoice);
      addActivity(sale.id, { type: "note", description: `Generated invoice ${newInvoice.invoiceNumber}` });
      alert(`Invoice ${newInvoice.invoiceNumber} generated successfully!`);
    } catch (err) {
      console.error("Failed to generate invoice", err);
      alert("Failed to generate invoice");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px] animate-fade-in" onClick={onClose} />

      <div className="relative w-full max-w-[540px] h-full bg-surface-container-lowest shadow-2xl flex flex-col animate-slide-in-right border-l border-black/[0.05]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0 bg-surface-container-lowest z-10 sticky top-0">
          <div className="flex items-center gap-2">
            <div 
              className="px-2 py-1 rounded bg-black/5 font-mono text-[10px] font-bold text-on-surface-variant opacity-70 truncate max-w-[150px] sm:max-w-[200px]"
              title={sale.orderNumber}
            >
              {sale.orderNumber}
            </div>
            <span className="font-label-caps text-[8px] font-bold px-1.5 py-0.5 rounded bg-black/[0.04] text-on-surface-variant opacity-60 uppercase tracking-wide">
              {SALE_TYPE_LABELS[sale.saleType]}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md text-on-surface-variant opacity-70 hover:opacity-100 hover:bg-black/5 transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-8">

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-label-caps text-[8.5px] font-bold px-1.5 py-0.5 rounded bg-black/5 text-on-surface-variant border border-black/[0.03]">
                {sale.status.toUpperCase()}
              </span>
              <span className={`font-label-caps text-[8.5px] font-bold px-1.5 py-0.5 rounded ${sale.paymentStatus === "Paid" ? "bg-emerald-50 text-emerald-700" : sale.paymentStatus === "Unpaid" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"}`}>
                {sale.paymentStatus.toUpperCase()}
              </span>
            </div>
            <h3 
              className="font-display font-bold text-[19px] text-on-surface leading-tight mb-2 break-words break-all line-clamp-3" 
              title={sale.title}
            >
              {sale.title}
            </h3>
            <div className="flex items-center gap-4 text-on-surface-variant opacity-70">
              {sale.contactName && (
                <div className="flex items-center gap-1.5 font-body-sm text-[11.5px]">
                  <User size={13} /> {sale.contactName}
                </div>
              )}
              <div className="flex items-center gap-1.5 font-body-sm text-[11.5px]">
                <Clock size={13} /> {new Date(sale.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Status Flow */}
          <div className="flex items-center w-full mb-6 relative">
            {STATUSES.map((status, idx) => {
              const isActive = sale.status === status;
              const statusIndex = STATUSES.indexOf(sale.status);
              const isPast = idx < statusIndex;

              return (
                <button
                  key={status}
                  onClick={() => updateSale(sale.id, { status })}
                  className={`flex-1 py-1 font-body-sm text-[9.5px] text-left border-b-2 transition-all ${isActive ? "border-on-surface text-on-surface font-semibold" :
                    isPast ? "border-on-surface/20 text-on-surface-variant opacity-60" :
                      "border-black/5 text-on-surface-variant opacity-60 hover:opacity-80"
                    }`}
                >
                  {status}
                </button>
              );
            })}
          </div>

          {/* Mark as Paid CTA */}
          {sale.paymentStatus !== "Paid" && (
            <button
              onClick={handleMarkPaid}
              className="w-full mb-6 py-2.5 rounded-xl bg-on-surface text-surface-container-lowest font-label-caps text-[9px] font-bold tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={13} /> MARK AS PAID — {formatCurrency(sale.total, sale.currency)}
            </button>
          )}

          {sale.paymentStatus === "Paid" && (
            <div className="w-full mb-6 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center gap-2">
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span className="font-label-caps text-[9px] font-bold tracking-widest text-emerald-700">PAYMENT RECEIVED — {formatCurrency(sale.total, sale.currency)}</span>
            </div>
          )}

          <div className="flex justify-end mb-6">
            <button
              onClick={handleGenerateInvoice}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low border border-black/5 hover:bg-black/5 text-on-surface-variant font-label-caps text-[9px] font-bold tracking-wide transition-colors"
            >
              <FileText size={11} /> GENERATE INVOICE
            </button>
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-4 rounded-xl bg-surface-container-low/50 border border-black/[0.03] space-y-1">
              <div className="font-label-caps text-[8.5px] text-on-surface-variant opacity-50 uppercase tracking-wider flex items-center gap-1">
                <DollarSign size={10} /> Subtotal
              </div>
              <div 
                className="font-display font-bold text-[16px] text-on-surface opacity-70 break-all"
                title={formatCurrency(sale.subtotal, sale.currency)}
              >
                {formatCurrency(sale.subtotal, sale.currency)}
              </div>
              {sale.discountTotal > 0 && (
                <div 
                  className="font-body-sm text-[10px] text-red-500 opacity-70 break-all"
                  title={`−${formatCurrency(sale.discountTotal, sale.currency)} discount`}
                >
                  −{formatCurrency(sale.discountTotal, sale.currency)} discount
                </div>
              )}
            </div>
            <div className="p-4 rounded-xl bg-surface-container-low/50 border border-black/[0.03]">
              <div className="font-label-caps text-[8.5px] text-on-surface-variant opacity-50 uppercase tracking-wider mb-1">Total</div>
              <div 
                className="font-display font-bold text-[17px] text-on-surface opacity-90 break-all"
                title={formatCurrency(sale.total, sale.currency)}
              >
                {formatCurrency(sale.total, sale.currency)}
              </div>
            </div>
          </div>

          {/* Line Items */}
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-label-caps text-[9px] text-on-surface-variant opacity-60 uppercase tracking-wider">Line Items</h4>
              <span className="font-body-sm text-[10px] text-on-surface-variant opacity-60">{sale.items.length} item{sale.items.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="space-y-1">
              {sale.items.length === 0 ? (
                <p className="font-body-sm text-[11px] text-on-surface-variant opacity-40">No line items recorded.</p>
              ) : (
                sale.items.map(item => (
                  <div key={item.id} className="flex items-center justify-between py-2.5 px-1 border-b border-black/[0.02]">
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
                    <div className="text-right shrink-0">
                      <p className="font-body-sm font-semibold text-[12px] text-on-surface opacity-80 break-all">{formatCurrency(item.subtotal, sale.currency)}</p>
                      <p className="font-body-sm text-[9px] text-on-surface-variant opacity-60 break-all">{formatCurrency(item.price, sale.currency)} ea</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Activity & Notes */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-label-caps text-[9px] text-on-surface-variant opacity-40 uppercase tracking-wider">Activity Log</h4>
            </div>

            <form onSubmit={handleAddNote} className="mb-6 relative">
              <input
                type="text"
                placeholder="Log a note or operational update..."
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                className="w-full px-0 py-2 border-b border-black/10 bg-transparent focus:border-primary/40 outline-none transition-all font-body-sm text-[12px] placeholder:opacity-60"
              />
              {newNote.trim() && (
                <button type="submit" className="absolute right-0 top-1.5 font-label-caps text-[9px] font-bold text-on-surface">LOG</button>
              )}
            </form>

            <div className="space-y-4">
              {sale.activities.map(activity => {
                const Icon = activity.type === "payment" ? DollarSign : activity.type === "shipping" ? Truck : activity.type === "status_change" ? TrendingUp : FileText;
                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="mt-0.5 opacity-30 text-on-surface-variant"><Icon size={11} /></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-display font-medium text-[12px] text-on-surface opacity-90">{activity.author}</span>
                        <span className="font-body-sm text-[10px] text-on-surface-variant opacity-60">{new Date(activity.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="font-body-sm text-[12px] text-on-surface-variant leading-relaxed opacity-80">{activity.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
