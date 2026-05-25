"use client";

import React, { useState } from "react";
import { useAssets } from "../context/AssetsContext";
import { useMembers } from "@/features/members/context/MembersContext";
import { Tag, MapPin, LayoutGrid, Calendar, Wallet, User } from "lucide-react";
import MemberPicker from "@/features/tasks/components/MemberPicker";
import { type Member as TaskMember } from "@/features/tasks";

import { ModalShell } from "@/components/ui/global/modal/ModalShell";
import { ModalHeader } from "@/components/ui/global/modal/ModalHeader";
import { ModalContent } from "@/components/ui/global/modal/ModalContent";
import { ModalFooter } from "@/components/ui/global/modal/ModalFooter";
import { GlobalInput } from "@/components/ui/global/form/GlobalInput";
import Dropdown from "@/components/ui/Dropdown";
import DatePicker from "@/components/ui/DatePicker";
import { FormField } from "@/components/ui/global/form/FormField";

const CATEGORY_OPTIONS = [
  { label: "Electronics", value: "Electronics" },
  { label: "Vehicle", value: "Vehicle" },
  { label: "Furniture", value: "Furniture" },
  { label: "Equipment", value: "Equipment" },
  { label: "Property", value: "Property" },
  { label: "Tools", value: "Tools" },
  { label: "Other", value: "Other" },
];

const CURRENCY_OPTIONS = [
  { label: "USD", value: "USD" },
  { label: "IDR", value: "IDR" },
  { label: "EUR", value: "EUR" },
  { label: "GBP", value: "GBP" },
  { label: "SGD", value: "SGD" },
];

export default function AddAssetModal({ onClose }: { onClose: () => void }) {
  const { assets, addAsset } = useAssets();
  const { members } = useMembers(); // Keeping this if needed later, otherwise MemberPicker fetches its own members.

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [assetCode, setAssetCode] = useState("");
  const [status, setStatus] = useState<"Available" | "In Use" | "Maintenance" | "Damaged" | "Archived">("Available");

  const [assignees, setAssignees] = useState<TaskMember[]>([]);
  const [location, setLocation] = useState("");

  const [currency, setCurrency] = useState("USD");
  const [purchaseValue, setPurchaseValue] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [warrantyExpiry, setWarrantyExpiry] = useState("");

  const [error, setError] = useState<string | null>(null);

  const isValid = name.trim() && assetCode.trim() && category.trim();

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!isValid) return;

    const pValue = parseFloat(purchaseValue);
    if (purchaseValue && (isNaN(pValue) || pValue < 0)) {
      setError("Purchase value must be a valid positive number.");
      return;
    }

    if (assets.some(a => a.assetCode.toLowerCase() === assetCode.trim().toLowerCase())) {
      setError("Asset Code already exists.");
      return;
    }

    addAsset({
      name: name.trim(),
      category: category.trim(),
      assetCode: assetCode.trim(),
      status: status,
      assignedTo: assignees.length > 0 ? assignees[0].name : undefined,
      location: location.trim() || undefined,
      purchaseValue: !isNaN(pValue) ? pValue : undefined,
      purchaseDate: purchaseDate || undefined,
      supplierName: supplierName.trim() || undefined,
      warrantyExpiry: warrantyExpiry || undefined,
    });

    onClose();
  };

  return (
    <ModalShell onClose={onClose} maxWidth={480}>
      <ModalHeader title="Register Asset" onClose={onClose} />

      <ModalContent className="db-sidebar space-y-6">
        <div className="space-y-4">
          <GlobalInput
            autoFocus
            required
            maxLength={60}
            placeholder="Asset Name (e.g. MacBook Pro M3)…"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && isValid && handleSubmit()}
            className="font-display font-semibold"
            style={{ fontSize: "16px", background: "transparent", border: "none", padding: "0" }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <GlobalInput
            label="Asset Code"
            icon={<Tag size={11} strokeWidth={1.75} style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }} />}
            required
            maxLength={30}
            placeholder="AST-2026-001"
            value={assetCode}
            onChange={e => {
              setAssetCode(e.target.value);
              setError(null);
            }}
          />
          <FormField label="Category" icon={<LayoutGrid size={11} strokeWidth={1.75} />}>
            <div style={{ padding: "4px 0", border: "1px solid rgba(0,0,0,0.09)", background: "rgba(0,0,0,0.02)", borderRadius: "6px" }}>
              <Dropdown
                value={category}
                onChange={setCategory}
                options={CATEGORY_OPTIONS}
                variant="minimal"
              />
            </div>
          </FormField>
        </div>

        <div style={{ height: 1, background: "rgba(0,0,0,0.06)" }} />

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Assigned To" icon={<User size={11} strokeWidth={1.75} />}>
            <MemberPicker selected={assignees} onChange={setAssignees} max={1} />
          </FormField>
          <GlobalInput
            label="Location"
            icon={<MapPin size={11} strokeWidth={1.75} style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }} />}
            maxLength={40}
            placeholder="Main Office"
            value={location}
            onChange={e => setLocation(e.target.value)}
          />
        </div>

        <div style={{ height: 1, background: "rgba(0,0,0,0.06)" }} />

        <div className="grid grid-cols-2 gap-4">
          <div className="flex gap-2">
            <div className="w-[85px] shrink-0">
              <FormField label="Currency" icon={<Wallet size={11} strokeWidth={1.75} />}>
                <div style={{ padding: "4px 0", border: "1px solid rgba(0,0,0,0.09)", background: "rgba(0,0,0,0.02)", borderRadius: "6px" }}>
                  <Dropdown
                    value={currency}
                    onChange={setCurrency}
                    options={CURRENCY_OPTIONS}
                    variant="minimal"
                  />
                </div>
              </FormField>
            </div>
            <div className="flex-1">
              <GlobalInput
                label="Value"
                type="number"
                placeholder="0.00"
                value={purchaseValue}
                onChange={e => {
                  setPurchaseValue(e.target.value);
                  setError(null);
                }}
              />
            </div>
          </div>
          <FormField label="Purchase Date" icon={<Calendar size={11} strokeWidth={1.75} />}>
            <DatePicker
              value={purchaseDate}
              onChange={val => setPurchaseDate(val || "")}
              placeholder="Select date"
              position="top"
              className="rounded-[6px]"
              triggerStyle={{ border: "1px solid rgba(0,0,0,0.09)", background: "rgba(0,0,0,0.02)", paddingTop: "8px", paddingBottom: "8px" }}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <GlobalInput
            label="Supplier / Vendor (Optional)"
            maxLength={60}
            placeholder="Vendor Name"
            value={supplierName}
            onChange={e => setSupplierName(e.target.value)}
          />
          <FormField label="Warranty Expiry" icon={<Calendar size={11} strokeWidth={1.75} />}>
            <DatePicker
              value={warrantyExpiry}
              onChange={val => setWarrantyExpiry(val || "")}
              placeholder="Select date"
              position="top"
              className="rounded-[6px]"
              triggerStyle={{ border: "1px solid rgba(0,0,0,0.09)", background: "rgba(0,0,0,0.02)", paddingTop: "8px", paddingBottom: "8px" }}
            />
          </FormField>
        </div>

      </ModalContent>

      <ModalFooter summary={
        error ? (
          <span className="text-red-600 font-display text-[11px] font-medium bg-red-50/50 border border-red-100 px-2.5 py-1 rounded-md">
            {error}
          </span>
        ) : null
      }>
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
