"use client";

import React, { useState } from "react";
import { useContacts } from "../context/ContactsContext";
import { User, Building2, Briefcase, Mail, DollarSign } from "lucide-react";
import { ContactStatus, RelationshipType, ContactContextData } from "@/features/contacts";

import { ModalShell } from "@/components/ui/global/modal/ModalShell";
import { ModalHeader } from "@/components/ui/global/modal/ModalHeader";
import { ModalContent } from "@/components/ui/global/modal/ModalContent";
import { ModalFooter } from "@/components/ui/global/modal/ModalFooter";
import { GlobalInput } from "@/components/ui/global/form/GlobalInput";
import { GlobalSelect } from "@/components/ui/global/form/GlobalSelect";
import { FormSection } from "@/components/ui/global/form/FormField";

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

  return (
    <ModalShell onClose={onClose} maxWidth={480}>
      <ModalHeader title="New Contact" icon={<User size={14} style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }} />} onClose={onClose} />
      
      <ModalContent className="space-y-5">
        <GlobalInput
          label="Company / Contact Name"
          icon={<Building2 size={11} strokeWidth={1.75} />}
          required
          maxLength={40}
          autoFocus
          placeholder="e.g. Acme Corp"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <GlobalSelect
            label="Relationship"
            icon={<Briefcase size={11} strokeWidth={1.75} />}
            options={[
              { value: "Customer", label: "Customer" },
              { value: "Partner", label: "Partner" },
              { value: "Supplier", label: "Supplier" },
              { value: "Investor", label: "Investor" },
              { value: "Vendor", label: "Vendor" },
              { value: "Reseller", label: "Reseller" },
              { value: "Distributor", label: "Distributor" },
              { value: "Affiliate", label: "Affiliate" },
            ]}
            value={relationshipType}
            onChange={e => setRelationshipType(e.target.value as RelationshipType)}
          />

          <GlobalSelect
            label="Status"
            options={[
              { value: "Lead", label: "Lead" },
              { value: "Onboarding", label: "Onboarding" },
              { value: "Active", label: "Active" },
              { value: "Inactive", label: "Inactive" },
            ]}
            value={status}
            onChange={e => setStatus(e.target.value as ContactStatus)}
          />
        </div>

        <GlobalInput
          label="Industry"
          maxLength={30}
          placeholder="e.g. Software, Logistics"
          value={industry}
          onChange={e => setIndustry(e.target.value)}
        />

        {isFinancialType && (
          <FormSection title="Relationship Overview">
            <div className="grid grid-cols-2 gap-4">
              <GlobalInput
                label="Deal Value"
                type="number"
                icon={<DollarSign size={11} strokeWidth={1.75} />}
                placeholder="0.00"
                value={dealValue}
                onChange={e => setDealValue(e.target.value)}
              />
              <GlobalInput
                label="Sales Stage"
                maxLength={30}
                placeholder="e.g. Qualified, Proposal"
                value={salesStage}
                onChange={e => setSalesStage(e.target.value)}
              />
            </div>
          </FormSection>
        )}

        <div style={{ height: 1, background: "rgba(0,0,0,0.06)" }} />

        <div className="space-y-4">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="font-label-caps text-[9px] uppercase tracking-[0.12em] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }}>
              Primary Contact <span style={{ opacity: 0.5, textTransform: "none", letterSpacing: "normal", fontWeight: "normal" }}>(Optional)</span>
            </span>
          </div>
          <GlobalInput
            label="Contact Person Name"
            icon={<User size={11} strokeWidth={1.75} />}
            maxLength={40}
            placeholder="Person Name"
            value={personName}
            onChange={e => setPersonName(e.target.value)}
          />
          <GlobalInput
            label="Email Address"
            icon={<Mail size={11} strokeWidth={1.75} />}
            type="email"
            maxLength={60}
            placeholder="email@example.com"
            value={personEmail}
            onChange={e => setPersonEmail(e.target.value)}
          />
        </div>
      </ModalContent>

      <ModalFooter>
        <button type="button" onClick={onClose} className="font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold px-3.5 py-2 rounded-[6px] hover:bg-black/[0.05] transition-colors" style={{ color: "var(--color-on-surface-variant)", opacity: 0.65 }}>
          Cancel
        </button>
        <button type="button" onClick={handleSubmit} disabled={!isValid} className="font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold px-4 py-2 rounded-[6px] disabled:opacity-30 hover:-translate-y-px transition-all" style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
          Add Contact
        </button>
      </ModalFooter>
    </ModalShell>
  );
}
