"use client";

import React, { useState } from "react";
import { Package, Tag, Layers, ShieldAlert, DollarSign, Wrench } from "lucide-react";
import { useProducts } from "../context/ProductsContext";
import { ProductType } from "@/features/products";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Dropdown from "@/components/ui/Dropdown";

export default function AddProductModal({ onClose }: { onClose: () => void }) {
  const { addProduct } = useProducts();
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState<ProductType>("Physical");
  const [price, setPrice] = useState("");
  const [totalQuantity, setTotalQuantity] = useState("");
  const [minThreshold, setMinThreshold] = useState("10");

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim() || !sku.trim()) return;

    addProduct({
      name,
      sku,
      category,
      type,
      price: parseFloat(price) || 0,
      totalQuantity: type === "Service" ? 0 : (parseInt(totalQuantity) || 0),
      minThreshold: parseInt(minThreshold) || 10,
      variants: [],
    });
    onClose();
  };

  const isService = type === "Service";

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Add New Product"
      size="md"
      footer={(
        <>
          <Button variant="ghost" onClick={onClose}>CANCEL</Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!name.trim() || !sku.trim()}
          >
            CREATE PRODUCT
          </Button>
        </>
      )}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Product / Service Name *"
          placeholder="e.g. Premium Ergonomic Mouse or Logo Design"
          autoFocus
          required
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="SKU / Code *"
            icon={Tag}
            placeholder="PRD-001"
            required
            value={sku}
            onChange={e => setSku(e.target.value)}
          />
          <Input
            label="Category"
            icon={Layers}
            placeholder="Electronics"
            value={category}
            onChange={e => setCategory(e.target.value)}
          />
        </div>

        {/* Type selector */}
        <div>
          <label className="block font-label-caps text-[9px] text-on-surface-variant opacity-60 mb-2 uppercase tracking-wider">
            Type
          </label>
          <div className="flex p-1 rounded-xl bg-black/[0.03] gap-1">
            <button
              type="button"
              onClick={() => setType("Physical")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-label-caps text-[9px] font-bold transition-all ${type === "Physical" ? "bg-white shadow-sm text-on-surface" : "text-on-surface-variant opacity-60 hover:opacity-100"}`}
            >
              <Package size={12} /> PHYSICAL
            </button>
            <button
              type="button"
              onClick={() => setType("Service")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-label-caps text-[9px] font-bold transition-all ${type === "Service" ? "bg-white shadow-sm text-on-surface" : "text-on-surface-variant opacity-60 hover:opacity-100"}`}
            >
              <Wrench size={12} /> SERVICE
            </button>
          </div>
        </div>

        {/* Price */}
        <div className="relative">
          <Input
            label="Price"
            type="number"
            placeholder="0.00"
            icon={DollarSign}
            value={price}
            onChange={e => setPrice(e.target.value)}
          />
        </div>

        {/* Stock section — only for Physical */}
        {!isService && (
          <div className="p-5 rounded-xl bg-black/[0.01] border border-black/[0.03] space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
              <h3 className="font-display font-bold text-[11px] uppercase tracking-wider opacity-60">Stock & Alerts</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Initial Stock"
                type="number"
                placeholder="0"
                value={totalQuantity}
                onChange={e => setTotalQuantity(e.target.value)}
              />
              <Input
                label="Low Stock Alert"
                type="number"
                icon={ShieldAlert}
                value={minThreshold}
                onChange={e => setMinThreshold(e.target.value)}
              />
            </div>
          </div>
        )}

        {isService && (
          <p className="text-[11px] text-on-surface-variant opacity-50 font-body-sm italic">
            Services don't track physical stock. The product will appear as always available.
          </p>
        )}
      </form>
    </Modal>
  );
}
