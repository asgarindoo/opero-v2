"use client";

import React, { useState, useEffect } from "react";
import { useSales } from "../context/SalesContext";
import { listProducts } from "@/features/products/services/products.client";
import type { Product } from "@/features/products/types";
import { ShoppingCart, Plus, Trash2, Package, Wrench, Store, FileText } from "lucide-react";
import { SaleStatus, PaymentStatus, SaleType, SaleItem } from "@/features/sales";

import { ModalShell } from "@/components/ui/global/modal/ModalShell";
import { ModalHeader } from "@/components/ui/global/modal/ModalHeader";
import { ModalContent } from "@/components/ui/global/modal/ModalContent";
import { ModalFooter } from "@/components/ui/global/modal/ModalFooter";
import { GlobalInput } from "@/components/ui/global/form/GlobalInput";
import { GlobalTextarea } from "@/components/ui/global/form/GlobalTextarea";
import { GlobalSelect } from "@/components/ui/global/form/GlobalSelect";
import { FormSection } from "@/components/ui/global/form/FormField";

const SALE_TYPES: { value: SaleType; label: string; icon: React.ReactNode }[] = [
  { value: "Product Sale", label: "Product Sale", icon: <Package size={12} strokeWidth={1.75} /> },
  { value: "Service Order", label: "Service Order", icon: <Wrench size={12} strokeWidth={1.75} /> },
  { value: "Retail", label: "Retail", icon: <Store size={12} strokeWidth={1.75} /> },
  { value: "Manual", label: "Manual Entry", icon: <FileText size={12} strokeWidth={1.75} /> },
];

function newItem(): SaleItem {
  return { id: Math.random().toString(36).substring(7), name: "", quantity: 1, price: 0, discount: 0, subtotal: 0 };
}

function calcSubtotal(item: SaleItem): number {
  return item.price * item.quantity * (1 - item.discount / 100);
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(val);
}

export default function AddSaleModal({ onClose }: { onClose: () => void }) {
  const { addSale } = useSales();
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    let active = true;
    listProducts<Product>().then(res => active && setAllProducts(res)).catch(console.error);
    return () => { active = false; };
  }, []);

  const [saleType, setSaleType] = useState<SaleType>("Product Sale");
  const [title, setTitle] = useState("");
  const [contactName, setContactName] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("Unpaid");
  const [items, setItems] = useState<SaleItem[]>([newItem()]);
  const [orderDiscount, setOrderDiscount] = useState("");
  const [notes, setNotes] = useState("");

  const addLineItem = () => setItems(prev => [...prev, newItem()]);
  const removeLineItem = (id: string) => {
    if (items.length === 1) return;
    setItems(prev => prev.filter(it => it.id !== id));
  };
  const updateItem = (id: string, field: keyof SaleItem, value: any) => {
    setItems(prev => prev.map(it => {
      if (it.id !== id) return it;
      const updated = { ...it, [field]: value };
      updated.subtotal = calcSubtotal(updated);
      return updated;
    }));
  };

  const subtotal = items.reduce((acc, it) => acc + it.subtotal, 0);
  const discountAmt = parseFloat(orderDiscount) || 0;
  const total = Math.max(0, subtotal - discountAmt);
  const isValid = title.trim() || items.some(it => it.name.trim());

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const hasItems = items.some(it => it.name.trim());
    if (!title.trim() && !hasItems) return;

    const cleanTitle = title.trim() || (items[0]?.name ? items[0].name : "New Sale");
    const cleanItems = items.filter(it => it.name.trim());

    addSale({
      title: cleanTitle,
      saleType,
      contactName: contactName.trim() || undefined,
      paymentStatus,
      status: paymentStatus === "Paid" ? "Completed" : "Pending",
      items: cleanItems,
      discountTotal: discountAmt,
      subtotal,
      total,
      notes,
    });
    onClose();
  };

  const footerSummary = (
    <div className="font-display text-[12px] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.6 }}>
      {items.filter(it => it.name.trim()).length} item{items.filter(it => it.name.trim()).length !== 1 ? "s" : ""} · {formatCurrency(total)}
    </div>
  );

  return (
    <ModalShell onClose={onClose} maxWidth={640}>
      <ModalHeader title="New Sale" icon={<ShoppingCart size={14} style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }} />} onClose={onClose} />
      
      <ModalContent className="space-y-6">
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="font-label-caps text-[9px] uppercase tracking-[0.12em] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }}>
              Sale Type
            </span>
          </div>
          <div className="flex p-1 rounded-[8px]" style={{ background: "rgba(0,0,0,0.03)" }}>
            {SALE_TYPES.map(({ value, label, icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setSaleType(value)}
                className="flex-1 flex flex-col items-center gap-1 py-1.5 rounded-[6px] font-label-caps text-[8.5px] font-bold transition-all"
                style={saleType === value ? { background: "#fff", color: "var(--color-on-surface)", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" } : { color: "var(--color-on-surface-variant)", opacity: 0.6 }}
              >
                {icon}
                <span className="leading-tight text-center">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <GlobalInput
            label="Sale Title"
            maxLength={40}
            autoFocus
            placeholder="e.g. Website Redesign"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <GlobalInput
            label="Customer"
            maxLength={40}
            placeholder="Customer name or walk-in"
            value={contactName}
            onChange={e => setContactName(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-[9px] uppercase tracking-[0.12em] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }}>
              Line Items
            </span>
            <button type="button" onClick={addLineItem} className="flex items-center gap-1.5 text-[10.5px] font-medium" style={{ color: "var(--color-primary)" }}>
              <Plus size={12} strokeWidth={2} /> Add Item
            </button>
          </div>

          <div className="grid grid-cols-[1fr_56px_80px_60px] gap-2">
            <span className="font-label-caps text-[8px] uppercase tracking-[0.12em] font-semibold opacity-40">Description</span>
            <span className="font-label-caps text-[8px] uppercase tracking-[0.12em] font-semibold opacity-40 text-center">Qty</span>
            <span className="font-label-caps text-[8px] uppercase tracking-[0.12em] font-semibold opacity-40 text-right">Price</span>
            <span className="font-label-caps text-[8px] uppercase tracking-[0.12em] font-semibold opacity-40 text-right">Disc%</span>
          </div>

          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="group">
                <div className="grid grid-cols-[1fr_56px_80px_60px_28px] gap-2 items-center">
                  <div className="relative">
                    <input
                      list={`products-${item.id}`}
                      placeholder="Item name or description"
                      value={item.name}
                      maxLength={40}
                      onChange={e => {
                        const val = e.target.value;
                        const matchedProduct = allProducts.find(p => p.name === val);
                        setItems(prev => prev.map(it => {
                          if (it.id !== item.id) return it;
                          const updated = { ...it, name: val };
                          if (matchedProduct && it.productId !== matchedProduct.id) {
                            updated.productId = matchedProduct.id;
                            updated.price = matchedProduct.price || 0;
                            updated.sku = matchedProduct.sku;
                          } else if (!matchedProduct) {
                            updated.productId = undefined;
                          }
                          updated.subtotal = calcSubtotal(updated);
                          return updated;
                        }));
                      }}
                      className="w-full font-body-md text-[12px] rounded-[6px] px-3 py-2 outline-none transition-all"
                      style={{ border: "1px solid rgba(0,0,0,0.09)", background: "rgba(0,0,0,0.02)", color: "var(--color-on-surface)" }}
                      onFocus={(e) => { e.target.style.background = "rgba(0,0,0,0.04)"; e.target.style.borderColor = "rgba(0,0,0,0.2)"; }}
                      onBlur={(e) => { e.target.style.background = "rgba(0,0,0,0.02)"; e.target.style.borderColor = "rgba(0,0,0,0.09)"; }}
                    />
                    <datalist id={`products-${item.id}`}>
                      {allProducts.map(p => (
                        <option key={p.id} value={p.name}>{p.sku ? `SKU: ${p.sku}` : "Product/Service"}</option>
                      ))}
                    </datalist>
                  </div>
                  <input
                    type="number" min="1" value={item.quantity}
                    onChange={e => updateItem(item.id, "quantity", parseInt(e.target.value) || 1)}
                    className="w-full text-center font-body-md text-[12px] rounded-[6px] px-2 py-2 outline-none transition-all"
                    style={{ border: "1px solid rgba(0,0,0,0.09)", background: "rgba(0,0,0,0.02)", color: "var(--color-on-surface)" }}
                  />
                  <div className="relative flex items-center">
                    <span className="absolute left-2 text-[10px]" style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }}>$</span>
                    <input
                      type="number" min="0" step="0.01" value={item.price || ""}
                      onChange={e => updateItem(item.id, "price", parseFloat(e.target.value) || 0)}
                      className="w-full pl-5 pr-2 py-2 font-body-md text-[12px] rounded-[6px] outline-none transition-all"
                      style={{ border: "1px solid rgba(0,0,0,0.09)", background: "rgba(0,0,0,0.02)", color: "var(--color-on-surface)" }}
                      placeholder="0"
                    />
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="number" min="0" max="100" value={item.discount || ""}
                      onChange={e => updateItem(item.id, "discount", parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-2 font-body-md text-[12px] rounded-[6px] outline-none transition-all"
                      style={{ border: "1px solid rgba(0,0,0,0.09)", background: "rgba(0,0,0,0.02)", color: "var(--color-on-surface)" }}
                      placeholder="0"
                    />
                  </div>
                  <button
                    type="button" onClick={() => removeLineItem(item.id)}
                    className="p-1.5 rounded-[6px] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/[0.06]"
                  >
                    <Trash2 size={13} strokeWidth={1.75} style={{ color: "rgba(186,26,26,0.55)" }} />
                  </button>
                </div>
                {item.subtotal > 0 && (
                  <div className="text-right pr-8 mt-0.5">
                    <span className="font-display text-[10px]" style={{ color: "var(--color-on-surface-variant)", opacity: 0.6 }}>{formatCurrency(item.subtotal)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-6 items-start pt-2">
          <div className="flex-1">
            <GlobalSelect
              label="Payment Status"
              options={[
                { value: "Unpaid", label: "Unpaid" },
                { value: "Partially Paid", label: "Partially Paid" },
                { value: "Paid", label: "Paid" },
              ]}
              value={paymentStatus}
              onChange={e => setPaymentStatus(e.target.value as PaymentStatus)}
            />
          </div>

          <div className="w-[200px] space-y-2 pt-1">
            <div className="flex justify-between text-[11.5px]">
              <span className="font-body-sm" style={{ color: "var(--color-on-surface-variant)", opacity: 0.6 }}>Subtotal</span>
              <span className="font-display" style={{ opacity: 0.7 }}>{formatCurrency(subtotal)}</span>
            </div>
            {discountAmt > 0 && (
              <div className="flex justify-between text-[11.5px]">
                <span className="font-body-sm" style={{ color: "var(--color-on-surface-variant)", opacity: 0.6 }}>Discount</span>
                <span className="font-display" style={{ color: "rgba(186,26,26,0.8)" }}>−{formatCurrency(discountAmt)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-1.5" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
              <span className="font-label-caps text-[9px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--color-on-surface-variant)", opacity: 0.6 }}>Total</span>
              <span className="font-display font-bold text-[15px]" style={{ color: "var(--color-on-surface)", opacity: 0.9 }}>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        <GlobalTextarea
          label="Notes (optional)"
          maxLength={300}
          rows={2}
          placeholder="Internal notes or customer instructions..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      </ModalContent>

      <ModalFooter summary={footerSummary}>
        <button type="button" onClick={onClose} className="font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold px-3.5 py-2 rounded-[6px] hover:bg-black/[0.05] transition-colors" style={{ color: "var(--color-on-surface-variant)", opacity: 0.65 }}>
          Cancel
        </button>
        <button type="button" onClick={handleSubmit} disabled={!isValid} className="font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold px-4 py-2 rounded-[6px] disabled:opacity-30 hover:-translate-y-px transition-all" style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
          Create Sale
        </button>
      </ModalFooter>
    </ModalShell>
  );
}
