"use client";

import React, { useState } from "react";
import { useAssets } from "../context/AssetsContext";
import { Tag, MapPin, LayoutGrid, Calendar, Wallet, UploadCloud, X, Loader2 } from "lucide-react";

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

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [assetCode, setAssetCode] = useState("");
  const [status, setStatus] = useState<"Available" | "In Use" | "Maintenance" | "Damaged" | "Archived">("Available");
  const [quantity, setQuantity] = useState("1");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [location, setLocation] = useState("");

  const [currency, setCurrency] = useState("USD");
  const [purchaseValue, setPurchaseValue] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [warrantyExpiry, setWarrantyExpiry] = useState("");

  const [error, setError] = useState<string | null>(null);

  const isValid = name.trim() && assetCode.trim() && category.trim() && parseInt(quantity) >= 1 && !isUploadingImage;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB.");
      return;
    }

    setError(null);
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!isValid) return;

    const pValue = parseFloat(purchaseValue);
    if (purchaseValue && (isNaN(pValue) || pValue < 0)) {
      setError("Purchase value must be a valid positive number.");
      return;
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 1) {
      setError("Quantity must be at least 1.");
      return;
    }

    if (assets.some(a => a.assetCode.toLowerCase() === assetCode.trim().toLowerCase())) {
      setError("Asset Code already exists.");
      return;
    }

    setIsUploadingImage(true);
    let finalImageUrl = imageUrl;

    if (imageFile) {
      try {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("folder", "assets");
        
        const res = await fetch("/api/tenant/files", {
          method: "POST",
          body: formData,
        });
        
        if (!res.ok) {
          throw new Error(await res.text());
        }
        
        const data = await res.json();
        if (data.downloadUrl) {
          finalImageUrl = data.downloadUrl;
        }
      } catch (err: any) {
        console.error(err);
        setError("Failed to upload image");
        setIsUploadingImage(false);
        return;
      }
    }

    addAsset({
      name: name.trim(),
      category: category.trim(),
      assetCode: assetCode.trim(),
      status: status,
      quantity: qty,
      imageUrl: finalImageUrl.trim() || undefined,
      location: location.trim() || undefined,
      purchaseValue: !isNaN(pValue) ? pValue : undefined,
      currency: currency,
      purchaseDate: purchaseDate || undefined,
      supplierName: supplierName.trim() || undefined,
      warrantyExpiry: warrantyExpiry || undefined,
    });

    setIsUploadingImage(false);
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
            <Dropdown
              value={category}
              onChange={setCategory}
              options={CATEGORY_OPTIONS}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <GlobalInput
            label="Quantity"
            type="number"
            min={1}
            required
            value={quantity}
            onChange={e => {
              setQuantity(e.target.value);
              setError(null);
            }}
          />
          <div className="flex flex-col gap-1.5 h-[58px]">
            <span className="font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-50 uppercase tracking-wider px-1">Asset Image</span>
            {imageUrl ? (
              <div className="relative group w-full h-[38px] rounded-lg border border-black/10 overflow-hidden bg-black/5 flex items-center px-2 gap-2 mt-0.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Preview" className="h-6 w-6 object-cover rounded bg-white shrink-0 border border-black/10" />
                <span className="font-display font-medium text-[11px] text-on-surface opacity-80 truncate flex-1">Image Uploaded</span>
                <button 
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="w-6 h-6 rounded flex items-center justify-center text-on-surface-variant opacity-60 hover:opacity-100 hover:bg-black/5 transition-all focus:outline-none"
                >
                  <X size={12} strokeWidth={2.5} />
                </button>
              </div>
            ) : (
              <label className={`relative flex items-center justify-center w-full h-[38px] mt-0.5 rounded-lg border border-dashed ${isUploadingImage ? 'border-primary/40 bg-primary/5' : 'border-black/20 hover:border-primary/50 hover:bg-black/[0.02]'} transition-all cursor-pointer overflow-hidden group focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50`}>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleImageUpload}
                  disabled={isUploadingImage}
                  className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-default"
                />
                <div className={`flex items-center gap-1.5 transition-colors ${isUploadingImage ? 'text-primary' : 'text-on-surface-variant opacity-60 group-hover:opacity-100 group-hover:text-primary'}`}>
                  {isUploadingImage ? <Loader2 size={12} className="animate-spin" /> : <UploadCloud size={13} strokeWidth={2.2} />}
                  <span className="font-display font-medium text-[11px]">{isUploadingImage ? "Uploading..." : "Click to upload image"}</span>
                </div>
              </label>
            )}
          </div>
        </div>

        <div style={{ height: 1, background: "rgba(0,0,0,0.06)" }} />

        <div className="grid grid-cols-1 gap-4">
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
                <Dropdown
                  value={currency}
                  onChange={setCurrency}
                  options={CURRENCY_OPTIONS}
                />
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
        <button type="button" onClick={handleSubmit} disabled={!isValid || isUploadingImage} className="font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold px-4 py-2 rounded-[6px] disabled:opacity-30 hover:-translate-y-px transition-all flex items-center gap-2" style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
          {isUploadingImage ? (
            <>
              <Loader2 size={12} className="animate-spin" />
              Registering...
            </>
          ) : (
            "Register Asset"
          )}
        </button>
      </ModalFooter>
    </ModalShell>
  );
}
