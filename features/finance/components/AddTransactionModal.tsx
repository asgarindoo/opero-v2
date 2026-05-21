"use client";

import React, { useState } from "react";
import { useFinance } from "../context/FinanceContext";
import { DollarSign, User, ChevronDown, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { TransactionType, PaymentMethod } from "@/features/finance";
import OperationModal from "@/components/ui/OperationModal";
import OperationInput from "@/components/ui/OperationInput";
import OperationTextarea from "@/components/ui/OperationTextarea";

export default function AddTransactionModal({ onClose }: { onClose: () => void }) {
  const { addTransaction } = useFinance();
  const [type, setType] = useState<TransactionType>("Expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [reference, setReference] = useState("");
  const [contactName, setContactName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Bank Transfer");
  const [notes, setNotes] = useState("");

  const isValid = amount.trim() && reference.trim();

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!isValid) return;

    addTransaction({
      type,
      amount: parseFloat(amount),
      category: category.trim() || "General",
      reference: reference.trim(),
      contactName: contactName.trim() || undefined,
      paymentMethod,
      notes,
      status: "Pending"
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
          Create Transaction
        </button>
      </div>
    </>
  );

  return (
    <OperationModal
      onClose={onClose}
      title="New Transaction"
      icon={<DollarSign size={14} style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }} />}
      maxWidth={480}
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <div className="flex p-1 rounded-[8px]" style={{ background: "rgba(0,0,0,0.03)" }}>
            <button
              type="button"
              onClick={() => setType("Expense")}
              className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-[6px] font-label-caps text-[9px] font-bold transition-all"
              style={type === "Expense" ? { background: "#fff", color: "rgba(186,26,26,0.9)", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" } : { color: "var(--color-on-surface-variant)", opacity: 0.6 }}
            >
              <ArrowUpRight size={12} strokeWidth={2} /> EXPENSE
            </button>
            <button
              type="button"
              onClick={() => setType("Income")}
              className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-[6px] font-label-caps text-[9px] font-bold transition-all"
              style={type === "Income" ? { background: "#fff", color: "rgba(0,120,60,0.9)", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" } : { color: "var(--color-on-surface-variant)", opacity: 0.6 }}
            >
              <ArrowDownLeft size={12} strokeWidth={2} /> INCOME
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="font-label-caps text-[9px] uppercase tracking-[0.12em] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }}>
                Amount *
              </span>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-4 font-display font-bold text-[16px]" style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }}>$</span>
              <input
                type="number"
                autoFocus
                required
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-3 rounded-[8px] outline-none transition-all font-display font-bold text-[18px]"
                style={{ border: "1px solid rgba(0,0,0,0.09)", background: "rgba(0,0,0,0.02)", color: "var(--color-on-surface)" }}
                onFocus={(e) => { e.target.style.background = "rgba(0,0,0,0.04)"; e.target.style.borderColor = "rgba(0,0,0,0.2)"; }}
                onBlur={(e) => { e.target.style.background = "rgba(0,0,0,0.02)"; e.target.style.borderColor = "rgba(0,0,0,0.09)"; }}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <OperationInput
              label="Reference #"
              required
              maxLength={40}
              placeholder="INV-001"
              value={reference}
              onChange={e => setReference(e.target.value)}
            />
            <OperationInput
              label="Category"
              maxLength={40}
              placeholder="Infrastructure"
              value={category}
              onChange={e => setCategory(e.target.value)}
            />
          </div>
        </div>

        <div className="p-4 rounded-[8px] space-y-4" style={{ background: "rgba(0,0,0,0.01)", border: "1px dashed rgba(0,0,0,0.09)" }}>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="font-label-caps text-[9px] uppercase tracking-[0.12em] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }}>
              Entity & Payment
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <OperationInput
              label="Entity/Contact"
              icon={<User size={11} strokeWidth={1.75} />}
              maxLength={60}
              placeholder="Vendor name"
              value={contactName}
              onChange={e => setContactName(e.target.value)}
            />
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="font-label-caps text-[9px] uppercase tracking-[0.12em] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }}>
                  Payment Method
                </span>
              </div>
              <div className="relative">
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full appearance-none font-body-md text-[13px] rounded-[6px] pl-3 pr-8 py-2.5 outline-none transition-all cursor-pointer"
                  style={{ border: "1px solid rgba(0,0,0,0.09)", background: "rgba(0,0,0,0.02)", color: "var(--color-on-surface)" }}
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Stripe">Stripe</option>
                  <option value="Cash">Cash</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }} />
              </div>
            </div>
          </div>
        </div>

        <OperationTextarea
          label="Notes"
          maxLength={300}
          rows={2}
          placeholder="Internal record notes..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      </form>
    </OperationModal>
  );
}
