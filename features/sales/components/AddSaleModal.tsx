"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSales } from "../context/SalesContext";
import { listProducts } from "@/features/products/services/products.client";
import type { Product } from "@/features/products/types";
import { ShoppingCart, Plus, Trash2, Package, Wrench, Store, FileText, ChevronDown, User, DollarSign } from "lucide-react";
import { SaleStatus, PaymentStatus, SaleType, SaleItem } from "@/features/sales";

import { ModalShell } from "@/components/ui/global/modal/ModalShell";
import { ModalHeader } from "@/components/ui/global/modal/ModalHeader";
import { ModalContent } from "@/components/ui/global/modal/ModalContent";
import { ModalFooter } from "@/components/ui/global/modal/ModalFooter";
import { GlobalInput } from "@/components/ui/global/form/GlobalInput";
import { GlobalTextarea } from "@/components/ui/global/form/GlobalTextarea";

const SALE_TYPES: { value: SaleType; label: string; icon: React.ReactNode }[] = [
  { value: "Product Sale", label: "Product Sale", icon: <Package size={11} strokeWidth={2} /> },
  { value: "Service Order", label: "Service Order", icon: <Wrench size={11} strokeWidth={2} /> },
  { value: "Retail", label: "Retail", icon: <Store size={11} strokeWidth={2} /> },
  { value: "Manual", label: "Manual Entry", icon: <FileText size={11} strokeWidth={2} /> },
];

const CURRENCIES = ["USD", "IDR", "EUR", "GBP", "SGD"];
const PAYMENT_STATUSES: PaymentStatus[] = ["Unpaid", "Partially Paid", "Paid"];

function newItem(): SaleItem {
  return { id: Math.random().toString(36).substring(7), name: "", quantity: 1, price: 0, discount: 0, discountType: "percentage", subtotal: 0 };
}

function calcSubtotal(item: SaleItem): number {
  const base = item.price * item.quantity;
  const discountAmt = item.discountType === "fixed" ? item.discount : base * (item.discount / 100);
  return Math.max(0, base - discountAmt);
}

function formatCurrency(val: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(val);
}

/* ── Reusable click dropdown ─────────────────────────────────────────────── */
function Dd<T extends string>({ value, opts, onChange, renderT, renderO }: {
  value: T; opts: T[]; onChange: (v: T) => void;
  renderT: (v: T) => React.ReactNode; renderO: (v: T) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(v => !v)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] hover:bg-black/[0.04] transition-colors" style={{ border: "1px solid rgba(0,0,0,0.09)" }}>
        {renderT(value)}
        <ChevronDown size={10} strokeWidth={2} style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 py-1 rounded-[8px] shadow-xl" style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.1)", minWidth: 155 }}>
          {opts.map(o => (
            <button type="button" key={o} onClick={() => { onChange(o); setOpen(false); }} className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-black/[0.04] text-left transition-colors">
              {renderO(o)}
              {value === o && <span className="ml-auto font-label-caps text-[8px]" style={{ color: "var(--color-on-surface-variant)", opacity: 0.4 }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Section label ───────────────────────────────────────────────────────── */
function SL({ icon, children, right }: { icon?: React.ReactNode; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="font-label-caps text-[9px] uppercase tracking-[0.12em] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }}>
          {children}
        </span>
      </div>
      {right}
    </div>
  );
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
  const [orderDiscountType, setOrderDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [currency, setCurrency] = useState("USD");
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
  const rawOrderDiscount = parseFloat(orderDiscount) || 0;
  const orderDiscountAmt = orderDiscountType === "fixed" ? rawOrderDiscount : subtotal * (rawOrderDiscount / 100);
  const clampedOrderDiscountAmt = Math.min(subtotal, Math.max(0, orderDiscountAmt));
  const total = Math.max(0, subtotal - clampedOrderDiscountAmt);
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
      orderDiscountValue: rawOrderDiscount,
      orderDiscountType,
      discountTotal: clampedOrderDiscountAmt,
      subtotal,
      total,
      currency,
      notes,
    });
    onClose();
  };

  const footerSummary = (
    <div className="flex items-center gap-6">
      <div className="font-display text-[12px] font-semibold flex gap-2 items-center" style={{ color: "var(--color-on-surface-variant)", opacity: 0.6 }}>
        {items.filter(it => it.name.trim()).length} item{items.filter(it => it.name.trim()).length !== 1 ? "s" : ""}
      </div>
      <div className="flex gap-6 font-display text-[13px] flex-1 justify-end mr-2">
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-label-caps uppercase tracking-wider text-on-surface-variant/50">Subtotal</span>
          <span className="font-semibold text-on-surface/80">{formatCurrency(subtotal, currency)}</span>
        </div>
        {clampedOrderDiscountAmt > 0 && (
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-label-caps uppercase tracking-wider text-on-surface-variant/50">
              Discount {orderDiscountType === "percentage" && orderDiscount ? `(${orderDiscount}%)` : ""}
            </span>
            <span className="font-semibold text-on-surface-variant/80">−{formatCurrency(clampedOrderDiscountAmt, currency)}</span>
          </div>
        )}
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-label-caps uppercase tracking-wider text-on-surface-variant/50">Total</span>
          <span className="font-bold text-[15px] text-on-surface">{formatCurrency(total, currency)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <ModalShell onClose={onClose} maxWidth={640}>
      <ModalHeader title="New Sale" onClose={onClose} />
      
      <ModalContent className="db-sidebar space-y-6">
        <div className="space-y-4">
          <GlobalInput
            autoFocus
            maxLength={60}
            placeholder="Sale Title (e.g. Website Redesign)…"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="font-display font-semibold"
            style={{ fontSize: "16px", background: "transparent", border: "none", padding: "0" }}
          />

          <GlobalTextarea
            rows={2}
            maxLength={500}
            placeholder="Add notes or descriptions (optional)…"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />

          <div className="flex items-center gap-2 flex-wrap pt-2">
            <Dd
              value={saleType} opts={SALE_TYPES.map(t => t.value)} onChange={setSaleType}
              renderT={t => {
                const meta = SALE_TYPES.find(x => x.value === t)!;
                return <><span style={{ color: "var(--color-on-surface-variant)", opacity: 0.7 }}>{meta.icon}</span><span className="font-label-caps text-[10px] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.9 }}>{t.toUpperCase()}</span></>
              }}
              renderO={t => {
                const meta = SALE_TYPES.find(x => x.value === t)!;
                return <><span style={{ color: "var(--color-on-surface-variant)", opacity: 0.7 }}>{meta.icon}</span><span className="font-body-md text-[12px]" style={{ color: "var(--color-on-surface-variant)", opacity: 0.9 }}>{t}</span></>
              }}
            />
            <Dd
              value={paymentStatus} opts={PAYMENT_STATUSES} onChange={setPaymentStatus}
              renderT={s => <><span className="font-label-caps text-[10px] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.9 }}>{s.toUpperCase()}</span></>}
              renderO={s => <><span className="font-body-md text-[12px]" style={{ color: "var(--color-on-surface-variant)", opacity: 0.9 }}>{s}</span></>}
            />
            <Dd
              value={currency} opts={CURRENCIES} onChange={setCurrency}
              renderT={c => <><span className="font-label-caps text-[10px] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.9 }}>{c}</span></>}
              renderO={c => <><span className="font-body-md text-[12px]" style={{ color: "var(--color-on-surface-variant)", opacity: 0.9 }}>{c}</span></>}
            />
          </div>
        </div>

        <div>
          <SL icon={<User size={11} strokeWidth={1.75} />}>Customer Info</SL>
          <GlobalInput
            maxLength={40}
            placeholder="Customer name or walk-in"
            value={contactName}
            onChange={e => setContactName(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <SL 
            icon={<ShoppingCart size={11} strokeWidth={1.75} />}
            right={
              <button type="button" onClick={addLineItem} className="flex items-center gap-1.5 font-label-caps text-[9px] font-bold" style={{ color: "var(--color-primary)" }}>
                <Plus size={10} strokeWidth={2} /> ADD ITEM
              </button>
            }
          >
            Line Items
          </SL>

          <div className="grid grid-cols-[1fr_56px_80px_80px_80px_28px] gap-2 items-center px-2">
            <span className="font-label-caps text-[8px] uppercase tracking-[0.12em] font-semibold opacity-40">Description</span>
            <span className="font-label-caps text-[8px] uppercase tracking-[0.12em] font-semibold opacity-40 text-center">Qty</span>
            <span className="font-label-caps text-[8px] uppercase tracking-[0.12em] font-semibold opacity-40 text-right">Price</span>
            <span className="font-label-caps text-[8px] uppercase tracking-[0.12em] font-semibold opacity-40 text-right">Discount</span>
            <span className="font-label-caps text-[8px] uppercase tracking-[0.12em] font-semibold opacity-40 text-right">Line Total</span>
            <span />
          </div>

          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="group">
                <div className="grid grid-cols-[1fr_56px_80px_80px_80px_28px] gap-2 items-center">
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
                            updated.sku = undefined;
                          }
                          updated.subtotal = calcSubtotal(updated);
                          return updated;
                        }));
                      }}
                      className="w-full bg-black/[0.02] border border-black/[0.06] rounded-[6px] px-3 py-1.5 font-display text-[13px] outline-none focus:bg-white focus:border-primary/30 transition-all placeholder:opacity-40"
                    />
                    <datalist id={`products-${item.id}`}>
                      {allProducts.map(p => <option key={p.id} value={p.name}>{p.sku ? `SKU: ${p.sku}` : "Product/Service"}</option>)}
                    </datalist>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={item.quantity || ""}
                    onChange={e => updateItem(item.id, "quantity", parseInt(e.target.value) || 0)}
                    className="w-full bg-black/[0.02] border border-black/[0.06] rounded-[6px] px-2 py-1.5 font-display text-[13px] outline-none text-center focus:bg-white focus:border-primary/30 transition-all"
                  />
                  <input
                    type="number"
                    min="0"
                    value={item.price || ""}
                    onChange={e => updateItem(item.id, "price", parseFloat(e.target.value) || 0)}
                    className="w-full bg-black/[0.02] border border-black/[0.06] rounded-[6px] px-2 py-1.5 font-display text-[13px] outline-none text-right focus:bg-white focus:border-primary/30 transition-all"
                  />
                  <div className="relative flex items-center bg-black/[0.02] border border-black/[0.06] rounded-[6px] focus-within:bg-white focus-within:border-primary/30 transition-all overflow-hidden">
                    <input
                      type="number"
                      min="0"
                      value={item.discount || ""}
                      onChange={e => updateItem(item.id, "discount", parseFloat(e.target.value) || 0)}
                      className="w-full bg-transparent px-2 py-1.5 font-display text-[13px] outline-none text-right"
                    />
                    <button 
                      type="button" 
                      onClick={() => updateItem(item.id, "discountType", item.discountType === "fixed" ? "percentage" : "fixed")}
                      className="px-1.5 py-1.5 text-[10px] font-bold text-on-surface-variant opacity-60 hover:opacity-100 hover:bg-black/5 border-l border-black/[0.06] transition-all"
                    >
                      {item.discountType === "fixed" ? "$" : "%"}
                    </button>
                  </div>
                  <div className="text-right font-display text-[13px] font-semibold opacity-80 pl-1 truncate" title={formatCurrency(item.subtotal, currency)}>
                    {item.subtotal > 0 ? formatCurrency(item.subtotal, currency) : "—"}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLineItem(item.id)}
                    disabled={items.length === 1}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-all flex items-center justify-center opacity-40 hover:opacity-100 disabled:opacity-10"
                  >
                    <Trash2 size={13} strokeWidth={2} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <div className="w-1/2 flex items-center gap-2">
              <span className="font-label-caps text-[9px] uppercase tracking-[0.12em] font-semibold opacity-40 ml-auto">Order Discount</span>
              <div className="w-[120px] relative flex items-center bg-black/[0.02] border border-black/[0.06] rounded-[6px] focus-within:bg-white focus-within:border-primary/30 transition-all overflow-hidden">
                <input
                  type="number"
                  min="0"
                  value={orderDiscount}
                  onChange={e => setOrderDiscount(e.target.value)}
                  className="w-full bg-transparent pl-3 pr-2 py-1.5 font-display text-[13px] outline-none text-right"
                  placeholder="0.00"
                />
                <button 
                  type="button" 
                  onClick={() => setOrderDiscountType(prev => prev === "fixed" ? "percentage" : "fixed")}
                  className="px-2 py-1.5 text-[11px] font-bold text-on-surface-variant opacity-60 hover:opacity-100 hover:bg-black/5 border-l border-black/[0.06] transition-all"
                >
                  {orderDiscountType === "fixed" ? "$" : "%"}
                </button>
              </div>
            </div>
          </div>
        </div>

      </ModalContent>

      <ModalFooter>
        <div className="flex-1">
          {footerSummary}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold px-3.5 py-2 rounded-[6px] hover:bg-black/[0.05] transition-colors" style={{ color: "var(--color-on-surface-variant)", opacity: 0.65 }}>
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} disabled={!isValid} className="font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold px-4 py-2 rounded-[6px] disabled:opacity-30 hover:-translate-y-px transition-all" style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
            Create Sale
          </button>
        </div>
      </ModalFooter>
    </ModalShell>
  );
}
