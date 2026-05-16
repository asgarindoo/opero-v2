"use client";

import React, { useEffect, useRef, useState } from "react";
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
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { getTenantLogoSrc } from "@/lib/tenant-logo";
import ModuleHeader from "../components/shared/ModuleHeader";
import ModuleTabs from "../components/shared/ModuleTabs";
import Button from "../components/ui/Button";

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
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const canManage = data?.membership.role === "owner" || data?.membership.role === "admin";

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/tenant/settings", { cache: "no-store" });
        const payload = await res.json();

        if (!res.ok) {
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
    await authClient.signOut();
    router.replace("/login");
    router.refresh();
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
        <div className="max-w-[800px] mx-auto animate-fade-in">
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
                <div className="space-y-12 pb-20">
                  <section className="space-y-6">
                    <div>
                      <h3 className="font-display font-semibold text-[15px] text-on-surface">General Information</h3>
                      <p className="font-body-sm text-[12px] text-on-surface-variant opacity-60 mt-1">
                        Manage the identity and branding for this tenant.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-8 pt-4">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="font-label-caps text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">
                            Tenant Name
                          </label>
                          <input
                            type="text"
                            value={form.name}
                            disabled={!canManage}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full bg-black/[0.01] border border-black/[0.06] rounded-lg px-4 py-3 font-display text-[14px] focus:bg-white focus:border-primary/20 outline-none transition-all disabled:opacity-60"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="font-label-caps text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">
                            Workspace URL
                          </label>
                          <div className="relative">
                            <Globe size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-40" />
                            <input
                              type="text"
                              readOnly
                              value={`${data.tenant.slug}.opero.app`}
                              className="w-full bg-black/[0.03] border border-black/[0.06] rounded-lg pl-11 pr-4 py-3 font-display text-[14px] text-on-surface-variant opacity-70 outline-none cursor-not-allowed"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="font-label-caps text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">
                            Tenant Code
                          </label>
                          <div className="relative group">
                            <input
                              type="text"
                              readOnly
                              value={data.tenant.slug}
                              className="w-full bg-black/[0.03] border border-black/[0.06] rounded-lg px-4 py-3 font-display text-[14px] text-on-surface-variant font-bold tracking-tight outline-none cursor-default"
                            />
                            <button
                              onClick={() => copyToClipboard(data.tenant.slug)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-black/[0.05] rounded-md transition-colors text-on-surface-variant opacity-60 hover:opacity-100"
                              title="Copy code"
                            >
                              {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                            </button>
                          </div>
                          <p className="font-body-sm text-[11px] text-on-surface-variant opacity-50 mt-1">
                            Share this unique code with others so they can join this tenant.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="font-label-caps text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest block">
                          Logo
                        </label>
                        <div className="flex items-center gap-5">
                          <div className="w-24 h-24 rounded-lg bg-black/[0.02] border border-dashed border-black/[0.1] flex items-center justify-center overflow-hidden text-on-surface-variant">
                            {form.logo ? (
                              <img src={form.logo} alt={`${form.name} logo`} className="w-full h-full object-cover" />
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
                            <p className="font-body-sm text-[11px] text-on-surface-variant opacity-60">
                              Stored in tenant profile.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-black/[0.04]">
                      <ReadOnlyMetric label="Role" value={data.membership.role} />
                      <ReadOnlyMetric label="Created" value={new Date(data.tenant.createdAt).toLocaleDateString()} />
                    </div>
                  </section>

                  {!canManage && (
                    <div className="rounded-lg border border-black/[0.06] bg-black/[0.015] p-4 font-body-sm text-[12px] text-on-surface-variant/70">
                      You can view tenant settings, but only owners and admins can edit them.
                    </div>
                  )}
                </div>
              )}

              {activeTab === "billing" && (
                <div className="space-y-12 animate-fade-in pb-20">
                  <section className="space-y-6">
                    <div>
                      <h3 className="font-display font-semibold text-[15px] text-on-surface">Plan & Usage</h3>
                      <p className="font-body-sm text-[12px] text-on-surface-variant opacity-60 mt-1">
                        This reflects the subscription data currently stored for this tenant.
                      </p>
                    </div>

                    <div className="p-8 rounded-xl border border-black/[0.04] bg-black/[0.01] space-y-8">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                        <ReadOnlyMetric label="Plan" value={plan?.plan.displayName ?? "Not configured"} />
                        <ReadOnlyMetric label="Status" value={plan?.status ?? "Not configured"} />
                        <ReadOnlyMetric
                          label="Period End"
                          value={plan?.currentPeriodEnd ? new Date(plan.currentPeriodEnd).toLocaleDateString() : "Not configured"}
                        />
                      </div>

                      <div className="space-y-3 pt-6 border-t border-black/[0.04]">
                        <div className="flex justify-between font-body-sm text-[11px]">
                          <span className="text-on-surface-variant opacity-60">Members</span>
                          <span className="font-semibold text-on-surface">
                            {membersCount}{membersMax > 0 ? ` / ${membersMax}` : ""}
                          </span>
                        </div>
                        <div className="h-1 w-full bg-black/[0.04] rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${membersPct}%` }} />
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-12 animate-fade-in pb-20">
                  <section className="space-y-6">
                    <div>
                      <h3 className="font-display font-semibold text-[15px] text-on-surface">Account Access</h3>
                      <p className="font-body-sm text-[12px] text-on-surface-variant opacity-60 mt-1">
                        Security controls shown here are limited to features currently wired in the app.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <InfoRow icon={UserRound} label="Signed in as" value={data.user?.name ?? "Unknown user"} />
                      <InfoRow icon={Mail} label="Email" value={data.user?.email ?? "Unknown email"} />
                      <InfoRow icon={Shield} label="Tenant role" value={data.membership.role} />
                    </div>
                  </section>

                  <section className="pt-10 border-t border-black/[0.04] space-y-6">
                    <div>
                      <h3 className="font-display font-semibold text-[15px] text-on-surface">Session</h3>
                      <p className="font-body-sm text-[12px] text-on-surface-variant opacity-60 mt-1">
                        End your current session on this browser.
                      </p>
                    </div>

                    <Button variant="danger" size="sm" icon={LogOut} onClick={handleSignOut}>
                      SIGN OUT
                    </Button>
                  </section>
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
