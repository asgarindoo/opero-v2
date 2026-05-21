"use client";

import React, { useState } from "react";
import { useAssets } from "../context/AssetsContext";
import { Landmark, Tag, MapPin, DollarSign, Calendar, CheckSquare, Square } from "lucide-react";
import { createTransaction } from "@/features/finance/services/finance.client";
import OperationModal from "@/components/ui/OperationModal";
import OperationInput from "@/components/ui/OperationInput";
import OperationTextarea from "@/components/ui/OperationTextarea";

export default function AddAssetModal({ onClose }: { onClose: () => void }) {
  const { addAsset } = useAssets();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [assetCode, setAssetCode] = useState("");
  const [location, setLocation] = useState("");
  const [department, setDepartment] = useState("");
  const [purchaseValue, setPurchaseValue] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");

  const [recordExpense, setRecordExpense] = useState(false);

  const isValid = name.trim() && assetCode.trim();

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!isValid) return;

    const pValue = parseFloat(purchaseValue);

    addAsset({
      name: name.trim(),
      category: category.trim(),
      assetCode: assetCode.trim(),
      location: location.trim(),
      department: department.trim(),
      purchaseValue: pValue || undefined,
      purchaseDate: purchaseDate || undefined,
      status: "Active"
    });

    if (recordExpense && pValue > 0) {
      createTransaction({
        id: "tx" + Date.now(),
        type: "Expense",
        amount: pValue,
        description: `Asset Purchase: ${name.trim()} (${assetCode.trim()})`,
        date: purchaseDate || new Date().toISOString().split("T")[0],
        category: category.trim() || "Asset Purchase",
        paymentMethod: "Bank Transfer",
        status: "Completed",
        notes: "Auto-recorded from Asset Registration"
      }).catch(err => console.error("Failed to record expense:", err));
    }

    onClose();
  };

  const footer = (
    <>
      <div />
      <div className="flex items-center gap-2 shrink-0">
        <button type="button" onClick={onClose} className="font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold px-3.5 py-2 rounded-[6px] hover:bg-black/[0.05] transition-colors" style={{ color: "var(--color-on-surface-variant)", opacity: 0.65 }}>
          Cancel
        </button>
        <button type="button" onClick={handleSubmit} disabled={!isValid} className="font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold px-4 py-2 rounded-[6px] disabled:opacity-30 hover:-translate-y-px transition-all" style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
          Register Asset
        </button>
      </div>
    </>
  );

  return (
    <OperationModal
      onClose={onClose}
      title="Register Asset"
      icon={<Landmark size={14} style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }} />}
      maxWidth={480}
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <OperationInput
          label="Asset Name"
          required
          maxLength={80}
          autoFocus
          placeholder="e.g. MacBook Pro 16"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <OperationInput
            label="Asset Code / Serial"
            icon={<Tag size={11} strokeWidth={1.75} />}
            required
            maxLength={40}
            placeholder="SN-123456"
            value={assetCode}
            onChange={e => setAssetCode(e.target.value)}
          />
          <OperationInput
            label="Category"
            maxLength={40}
            placeholder="Computing"
            value={category}
            onChange={e => setCategory(e.target.value)}
          />
        </div>

        <div className="p-4 rounded-[8px] space-y-4" style={{ background: "rgba(0,0,0,0.01)", border: "1px dashed rgba(0,0,0,0.09)" }}>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="font-label-caps text-[9px] uppercase tracking-[0.12em] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }}>
              Assignment & Location
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <OperationInput
              label="Department"
              maxLength={60}
              placeholder="IT Dept"
              value={department}
              onChange={e => setDepartment(e.target.value)}
            />
            <OperationInput
              label="Initial Location"
              icon={<MapPin size={11} strokeWidth={1.75} />}
              maxLength={60}
              placeholder="Floor 2"
              value={location}
              onChange={e => setLocation(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <OperationInput
            label="Purchase Value"
            type="number"
            icon={<DollarSign size={11} strokeWidth={1.75} />}
            placeholder="0.00"
            value={purchaseValue}
            onChange={e => setPurchaseValue(e.target.value)}
          />
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Calendar size={11} strokeWidth={1.75} style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }} />
              <span className="font-label-caps text-[9px] uppercase tracking-[0.12em] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }}>
                Purchase Date
              </span>
            </div>
            <input
              type="date"
              value={purchaseDate}
              onChange={e => setPurchaseDate(e.target.value)}
              className="w-full font-body-md text-[13px] rounded-[6px] px-3 py-2.5 outline-none transition-all"
              style={{ border: "1px solid rgba(0,0,0,0.09)", background: "rgba(0,0,0,0.02)", color: "var(--color-on-surface)" }}
              onFocus={(e) => { e.target.style.background = "rgba(0,0,0,0.04)"; e.target.style.borderColor = "rgba(0,0,0,0.2)"; }}
              onBlur={(e) => { e.target.style.background = "rgba(0,0,0,0.02)"; e.target.style.borderColor = "rgba(0,0,0,0.09)"; }}
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => setRecordExpense(!recordExpense)}
            className="flex items-center gap-2 group transition-colors"
          >
            {recordExpense ? (
              <CheckSquare size={14} strokeWidth={2} style={{ color: "rgba(0,120,60,0.8)" }} />
            ) : (
              <Square size={14} strokeWidth={1.75} style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }} />
            )}
            <span className="font-body-md text-[12px]" style={{ color: "var(--color-on-surface-variant)", opacity: recordExpense ? 0.8 : 0.6 }}>
              Automatically record this purchase as an Expense in Finance
            </span>
          </button>
        </div>
      </form>
    </OperationModal>
  );
}
