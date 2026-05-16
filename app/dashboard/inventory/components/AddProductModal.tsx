"use client";

import React, { useState } from "react";
import { useInventory } from "../context/InventoryContext";
import { Package, Tag, Layers, ShieldAlert, Building2 } from "lucide-react";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function AddProductModal({ onClose }: { onClose: () => void }) {
  const { addProduct } = useInventory();
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [totalQuantity, setTotalQuantity] = useState("");
  const [minThreshold, setMinThreshold] = useState("10");
  const [supplierName, setSupplierName] = useState("");

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim() || !sku.trim()) return;

    addProduct({
      name,
      sku,
      category,
      totalQuantity: parseInt(totalQuantity) || 0,
      minThreshold: parseInt(minThreshold) || 10,
      supplierName: supplierName || undefined,
      variants: [],
    });
    onClose();
  };

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
          label="Product Name *"
          placeholder="e.g. Premium Ergonomic Mouse"
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

        <div className="p-5 rounded-xl bg-black/[0.01] border border-black/[0.03] space-y-5">
          <div className="flex items-center gap-2 mb-1">
             <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
             <h3 className="font-display font-bold text-[11px] uppercase tracking-wider opacity-60">Inventory & Stock</h3>
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
              label="Alert Threshold"
              type="number"
              icon={ShieldAlert}
              value={minThreshold}
              onChange={e => setMinThreshold(e.target.value)}
            />
          </div>
        </div>

        <Input 
          label="Preferred Supplier"
          icon={Building2}
          placeholder="Search suppliers..."
          value={supplierName}
          onChange={e => setSupplierName(e.target.value)}
        />
      </form>
    </Modal>
  );
}
