import React, { useState } from "react";
import { useInvoices } from "../context/InvoicesContext";
import { X, User, Calendar, Plus, Trash2, FileText, DollarSign } from "lucide-react";
import { InvoiceItem } from "@/features/invoices";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.some(it => !it.description)) return;

    addInvoice({
      contactName: contactName.trim() || undefined,
      invoiceNumber,
      dueDate,
      notes,
      items: items as InvoiceItem[],
      status: "Unpaid"
    });
    onClose();
  };

  const total = items.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/10 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-[640px] bg-surface-container-lowest rounded-2xl shadow-2xl animate-scale-in border border-black/5 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/[0.04]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <FileText size={14} />
            </div>
            <h2 className="font-display font-semibold text-[15px] text-on-surface">New Operational Invoice</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-on-surface-variant opacity-70 hover:opacity-100 hover:bg-black/5 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 max-h-[75vh] overflow-y-auto px-6 py-6 space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block font-label-caps text-[9px] text-on-surface-variant opacity-60 mb-1.5 uppercase tracking-wider">
                Customer Name <span className="opacity-40">(optional)</span>
              </label>
                <div className="relative flex items-center">
                  <User size={13} className="absolute left-3 text-on-surface-variant opacity-60" />
                  <input 
                    type="text" autoFocus value={contactName} onChange={e => setContactName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-black/10 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary/40 outline-none transition-all font-body-sm text-[12.5px] text-on-surface"
                    placeholder="Client name (optional)"
                  />
                </div>
              </div>
              <div>
                <label className="block font-label-caps text-[9px] text-on-surface-variant opacity-60 mb-1.5 uppercase tracking-wider">Invoice Number</label>
                <input 
                  type="text" required value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-surface-container-low font-mono text-[11px] text-on-surface opacity-80"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block font-label-caps text-[9px] text-on-surface-variant opacity-60 mb-1.5 uppercase tracking-wider">Due Date *</label>
                <div className="relative flex items-center">
                  <Calendar size={13} className="absolute left-3 text-on-surface-variant opacity-60" />
                  <input 
                    type="date" required value={dueDate} onChange={e => setDueDate(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-black/10 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary/40 outline-none transition-all font-body-sm text-[12.5px] text-on-surface"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-3">
             <div className="flex items-center justify-between mb-1">
                <h3 className="font-label-caps text-[9px] text-on-surface-variant opacity-60 uppercase tracking-widest">Line Items</h3>
                <button type="button" onClick={addItem} className="flex items-center gap-1.5 text-[10.5px] font-medium text-primary hover:underline">
                  <Plus size={12} /> Add Item
                </button>
             </div>
             <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={item.id} className="flex gap-2 group animate-fade-in">
                     <div className="flex-[4]">
                       <input 
                         placeholder="Item description..." value={item.description} onChange={e => updateItem(item.id!, "description", e.target.value)}
                         className="w-full px-3 py-2 rounded-lg border border-black/10 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary/40 outline-none transition-all font-body-sm text-[12px] text-on-surface"
                       />
                     </div>
                     <div className="flex-[1]">
                       <input 
                         type="number" placeholder="Qty" value={item.quantity} onChange={e => updateItem(item.id!, "quantity", parseInt(e.target.value))}
                         className="w-full px-3 py-2 rounded-lg border border-black/10 bg-surface-container-low text-center font-body-sm text-[12px] text-on-surface"
                       />
                     </div>
                     <div className="flex-[2]">
                       <div className="relative flex items-center">
                         <span className="absolute left-2 text-on-surface opacity-30 text-[10px]">$</span>
                         <input 
                           type="number" placeholder="Price" value={item.unitPrice} onChange={e => updateItem(item.id!, "unitPrice", parseFloat(e.target.value))}
                           className="w-full pl-5 pr-2 py-2 rounded-lg border border-black/10 bg-surface-container-low font-body-sm text-[12px] text-on-surface"
                         />
                       </div>
                     </div>
                     <button type="button" onClick={() => removeItem(item.id!)} className="p-2 rounded-lg text-on-surface-variant opacity-0 group-hover:opacity-60 hover:opacity-100 transition-opacity">
                        <Trash2 size={14} />
                     </button>
                  </div>
                ))}
             </div>
          </div>

          <div className="flex justify-end pt-4">
             <div className="w-[180px] space-y-1.5 px-2">
                <div className="flex justify-between items-center text-on-surface-variant opacity-60 font-body-sm text-[11px]">
                   <span>Tax (10%)</span>
                   <span>${(total * 0.1).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center font-display font-bold text-[15px] text-on-surface pt-1 border-t border-black/5">
                   <span>Total</span>
                   <span>${(total * 1.1).toFixed(2)}</span>
                </div>
             </div>
          </div>

          <div>
            <label className="block font-label-caps text-[9px] text-on-surface-variant opacity-60 mb-1.5 uppercase tracking-wider">Invoice Notes</label>
            <textarea 
              value={notes} onChange={e => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary/40 outline-none transition-all font-body-sm text-[12.5px] text-on-surface h-20 resize-none"
              placeholder="Terms and conditions..."
            />
          </div>
        </form>

        <div className="px-6 py-4 bg-surface-container-low border-t border-black/[0.04] flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg font-label-caps text-[10px] font-bold tracking-wide text-on-surface-variant hover:bg-black/5 transition-colors">CANCEL</button>
          <button 
            type="submit" onClick={handleSubmit} disabled={items.some(it => !it.description)}
            className="px-6 py-2 rounded-lg font-label-caps text-[10px] font-bold tracking-wide bg-primary text-on-primary hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all disabled:opacity-60"
          >
            GENERATE INVOICE
          </button>
        </div>
      </div>
    </div>
  );
}
