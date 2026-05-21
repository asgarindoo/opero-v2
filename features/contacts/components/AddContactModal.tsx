"use client";

import React, { useState } from "react";
import { useContacts } from "../context/ContactsContext";
import { User, Building2, Briefcase, Mail, DollarSign, ChevronDown } from "lucide-react";
import { ContactStatus, RelationshipType, ContactContextData } from "@/features/contacts";
import OperationModal from "@/components/ui/OperationModal";
import OperationInput from "@/components/ui/OperationInput";

export default function AddContactModal({ onClose }: { onClose: () => void }) {
  const { addContact } = useContacts();
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [relationshipType, setRelationshipType] = useState<RelationshipType>("Customer");
  const [status, setStatus] = useState<ContactStatus>("Lead");
  const [personName, setPersonName] = useState("");
  const [personEmail, setPersonEmail] = useState("");

  const [dealValue, setDealValue] = useState("");
  const [salesStage, setSalesStage] = useState("");

  const isValid = name.trim().length > 0;

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!isValid) return;

    const contextData: ContactContextData = {
      value: dealValue ? Number(dealValue) : undefined,
      stage: salesStage || undefined
    };

    addContact({
      name: name.trim(),
      industry: industry.trim() || "Unspecified",
      relationshipType,
      status,
      contextData,
      persons: personName.trim() ? [{
        id: "p" + Date.now(),
        name: personName.trim(),
        email: personEmail.trim() || "",
        role: "Contact Person",
        isPrimary: true
      }] : []
    });
    onClose();
  };

  const isFinancialType = ["Customer", "Reseller", "Distributor", "Affiliate", "Investor", "Supplier", "Vendor"].includes(relationshipType);

  const footer = (
    <>
      <div />
      <div className="flex items-center gap-2 shrink-0">
        <button type="button" onClick={onClose} className="font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold px-3.5 py-2 rounded-[6px] hover:bg-black/[0.05] transition-colors" style={{ color: "var(--color-on-surface-variant)", opacity: 0.65 }}>
          Cancel
        </button>
        <button type="button" onClick={handleSubmit} disabled={!isValid} className="font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold px-4 py-2 rounded-[6px] disabled:opacity-30 hover:-translate-y-px transition-all" style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
          Add Contact
        </button>
      </div>
    </>
  );

  return (
    <OperationModal
      onClose={onClose}
      title="New Contact"
      icon={<User size={14} style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }} />}
      maxWidth={480}
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <OperationInput
          label="Company / Contact Name"
          icon={<Building2 size={11} strokeWidth={1.75} />}
          required
          maxLength={80}
          autoFocus
          placeholder="e.g. Acme Corp"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Briefcase size={11} strokeWidth={1.75} style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }} />
              <span className="font-label-caps text-[9px] uppercase tracking-[0.12em] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }}>
                Relationship
              </span>
            </div>
            <div className="relative">
              <select
                value={relationshipType}
                onChange={e => setRelationshipType(e.target.value as RelationshipType)}
                className="w-full appearance-none font-body-md text-[13px] rounded-[6px] pl-3 pr-8 py-2.5 outline-none transition-all cursor-pointer"
                style={{ border: "1px solid rgba(0,0,0,0.09)", background: "rgba(0,0,0,0.02)", color: "var(--color-on-surface)" }}
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
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="font-label-caps text-[9px] uppercase tracking-[0.12em] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }}>
                Status
              </span>
            </div>
            <div className="relative">
              <select
                value={status}
                onChange={e => setStatus(e.target.value as ContactStatus)}
                className="w-full appearance-none font-body-md text-[13px] rounded-[6px] pl-3 pr-8 py-2.5 outline-none transition-all cursor-pointer"
                style={{ border: "1px solid rgba(0,0,0,0.09)", background: "rgba(0,0,0,0.02)", color: "var(--color-on-surface)" }}
              >
                <option value="Lead">Lead</option>
                <option value="Onboarding">Onboarding</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }} />
            </div>
          </div>
        </div>

        <OperationInput
          label="Industry"
          maxLength={50}
          placeholder="e.g. Software, Logistics"
          value={industry}
          onChange={e => setIndustry(e.target.value)}
        />

        {isFinancialType && (
          <div className="p-4 rounded-[8px] space-y-4" style={{ background: "rgba(0,0,0,0.01)", border: "1px dashed rgba(0,0,0,0.09)" }}>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="font-label-caps text-[9px] uppercase tracking-[0.12em] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }}>
                Relationship Overview
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <OperationInput
                label="Deal Value"
                type="number"
                icon={<DollarSign size={11} strokeWidth={1.75} />}
                placeholder="0.00"
                value={dealValue}
                onChange={e => setDealValue(e.target.value)}
              />
              <OperationInput
                label="Sales Stage"
                maxLength={40}
                placeholder="e.g. Qualified, Proposal"
                value={salesStage}
                onChange={e => setSalesStage(e.target.value)}
              />
            </div>
          </div>
        )}

        <div style={{ height: 1, background: "rgba(0,0,0,0.06)" }} />

        <div className="space-y-4">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="font-label-caps text-[9px] uppercase tracking-[0.12em] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }}>
              Primary Contact <span style={{ opacity: 0.5, textTransform: "none", letterSpacing: "normal", fontWeight: "normal" }}>(Optional)</span>
            </span>
          </div>
          <OperationInput
            label="Contact Person Name"
            icon={<User size={11} strokeWidth={1.75} />}
            maxLength={60}
            placeholder="Person Name"
            value={personName}
            onChange={e => setPersonName(e.target.value)}
          />
          <OperationInput
            label="Email Address"
            icon={<Mail size={11} strokeWidth={1.75} />}
            type="email"
            maxLength={80}
            placeholder="email@example.com"
            value={personEmail}
            onChange={e => setPersonEmail(e.target.value)}
          />
        </div>
      </form>
    </OperationModal>
  );
}
