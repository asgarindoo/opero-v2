"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Building,
  CreditCard,
  Save,
  Upload,
  Globe,
  Shield,
  LogOut,
  Mail,
  UserRound,
  Copy,
  Check,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { getTenantLogoSrc } from "@/lib/tenant-logo";
import { getRootAppUrl } from "@/lib/tenant-url";
import { markPresenceOffline } from "@/features/presence";
import ModuleHeader from "@/components/common/ModuleHeader";
import ModuleTabs from "@/components/common/ModuleTabs";
import Button from "@/components/ui/Button";

type SettingsTab = "tenant" | "billing" | "security";

interface TenantSettingsResponse {
  tenant: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    createdAt: string;
    tenantSettings: {
      timezone: string;
      locale: string;
      brandColor: string | null;
      logoUrl: string | null;
      websiteUrl: string | null;
      industryType: string | null;
    } | null;
    tenantPlan: {
      status: string;
      currentPeriodEnd: string | null;
      plan: {
        name: string;
        displayName: string;
        maxMembers: number;
        maxBots: number;
        features: unknown;
      };
    } | null;
  };
  membership: { role: string };
  user: { id: string; name: string; email: string; image: string | null } | null;
  usage: { membersCount: number };
}

const tabs = [
  { id: "tenant", label: "Tenant Info", icon: Building },
  { id: "billing", label: "Plan & Billing", icon: CreditCard },
  { id: "security", label: "Security", icon: Shield },
];

export default function SettingsPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<SettingsTab>("tenant");
  const [data, setData] = useState<TenantSettingsResponse | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    logo: "" as string | null,
    websiteUrl: "",
    brandColor: "",
    timezone: "UTC",
    locale: "en",
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for older browsers
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.focus();
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const canManage = data?.membership.role === "owner" || data?.membership.role === "admin";
  const isOwner = data?.membership.role === "owner";

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      setLoading(true);
      setError(null);
      try {
        const [settingsRes, inviteRes] = await Promise.all([
          fetch("/api/tenant/settings", { cache: "no-store" }),
          fetch("/api/tenant/invite"),
        ]);
        const payload = await settingsRes.json();

        if (!settingsRes.ok) {
          throw new Error(payload.error ?? "Failed to load settings.");
        }

        if (cancelled) return;
        setData(payload);
        const logo = payload.tenant.logo ?? payload.tenant.tenantSettings?.logoUrl ?? null;
        setForm({
          name: payload.tenant.name,
          logo: getTenantLogoSrc(payload.tenant.id, logo),
          websiteUrl: payload.tenant.tenantSettings?.websiteUrl ?? "",
          brandColor: payload.tenant.tenantSettings?.brandColor ?? "",
          timezone: payload.tenant.tenantSettings?.timezone ?? "UTC",
          locale: payload.tenant.tenantSettings?.locale ?? "en",
        });

        if (inviteRes.ok) {
          const invitePayload = await inviteRes.json();
          if (!cancelled) setInviteCode(invitePayload.inviteCode ?? null);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load settings.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSettings();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (event) => setForm((current) => ({ ...current, logo: event.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!canManage) return;

    setIsSaving(true);
    setMessage(null);
    setError(null);

    try {
      const logoWasChanged = !form.logo || !form.logo.startsWith("/api/tenant/logo/");
      const res = await fetch("/api/tenant/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          websiteUrl: form.websiteUrl,
          brandColor: form.brandColor,
          timezone: form.timezone,
          locale: form.locale,
          ...(logoWasChanged ? { logo: form.logo ?? "" } : {}),
        }),
      });
      const payload = await res.json();

      if (!res.ok) {
        throw new Error(payload.error ?? "Failed to save settings.");
      }

      setData((current) => current ? {
        ...current,
        tenant: {
          ...current.tenant,
          name: payload.tenant.name,
          logo: getTenantLogoSrc(payload.tenant.id, payload.tenant.logo),
          tenantSettings: payload.tenant.tenantSettings,
        },
      } : current);
      await authClient.organization.setActive({ organizationId: data?.tenant.id });
      setMessage("Settings saved.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await markPresenceOffline().catch(() => null);
    window.location.assign(getRootAppUrl("/logout"));
  };

  const handleLeaveTenant = async () => {
    if (!data) return;
    const confirmed = window.confirm(`Leave "${data.tenant.name}"? You will lose access until someone invites you again.`);
    if (!confirmed) return;

    setIsLeaving(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/tenant/leave", { method: "POST" });
      const payload = await res.json();

      if (!res.ok) {
        throw new Error(payload.error ?? "Failed to leave tenant.");
      }

      await authClient.organization.setActive({ organizationId: null });
      router.replace("/tenants");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to leave tenant.");
    } finally {
      setIsLeaving(false);
    }
  };

  const handleDeleteTenant = async () => {
    if (!data || !isOwner) return;
    const typed = window.prompt(`Type ${data.tenant.slug} to permanently delete this tenant.`);
    if (typed !== data.tenant.slug) {
      if (typed !== null) setError("Tenant deletion cancelled: slug did not match.");
      return;
    }

    setIsDeleting(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/tenant", { method: "DELETE" });
      const payload = await res.json();

      if (!res.ok) {
        throw new Error(payload.error ?? "Failed to delete tenant.");
      }

      await authClient.organization.setActive({ organizationId: null });
      router.replace("/tenants");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete tenant.");
    } finally {
      setIsDeleting(false);
    }
  };

  const plan = data?.tenant.tenantPlan;
  const membersMax = plan?.plan.maxMembers ?? 0;
  const membersCount = data?.usage.membersCount ?? 0;
  const membersPct = membersMax > 0 ? Math.min(100, Math.round((membersCount / membersMax) * 100)) : 0;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background text-on-surface">
      <ModuleHeader
        title="Settings"
        rightContent={activeTab === "tenant" && canManage ? (
          <Button variant="primary" size="sm" icon={Save} isLoading={isSaving} onClick={handleSave}>
            SAVE CHANGES
          </Button>
        ) : null}
      />

      <ModuleTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as SettingsTab)}
        background="bg-black/[0.01]"
      />

      <div className="flex-1 overflow-y-auto px-5 sm:px-10 py-10">
        <div className="max-w-[1200px] mx-auto animate-fade-in">
          {loading ? (
            /* Premium Soft Skeletons */
            <div className="space-y-12 pb-20">
              <section className="space-y-6">
                <div className="space-y-2">
                  <div className="h-5 w-40 bg-black/[0.05] rounded animate-pulse" />
                  <div className="h-3 w-64 bg-black/[0.03] rounded animate-pulse" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-8 pt-4">
                  <div className="space-y-6">
                    {[1, 2].map(i => (
                      <div key={i} className="space-y-2">
                        <div className="h-2.5 w-20 bg-black/[0.04] rounded animate-pulse" />
                        <div className="h-11 w-full bg-black/[0.02] border border-black/[0.04] rounded-lg animate-pulse" />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <div className="h-2.5 w-12 bg-black/[0.04] rounded animate-pulse" />
                    <div className="flex items-center gap-5">
                      <div className="w-24 h-24 rounded-lg bg-black/[0.03] animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-9 w-24 bg-black/[0.03] rounded-lg animate-pulse" />
                        <div className="h-3 w-32 bg-black/[0.02] rounded animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          ) : error && !data ? (
            <div className="rounded-xl border border-red-500/15 bg-red-500/[0.03] p-8 text-[13px] text-red-600">
              {error}
            </div>
          ) : data ? (
            <>
              {(message || error) && (
                <div
                  className="mb-6 rounded-lg border px-4 py-3 font-body-sm text-[12px]"
                  style={{
                    borderColor: error ? "rgba(220,38,38,0.18)" : "rgba(22,163,74,0.2)",
                    background: error ? "rgba(220,38,38,0.035)" : "rgba(22,163,74,0.04)",
                    color: error ? "#dc2626" : "#15803d",
                  }}
                >
                  {error ?? message}
                </div>
              )}

              {activeTab === "tenant" && (
                <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 pb-20">
                  {/* Left Column: Context / Overview */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-display font-semibold text-[15px] text-on-surface">Workspace</h3>
                      <p className="font-body-sm text-[12px] text-on-surface-variant opacity-60 mt-1">
                        General information and identity of the current tenant.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-black/[0.06] bg-[#fef8f8] overflow-hidden">
                      <div className="p-6 border-b border-black/[0.04] flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-white border border-black/[0.06] flex items-center justify-center overflow-hidden shrink-0">
                          {data.tenant.logo ? (
                            <Image src={getTenantLogoSrc(data.tenant.id, data.tenant.logo)} alt="Logo" width={64} height={64} className="object-cover" unoptimized />
                          ) : (
                            <Building size={24} className="text-on-surface-variant opacity-40" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-display font-bold text-[16px] text-on-surface truncate">{data.tenant.name}</p>
                          <p className="font-body-sm text-[12px] text-on-surface-variant opacity-60 truncate">{data.tenant.slug}.opero.app</p>
                        </div>
                      </div>
                      <div className="p-6 space-y-4">
                        <ReadOnlyMetric label="Role" value={data.membership.role} />
                        <ReadOnlyMetric label="Created" value={new Date(data.tenant.createdAt).toLocaleDateString()} />
                        <ReadOnlyMetric label="Members" value={membersCount.toString()} />
                      </div>
                    </div>

                    {!canManage && (
                      <div className="rounded-lg border border-black/[0.06] bg-[#fef8f8] p-4 font-body-sm text-[12px] text-on-surface-variant/70">
                        You can view settings, but only owners and admins can edit them.
                      </div>
                    )}
                  </div>

                  {/* Right Column: Settings Cards */}
                  <div className="space-y-8">
                     {/* General Settings Card */}
                     <div className="rounded-2xl border border-black/[0.06] bg-[#fef8f8] p-8 space-y-6">
                        <div>
                          <h4 className="font-display font-semibold text-[14px] text-on-surface">General Settings</h4>
                          <p className="font-body-sm text-[12px] text-on-surface-variant opacity-60">Update the workspace name and branding.</p>
                        </div>
                        <div className="space-y-2 max-w-md">
                          <label className="font-label-caps text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">
                            Tenant Name
                          </label>
                          <input
                            type="text"
                            value={form.name}
                            disabled={!canManage}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full bg-white border border-black/[0.06] rounded-xl px-4 py-3 font-display text-[14px] focus:border-primary/30 outline-none transition-all disabled:opacity-60"
                          />
                        </div>
                     </div>

                     {/* Logo Card */}
                     <div className="rounded-2xl border border-black/[0.06] bg-[#fef8f8] p-8 space-y-6">
                        <div>
                          <h4 className="font-display font-semibold text-[14px] text-on-surface">Logo</h4>
                          <p className="font-body-sm text-[12px] text-on-surface-variant opacity-60">Upload a logo for your workspace.</p>
                        </div>
                        <div className="flex items-center gap-5">
                          <div className="relative w-24 h-24 rounded-xl bg-white border border-dashed border-black/[0.1] flex items-center justify-center overflow-hidden text-on-surface-variant">
                            {form.logo ? (
                              <Image
                                src={form.logo}
                                alt={`${form.name} logo`}
                                fill
                                sizes="96px"
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <Building size={32} className="opacity-40" />
                            )}
                          </div>
                          <div className="space-y-2">
                            <input
                              ref={fileRef}
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFile(file);
                              }}
                            />
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              icon={Upload}
                              disabled={!canManage}
                              onClick={() => fileRef.current?.click()}
                            >
                              UPLOAD
                            </Button>
                            {form.logo && canManage && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setForm({ ...form, logo: "" })}
                              >
                                REMOVE
                              </Button>
                            )}
                          </div>
                        </div>
                     </div>

                     {/* Invite Card */}
                     <div className="rounded-2xl border border-black/[0.06] bg-[#fef8f8] p-8 space-y-6">
                        <div>
                          <h4 className="font-display font-semibold text-[14px] text-on-surface">Invitation Code</h4>
                          <p className="font-body-sm text-[12px] text-on-surface-variant opacity-60">Share this code with your team to invite them.</p>
                        </div>
                        <div className="relative group max-w-md">
                          {inviteCode ? (
                            <input
                              type="text"
                              readOnly
                              value={inviteCode}
                              className="w-full bg-white border border-black/[0.06] rounded-xl px-4 py-3 font-display text-[15px] text-on-surface font-bold tracking-[0.15em] outline-none cursor-default select-all"
                            />
                          ) : (
                            <div className="w-full bg-black/[0.02] border border-black/[0.04] rounded-xl px-4 py-3 h-[50px] animate-pulse" />
                          )}
                          <button
                            onClick={() => inviteCode && copyToClipboard(inviteCode)}
                            disabled={!inviteCode}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-black/[0.05] rounded-md transition-colors text-on-surface-variant opacity-60 hover:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Copy invite code"
                          >
                            {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                          </button>
                        </div>
                     </div>
                  </div>
                </div>
              )}

              {activeTab === "billing" && (
                <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-10 pb-20">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-display font-semibold text-[15px] text-on-surface">Current Plan</h3>
                      <p className="font-body-sm text-[12px] text-on-surface-variant opacity-60 mt-1">
                        Overview of your workspace usage and billing.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-black/[0.06] bg-[#fef8f8] overflow-hidden">
                       <div className="p-6 border-b border-black/[0.04]">
                          <p className="font-label-caps text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest mb-1">Status</p>
                          <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-green-500" />
                             <p className="font-display font-bold text-[16px] text-on-surface">{plan?.status ?? "Active"}</p>
                          </div>
                       </div>
                       <div className="p-6 space-y-4">
                          <ReadOnlyMetric label="Active Plan" value={plan?.plan.displayName ?? "Free"} />
                          <ReadOnlyMetric
                            label="Period End"
                            value={plan?.currentPeriodEnd ? new Date(plan.currentPeriodEnd).toLocaleDateString() : "Lifetime"}
                          />
                          <div className="space-y-2 pt-2">
                            <div className="flex justify-between font-body-sm text-[11px]">
                              <span className="text-on-surface-variant opacity-60">Members</span>
                              <span className="font-semibold text-on-surface">
                                {membersCount}{membersMax > 0 ? ` / ${membersMax}` : ""}
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-black/[0.04] rounded-full overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: `${membersPct}%` }} />
                            </div>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Free Plan */}
                        <div className="rounded-2xl border border-black/[0.06] bg-[#fef8f8] p-8 flex flex-col relative overflow-hidden">
                           <div className="mb-6">
                              <span className="font-label-caps text-[10px] uppercase tracking-[0.1em] font-bold text-on-surface-variant">Free</span>
                              <div className="flex items-end gap-1.5 mt-2 mb-3">
                                 <span className="font-display text-[40px] leading-none font-bold tracking-tight text-primary">$0</span>
                                 <span className="font-body-sm text-[13px] mb-2 text-on-surface-variant">/forever</span>
                              </div>
                              <p className="font-body-sm text-[13px] leading-relaxed text-on-surface-variant">For solo founders trying out the system.</p>
                           </div>
                           <div className="w-full h-px mb-6 bg-black/[0.04]" />
                           <ul className="flex flex-col gap-3 flex-1 mb-8">
                             {[
                               { text: "1 user", included: true },
                               { text: "Work management", included: true },
                               { text: "1 bot (WA or Telegram)", included: true },
                               { text: "Invite team members", included: false },
                               { text: "Automation hub", included: false },
                             ].map(f => (
                               <li key={f.text} className={`flex items-center gap-3 font-body-sm text-[13px] ${f.included ? 'text-on-surface' : 'text-on-surface-variant opacity-40'}`}>
                                 <Check size={14} className={f.included ? 'text-primary' : 'opacity-0'} />
                                 {f.text}
                               </li>
                             ))}
                           </ul>
                           <button className="w-full font-label-caps text-[11px] uppercase tracking-[0.06em] font-semibold py-3.5 rounded-xl border border-black/[0.06] bg-black/[0.02] text-on-surface-variant opacity-60 cursor-not-allowed">
                             Current Plan
                           </button>
                        </div>

                        {/* Pro Plan */}
                        <div className="rounded-2xl border border-primary/20 bg-primary/[0.02] p-8 flex flex-col relative overflow-hidden shadow-sm">
                           <div className="absolute top-0 right-0 bg-primary text-white font-label-caps text-[9px] px-3 py-1 rounded-bl-xl uppercase tracking-widest font-bold">
                              Upgrade
                           </div>
                           <div className="mb-6">
                              <span className="font-label-caps text-[10px] uppercase tracking-[0.1em] font-bold text-primary">Pro</span>
                              <div className="flex items-end gap-1.5 mt-2 mb-3">
                                 <span className="font-display text-[40px] leading-none font-bold tracking-tight text-primary">$29</span>
                                 <span className="font-body-sm text-[13px] mb-2 text-primary/60">/per month</span>
                              </div>
                              <p className="font-body-sm text-[13px] leading-relaxed text-on-surface-variant">For teams that need full collaboration and automation.</p>
                           </div>
                           <div className="w-full h-px mb-6 bg-primary/10" />
                           <ul className="flex flex-col gap-3 flex-1 mb-8">
                             {[
                               { text: "Multi-user (invite team)", included: true },
                               { text: "Multiple bots (WA + Telegram)", included: true },
                               { text: "Team chat & discussion", included: true },
                               { text: "Automation hub", included: true },
                               { text: "Full activity timeline", included: true },
                             ].map(f => (
                               <li key={f.text} className={`flex items-center gap-3 font-body-sm text-[13px] text-on-surface`}>
                                 <Check size={14} className="text-primary" />
                                 {f.text}
                               </li>
                             ))}
                           </ul>
                           <button className="w-full font-label-caps text-[11px] uppercase tracking-[0.06em] font-semibold py-3.5 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors shadow-md active:scale-95">
                             Upgrade to Pro
                           </button>
                        </div>
                     </div>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-10 pb-20">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-display font-semibold text-[15px] text-on-surface">Account</h3>
                      <p className="font-body-sm text-[12px] text-on-surface-variant opacity-60 mt-1">
                        Your personal identity and current session.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-black/[0.06] bg-[#fef8f8] overflow-hidden">
                       <div className="p-6 border-b border-black/[0.04]">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                <UserRound size={20} />
                             </div>
                             <div className="min-w-0">
                                <p className="font-display font-bold text-[15px] text-on-surface truncate">{data.user?.name}</p>
                                <p className="font-body-sm text-[12px] text-on-surface-variant opacity-60 truncate">{data.user?.email}</p>
                             </div>
                          </div>
                       </div>
                       <div className="p-6">
                          <Button variant="secondary" size="sm" icon={LogOut} onClick={handleSignOut} className="w-full justify-center">
                            SIGN OUT OF THIS DEVICE
                          </Button>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                     {/* Workspace Permissions */}
                     <div className="rounded-2xl border border-black/[0.06] bg-[#fef8f8] p-8 space-y-6">
                        <div>
                          <h4 className="font-display font-semibold text-[14px] text-on-surface">Workspace Permissions</h4>
                          <p className="font-body-sm text-[12px] text-on-surface-variant opacity-60">Your access level in this workspace.</p>
                        </div>
                        <div className="flex items-center gap-4 p-5 rounded-xl bg-white border border-black/[0.05]">
                           <div className="w-10 h-10 rounded-lg bg-black/[0.02] border border-black/[0.06] flex items-center justify-center text-primary shrink-0">
                             <Shield size={18} />
                           </div>
                           <div>
                             <p className="font-label-caps text-[9px] text-on-surface-variant opacity-60 uppercase tracking-wider mb-1">ROLE</p>
                             <p className="font-display text-[14px] font-semibold text-on-surface capitalize">{data.membership.role}</p>
                           </div>
                        </div>
                     </div>

                     {/* Danger Zone */}
                     <div className="rounded-2xl border border-red-500/10 bg-red-500/[0.02] p-8 space-y-6">
                        <div>
                          <h4 className="font-display font-semibold text-[14px] text-red-700">Danger Zone</h4>
                          <p className="font-body-sm text-[12px] text-red-700/60">Destructive actions for your membership or the workspace itself.</p>
                        </div>
                        
                        <div className="space-y-4">
                          <DangerAction
                            icon={AlertTriangle}
                            title="Leave Workspace"
                            description="Remove your membership. Owners can leave only if another owner remains."
                            action={(
                              <Button variant="danger" size="sm" icon={LogOut} isLoading={isLeaving} onClick={handleLeaveTenant}>
                                LEAVE
                              </Button>
                            )}
                          />

                          {isOwner && (
                            <DangerAction
                              icon={Trash2}
                              title="Delete Workspace"
                              description="Permanently delete this workspace and all associated records."
                              action={(
                                <Button variant="danger" size="sm" icon={Trash2} isLoading={isDeleting} onClick={handleDeleteTenant}>
                                  DELETE
                                </Button>
                              )}
                            />
                          )}
                        </div>
                     </div>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ReadOnlyMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="space-y-2 min-w-0">
      <p className="font-label-caps text-[9px] text-on-surface-variant opacity-60 uppercase tracking-wider">
        {label}
      </p>
      <p className="font-display text-[14px] font-semibold text-on-surface truncate">
        {value}
      </p>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 p-5 rounded-xl border border-black/[0.05] bg-black/[0.01]">
      <div className="w-10 h-10 rounded-lg bg-white border border-black/[0.06] flex items-center justify-center text-primary">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="font-label-caps text-[9px] text-on-surface-variant opacity-60 uppercase tracking-wider">
          {label}
        </p>
        <p className="font-display text-[14px] font-semibold text-on-surface truncate">
          {value}
        </p>
      </div>
    </div>
  );
}

function DangerAction({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between p-5 rounded-xl border border-red-500/10 bg-red-500/[0.025]">
      <div className="flex items-start gap-4 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-white border border-red-500/10 flex items-center justify-center text-red-600 shrink-0">
          <Icon size={18} />
        </div>
        <div className="min-w-0">
          <p className="font-display text-[14px] font-semibold text-on-surface">{title}</p>
          <p className="font-body-sm text-[12px] text-on-surface-variant opacity-65 mt-1 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}
