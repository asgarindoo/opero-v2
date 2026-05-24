"use client";

import React, { useState } from "react";
import { useContacts } from "../context/ContactsContext";
import { User, Building2, Briefcase, Mail, DollarSign } from "lucide-react";
import { ContactStatus, RelationshipType, ContactContextData } from "@/features/contacts";

import { ModalShell } from "@/components/ui/global/modal/ModalShell";
import { ModalHeader } from "@/components/ui/global/modal/ModalHeader";
import { ModalContent } from "@/components/ui/global/modal/ModalContent";
import { ModalFooter } from "@/components/ui/global/modal/ModalFooter";
import { useTenant } from "@/components/providers/TenantProvider";
import { GlobalInput } from "@/components/ui/global/form/GlobalInput";
import Dropdown from "@/components/ui/Dropdown";

function SL({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      {icon}
      <span className="font-label-caps text-[9px] uppercase tracking-[0.12em] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }}>
        {children}
      </span>
    </div>
  );
}

export default function AddContactModal({ onClose }: { onClose: () => void }) {
  const { user } = useTenant();
  const { addContact } = useContacts();
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [relationshipType, setRelationshipType] = useState<RelationshipType>("Customer");
  const [status, setStatus] = useState<ContactStatus>("New");
  const [personName, setPersonName] = useState("");
  const [personEmail, setPersonEmail] = useState("");

  const [dealValue, setDealValue] = useState("");
  const [salesStage, setSalesStage] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [emailError, setEmailError] = useState("");

  const validateEmail = (email: string) => {
    if (!email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPersonEmail(val);
    if (val && !validateEmail(val)) {
      setEmailError("Invalid email address");
    } else {
      setEmailError("");
    }
  };

  const isValid = name.trim().length > 0 && personEmail.trim().length > 0 && validateEmail(personEmail);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!isValid) return;

    const contextData: ContactContextData = {
      value: dealValue ? Number(dealValue) : undefined,
      currency: dealValue ? currency : undefined,
      stage: salesStage || undefined
    };

    addContact({
      name: name.trim(),
      industry: industry.trim() || "Unspecified",
      relationshipType,
      status,
      contextData,
      activities: [{
        id: "a" + Date.now(),
        author: user?.name || "System",
        type: "system",
        description: "Created contact record",
        timestamp: new Date().toISOString()
      }],
      persons: personName.trim() || personEmail.trim() ? [{
        id: "p" + Date.now(),
        name: personName.trim() || "Unknown",
        email: personEmail.trim() || "",
        role: "Contact Person",
        isPrimary: true
      }] : []
    });
    onClose();
  };

  const isFinancialType = ["Customer", "Reseller", "Distributor", "Affiliate", "Investor", "Supplier", "Vendor"].includes(relationshipType);

  return (
    <ModalShell onClose={onClose} maxWidth={800}>
      <ModalHeader title="New Contact" onClose={onClose} />

      <ModalContent className="db-sidebar space-y-6">
        <div className="space-y-4">
          <div className="relative">
            <GlobalInput
              autoFocus
              required
              maxLength={40}
              placeholder="Company or Contact Name…"
              value={name}
              onChange={e => setName(e.target.value)}
              className="font-display font-semibold pr-4"
              style={{ fontSize: "16px", background: "transparent", border: "none", padding: "0" }}
            />
            {name.length === 0 && <span className="absolute left-[200px] top-1 text-red-500 font-display">*</span>}
          </div>

          <div className="grid grid-cols-2 gap-4 items-start">
            <div>
              <SL icon={<Briefcase size={11} strokeWidth={1.75} />}>Relationship</SL>
              <Dropdown
                className="[&>button]:h-[39px]"
                value={relationshipType}
                onChange={val => setRelationshipType(val as RelationshipType)}
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
              />
            </div>

            <div>
              <SL>Status</SL>
              <Dropdown
                className="[&>button]:h-[39px]"
                value={status}
                onChange={val => setStatus(val as ContactStatus)}
                options={[
                  { value: "Lead", label: "Lead" },
                  { value: "Onboarding", label: "Onboarding" },
                  { value: "Active", label: "Active" },
                  { value: "Inactive", label: "Inactive" },
                ]}
              />
            </div>
          </div>

          <div>
            <SL>Industry</SL>
            <GlobalInput
              maxLength={30}
              placeholder="e.g. Software, Logistics"
              value={industry}
              onChange={e => setIndustry(e.target.value)}
            />
          </div>
        </div>

        {isFinancialType && (
          <div>
            <SL>Relationship Overview <span style={{ opacity: 0.5, textTransform: "none", letterSpacing: "normal", fontWeight: "normal" }}>(Optional)</span></SL>
            <div className="grid grid-cols-2 gap-4 items-start">
              <div className="flex items-center gap-2">
                <div className="w-[72px] shrink-0">
                  <Dropdown
                    className="[&>button]:h-[39px]"
                    value={currency}
                    onChange={val => setCurrency(val as string)}
                    options={[
                      { value: "USD", label: "USD" },
                      { value: "IDR", label: "IDR" },
                      { value: "EUR", label: "EUR" },
                      { value: "GBP", label: "GBP" },
                      { value: "SGD", label: "SGD" },
                      { value: "AUD", label: "AUD" },
                    ]}
                  />
                </div>
                <div className="flex-1">
                  <GlobalInput
                    type="number"
                    placeholder="Deal Value (0.00)"
                    value={dealValue}
                    onChange={e => setDealValue(e.target.value)}
                  />
                </div>
              </div>
              <GlobalInput
                maxLength={30}
                placeholder="Sales Stage (e.g. Qualified)"
                value={salesStage}
                onChange={e => setSalesStage(e.target.value)}
              />
            </div>
          </div>
        )}

        <div style={{ height: 1, background: "rgba(0,0,0,0.06)" }} />

        <div className="space-y-4">
          <SL>Primary Contact <span className="text-red-500">*</span></SL>

          <div className="grid grid-cols-2 gap-4 items-start">
            <GlobalInput
              maxLength={40}
              placeholder="Person Name"
              value={personName}
              onChange={e => setPersonName(e.target.value)}
            />
            <GlobalInput
              type="email"
              placeholder="email@example.com"
              value={personEmail}
              onChange={handleEmailChange}
              error={emailError}
            />
          </div>
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
