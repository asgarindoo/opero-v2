"use client";

import React, { useState } from "react";
import { Package, Tag, Layers, ShieldAlert, DollarSign, Wrench } from "lucide-react";
import { useProducts } from "../context/ProductsContext";
import { ProductType } from "@/features/products";

import { ModalShell } from "@/components/ui/global/modal/ModalShell";
import { ModalHeader } from "@/components/ui/global/modal/ModalHeader";
import { ModalContent } from "@/components/ui/global/modal/ModalContent";
import { ModalFooter } from "@/components/ui/global/modal/ModalFooter";
import { GlobalInput } from "@/components/ui/global/form/GlobalInput";
import { FormSection } from "@/components/ui/global/form/FormField";

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
    <ModalShell onClose={onClose} maxWidth={480}>
      <ModalHeader title="New Product" icon={<Package size={14} style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }} />} onClose={onClose} />
      
      <ModalContent className="space-y-5">
        <GlobalInput
          label="Product / Service Name"
          required
          maxLength={80}
          autoFocus
          placeholder="e.g. Premium Ergonomic Mouse"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <GlobalInput
            label="SKU / Code"
            icon={<Tag size={11} strokeWidth={1.75} />}
            required
            maxLength={20}
            placeholder="PRD-001"
            value={sku}
            onChange={e => setSku(e.target.value)}
          />
          <GlobalInput
            label="Category"
            icon={<Layers size={11} strokeWidth={1.75} />}
            maxLength={30}
            placeholder="Electronics"
            value={category}
            onChange={e => setCategory(e.target.value)}
          />
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="font-label-caps text-[9px] uppercase tracking-[0.12em] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }}>
              Type
            </span>
          </div>
          <div className="flex p-1 rounded-[8px]" style={{ background: "rgba(0,0,0,0.03)" }}>
            <button
              type="button"
              onClick={() => setType("Physical")}
              className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-[6px] font-label-caps text-[9px] font-bold transition-all"
              style={type === "Physical" ? { background: "#fff", color: "var(--color-on-surface)", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" } : { color: "var(--color-on-surface-variant)", opacity: 0.6 }}
            >
              <Package size={12} strokeWidth={1.75} /> PHYSICAL
            </button>
            <button
              type="button"
              onClick={() => setType("Service")}
              className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-[6px] font-label-caps text-[9px] font-bold transition-all"
              style={type === "Service" ? { background: "#fff", color: "var(--color-on-surface)", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" } : { color: "var(--color-on-surface-variant)", opacity: 0.6 }}
            >
              <Wrench size={12} strokeWidth={1.75} /> SERVICE
            </button>
          </div>
        </div>

        <GlobalInput
          label="Price"
          type="number"
          icon={<DollarSign size={11} strokeWidth={1.75} />}
          placeholder="0.00"
          value={price}
          onChange={e => setPrice(e.target.value)}
        />

        {!isService && (
          <FormSection title="Stock & Alerts">
            <div className="grid grid-cols-2 gap-4">
              <GlobalInput
                label="Initial Stock"
                type="number"
                placeholder="0"
                value={totalQuantity}
                onChange={e => setTotalQuantity(e.target.value)}
              />
              <GlobalInput
                label="Low Stock Alert"
                type="number"
                icon={<ShieldAlert size={11} strokeWidth={1.75} />}
                value={minThreshold}
                onChange={e => setMinThreshold(e.target.value)}
              />
            </div>
          </FormSection>
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
