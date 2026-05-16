import React, { useState } from "react";
import { useAssets } from "../context/AssetsContext";
import { X, Landmark, Tag, User, MapPin, DollarSign, Calendar } from "lucide-react";

export default function AddAssetModal({ onClose }: { onClose: () => void }) {
  const { addAsset } = useAssets();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [assetCode, setAssetCode] = useState("");
  const [location, setLocation] = useState("");
  const [department, setDepartment] = useState("");
  const [purchaseValue, setPurchaseValue] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !assetCode.trim()) return;

    addAsset({
      name,
      category,
      assetCode,
      location,
      department,
      purchaseValue: parseFloat(purchaseValue) || undefined,
      purchaseDate: purchaseDate || undefined,
      status: "Active"
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/10 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-[480px] bg-surface-container-lowest rounded-2xl shadow-2xl animate-scale-in border border-black/5 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/[0.04]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Landmark size={14} />
            </div>
            <h2 className="font-display font-semibold text-[15px] text-on-surface">Register New Asset</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-on-surface-variant opacity-70 hover:opacity-100 hover:bg-black/5 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 max-h-[75vh] overflow-y-auto px-6 py-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block font-label-caps text-[9px] text-on-surface-variant opacity-60 mb-1.5 uppercase tracking-wider">Asset Name *</label>
              <input 
                type="text" autoFocus required value={name} onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary/40 outline-none transition-all font-body-sm text-[12.5px] text-on-surface"
                placeholder="e.g. MacBook Pro 16"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-label-caps text-[9px] text-on-surface-variant opacity-60 mb-1.5 uppercase tracking-wider">Asset Code / Serial *</label>
                <div className="relative flex items-center">
                  <Tag size={13} className="absolute left-3 text-on-surface-variant opacity-60" />
                  <input 
                    type="text" required value={assetCode} onChange={e => setAssetCode(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-black/10 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary/40 outline-none transition-all font-body-sm text-[12.5px] text-on-surface"
                    placeholder="SN-123456"
                  />
                </div>
              </div>
              <div>
                <label className="block font-label-caps text-[9px] text-on-surface-variant opacity-60 mb-1.5 uppercase tracking-wider">Category</label>
                <input 
                  type="text" value={category} onChange={e => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary/40 outline-none transition-all font-body-sm text-[12.5px] text-on-surface"
                  placeholder="Computing"
                />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-low/50 border border-black/[0.03] space-y-4">
            <h3 className="font-display font-medium text-[12px] text-on-surface opacity-80">Assignment & Location</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-label-caps text-[8.5px] text-on-surface-variant opacity-60 mb-1.5 uppercase tracking-wider">Department</label>
                <input 
                  type="text" value={department} onChange={e => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-black/10 bg-surface-container-lowest focus:border-primary/40 outline-none transition-all font-body-sm text-[12px] text-on-surface"
                  placeholder="IT Dept"
                />
              </div>
              <div>
                <label className="block font-label-caps text-[8.5px] text-on-surface-variant opacity-60 mb-1.5 uppercase tracking-wider">Initial Location</label>
                <div className="relative flex items-center">
                  <MapPin size={13} className="absolute left-3 text-on-surface-variant opacity-60" />
                  <input 
                    type="text" value={location} onChange={e => setLocation(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-black/10 bg-surface-container-lowest focus:border-primary/40 outline-none transition-all font-body-sm text-[12px] text-on-surface"
                    placeholder="Floor 2"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-label-caps text-[9px] text-on-surface-variant opacity-60 mb-1.5 uppercase tracking-wider">Purchase Value</label>
              <div className="relative flex items-center">
                <DollarSign size={13} className="absolute left-3 text-on-surface-variant opacity-60" />
                <input 
                  type="number" value={purchaseValue} onChange={e => setPurchaseValue(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-black/10 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary/40 outline-none transition-all font-body-sm text-[12.5px] text-on-surface"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label className="block font-label-caps text-[9px] text-on-surface-variant opacity-60 mb-1.5 uppercase tracking-wider">Purchase Date</label>
              <div className="relative flex items-center">
                <Calendar size={13} className="absolute left-3 text-on-surface-variant opacity-60" />
                <input 
                  type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-black/10 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary/40 outline-none transition-all font-body-sm text-[12.5px] text-on-surface"
                />
              </div>
            </div>
          </div>
        </form>

        <div className="px-6 py-4 bg-surface-container-low border-t border-black/[0.04] flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg font-label-caps text-[10px] font-bold tracking-wide text-on-surface-variant hover:bg-black/5 transition-colors">CANCEL</button>
          <button 
            type="submit" onClick={handleSubmit} disabled={!name.trim() || !assetCode.trim()}
            className="px-6 py-2 rounded-lg font-label-caps text-[10px] font-bold tracking-wide bg-primary text-on-primary hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all disabled:opacity-60"
          >
            REGISTER ASSET
          </button>
        </div>
      </div>
    </div>
  );
}
