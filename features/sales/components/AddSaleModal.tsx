"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useSales } from "../context/SalesContext";
import { listProducts } from "@/features/products/services/products.client";
import type { Product } from "@/features/products/types";
import { X, ShoppingCart, User, Plus, Trash2, Package, Wrench, Briefcase, Store, FileText, ChevronDown } from "lucide-react";
import { SaleStatus, PaymentStatus, SaleType, SaleItem } from "@/features/sales";
import Dropdown from "@/components/ui/Dropdown";

// Inline product picker — in a real implementation this would use useProducts()
// For now we type-check via the shared interface
interface SimpleProduct {
  id: string;
  name: string;
  sku?: string;
  price: number;
  type: "Physical" | "Service";
}

const SALE_TYPES: { value: SaleType; label: string; icon: React.ReactNode }[] = [
  { value: "Product Sale", label: "Product Sale", icon: <Package size={12} /> },
  { value: "Service Order", label: "Service Order", icon: <Wrench size={12} /> },
  { value: "Retail", label: "Retail", icon: <Store size={12} /> },
  { value: "Manual", label: "Manual Entry", icon: <FileText size={12} /> },
];

function newItem(): SaleItem {
  return {
    id: Math.random().toString(36).substring(7),
    name: "",
    quantity: 1,
    price: 0,
    discount: 0,
    subtotal: 0,
  };
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
    listProducts<Product>()
      .then(res => active && setAllProducts(res))
      .catch(console.error);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

  const isValid = title.trim() || items.some(it => it.name.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/10 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      <div className="relative w-full max-w-[600px] bg-surface-container-lowest rounded-2xl shadow-2xl animate-scale-in border border-black/5 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/[0.04] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <ShoppingCart size={14} />
            </div>
            <h2 className="font-display font-semibold text-[15px] text-on-surface">New Sale</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-on-surface-variant opacity-70 hover:opacity-100 hover:bg-black/5 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

          {/* Sale Type Selector */}
          <div>
            <label className="block font-label-caps text-[9px] text-on-surface-variant opacity-60 mb-2 uppercase tracking-wider">Sale Type</label>
            <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-black/[0.03]">
              {SALE_TYPES.map(({ value, label, icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSaleType(value)}
                  className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg font-label-caps text-[8px] font-bold transition-all ${saleType === value ? "bg-white shadow-sm text-on-surface" : "text-on-surface-variant opacity-60 hover:opacity-100"}`}
                >
                  {icon}
                  <span className="leading-tight text-center">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title & Customer */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-label-caps text-[9px] text-on-surface-variant opacity-60 mb-1.5 uppercase tracking-wider">Sale Title</label>
              <input
                type="text" autoFocus value={title} onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary/40 outline-none transition-all font-body-sm text-[12.5px] text-on-surface"
                placeholder="e.g. Website Redesign"
              />
            </div>
            <div>
              <label className="block font-label-caps text-[9px] text-on-surface-variant opacity-60 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                <User size={9} /> Customer <span className="opacity-40">(optional)</span>
              </label>
              <input
                type="text" value={contactName} onChange={e => setContactName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary/40 outline-none transition-all font-body-sm text-[12.5px] text-on-surface"
                placeholder="Customer name or walk-in"
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-label-caps text-[9px] text-on-surface-variant opacity-60 uppercase tracking-widest">Line Items</label>
              <button type="button" onClick={addLineItem} className="flex items-center gap-1.5 text-[10.5px] font-medium text-primary hover:underline">
                <Plus size={12} /> Add Item
              </button>
            </div>

            {/* Header row */}
            <div className="grid grid-cols-[1fr_56px_80px_60px] gap-2">
              <span className="font-label-caps text-[8px] opacity-40 uppercase tracking-widest">Description</span>
              <span className="font-label-caps text-[8px] opacity-40 uppercase tracking-widest text-center">Qty</span>
              <span className="font-label-caps text-[8px] opacity-40 uppercase tracking-widest text-right">Price</span>
              <span className="font-label-caps text-[8px] opacity-40 uppercase tracking-widest text-right">Disc%</span>
            </div>

            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="group animate-fade-in">
                  <div className="grid grid-cols-[1fr_56px_80px_60px_28px] gap-2 items-center">
                    <div className="relative">
                      <input
                        list={`products-${item.id}`}
                        placeholder="Item name or description"
                        value={item.name}
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
                        className="w-full px-3 py-2 rounded-lg border border-black/10 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary/40 outline-none transition-all font-body-sm text-[12px] text-on-surface"
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
                      className="w-full px-2 py-2 rounded-lg border border-black/10 bg-surface-container-low text-center font-body-sm text-[12px] text-on-surface"
                    />
                    <div className="relative flex items-center">
                      <span className="absolute left-2 text-on-surface opacity-30 text-[10px]">$</span>
                      <input
                        type="number" min="0" step="0.01" value={item.price || ""}
                        onChange={e => updateItem(item.id, "price", parseFloat(e.target.value) || 0)}
                        className="w-full pl-5 pr-2 py-2 rounded-lg border border-black/10 bg-surface-container-low font-body-sm text-[12px] text-on-surface"
                        placeholder="0"
                      />
                    </div>
                    <div className="relative flex items-center">
                      <input
                        type="number" min="0" max="100" value={item.discount || ""}
                        onChange={e => updateItem(item.id, "discount", parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-2 rounded-lg border border-black/10 bg-surface-container-low font-body-sm text-[12px] text-on-surface"
                        placeholder="0"
                      />
                    </div>
                    <button
                      type="button" onClick={() => removeLineItem(item.id)}
                      className="p-1.5 rounded-lg text-on-surface-variant opacity-0 group-hover:opacity-50 hover:opacity-100 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  {item.subtotal > 0 && (
                    <div className="text-right pr-8 mt-0.5">
                      <span className="font-display text-[10px] text-on-surface-variant opacity-50">{formatCurrency(item.subtotal)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Totals + Payment */}
          <div className="flex gap-6 items-start">
            {/* Payment Status */}
            <div className="flex-1">
              <label className="block font-label-caps text-[9px] text-on-surface-variant opacity-60 mb-1.5 uppercase tracking-wider">Payment Status</label>
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

            {/* Order Summary */}
            <div className="w-[200px] space-y-2 pt-1">
              <div className="flex justify-between text-[11.5px]">
                <span className="text-on-surface-variant opacity-60 font-body-sm">Subtotal</span>
                <span className="font-display opacity-70">{formatCurrency(subtotal)}</span>
              </div>
              {discountAmt > 0 && (
                <div className="flex justify-between text-[11.5px]">
                  <span className="text-on-surface-variant opacity-60 font-body-sm">Discount</span>
                  <span className="font-display opacity-70 text-red-500">−{formatCurrency(discountAmt)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-1.5 border-t border-black/[0.06]">
                <span className="font-label-caps text-[9px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">Total</span>
                <span className="font-display font-bold text-[15px] text-on-surface opacity-90">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-label-caps text-[9px] text-on-surface-variant opacity-60 mb-1.5 uppercase tracking-wider">Notes (optional)</label>
            <textarea
              value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary/40 outline-none transition-all font-body-sm text-[12.5px] text-on-surface resize-none"
              placeholder="Internal notes or customer instructions..."
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-surface-container-low border-t border-black/[0.04] flex justify-between items-center gap-3 shrink-0">
          <div className="font-display text-[12px] text-on-surface-variant opacity-60">
            {items.filter(it => it.name.trim()).length} item{items.filter(it => it.name.trim()).length !== 1 ? "s" : ""} · {formatCurrency(total)}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg font-label-caps text-[10px] font-bold tracking-wide text-on-surface-variant hover:bg-black/5 transition-colors">
              CANCEL
            </button>
            <button
              type="submit" onClick={handleSubmit} disabled={!isValid}
              className="px-6 py-2 rounded-lg font-label-caps text-[10px] font-bold tracking-wide bg-primary text-on-primary hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all disabled:opacity-60"
            >
              CREATE SALE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
