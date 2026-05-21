"use client";

import React, { useState } from "react";
import { useInvoices } from "../context/InvoicesContext";
import { User, Calendar, Plus, Trash2, FileText, Hash } from "lucide-react";
import { InvoiceItem } from "@/features/invoices";
import OperationModal from "@/components/ui/OperationModal";
import OperationInput from "@/components/ui/OperationInput";
import OperationTextarea from "@/components/ui/OperationTextarea";

export default function AddInvoiceModal({ onClose }: { onClose: () => void }) {
  const { addInvoice } = useInvoices();
  const [contactName, setContactName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState(() => "INV-" + new Date().getFullYear() + "-" + Math.floor(Math.random() * 1000));
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<Partial<InvoiceItem>[]>([
    { id: "1", description: "", quantity: 1, unitPrice: 0, amount: 0 }
  ]);

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(), description: "", quantity: 1, unitPrice: 0, amount: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length === 1) return;
    setItems(items.filter(it => it.id !== id));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(it => {
      if (it.id !== id) return it;
      const updated = { ...it, [field]: value };
      if (field === "quantity" || field === "unitPrice") {
        updated.amount = (updated.quantity || 0) * (updated.unitPrice || 0);
      }
      return updated;
    }));
  };

  const total = items.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const isValid = items.some(it => it.description?.trim()) && invoiceNumber.trim() && dueDate;

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!isValid) return;

    addInvoice({
      contactName: contactName.trim() || undefined,
      invoiceNumber,
      dueDate,
      notes,
      items: items.filter(it => it.description?.trim()) as InvoiceItem[],
      status: "Unpaid"
    });
    onClose();
  };

  const footer = (
    <>
      <div />
      <div className="flex items-center gap-2 shrink-0">
        <button type="button" onClick={onClose} className="font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold px-3.5 py-2 rounded-[6px] hover:bg-black/[0.05] transition-colors" style={{ color: "var(--color-on-surface-variant)", opacity: 0.65 }}>
          Cancel
        </button>
        <button type="button" onClick={handleSubmit} disabled={!isValid} className="font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold px-4 py-2 rounded-[6px] disabled:opacity-30 hover:-translate-y-px transition-all" style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
          Generate Invoice
        </button>
      </div>
    </>
  );

  return (
    <OperationModal
      onClose={onClose}
      title="New Invoice"
      icon={<FileText size={14} style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }} />}
      maxWidth={640}
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <OperationInput
              label="Customer Name"
              icon={<User size={11} strokeWidth={1.75} />}
              maxLength={80}
              autoFocus
              placeholder="Client name (optional)"
              value={contactName}
              onChange={e => setContactName(e.target.value)}
            />
            <OperationInput
              label="Invoice Number"
              icon={<Hash size={11} strokeWidth={1.75} />}
              required
              maxLength={30}
              value={invoiceNumber}
              onChange={e => setInvoiceNumber(e.target.value)}
            />
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Calendar size={11} strokeWidth={1.75} style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }} />
                <span className="font-label-caps text-[9px] uppercase tracking-[0.12em] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }}>
                  Due Date *
                </span>
              </div>
              <input
                type="date"
                required
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full font-body-md text-[13px] rounded-[6px] px-3 py-2.5 outline-none transition-all"
                style={{ border: "1px solid rgba(0,0,0,0.09)", background: "rgba(0,0,0,0.02)", color: "var(--color-on-surface)" }}
                onFocus={(e) => { e.target.style.background = "rgba(0,0,0,0.04)"; e.target.style.borderColor = "rgba(0,0,0,0.2)"; }}
                onBlur={(e) => { e.target.style.background = "rgba(0,0,0,0.02)"; e.target.style.borderColor = "rgba(0,0,0,0.09)"; }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-[9px] uppercase tracking-[0.12em] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }}>
              Line Items
            </span>
            <button type="button" onClick={addItem} className="flex items-center gap-1.5 text-[10.5px] font-medium" style={{ color: "var(--color-primary)" }}>
              <Plus size={12} strokeWidth={2} /> Add Item
            </button>
          </div>

          <div className="grid grid-cols-[1fr_60px_100px_40px] gap-2">
            <span className="font-label-caps text-[8px] uppercase tracking-[0.12em] font-semibold opacity-40">Description</span>
            <span className="font-label-caps text-[8px] uppercase tracking-[0.12em] font-semibold opacity-40 text-center">Qty</span>
            <span className="font-label-caps text-[8px] uppercase tracking-[0.12em] font-semibold opacity-40">Price</span>
            <span />
          </div>

          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="group">
                <div className="grid grid-cols-[1fr_60px_100px_40px] gap-2 items-center">
                  <input
                    placeholder="Item description..."
                    value={item.description}
                    onChange={e => updateItem(item.id!, "description", e.target.value)}
                    className="w-full font-body-md text-[12px] rounded-[6px] px-3 py-2 outline-none transition-all"
                    style={{ border: "1px solid rgba(0,0,0,0.09)", background: "rgba(0,0,0,0.02)", color: "var(--color-on-surface)" }}
                    onFocus={(e) => { e.target.style.background = "rgba(0,0,0,0.04)"; e.target.style.borderColor = "rgba(0,0,0,0.2)"; }}
                    onBlur={(e) => { e.target.style.background = "rgba(0,0,0,0.02)"; e.target.style.borderColor = "rgba(0,0,0,0.09)"; }}
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={e => updateItem(item.id!, "quantity", parseInt(e.target.value) || 0)}
                    className="w-full text-center font-body-md text-[12px] rounded-[6px] px-2 py-2 outline-none transition-all"
                    style={{ border: "1px solid rgba(0,0,0,0.09)", background: "rgba(0,0,0,0.02)", color: "var(--color-on-surface)" }}
                  />
                  <div className="relative flex items-center">
                    <span className="absolute left-2 text-[10px]" style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }}>$</span>
                    <input
                      type="number"
                      placeholder="Price"
                      value={item.unitPrice}
                      onChange={e => updateItem(item.id!, "unitPrice", parseFloat(e.target.value) || 0)}
                      className="w-full pl-5 pr-2 py-2 font-body-md text-[12px] rounded-[6px] outline-none transition-all"
                      style={{ border: "1px solid rgba(0,0,0,0.09)", background: "rgba(0,0,0,0.02)", color: "var(--color-on-surface)" }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id!)}
                    className="p-1.5 rounded-[6px] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/[0.06] flex items-center justify-center"
                  >
                    <Trash2 size={13} strokeWidth={1.75} style={{ color: "rgba(186,26,26,0.55)" }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <div className="w-[200px] space-y-2">
            <div className="flex justify-between items-center text-[11.5px]">
              <span className="font-body-sm" style={{ color: "var(--color-on-surface-variant)", opacity: 0.6 }}>Tax (10%)</span>
              <span className="font-display" style={{ opacity: 0.7 }}>${(total * 0.1).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-1.5" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
              <span className="font-label-caps text-[9px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--color-on-surface-variant)", opacity: 0.6 }}>Total</span>
              <span className="font-display font-bold text-[15px]" style={{ color: "var(--color-on-surface)", opacity: 0.9 }}>${(total * 1.1).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <OperationTextarea
          label="Invoice Notes"
          maxLength={500}
          rows={2}
          placeholder="Terms and conditions..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      </form>
    </OperationModal>
  );
}
