"use client";

import React, { useState, useEffect } from "react";
import { useInvoices } from "../context/InvoicesContext";
import { useContacts } from "@/features/contacts/context/ContactsContext";
import { useProducts } from "@/features/products/context/ProductsContext";

// Async currency converter using live global rates (ExchangeRate-API free tier)
const convertCurrency = async (amount: number, from: string, to: string) => {
  if (from === to) return amount;

  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${from}`);
    if (!res.ok) throw new Error("Failed to fetch rates");
    const data = await res.json();
    const rate = data.rates[to];
    if (rate) {
      return amount * rate;
    }
  } catch (error) {
    console.error("Currency conversion failed, falling back to static rates", error);
  }

  // Fallback to static rates if API fails
  const fallbackRates: Record<string, number> = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    IDR: 16000,
    SGD: 1.35
  };
  const baseRateFrom = fallbackRates[from] || 1;
  const baseRateTo = fallbackRates[to] || 1;
  const amountInUSD = amount / baseRateFrom;
  return amountInUSD * baseRateTo;
};

import { User, Calendar, Plus, Trash2, FileText, Hash, Receipt } from "lucide-react";
import { InvoiceItem } from "@/features/invoices";

function formatCurrency(val: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(val);
}

import { ModalShell } from "@/components/ui/global/modal/ModalShell";
import { ModalHeader } from "@/components/ui/global/modal/ModalHeader";
import { ModalContent } from "@/components/ui/global/modal/ModalContent";
import { ModalFooter } from "@/components/ui/global/modal/ModalFooter";
import { GlobalInput } from "@/components/ui/global/form/GlobalInput";
import { GlobalTextarea } from "@/components/ui/global/form/GlobalTextarea";
import { FormField } from "@/components/ui/global/form/FormField";
import DatePicker from "@/components/ui/DatePicker";
import Dropdown from "@/components/ui/Dropdown";

export default function AddInvoiceModal({ onClose }: { onClose: () => void }) {
  const { addInvoice } = useInvoices();
  const { contacts } = useContacts();
  const { allProducts } = useProducts();
  const [contactName, setContactName] = useState("");
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState(() => "INV-" + new Date().getFullYear() + "-" + Math.floor(Math.random() * 1000));
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [items, setItems] = useState<(Partial<InvoiceItem> & { discountType?: "percentage" | "fixed" })[]>([
    { id: "1", description: "", quantity: 1, unitPrice: 0, discount: 0, discountType: "percentage", amount: 0 }
  ]);
  const [taxRate, setTaxRate] = useState<string>("");
  const [discountRate, setDiscountRate] = useState<string>("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");

  // Track original product prices for re-conversion when currency changes
  const [productOriginals, setProductOriginals] = useState<Record<string, { price: number; currency: string }>>({});

  useEffect(() => {
    if (Object.keys(productOriginals).length === 0) return;
    const run = async () => {
      const updates: Record<string, number> = {};
      for (const [itemId, orig] of Object.entries(productOriginals)) {
        updates[itemId] = await convertCurrency(orig.price, orig.currency, currency);
      }
      setItems(prev => prev.map(it => {
        if (!it.id || updates[it.id] === undefined) return it;
        const qty = it.quantity || 0;
        const price = updates[it.id];
        const disc = it.discount || 0;
        const rawSub = qty * price;
        const discAmt = it.discountType === "fixed" ? disc : rawSub * (disc / 100);
        return { ...it, unitPrice: price, amount: Math.max(0, rawSub - discAmt) };
      }));
    };
    run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency]);

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(), description: "", quantity: 1, unitPrice: 0, discount: 0, discountType: "percentage", amount: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length === 1) return;
    setItems(items.filter(it => it.id !== id));
  };

  const updateItem = (id: string, field: string, value: any) => {
    setItems(currentItems => currentItems.map(it => {
      if (it.id !== id) return it;
      const updated = { ...it, [field]: value } as any;
      const qty = updated.quantity || 0;
      const price = updated.unitPrice || 0;
      const rawSub = qty * price;
      const disc = updated.discount || 0;
      const discAmt = updated.discountType === "fixed" ? disc : rawSub * (disc / 100);
      updated.amount = Math.max(0, rawSub - discAmt);
      return updated;
    }));
  };

  const subtotal = items.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const parsedDiscount = parseFloat(discountRate) || 0;
  const parsedTax = parseFloat(taxRate) || 0;

  const discountAmt = discountType === "fixed" ? parsedDiscount : subtotal * (parsedDiscount / 100);
  const clampedDiscount = Math.min(subtotal, Math.max(0, discountAmt));
  const taxAmt = Math.max(0, (subtotal - clampedDiscount) * (parsedTax / 100));
  const total = Math.max(0, subtotal - clampedDiscount + taxAmt);

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
      status: "Unpaid",
      subtotal,
      discountRate: parsedDiscount,
      discountTotal: clampedDiscount,
      taxRate: parsedTax,
      taxTotal: taxAmt,
      totalAmount: total,
      currency
    });
    onClose();
  };

  return (
    <ModalShell onClose={onClose} maxWidth={640}>
      <ModalHeader title="New Invoice" onClose={onClose} />

      <ModalContent className="db-sidebar space-y-6">
        <div className="space-y-4">
          <GlobalInput
            autoFocus
            required
            maxLength={60}
            placeholder="Invoice Number (e.g. INV-2026-...)…"
            value={invoiceNumber}
            onChange={e => setInvoiceNumber(e.target.value)}
            className="font-display font-semibold"
            style={{ fontSize: "16px", background: "transparent", border: "none", padding: "0" }}
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="relative">
              <GlobalInput
                label="Customer Name"
                icon={<User size={11} strokeWidth={1.75} />}
                maxLength={40}
                placeholder="Select or enter customer"
                value={contactName}
                onChange={e => setContactName(e.target.value)}
                onFocus={() => setIsCustomerDropdownOpen(true)}
                onBlur={() => setTimeout(() => setIsCustomerDropdownOpen(false), 200)}
              />
              {isCustomerDropdownOpen && (
                <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-surface-container-lowest border border-black/10 rounded-[8px] shadow-lg z-50 max-h-48 overflow-y-auto py-1">
                  {contacts.filter(c => c.name.toLowerCase().includes(contactName.toLowerCase())).length > 0 ? (
                    contacts.filter(c => c.name.toLowerCase().includes(contactName.toLowerCase())).map(c => (
                      <div
                        key={c.id}
                        className="px-3 py-2 cursor-pointer hover:bg-black/5 font-display text-[13px] text-on-surface transition-colors"
                        onClick={() => {
                          setContactName(c.name);
                          setIsCustomerDropdownOpen(false);
                        }}
                      >
                        {c.name}
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-3 text-center text-on-surface-variant opacity-50 font-body-sm text-[12px]">
                      No contacts found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <FormField label="Due Date" required>
              <DatePicker
                value={dueDate}
                onChange={val => setDueDate(val || "")}
                className="w-full"
              />
            </FormField>
            <FormField label="Currency">
              <Dropdown
                value={currency}
                options={[
                  { value: "USD", label: "USD" },
                  { value: "IDR", label: "IDR" },
                  { value: "EUR", label: "EUR" },
                  { value: "GBP", label: "GBP" },
                  { value: "SGD", label: "SGD" },
                ]}
                onChange={setCurrency}
              />
            </FormField>
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
                      placeholder="Item description (type or select)..."
                      value={item.description}
                      maxLength={40}
                      onChange={e => {
                        updateItem(item.id!, "description", e.target.value);
                        // User manually editing — stop tracking original
                        setProductOriginals(prev => { const n = { ...prev }; delete n[item.id!]; return n; });
                      }}
                      onFocus={() => setActiveDropdownId(item.id!)}
                      onBlur={() => setTimeout(() => setActiveDropdownId(null), 200)}
                      className="w-full bg-black/[0.02] border border-black/[0.06] rounded-[6px] px-3 py-1.5 font-display text-[13px] outline-none focus:bg-white focus:border-primary/30 transition-all placeholder:opacity-40"
                    />
                    {activeDropdownId === item.id && (
                      <div className="absolute top-[calc(100%+4px)] left-0 w-[240px] bg-surface-container-lowest border border-black/10 rounded-[8px] shadow-lg z-50 max-h-48 overflow-y-auto py-1">
                        {allProducts.filter(p => p.name.toLowerCase().includes((item.description || "").toLowerCase())).length > 0 ? (
                          allProducts.filter(p => p.name.toLowerCase().includes((item.description || "").toLowerCase())).map(p => (
                            <div
                              key={p.id}
                              className="px-3 py-2 cursor-pointer hover:bg-black/5 flex justify-between items-center transition-colors"
                              onMouseDown={async (e) => {
                                e.preventDefault();
                                updateItem(item.id!, "description", p.name);
                                // Store original for re-conversion on currency change
                                setProductOriginals(prev => ({ ...prev, [item.id!]: { price: p.price, currency: p.currency || "USD" } }));
                                const convertedPrice = await convertCurrency(p.price, p.currency || "USD", currency);
                                updateItem(item.id!, "unitPrice", convertedPrice);
                                setActiveDropdownId(null);
                              }}
                            >
                              <span className="font-display text-[13px] text-on-surface truncate pr-2">{p.name}</span>
                              <span className="font-body-sm text-[11px] text-on-surface-variant opacity-60 shrink-0">{formatCurrency(p.price, p.currency || "USD")}</span>
                            </div>
                          ))
                        ) : (
                          <div className="px-3 py-3 text-center text-on-surface-variant opacity-50 font-body-sm text-[12px]">
                            No products found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={item.quantity || ""}
                    onChange={e => updateItem(item.id!, "quantity", parseInt(e.target.value) || 0)}
                    className="w-full bg-black/[0.02] border border-black/[0.06] rounded-[6px] px-2 py-1.5 font-display text-[13px] outline-none text-center focus:bg-white focus:border-primary/30 transition-all"
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Price"
                    value={item.unitPrice || ""}
                    onChange={e => updateItem(item.id!, "unitPrice", parseFloat(e.target.value) || 0)}
                    className="w-full bg-black/[0.02] border border-black/[0.06] rounded-[6px] px-2 py-1.5 font-display text-[13px] outline-none text-right focus:bg-white focus:border-primary/30 transition-all"
                  />
                  <div className="relative flex items-center bg-black/[0.02] border border-black/[0.06] rounded-[6px] focus-within:bg-white focus-within:border-primary/30 transition-all overflow-hidden">
                    <input
                      type="number"
                      min="0"
                      value={item.discount || ""}
                      onChange={e => updateItem(item.id!, "discount", parseFloat(e.target.value) || 0)}
                      className="w-full bg-transparent px-2 py-1.5 font-display text-[13px] outline-none text-right"
                    />
                    <button
                      type="button"
                      onClick={() => updateItem(item.id!, "discountType", item.discountType === "fixed" ? "percentage" : "fixed")}
                      className="px-1.5 py-1.5 text-[10px] font-bold text-on-surface-variant opacity-60 hover:opacity-100 hover:bg-black/5 border-l border-black/[0.06] transition-all"
                    >
                      {item.discountType === "fixed" ? "$" : "%"}
                    </button>
                  </div>
                  <div className="text-right font-display text-[13px] font-semibold opacity-80 pl-1 truncate" title={formatCurrency(item.amount || 0, currency)}>
                    {(item.amount || 0) > 0 ? formatCurrency(item.amount || 0, currency) : "—"}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id!)}
                    disabled={items.length === 1}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-all flex items-center justify-center opacity-40 hover:opacity-100 disabled:opacity-10"
                  >
                    <Trash2 size={13} strokeWidth={2} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <div className="w-full flex justify-end items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="font-label-caps text-[9px] uppercase tracking-[0.12em] font-semibold opacity-40 ml-auto">Discount</span>
              <div className="w-[100px] relative flex items-center bg-black/[0.02] border border-black/[0.06] rounded-[6px] focus-within:bg-white focus-within:border-primary/30 transition-all overflow-hidden">
                <input
                  type="number"
                  min="0"
                  value={discountRate}
                  onChange={e => setDiscountRate(e.target.value)}
                  className="w-full bg-transparent px-2 py-1.5 font-display text-[13px] outline-none text-right"
                  placeholder="0.00"
                />
                <button
                  type="button"
                  onClick={() => setDiscountType(prev => prev === "fixed" ? "percentage" : "fixed")}
                  className="px-2 py-1.5 text-[11px] font-bold text-on-surface-variant opacity-60 hover:opacity-100 hover:bg-black/5 border-l border-black/[0.06] transition-all"
                >
                  {discountType === "fixed" ? "$" : "%"}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-label-caps text-[9px] uppercase tracking-[0.12em] font-semibold opacity-40 ml-auto">Tax</span>
              <div className="w-[100px] relative flex items-center bg-black/[0.02] border border-black/[0.06] rounded-[6px] focus-within:bg-white focus-within:border-primary/30 transition-all overflow-hidden">
                <input
                  type="number"
                  min="0"
                  value={taxRate}
                  onChange={e => setTaxRate(e.target.value)}
                  className="w-full bg-transparent pl-3 pr-2 py-1.5 font-display text-[13px] outline-none text-right"
                  placeholder="0.00"
                />
                <div className="px-2 py-1.5 text-[11px] font-bold text-on-surface-variant opacity-60 bg-black/[0.02] border-l border-black/[0.06]">
                  %
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <div className="w-full max-w-[200px] space-y-2">
            <div className="flex justify-between items-center text-[11.5px]">
              <span className="font-body-sm" style={{ color: "var(--color-on-surface-variant)", opacity: 0.6 }}>Subtotal</span>
              <span className="font-display" style={{ opacity: 0.7 }}>{formatCurrency(subtotal, currency)}</span>
            </div>
            {clampedDiscount > 0 && (
              <div className="flex justify-between items-center text-[11.5px] text-red-500">
                <span className="font-body-sm opacity-60">Discount {discountType === "percentage" && parsedDiscount ? `(${parsedDiscount}%)` : ""}</span>
                <span className="font-display opacity-80">−{formatCurrency(clampedDiscount, currency)}</span>
              </div>
            )}
            {taxAmt > 0 && (
              <div className="flex justify-between items-center text-[11.5px]">
                <span className="font-body-sm" style={{ color: "var(--color-on-surface-variant)", opacity: 0.6 }}>Tax {parsedTax ? `(${parsedTax}%)` : ""}</span>
                <span className="font-display" style={{ opacity: 0.7 }}>+{formatCurrency(taxAmt, currency)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-1.5" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
              <span className="font-label-caps text-[9px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--color-on-surface-variant)", opacity: 0.6 }}>Total</span>
              <span className="font-display font-bold text-[15px]" style={{ color: "var(--color-on-surface)", opacity: 0.9 }}>{formatCurrency(total, currency)}</span>
            </div>
          </div>
        </div>

      </ModalContent>

      <ModalFooter>
        <button type="button" onClick={onClose} className="font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold px-3.5 py-2 rounded-[6px] hover:bg-black/[0.05] transition-colors" style={{ color: "var(--color-on-surface-variant)", opacity: 0.65 }}>
          Cancel
        </button>
        <button type="button" onClick={handleSubmit} disabled={!isValid} className="font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold px-4 py-2 rounded-[6px] disabled:opacity-30 hover:-translate-y-px transition-all" style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
          Generate Invoice
        </button>
      </ModalFooter>
    </ModalShell>
  );
}
