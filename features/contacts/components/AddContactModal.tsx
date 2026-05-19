import React, { useState } from "react";
import { useContacts } from "../context/ContactsContext";
import { X, User, Building2, Briefcase, Mail, DollarSign } from "lucide-react";
import { ContactStatus, RelationshipType, ContactContextData } from "../types";

export default function AddContactModal({ onClose }: { onClose: () => void }) {
  const { addContact } = useContacts();
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [relationshipType, setRelationshipType] = useState<RelationshipType>("Customer");
  const [status, setStatus] = useState<ContactStatus>("Lead");
  const [personName, setPersonName] = useState("");
  const [personEmail, setPersonEmail] = useState("");

  // Standard Relationship Data
  const [dealValue, setDealValue] = useState("");
  const [salesStage, setSalesStage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const contextData: ContactContextData = {
      value: dealValue ? Number(dealValue) : undefined,
      stage: salesStage || undefined
    };

    addContact({
      name,
      industry: industry || "Unspecified",
      relationshipType,
      status,
      contextData,
      persons: personName ? [{
        id: "p" + Date.now(),
        name: personName,
        email: personEmail || "",
        role: "Contact Person",
        isPrimary: true
      }] : []
    });
    onClose();
  };

  const isFinancialType = ["Customer", "Reseller", "Distributor", "Affiliate", "Investor", "Supplier", "Vendor"].includes(relationshipType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/10 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal Box */}
      <div className="relative w-full max-w-[440px] bg-surface-container-lowest rounded-2xl shadow-2xl animate-scale-in border border-black/5 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/[0.04]">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
              <User size={13} />
            </div>
            <h2 className="font-display font-medium text-[14px] text-on-surface">New Contact</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-on-surface-variant opacity-70 hover:opacity-100 hover:bg-black/5 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 max-h-[70vh] overflow-y-auto px-6 py-6 space-y-6">
          
          <div className="space-y-4">
            <div>
              <label className="block font-label-caps text-[9px] text-on-surface-variant opacity-60 mb-1.5 uppercase tracking-wider">Company / Contact Name *</label>
              <div className="relative flex items-center">
                <Building2 size={13} className="absolute left-3.5 text-on-surface-variant opacity-60" />
                <input 
                  type="text" 
                  autoFocus
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-black/5 bg-surface-container-low/50 focus:bg-surface-container-lowest focus:border-primary/30 focus:shadow-[0_4px_16px_rgba(0,0,0,0.02)] outline-none transition-all font-body-sm text-[12.5px] text-on-surface"
                  placeholder="e.g. Acme Corp"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-label-caps text-[9px] text-on-surface-variant opacity-60 mb-1.5 uppercase tracking-wider">Relationship</label>
                <div className="relative flex items-center">
                  <Briefcase size={13} className="absolute left-3.5 text-on-surface-variant opacity-60" />
                  <select
                    value={relationshipType}
                    onChange={e => setRelationshipType(e.target.value as RelationshipType)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-black/5 bg-surface-container-low/50 focus:bg-surface-container-lowest focus:border-primary/30 outline-none transition-all font-body-sm text-[12.5px] text-on-surface appearance-none"
                  >
                    <option value="Customer">Customer</option>
                    <option value="Partner">Partner</option>
                    <option value="Supplier">Supplier</option>
                    <option value="Investor">Investor</option>
                    <option value="Vendor">Vendor</option>
                    <option value="Reseller">Reseller</option>
                    <option value="Distributor">Distributor</option>
                    <option value="Affiliate">Affiliate</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-label-caps text-[9px] text-on-surface-variant opacity-60 mb-1.5 uppercase tracking-wider">Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as ContactStatus)}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/5 bg-surface-container-low/50 focus:bg-surface-container-lowest focus:border-primary/30 outline-none transition-all font-body-sm text-[12.5px] text-on-surface appearance-none"
                >
                  <option value="Lead">Lead</option>
                  <option value="Onboarding">Onboarding</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-label-caps text-[9px] text-on-surface-variant opacity-60 mb-1.5 uppercase tracking-wider">Industry</label>
              <input 
                type="text" 
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-black/5 bg-surface-container-low/50 focus:bg-surface-container-lowest focus:border-primary/30 outline-none transition-all font-body-sm text-[12.5px] text-on-surface"
                placeholder="e.g. Software, Logistics"
              />
            </div>
          </div>

          {/* Unified Business Details Section */}
          {isFinancialType && (
            <div className="p-4 rounded-xl bg-surface-container-low/50 border border-black/[0.03] animate-fade-in space-y-4">
              <h3 className="font-display font-medium text-[12px] text-on-surface opacity-80">Relationship Overview</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-caps text-[8.5px] text-on-surface-variant opacity-70 mb-1.5 uppercase tracking-wider">Deal Value</label>
                  <div className="relative flex items-center">
                    <DollarSign size={13} className="absolute left-3 text-on-surface-variant opacity-60" />
                    <input 
                      type="number" 
                      value={dealValue}
                      onChange={e => setDealValue(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-lg border border-black/10 bg-surface-container-lowest focus:border-primary/40 outline-none transition-all font-body-sm text-[12px] text-on-surface"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-label-caps text-[8.5px] text-on-surface-variant opacity-70 mb-1.5 uppercase tracking-wider">Sales Stage</label>
                  <input 
                    type="text"
                    value={salesStage}
                    onChange={e => setSalesStage(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-black/10 bg-surface-container-lowest focus:border-primary/40 outline-none transition-all font-body-sm text-[12px] text-on-surface"
                    placeholder="e.g. Qualified, Proposal"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="h-px bg-black/[0.04] w-full" />

          <div className="space-y-4 pb-2">
             <h3 className="font-display font-medium text-[13px] text-on-surface mb-2">Primary Contact (Optional)</h3>
             <div>
              <div className="relative flex items-center mb-3">
                <User size={14} className="absolute left-3 text-on-surface-variant opacity-60" />
                <input 
                  type="text" 
                  value={personName}
                  onChange={e => setPersonName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-black/10 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary/40 outline-none transition-all font-body-sm text-[13px] text-on-surface"
                  placeholder="Contact Person Name"
                />
              </div>
              <div className="relative flex items-center">
                <Mail size={14} className="absolute left-3 text-on-surface-variant opacity-60" />
                <input 
                  type="email" 
                  value={personEmail}
                  onChange={e => setPersonEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-black/10 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary/40 outline-none transition-all font-body-sm text-[13px] text-on-surface"
                  placeholder="Email Address"
                />
              </div>
            </div>
          </div>

        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-surface-container-low border-t border-black/[0.04] flex justify-end gap-3 shrink-0">
          <button 
            type="button" 
            onClick={onClose}
            className="px-5 py-2 rounded-lg font-label-caps text-[10px] font-bold tracking-wide text-on-surface-variant hover:bg-black/5 transition-colors"
          >
            CANCEL
          </button>
          <button 
            type="submit"
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="px-6 py-2 rounded-lg font-label-caps text-[10px] font-bold tracking-wide bg-primary text-on-primary hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all disabled:opacity-60 disabled:hover:shadow-none"
          >
            ADD CONTACT
          </button>
        </div>
      </div>
    </div>
  );
}
