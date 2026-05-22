"use client";

import React, { useState } from "react";
import { useAssets } from "../context/AssetsContext";
import { Landmark, Tag, MapPin, DollarSign } from "lucide-react";
import { createTransaction } from "@/features/finance/services/finance.client";

import { ModalShell } from "@/components/ui/global/modal/ModalShell";
import { ModalHeader } from "@/components/ui/global/modal/ModalHeader";
import { ModalContent } from "@/components/ui/global/modal/ModalContent";
import { ModalFooter } from "@/components/ui/global/modal/ModalFooter";
import { GlobalInput } from "@/components/ui/global/form/GlobalInput";
import { GlobalDatePicker } from "@/components/ui/global/form/GlobalDatePicker";
import { GlobalCheckbox } from "@/components/ui/global/form/GlobalCheckbox";
import { FormSection } from "@/components/ui/global/form/FormField";

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

  return (
    <ModalShell onClose={onClose} maxWidth={480}>
      <ModalHeader title="Register Asset" icon={<Landmark size={14} style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }} />} onClose={onClose} />
      
      <ModalContent className="space-y-6">
        <GlobalInput
          label="Asset Name"
          required
          maxLength={50}
          autoFocus
          placeholder="e.g. MacBook Pro 16"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <GlobalInput
            label="Asset Code / Serial"
            icon={<Tag size={11} strokeWidth={1.75} />}
            required
            maxLength={30}
            placeholder="SN-123456"
            value={assetCode}
            onChange={e => setAssetCode(e.target.value)}
          />
          <GlobalInput
            label="Category"
            maxLength={30}
            placeholder="Computing"
            value={category}
            onChange={e => setCategory(e.target.value)}
          />
        </div>

        <FormSection title="Assignment & Location">
          <div className="grid grid-cols-2 gap-4">
            <GlobalInput
              label="Department"
              maxLength={30}
              placeholder="IT Dept"
              value={department}
              onChange={e => setDepartment(e.target.value)}
            />
            <GlobalInput
              label="Initial Location"
              icon={<MapPin size={11} strokeWidth={1.75} />}
              maxLength={40}
              placeholder="Floor 2"
              value={location}
              onChange={e => setLocation(e.target.value)}
            />
          </div>
        </FormSection>

        <div className="grid grid-cols-2 gap-4">
          <GlobalInput
            label="Purchase Value"
            type="number"
            icon={<DollarSign size={11} strokeWidth={1.75} />}
            placeholder="0.00"
            value={purchaseValue}
            onChange={e => setPurchaseValue(e.target.value)}
          />
          <GlobalDatePicker
            label="Purchase Date"
            value={purchaseDate}
            onChange={e => setPurchaseDate(e.target.value)}
          />
        </div>

        <div className="pt-2">
          <GlobalCheckbox
            label="Automatically record this purchase as an Expense in Finance"
            checked={recordExpense}
            onChange={setRecordExpense}
          />
        </div>
      </ModalContent>

      <ModalFooter>
        <button type="button" onClick={onClose} className="font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold px-3.5 py-2 rounded-[6px] hover:bg-black/[0.05] transition-colors" style={{ color: "var(--color-on-surface-variant)", opacity: 0.65 }}>
          Cancel
        </button>
        <button type="button" onClick={handleSubmit} disabled={!isValid} className="font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold px-4 py-2 rounded-[6px] disabled:opacity-30 hover:-translate-y-px transition-all" style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
          Register Asset
        </button>
      </ModalFooter>
    </ModalShell>
  );
}
