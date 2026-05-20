import React, { useState } from "react";
import { useSales } from "../context/SalesContext";
import { X, ShoppingCart, DollarSign, User, Calendar, MapPin, Package } from "lucide-react";
import Dropdown from "@/components/ui/Dropdown";
import { SaleStatus, PaymentStatus, SalePriority } from "@/features/sales";

export default function AddSaleModal({ onClose }: { onClose: () => void }) {
  const { addSale } = useSales();
  const [title, setTitle] = useState("");
  const [contactName, setContactName] = useState("");
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<SaleStatus>("Pending");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("Unpaid");
  const [priority, setPriority] = useState<SalePriority>("Medium");
  const [shippingAddress, setShippingAddress] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !contactName.trim()) return;

    addSale({
      title,
      contactName,
      value: Number(value) || 0,
      status,
      paymentStatus,
      priority,
      shippingAddress: shippingAddress || undefined
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
              <ShoppingCart size={14} />
            </div>
            <h2 className="font-display font-semibold text-[15px] text-on-surface">New Order</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-on-surface-variant opacity-70 hover:opacity-100 hover:bg-black/5 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 max-h-[75vh] overflow-y-auto px-6 py-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block font-label-caps text-[9px] text-on-surface-variant opacity-60 mb-1.5 uppercase tracking-wider">Order Title / Reference *</label>
              <input 
                type="text" autoFocus required value={title} onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary/40 outline-none transition-all font-body-sm text-[12.5px] text-on-surface"
                placeholder="e.g. Q4 Hardware Restock"
              />
            </div>

            <div>
              <label className="block font-label-caps text-[9px] text-on-surface-variant opacity-60 mb-1.5 uppercase tracking-wider">Customer / Organization *</label>
              <div className="relative flex items-center">
                <User size={14} className="absolute left-3 text-on-surface-variant opacity-60" />
                <input 
                  type="text" required value={contactName} onChange={e => setContactName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-black/10 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary/40 outline-none transition-all font-body-sm text-[12.5px] text-on-surface"
                  placeholder="Select or enter customer"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-label-caps text-[9px] text-on-surface-variant opacity-60 mb-1.5 uppercase tracking-wider">Initial Status</label>
                <Dropdown
                  value={status}
                  onChange={(val) => setStatus(val as SaleStatus)}
                  options={[
                    { value: "Pending", label: "Pending" },
                    { value: "Paid", label: "Paid" },
                    { value: "Processing", label: "Processing" },
                  ]}
                />
              </div>
              <div>
                <label className="block font-label-caps text-[9px] text-on-surface-variant opacity-60 mb-1.5 uppercase tracking-wider">Payment State</label>
                <Dropdown
                  value={paymentStatus}
                  onChange={(val) => setPaymentStatus(val as PaymentStatus)}
                  options={[
                    { value: "Unpaid", label: "Unpaid" },
                    { value: "Partially Paid", label: "Partially Paid" },
                    { value: "Paid", label: "Paid" },
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-low/50 border border-black/[0.03] space-y-4">
            <h3 className="font-display font-medium text-[12px] text-on-surface opacity-80">Order Logistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-label-caps text-[8.5px] text-on-surface-variant opacity-60 mb-1.5 uppercase tracking-wider">Total Value</label>
                <div className="relative flex items-center">
                  <DollarSign size={13} className="absolute left-3 text-on-surface-variant opacity-60" />
                  <input 
                    type="number" value={value} onChange={e => setValue(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-black/10 bg-surface-container-lowest focus:border-primary/40 outline-none transition-all font-body-sm text-[12px] text-on-surface"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block font-label-caps text-[8.5px] text-on-surface-variant opacity-60 mb-1.5 uppercase tracking-wider">Priority</label>
                <Dropdown
                  value={priority}
                  onChange={(val) => setPriority(val as SalePriority)}
                  options={[
                    { value: "Low", label: "Low" },
                    { value: "Medium", label: "Medium" },
                    { value: "High", label: "High" },
                  ]}
                />
              </div>
            </div>
            <div>
              <label className="block font-label-caps text-[8.5px] text-on-surface-variant opacity-60 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                <MapPin size={10} /> Shipping Address
              </label>
              <textarea 
                rows={2} value={shippingAddress} onChange={e => setShippingAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-black/10 bg-surface-container-lowest focus:border-primary/40 outline-none transition-all font-body-sm text-[12px] text-on-surface resize-none"
                placeholder="Full delivery address..."
              />
            </div>
          </div>
        </form>

        <div className="px-6 py-4 bg-surface-container-low border-t border-black/[0.04] flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg font-label-caps text-[10px] font-bold tracking-wide text-on-surface-variant hover:bg-black/5 transition-colors">CANCEL</button>
          <button 
            type="submit" onClick={handleSubmit} disabled={!title.trim() || !contactName.trim()}
            className="px-6 py-2 rounded-lg font-label-caps text-[10px] font-bold tracking-wide bg-primary text-on-primary hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all disabled:opacity-60"
          >
            CREATE ORDER
          </button>
        </div>
      </div>
    </div>
  );
}
