"use client";

import React, { useState, useRef, useEffect } from "react";
import { Package, Tag, Layers, ShieldAlert, DollarSign, Wrench, ChevronDown } from "lucide-react";
import { useProducts } from "../context/ProductsContext";
import { ProductType } from "@/features/products";

import { ModalShell } from "@/components/ui/global/modal/ModalShell";
import { ModalHeader } from "@/components/ui/global/modal/ModalHeader";
import { ModalContent } from "@/components/ui/global/modal/ModalContent";
import { ModalFooter } from "@/components/ui/global/modal/ModalFooter";
import { GlobalInput } from "@/components/ui/global/form/GlobalInput";

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

export default function AddProductModal({ onClose }: { onClose: () => void }) {
  const { addProduct } = useProducts();
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState<ProductType>("Physical");
  const [price, setPrice] = useState("");
  const [totalQuantity, setTotalQuantity] = useState("");
  const [minThreshold, setMinThreshold] = useState("10");

  const isService = type === "Service";
  const isValid = name.trim() && sku.trim();

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!isValid) return;

    addProduct({
      name: name.trim(),
      sku: sku.trim(),
      category: category.trim(),
      type,
      price: parseFloat(price) || 0,
      totalQuantity: isService ? 0 : (parseInt(totalQuantity) || 0),
      minThreshold: parseInt(minThreshold) || 10,
      variants: [],
    });
    onClose();
  };

  return (
    <ModalShell onClose={onClose} maxWidth={540}>
      <ModalHeader title="New Product" onClose={onClose} />
      
      <ModalContent className="db-sidebar space-y-6">
        <div className="space-y-4">
          <GlobalInput
            autoFocus
            required
            maxLength={60}
            placeholder="Product or Service Name…"
            value={name}
            onChange={e => setName(e.target.value)}
            className="font-display font-semibold"
            style={{ fontSize: "16px", background: "transparent", border: "none", padding: "0" }}
          />

          <div className="flex items-center gap-2 flex-wrap pt-2">
            <Dd
              value={type} opts={["Physical", "Service"] as ProductType[]} onChange={setType}
              renderT={t => <>{t === "Physical" ? <Package size={11} strokeWidth={2} style={{ color: "var(--color-on-surface-variant)", opacity: 0.7 }} /> : <Wrench size={11} strokeWidth={2} style={{ color: "var(--color-on-surface-variant)", opacity: 0.7 }} />}<span className="font-label-caps text-[10px] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.9 }}>{t.toUpperCase()}</span></>}
              renderO={t => <>{t === "Physical" ? <Package size={11} strokeWidth={2} style={{ color: "var(--color-on-surface-variant)", opacity: 0.7 }} /> : <Wrench size={11} strokeWidth={2} style={{ color: "var(--color-on-surface-variant)", opacity: 0.7 }} />}<span className="font-body-md text-[12px]" style={{ color: "var(--color-on-surface-variant)", opacity: 0.9 }}>{t}</span></>}
            />
          </div>
        </div>

        <div>
          <SL icon={<Tag size={11} strokeWidth={1.75} />}>Details</SL>
          <div className="grid grid-cols-2 gap-4">
            <GlobalInput
              required
              maxLength={20}
              placeholder="SKU / Code (e.g. PRD-001)"
              value={sku}
              onChange={e => setSku(e.target.value)}
            />
            <GlobalInput
              maxLength={30}
              placeholder="Category (e.g. Electronics)"
              value={category}
              onChange={e => setCategory(e.target.value)}
            />
          </div>
        </div>

        <div>
          <SL icon={<DollarSign size={11} strokeWidth={1.75} />}>Pricing</SL>
          <GlobalInput
            type="number"
            placeholder="Price (0.00)"
            value={price}
            onChange={e => setPrice(e.target.value)}
          />
        </div>

        {!isService && (
          <div>
            <SL icon={<ShieldAlert size={11} strokeWidth={1.75} />}>Stock & Alerts</SL>
            <div className="grid grid-cols-2 gap-4">
              <GlobalInput
                type="number"
                placeholder="Initial Stock"
                value={totalQuantity}
                onChange={e => setTotalQuantity(e.target.value)}
              />
              <GlobalInput
                type="number"
                placeholder="Low Stock Alert"
                value={minThreshold}
                onChange={e => setMinThreshold(e.target.value)}
              />
            </div>
          </div>
        )}

        {isService && (
          <p className="font-body-md text-[11.5px]" style={{ color: "var(--color-on-surface-variant)", opacity: 0.5, fontStyle: "italic" }}>
            Services don't track physical stock.
          </p>
        )}
      </ModalContent>

      <ModalFooter>
        <button type="button" onClick={onClose} className="font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold px-3.5 py-2 rounded-[6px] hover:bg-black/[0.05] transition-colors" style={{ color: "var(--color-on-surface-variant)", opacity: 0.65 }}>
          Cancel
        </button>
        <button type="button" onClick={handleSubmit} disabled={!isValid} className="font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold px-4 py-2 rounded-[6px] disabled:opacity-30 hover:-translate-y-px transition-all" style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
          Create Product
        </button>
      </ModalFooter>
    </ModalShell>
  );
}
