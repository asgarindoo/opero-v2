"use client";

import React, { useState } from "react";
import { 
  Building, 
  CreditCard, 
  Zap, 
  Shield, 
  Plus, 
  Save, 
  Upload, 
  Hash, 
  Globe,
  MessageCircle,
  Mail,
  Webhook,
  LogOut,
  Trash2,
  Check,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  Cpu
} from "lucide-react";

// Shared UI
import ModuleHeader from "../components/shared/ModuleHeader";
import ModuleTabs from "../components/shared/ModuleTabs";
import Button from "../components/ui/Button";

type SettingsTab = "tenant" | "billing" | "integrations" | "security";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("tenant");
  const [isSaving, setIsSaving] = useState(false);

  const tabs = [
    { id: "tenant", label: "Tenant Info", icon: Building },
    { id: "billing", label: "Plan & Billing", icon: CreditCard },
    { id: "integrations", label: "Integrations", icon: Zap },
    { id: "security", label: "Security", icon: Shield },
  ];

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background text-on-surface">
      {/* ── Header ── */}
      <ModuleHeader 
        title="Settings"
        rightContent={(
          <Button 
            variant="primary" 
            size="sm" 
            icon={Save}
            isLoading={isSaving}
            onClick={handleSave}
          >
            SAVE CHANGES
          </Button>
        )}
      />

      {/* ── Navigation ── */}
      <ModuleTabs 
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as SettingsTab)}
        background="bg-black/[0.01]"
      />

      {/* ── View Area ── */}
      <div className="flex-1 overflow-y-auto px-10 py-10">
        <div className="max-w-[800px] mx-auto animate-fade-in">
          
          {/* ── Section: Tenant Info ── */}
          {activeTab === "tenant" && (
            <div className="space-y-12 pb-20">
              <section className="space-y-6">
                <div>
                  <h3 className="font-display font-semibold text-[15px] text-on-surface">General Information</h3>
                  <p className="font-body-sm text-[12px] text-on-surface-variant opacity-60 mt-1">Configure your workspace branding and basic identity.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="font-label-caps text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">Workspace Name</label>
                      <input 
                        type="text" 
                        defaultValue="Opero Creative" 
                        className="w-full bg-black/[0.01] border border-black/[0.06] rounded-lg px-4 py-3 font-display text-[14px] focus:bg-white focus:border-primary/20 outline-none transition-all" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-label-caps text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">Tenant Code</label>
                      <div className="relative group">
                        <Hash size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-40" />
                        <input 
                          type="text" 
                          readOnly 
                          defaultValue="OP-MAIN-2024" 
                          className="w-full bg-black/[0.03] border border-black/[0.06] rounded-lg pl-11 pr-4 py-3 font-display text-[14px] text-on-surface-variant opacity-70 outline-none cursor-not-allowed" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="font-label-caps text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest block">Logo</label>
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-24 rounded-lg bg-black/[0.02] border border-dashed border-black/[0.1] flex items-center justify-center text-on-surface-variant opacity-40">
                         <Building size={32} />
                      </div>
                      <div className="space-y-2">
                        <Button variant="secondary" size="sm" icon={Upload}>UPLOAD NEW</Button>
                        <p className="font-body-sm text-[11px] text-on-surface-variant opacity-60">JPG, PNG or SVG. Max 2MB.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="font-label-caps text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">Description</label>
                  <textarea 
                    rows={3} 
                    placeholder="Short description of your workspace..." 
                    className="w-full bg-black/[0.01] border border-black/[0.06] rounded-lg px-4 py-3 font-display text-[14px] focus:bg-white focus:border-primary/20 outline-none transition-all resize-none" 
                  />
                </div>
              </section>

              <section className="pt-10 border-t border-black/[0.04] space-y-6">
                <div>
                  <h3 className="font-display font-semibold text-[15px] text-on-surface">Network & Domain</h3>
                  <p className="font-body-sm text-[12px] text-on-surface-variant opacity-60 mt-1">Configure how your workspace is accessed on the web.</p>
                </div>
                
                <div className="flex items-center gap-4 p-4 rounded-lg bg-black/[0.01] border border-black/[0.04]">
                  <Globe size={16} className="text-primary opacity-60" />
                  <div className="flex-1">
                    <p className="font-display text-[13px] font-medium text-on-surface">Workspace Subdomain</p>
                    <p className="font-body-sm text-[11px] text-on-surface-variant opacity-60">opero.app/creative</p>
                  </div>
                  <Button variant="secondary" size="sm">MANAGE</Button>
                </div>
              </section>

              {/* Danger Zone */}
              <section className="pt-10 border-t border-black/[0.04] space-y-6">
                <div>
                  <h3 className="font-display font-semibold text-[15px] text-red-600">Danger Zone</h3>
                  <p className="font-body-sm text-[12px] text-on-surface-variant opacity-60 mt-1">Irreversible actions that affect the entire workspace.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="flex items-center justify-between p-4 rounded-lg border border-red-500/10 bg-red-500/[0.01] hover:bg-red-500/[0.04] transition-all group">
                    <div className="text-left">
                      <p className="font-display text-[13px] font-semibold text-red-600">Leave Workspace</p>
                      <p className="font-body-sm text-[11px] text-red-600 opacity-60">Remove your access to this tenant.</p>
                    </div>
                    <LogOut size={16} className="text-red-600 opacity-40 group-hover:opacity-100 transition-opacity" />
                  </button>
                  <button className="flex items-center justify-between p-4 rounded-lg border border-red-500/10 bg-red-500/[0.01] hover:bg-red-500/[0.04] transition-all group">
                    <div className="text-left">
                      <p className="font-display text-[13px] font-semibold text-red-600">Delete Workspace</p>
                      <p className="font-body-sm text-[11px] text-red-600 opacity-60">Permanently delete all data.</p>
                    </div>
                    <Trash2 size={16} className="text-red-600 opacity-40 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>
              </section>
            </div>
          )}

          {/* ── Section: Plan & Billing ── */}
          {activeTab === "billing" && (
            <div className="space-y-12 animate-fade-in pb-20">
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-semibold text-[15px] text-on-surface">Subscription Plan</h3>
                    <p className="font-body-sm text-[12px] text-on-surface-variant opacity-60 mt-1">Manage your current plan and usage quotas.</p>
                  </div>
                  <div className="px-3 py-1 rounded bg-primary text-on-primary font-label-caps text-[9px] font-bold tracking-widest">
                    PRO PLAN
                  </div>
                </div>

                <div className="p-8 rounded-xl border border-black/[0.04] bg-black/[0.01] space-y-8">
                  <div className="grid grid-cols-3 gap-8">
                    <div className="space-y-2">
                       <p className="font-label-caps text-[9px] text-on-surface-variant opacity-60 uppercase tracking-wider">Plan Cost</p>
                       <p className="font-display text-[20px] font-bold text-on-surface">$29<span className="text-[12px] opacity-40">/mo</span></p>
                    </div>
                    <div className="space-y-2">
                       <p className="font-label-caps text-[9px] text-on-surface-variant opacity-60 uppercase tracking-wider">Renewal Date</p>
                       <p className="font-display text-[15px] font-semibold text-on-surface">June 12, 2024</p>
                    </div>
                    <div className="flex items-center justify-end">
                       <Button variant="secondary" size="sm">CHANGE PLAN</Button>
                    </div>
                  </div>

                  <div className="space-y-6 pt-6 border-t border-black/[0.04]">
                    <h4 className="font-label-caps text-[9px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">Workspace Usage</h4>
                    <div className="grid grid-cols-2 gap-10">
                      <div className="space-y-2">
                        <div className="flex justify-between font-body-sm text-[11px]">
                          <span className="text-on-surface-variant opacity-60">Team Members</span>
                          <span className="font-semibold text-on-surface">12 / 25</span>
                        </div>
                        <div className="h-1 w-full bg-black/[0.04] rounded-full overflow-hidden">
                           <div className="h-full bg-primary" style={{ width: "48%" }} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between font-body-sm text-[11px]">
                          <span className="text-on-surface-variant opacity-60">Storage Used</span>
                          <span className="font-semibold text-on-surface">4.2 GB / 50 GB</span>
                        </div>
                        <div className="h-1 w-full bg-black/[0.04] rounded-full overflow-hidden">
                           <div className="h-full bg-primary" style={{ width: "8.4%" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="pt-10 border-t border-black/[0.04] space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-semibold text-[15px] text-on-surface">Payment Method</h3>
                    <p className="font-body-sm text-[12px] text-on-surface-variant opacity-60 mt-1">Billing details and default payment information.</p>
                  </div>
                  <Button variant="secondary" size="sm">UPDATE</Button>
                </div>
                
                <div className="flex items-center gap-4 p-4 rounded-lg bg-black/[0.01] border border-black/[0.04]">
                  <div className="w-10 h-10 rounded bg-white border border-black/[0.06] flex items-center justify-center font-display font-bold text-[10px] text-on-surface-variant opacity-60 uppercase">
                     VISA
                  </div>
                  <div className="flex-1">
                    <p className="font-display text-[13px] font-medium text-on-surface">Visa ending in 4242</p>
                    <p className="font-body-sm text-[11px] text-on-surface-variant opacity-60">Expires 12/26</p>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ── Section: Integrations ── */}
          {activeTab === "integrations" && (
            <div className="space-y-12 animate-fade-in pb-20">
              <section className="space-y-6">
                <div>
                  <h3 className="font-display font-semibold text-[15px] text-on-surface">Active Integrations</h3>
                  <p className="font-body-sm text-[12px] text-on-surface-variant opacity-60 mt-1">Connect your workspace with third-party platforms.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: "telegram", name: "Telegram", desc: "Automate notifications and bot responses.", icon: MessageCircle, status: "connected" },
                    { id: "whatsapp", name: "WhatsApp", desc: "Send direct updates via WhatsApp Business.", icon: Smartphone, status: "not_connected" },
                    { id: "email", name: "SMTP Email", desc: "Configure custom email relay settings.", icon: Mail, status: "connected" },
                    { id: "webhooks", name: "Webhooks", desc: "Push workspace events to custom endpoints.", icon: Webhook, status: "not_connected" },
                  ].map(integration => (
                    <div key={integration.id} className="p-5 rounded-xl border border-black/[0.05] bg-black/[0.01] flex flex-col gap-4">
                      <div className="flex items-start justify-between">
                         <div className="w-10 h-10 rounded-lg bg-white border border-black/[0.06] flex items-center justify-center text-primary">
                            <integration.icon size={20} />
                         </div>
                         <div className={`px-2 py-0.5 rounded text-[9px] font-bold font-label-caps tracking-wider ${integration.status === 'connected' ? 'bg-green-100 text-green-700' : 'bg-black/[0.06] text-on-surface-variant opacity-60'}`}>
                            {integration.status === 'connected' ? 'ACTIVE' : 'DISCONNECTED'}
                         </div>
                      </div>
                      <div>
                        <p className="font-display text-[14px] font-semibold text-on-surface">{integration.name}</p>
                        <p className="font-body-sm text-[11px] text-on-surface-variant opacity-60 mt-1 leading-relaxed">{integration.desc}</p>
                      </div>
                      <div className="pt-2">
                        <Button variant="secondary" size="sm" className="w-full">
                          {integration.status === 'connected' ? 'CONFIGURE' : 'CONNECT'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* ── Section: Security ── */}
          {activeTab === "security" && (
            <div className="space-y-12 animate-fade-in pb-20">
              <section className="space-y-6">
                <div>
                  <h3 className="font-display font-semibold text-[15px] text-on-surface">Workspace Security</h3>
                  <p className="font-body-sm text-[12px] text-on-surface-variant opacity-60 mt-1">Configure global security policies and session management.</p>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center justify-between p-5 rounded-xl border border-black/[0.05] bg-black/[0.01]">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-white border border-black/[0.06] flex items-center justify-center text-primary">
                           <ShieldCheck size={20} />
                        </div>
                        <div>
                          <p className="font-display text-[14px] font-semibold text-on-surface">Two-Factor Authentication</p>
                          <p className="font-body-sm text-[11px] text-on-surface-variant opacity-60">Require 2FA for all team members.</p>
                        </div>
                      </div>
                      <button className="relative w-10 h-6 bg-black/[0.06] rounded-full transition-colors">
                         <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                      </button>
                   </div>

                   <div className="flex items-center justify-between p-5 rounded-xl border border-black/[0.05] bg-black/[0.01]">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-white border border-black/[0.06] flex items-center justify-center text-primary">
                           <Cpu size={20} />
                        </div>
                        <div>
                          <p className="font-display text-[14px] font-semibold text-on-surface">API Key Management</p>
                          <p className="font-body-sm text-[11px] text-on-surface-variant opacity-60">Generate and rotate workspace API keys.</p>
                        </div>
                      </div>
                      <Button variant="secondary" size="sm">MANAGE KEYS</Button>
                   </div>
                </div>
              </section>

              <section className="pt-10 border-t border-black/[0.04] space-y-6">
                <div>
                  <h3 className="font-display font-semibold text-[15px] text-on-surface">Active Sessions</h3>
                  <p className="font-body-sm text-[12px] text-on-surface-variant opacity-60 mt-1">Review and manage devices currently signed into this workspace.</p>
                </div>
                
                <div className="space-y-2">
                   {[
                     { device: "MacBook Pro", browser: "Chrome", location: "Jakarta, ID", current: true },
                     { device: "iPhone 15", browser: "Safari", location: "Jakarta, ID", current: false },
                   ].map((session, i) => (
                     <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-black/[0.03] bg-black/[0.01]">
                        <div className="flex items-center gap-4">
                           <div className="w-8 h-8 rounded bg-white border border-black/[0.04] flex items-center justify-center text-on-surface-variant opacity-60">
                              {session.device.includes("iPhone") ? <Smartphone size={14} /> : <Cpu size={14} />}
                           </div>
                           <div>
                              <div className="flex items-center gap-2">
                                <span className="font-display text-[13px] font-semibold text-on-surface">{session.device} • {session.browser}</span>
                                {session.current && <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700 text-[8px] font-bold uppercase tracking-widest">Current</span>}
                              </div>
                              <p className="font-body-sm text-[11px] text-on-surface-variant opacity-60">{session.location}</p>
                           </div>
                        </div>
                        {!session.current && <Button variant="secondary" size="sm">REVOKE</Button>}
                     </div>
                   ))}
                </div>
              </section>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
