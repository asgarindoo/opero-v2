"use client";

import React, { useState } from "react";
import { useFinance } from "../context/FinanceContext";
import { DollarSign, User, Calendar } from "lucide-react";
import { TransactionType, PaymentMethod, Transaction } from "@/features/finance";

import { ModalShell } from "@/components/ui/global/modal/ModalShell";
import { ModalHeader } from "@/components/ui/global/modal/ModalHeader";
import { ModalContent } from "@/components/ui/global/modal/ModalContent";
import { ModalFooter } from "@/components/ui/global/modal/ModalFooter";
import { GlobalInput } from "@/components/ui/global/form/GlobalInput";
import { GlobalTextarea } from "@/components/ui/global/form/GlobalTextarea";
import Dropdown from "@/components/ui/Dropdown";
import DatePicker from "@/components/ui/DatePicker";

/* ── Section label ───────────────────────────────────────────────────────── */
function SL({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      {icon}
      <span className="font-label-caps text-[9px] uppercase tracking-[0.12em] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }}>
        {children}
      </span>
    </div>
  );
}

export default function AddTransactionModal({ onClose, initialData }: { onClose: () => void, initialData?: Transaction }) {
  const { addTransaction, updateTransaction } = useFinance();
  const [type, setType] = useState<TransactionType>(initialData?.type || "Expense");
  const [title, setTitle] = useState(initialData?.title || "");
  const [transactionDate, setTransactionDate] = useState(initialData?.transactionDate || "");
  const [amount, setAmount] = useState(initialData?.amount ? initialData.amount.toString() : "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [currency, setCurrency] = useState(initialData?.currency || "USD");
  const [contactName, setContactName] = useState(initialData?.contactName || "");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initialData?.paymentMethod || "Bank Transfer");
  const [notes, setNotes] = useState(initialData?.notes || "");

  const isFormValid = title.trim() !== "" && amount.trim() !== "" && transactionDate !== "";

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!isFormValid) return;

    const payload = {
      title: title.trim(),
      transactionDate,
      type,
      amount: parseFloat(amount),
      currency,
      category: category.trim() || "General",
      contactName: contactName.trim() || undefined,
      paymentMethod,
      notes,
      status: initialData?.status || "Completed",
      sourceType: initialData?.sourceType || "Manual"
    };

    if (initialData) {
      updateTransaction(initialData.id, payload as Partial<Transaction>);
    } else {
      addTransaction(payload);
    }
    onClose();
  };

  return (
    <ModalShell onClose={onClose} maxWidth={600}>
      <ModalHeader title={initialData ? "Edit Transaction" : "New Transaction"} onClose={onClose} />
      
      <ModalContent className="db-sidebar space-y-6">
        <div className="space-y-4">
          <GlobalInput
            autoFocus
            required
            maxLength={100}
            placeholder="Transaction title (e.g. Office Supplies)…"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === "Enter" && isFormValid && handleSubmit()}
            className="font-display font-semibold"
            style={{ fontSize: "16px", background: "transparent", border: "none", padding: "0" }}
          />

          <GlobalTextarea
            rows={2}
            maxLength={300}
            placeholder="Notes (Optional)…"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <SL>Transaction Type</SL>
              <Dropdown
                value={type}
                onChange={(val) => setType(val as TransactionType)}
                options={[
                  { value: "Expense", label: "Expense" },
                  { value: "Income", label: "Income" },
                  { value: "Refund", label: "Refund" },
                ]}
              />
            </div>
            <div>
              <SL icon={<Calendar size={12} style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }} />}>Transaction Date</SL>
              <DatePicker
                value={transactionDate}
                onChange={val => setTransactionDate(val || "")}
                placeholder="Select date"
              />
            </div>
          </div>
        </div>

        <div>
          <SL>Amount *</SL>
          <div className="flex items-center gap-3">
            <div className="w-20 shrink-0">
              <Dropdown
                value={currency}
                onChange={setCurrency}
                options={[
                  { value: "USD", label: "USD" },
                  { value: "IDR", label: "IDR" },
                  { value: "EUR", label: "EUR" },
                  { value: "GBP", label: "GBP" },
                  { value: "SGD", label: "SGD" }
                ]}
              />
            </div>
            <div className="relative flex-1 flex items-center">
              <input
                type="number"
                required
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full px-3 py-[6px] rounded-[6px] outline-none transition-all font-display font-medium text-[13px]"
                style={{ border: "1px solid rgba(0,0,0,0.09)", background: "rgba(0,0,0,0.02)", color: "var(--color-on-surface)" }}
                onFocus={(e) => { e.target.style.background = "rgba(0,0,0,0.04)"; e.target.style.borderColor = "rgba(0,0,0,0.2)"; }}
                onBlur={(e) => { e.target.style.background = "rgba(0,0,0,0.02)"; e.target.style.borderColor = "rgba(0,0,0,0.09)"; }}
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: "rgba(0,0,0,0.06)" }} />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <SL>Category</SL>
            <GlobalInput
              maxLength={30}
              placeholder="e.g. Infrastructure"
              value={category}
              onChange={e => setCategory(e.target.value)}
            />
          </div>
          <div>
            <SL icon={<User size={12} style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }} />}>Contact</SL>
            <GlobalInput
              maxLength={40}
              placeholder="Vendor name"
              value={contactName}
              onChange={e => setContactName(e.target.value)}
            />
          </div>
        </div>
        
        <div>
          <SL>Payment Method</SL>
          <Dropdown
            value={paymentMethod}
            onChange={(val) => setPaymentMethod(val as PaymentMethod)}
            options={[
              { value: "Bank Transfer", label: "Bank Transfer" },
              { value: "Credit Card", label: "Credit Card" },
              { value: "Cash", label: "Cash" },
              { value: "PayPal", label: "PayPal" },
              { value: "Stripe", label: "Stripe" }
            ]}
          />
        </div>
      </ModalContent>

      <ModalFooter>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onClose} className="font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold px-3.5 py-2 rounded-[6px] hover:bg-black/[0.05] transition-colors" style={{ color: "var(--color-on-surface-variant)", opacity: 0.65 }}>
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={!isFormValid}
            className="px-4 py-2 font-label-caps text-[11px] font-bold tracking-[0.1em] text-white uppercase rounded-[8px] transition-all bg-black hover:bg-black/80 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {initialData ? "Save Changes" : "Save Transaction"}
          </button>
        </div>
      </ModalFooter>
    </ModalShell>
  );
}
