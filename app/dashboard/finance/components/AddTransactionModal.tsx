import React, { useState } from "react";
import { useFinance } from "../context/FinanceContext";
import { X, DollarSign, Tag, User, Calendar, CreditCard, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { TransactionType, PaymentMethod } from "../types";

export default function AddTransactionModal({ onClose }: { onClose: () => void }) {
  const { addTransaction } = useFinance();
  const [type, setType] = useState<TransactionType>("Expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [reference, setReference] = useState("");
  const [contactName, setContactName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Bank Transfer");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !reference) return;

    addTransaction({
      type,
      amount: parseFloat(amount),
      category: category || "General",
      reference,
      contactName: contactName || undefined,
      paymentMethod,
      notes,
      status: "Pending"
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/10 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-[480px] bg-surface-container-lowest rounded-2xl shadow-2xl animate-scale-in border border-black/5 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/[0.04]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <DollarSign size={14} />
            </div>
            <h2 className="font-display font-semibold text-[15px] text-on-surface">New Transaction</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-on-surface-variant opacity-70 hover:opacity-100 hover:bg-black/5 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 max-h-[75vh] overflow-y-auto px-6 py-6 space-y-6">
          {/* Type Toggle */}
          <div className="flex p-1 rounded-xl bg-black/[0.03] gap-1">
             <button 
               type="button" onClick={() => setType("Expense")}
               className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-label-caps text-[9px] font-bold transition-all ${type === "Expense" ? "bg-white shadow-sm text-red-600" : "text-on-surface-variant opacity-60 hover:opacity-100"}`}
             >
               <ArrowUpRight size={12} /> EXPENSE
             </button>
             <button 
               type="button" onClick={() => setType("Income")}
               className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-label-caps text-[9px] font-bold transition-all ${type === "Income" ? "bg-white shadow-sm text-green-600" : "text-on-surface-variant opacity-60 hover:opacity-100"}`}
             >
               <ArrowDownLeft size={12} /> INCOME
             </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block font-label-caps text-[9px] text-on-surface-variant opacity-60 mb-1.5 uppercase tracking-wider">Amount *</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 font-display font-bold text-[14px] text-on-surface opacity-60">$</span>
                <input 
                  type="number" autoFocus required value={amount} onChange={e => setAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-black/10 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary/40 outline-none transition-all font-display font-bold text-[18px] text-on-surface"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-label-caps text-[9px] text-on-surface-variant opacity-60 mb-1.5 uppercase tracking-wider">Reference # *</label>
                <input 
                  type="text" required value={reference} onChange={e => setReference(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary/40 outline-none transition-all font-body-sm text-[12.5px] text-on-surface"
                  placeholder="INV-001"
                />
              </div>
              <div>
                <label className="block font-label-caps text-[9px] text-on-surface-variant opacity-60 mb-1.5 uppercase tracking-wider">Category</label>
                <input 
                  type="text" value={category} onChange={e => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary/40 outline-none transition-all font-body-sm text-[12.5px] text-on-surface"
                  placeholder="Infrastructure"
                />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-low/50 border border-black/[0.03] space-y-4">
            <h3 className="font-display font-medium text-[12px] text-on-surface opacity-80">Entity & Payment</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-label-caps text-[8.5px] text-on-surface-variant opacity-60 mb-1.5 uppercase tracking-wider">Entity/Contact</label>
                <div className="relative flex items-center">
                  <User size={13} className="absolute left-3 text-on-surface-variant opacity-60" />
                  <input 
                    type="text" value={contactName} onChange={e => setContactName(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-black/10 bg-surface-container-lowest focus:border-primary/40 outline-none transition-all font-body-sm text-[12px] text-on-surface"
                    placeholder="Vendor name"
                  />
                </div>
              </div>
              <div>
                <label className="block font-label-caps text-[8.5px] text-on-surface-variant opacity-60 mb-1.5 uppercase tracking-wider">Payment Method</label>
                <div className="relative flex items-center">
                  <CreditCard size={13} className="absolute left-3 text-on-surface-variant opacity-60" />
                  <select 
                    value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-black/10 bg-surface-container-lowest focus:border-primary/40 outline-none transition-all font-body-sm text-[12px] text-on-surface appearance-none"
                  >
                    <option>Bank Transfer</option>
                    <option>Credit Card</option>
                    <option>PayPal</option>
                    <option>Stripe</option>
                    <option>Cash</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-label-caps text-[9px] text-on-surface-variant opacity-60 mb-1.5 uppercase tracking-wider">Notes</label>
            <textarea 
              value={notes} onChange={e => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary/40 outline-none transition-all font-body-sm text-[12.5px] text-on-surface h-20 resize-none"
              placeholder="Internal record notes..."
            />
          </div>
        </form>

        <div className="px-6 py-4 bg-surface-container-low border-t border-black/[0.04] flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg font-label-caps text-[10px] font-bold tracking-wide text-on-surface-variant hover:bg-black/5 transition-colors">CANCEL</button>
          <button 
            type="submit" onClick={handleSubmit} disabled={!amount || !reference}
            className="px-6 py-2 rounded-lg font-label-caps text-[10px] font-bold tracking-wide bg-primary text-on-primary hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all disabled:opacity-50"
          >
            CREATE TRANSACTION
          </button>
        </div>
      </div>
    </div>
  );
}
