"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { getTenantDashboardUrl, rememberTenant } from "@/lib/tenant-url";

/* â”€â”€ Plan data â”€â”€ */
const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    tagline: "Perfect to get started",
    features: ["Up to 3 workflows", "2 team members", "1 GB storage", "Community support"],
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19",
    period: "/ mo per user",
    tagline: "For growing teams",
    features: ["Unlimited workflows", "Up to 25 members", "50 GB storage", "Priority support", "Analytics dashboard"],
    highlighted: true,
  },
  {
    id: "business",
    name: "Business",
    price: "$49",
    period: "/ mo per user",
    tagline: "For larger operations",
    features: ["Everything in Pro", "Unlimited members", "500 GB storage", "Dedicated support", "SSO & audit logs"],
    highlighted: false,
  },
];

const STEPS = ["Business Setup", "Choose Plan", "Launch"];



function slugify(val: string) {
  return val
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

/* â”€â”€ Availability badge â”€â”€ */
type AvailState = "idle" | "checking" | "available" | "taken";

function AvailBadge({ state }: { state: AvailState }) {
  if (state === "idle") return null;
  if (state === "checking")
    return (
      <span className="flex items-center gap-1 font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold text-on-surface-variant/50">
        <span className="w-3 h-3 rounded-full border-[1.5px] border-outline/40 border-t-on-surface-variant/60 animate-spin" />
        Checkingâ€¦
      </span>
    );
  if (state === "available")
    return (
      <span className="flex items-center gap-1 font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold" style={{ color: "#16a34a" }}>
        <span className="material-symbols-outlined text-[13px]">check_circle</span>
        Available
      </span>
    );
  return (
    <span className="flex items-center gap-1 font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold" style={{ color: "var(--color-error)" }}>
      <span className="material-symbols-outlined text-[13px]">cancel</span>
      Already taken
    </span>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Step 1: Business Setup â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function StepInfo({
  form,
  setForm,
  onNext,
}: {
  form: { name: string; slug: string; logo: string | null };
  setForm: (f: typeof form) => void;
  onNext: () => void;
}) {
  const [focused, setFocused] = useState<string | null>(null);
  const [slugEdited, setSlugEdited] = useState(false);
  const [avail, setAvail] = useState<AvailState>("idle");
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkAvailability = useCallback((slug: string) => {
    if (!slug) { setAvail("idle"); return; }
    setAvail("checking");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        const { data, error } = await authClient.organization.checkSlug({ slug });
        setAvail(error ? "taken" : data?.status ? "available" : "idle");
      } catch {
        setAvail("idle");
      }
    }, 650);
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const newSlug = slugEdited ? form.slug : slugify(val);
    setForm({ ...form, name: val, slug: newSlug });
    if (!slugEdited) checkAvailability(newSlug);
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugEdited(true);
    const newSlug = slugify(e.target.value);
    setForm({ ...form, slug: newSlug });
    checkAvailability(newSlug);
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm({ ...form, logo: ev.target?.result as string });
    reader.readAsDataURL(file);
  };

  const fieldStyle = (f: string) => ({
    borderColor: focused === f ? "var(--color-primary)" : "rgba(116,120,120,0.2)",
    boxShadow: focused === f ? "0 0 0 3px rgba(0,0,0,0.06)" : "none",
  });
  const inputCls = "w-full py-3 rounded-xl border bg-surface-container-lowest text-primary font-body-md text-[14px] placeholder:text-on-surface-variant/30 outline-none transition-all duration-200";

  const canProceed = form.name.trim() && form.slug.trim() && avail !== "taken" && avail !== "checking";

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">

      {/* Tenant Name */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="tenant-name" className="font-label-caps text-[10px] uppercase tracking-[0.06em] font-semibold text-on-surface-variant">
          Business Name
        </label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[16px] text-on-surface-variant/40 pointer-events-none">business</span>
          <input
            id="tenant-name" type="text" required autoFocus
            placeholder="Acme Corporation"
            value={form.name} onChange={handleNameChange}
            onFocus={() => setFocused("name")} onBlur={() => setFocused(null)}
            className={`${inputCls} pl-10 pr-4`} style={fieldStyle("name")}
          />
        </div>
      </div>

      {/* Subdomain */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="tenant-slug" className="font-label-caps text-[10px] uppercase tracking-[0.06em] font-semibold text-on-surface-variant">
            Subdomain
          </label>
          <AvailBadge state={avail} />
        </div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[16px] text-on-surface-variant/40 pointer-events-none">link</span>
          <input
            id="tenant-slug" type="text" required
            placeholder="acme-corporation"
            value={form.slug} onChange={handleSlugChange}
            onFocus={() => setFocused("slug")} onBlur={() => setFocused(null)}
            className={`${inputCls} pl-10 pr-4`}
            style={{
              borderColor:
                avail === "taken"     ? "var(--color-error)"
                : avail === "available" ? "rgba(22,163,74,0.5)"
                : focused === "slug"  ? "var(--color-primary)"
                : "rgba(116,120,120,0.2)",
              boxShadow:
                avail === "taken"      ? "0 0 0 3px rgba(186,26,26,0.06)"
                : avail === "available" ? "0 0 0 3px rgba(22,163,74,0.06)"
                : focused === "slug"   ? "0 0 0 3px rgba(0,0,0,0.06)"
                : "none",
            }}
          />
        </div>
        {/* Live subdomain preview */}
        <p className="font-body-sm text-[12px] text-on-surface-variant/50 pl-1">
          Your Tenant URL:{" "}
          <span className="font-semibold text-primary/70 font-mono tracking-tight">
            {form.slug || "your-Tenant"}.opero.app
          </span>
        </p>
      </div>

      {/* Logo Upload */}
      <div className="flex flex-col gap-1.5">
        <span className="font-label-caps text-[10px] uppercase tracking-[0.06em] font-semibold text-on-surface-variant">
          Logo <span className="text-on-surface-variant/40 normal-case tracking-normal font-normal">(optional)</span>
        </span>
        <div
          className="relative flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer"
          style={{
            borderColor: dragOver ? "var(--color-primary)" : "rgba(116,120,120,0.18)",
            background: dragOver ? "rgba(0,0,0,0.025)" : "rgba(0,0,0,0.01)",
          }}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        >
          <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          {form.logo ? (
            <>
              <img src={form.logo} alt="Logo preview" className="w-14 h-14 rounded-xl object-cover border border-outline/15 shadow-sm" />
              <span className="font-body-sm text-[12px] text-on-surface-variant/55">Click to change</span>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center border border-outline/10">
                <span className="material-symbols-outlined text-on-surface-variant/35 text-[20px]">upload</span>
              </div>
              <div className="text-center">
                <p className="font-body-md text-[13px] text-primary/65 font-medium">Drop your logo here</p>
                <p className="font-body-sm text-[12px] text-on-surface-variant/40">PNG, JPG, SVG Â· Max 2 MB</p>
              </div>
            </>
          )}
        </div>
      </div>

      <button
        id="step1-next" type="button"
        disabled={!canProceed}
        onClick={onNext}
        className="mt-2 w-full bg-primary text-on-primary font-label-caps text-[11px] uppercase tracking-[0.05em] font-semibold px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.16)] hover:-translate-y-px"
      >
        Continue
        <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
      </button>
    </div>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Step 2: Choose Plan â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function StepPlan({
  selected,
  onSelect,
  onNext,
  onBack,
}: {
  selected: string;
  onSelect: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col gap-5 animate-fade-in-up">
      {/* Plan cards â€” 3-col on wider containers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {plans.map((plan) => {
          const active = selected === plan.id;
          return (
            <button
              key={plan.id}
              id={`plan-${plan.id}`}
              type="button"
              onClick={() => onSelect(plan.id)}
              className="text-left rounded-2xl border p-5 transition-all duration-200 flex flex-col gap-3 relative overflow-hidden"
              style={{
                borderColor: active ? "var(--color-primary)" : "rgba(116,120,120,0.18)",
                background: active ? "rgba(0,0,0,0.025)" : "rgba(0,0,0,0.01)",
                boxShadow: active
                  ? plan.highlighted
                    ? "0 0 0 3px rgba(0,0,0,0.07), 0 8px 28px rgba(0,0,0,0.08)"
                    : "0 0 0 2.5px rgba(0,0,0,0.06)"
                  : "none",
              }}
            >
              {/* Popular badge */}
              {plan.highlighted && (
                <span
                  className="absolute top-3.5 right-3.5 font-label-caps text-[9px] uppercase tracking-[0.06em] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: active ? "var(--color-primary)" : "rgba(0,0,0,0.07)", color: active ? "#fff" : "var(--color-primary)" }}
                >
                  Popular
                </span>
              )}

              {/* Radio + Name */}
              <div className="flex items-center gap-2.5">
                <div
                  className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200"
                  style={{ borderColor: active ? "var(--color-primary)" : "rgba(116,120,120,0.3)" }}
                >
                  {active && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
                <span className="font-h3 text-[14px] font-semibold text-primary">{plan.name}</span>
              </div>

              {/* Price */}
              <div>
                <span className="font-display font-bold text-primary leading-none" style={{ fontSize: 26 }}>{plan.price}</span>
                <span className="font-body-sm text-[11px] text-on-surface-variant ml-1">{plan.period}</span>
              </div>

              <p className="font-body-sm text-[12px] text-on-surface-variant">{plan.tagline}</p>

              {/* Features */}
              <ul className="flex flex-col gap-1.5 pt-3 border-t border-outline/10 mt-auto">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary/50 text-[12px]">check</span>
                    <span className="font-body-sm text-[12px] text-on-surface-variant">{f}</span>
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      <p className="text-center font-body-sm text-[12px] text-on-surface-variant/40">
        Annual billing saves up to 20%. All paid plans include a 14-day free trial.
      </p>

      <button
        id="step2-next" type="button" onClick={onNext}
        className="w-full bg-primary text-on-primary font-label-caps text-[11px] uppercase tracking-[0.05em] font-semibold px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.16)] hover:-translate-y-px"
      >
        Launch Tenant
        <span className="material-symbols-outlined text-[15px]">rocket_launch</span>
      </button>
      <button
        type="button" id="step2-back" onClick={onBack}
        className="w-full border border-outline/20 text-on-surface-variant font-label-caps text-[11px] uppercase tracking-[0.05em] font-semibold px-6 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-surface-container hover:border-outline/40 active:scale-[0.98] transition-all duration-200"
      >
        <span className="material-symbols-outlined text-[15px]">arrow_back</span>Back
      </button>
    </div>
  );
}

/* ─────────────────── Step 3: Launch ─────────────────── */
const LAUNCH_STEPS = [
  { label: "Creating Tenant", delay: 400 },
  { label: "Applying plan & billing", delay: 900 },
  { label: "Configuring subdomain", delay: 1500 },
  { label: "Finalising setup", delay: 2000 },
];

function StepLaunch({
  tenantName,
  tenantSlug,
  tenantLogo,
  onEnter,
}: {
  tenantName: string;
  tenantSlug: string;
  tenantLogo?: string | null;
  onEnter: () => void;
}) {
  const hasStartedRef = useRef(false);
  const [doneCount, setDoneCount] = useState(0);
  const [phase, setPhase] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [retryNonce, setRetryNonce] = useState(0);

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const timers: ReturnType<typeof setTimeout>[] = [];

    // Kick off visual progress steps
    LAUNCH_STEPS.forEach((s, i) => {
      timers.push(setTimeout(() => setDoneCount(i + 1), s.delay));
    });

    // Actual API call — create the org
    fetch("/api/tenant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: tenantName, slug: tenantSlug, logo: tenantLogo ?? "" }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setPhase("error");
          setErrorMsg(data.error);
        } else {
          timers.push(setTimeout(() => setPhase("success"), 2600));
        }
      })
      .catch(() => {
        setPhase("error");
        setErrorMsg("Failed to create tenant. Please try again.");
      });

    return () => timers.forEach(clearTimeout);
  }, [retryNonce, tenantLogo, tenantName, tenantSlug]);



  return (
    <div className="flex flex-col items-center justify-center text-center gap-7 py-6 animate-fade-in-up min-h-[300px]">
      {phase === "loading" ? (
        <>
          {/* Spinner */}
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-[3px] border-outline/12" />
            <div
              className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-primary animate-spin"
              style={{ animationDuration: "0.85s" }}
            />
            {/* Inner pulse */}
            <div className="absolute inset-3 rounded-full border border-outline/15 animate-pulse" />
          </div>

          <div>
            <p className="font-h3 text-[18px] font-semibold text-primary mb-1">Setting up your Tenantâ€¦</p>
            <p className="font-body-md text-[14px] text-on-surface-variant">This only takes a moment.</p>
          </div>

          {/* Animated progress steps */}
          <div className="flex flex-col gap-2.5 w-full max-w-[280px]">
            {LAUNCH_STEPS.map((s, i) => {
              const done = i < doneCount;
              const active = i === doneCount;
              return (
                <div key={i} className="flex items-center gap-3 transition-all duration-300">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-400"
                    style={{
                      background: done ? "var(--color-primary)" : "transparent",
                      border: done ? "none" : active ? "1.5px solid var(--color-primary)" : "1.5px solid rgba(116,120,120,0.2)",
                    }}
                  >
                    {done && <span className="material-symbols-outlined text-white text-[11px]">check</span>}
                    {active && <span className="w-2 h-2 rounded-full border border-primary border-t-transparent animate-spin block" style={{ animationDuration: "0.6s" }} />}
                  </div>
                  <span
                    className="font-body-sm text-[12px] transition-colors duration-300"
                    style={{ color: done ? "var(--color-primary)" : active ? "var(--color-on-surface)" : "rgba(68,71,72,0.4)" }}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      ) : phase === "error" ? (
        <div className="flex flex-col items-center gap-5 animate-scale-in">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: "rgba(186,26,26,0.08)", color: "var(--color-error)" }}
          >
            <span className="material-symbols-outlined text-[28px]">error</span>
          </div>

          <div>
            <p
              className="font-display font-bold leading-[1.1] mb-2"
              style={{ fontSize: "clamp(22px, 3vw, 28px)", letterSpacing: "-0.02em", color: "var(--color-error)" }}
            >
              Tenant setup failed.
            </p>
            <p className="font-body-md text-[14px] text-on-surface-variant">
              {errorMsg || "Please check the tenant details and try again."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              hasStartedRef.current = false;
              setDoneCount(0);
              setPhase("loading");
              setErrorMsg("");
              setRetryNonce((value) => value + 1);
            }}
            className="mt-1 bg-primary text-on-primary font-label-caps text-[11px] uppercase tracking-[0.05em] font-semibold px-8 py-3.5 rounded-xl flex items-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 shadow-[0_4px_16px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.18)] hover:-translate-y-px"
          >
            Try Again
            <span className="material-symbols-outlined text-[15px]">refresh</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-5 animate-scale-in">
          {/* Success circle */}
          <div
            className="w-16 h-16 rounded-full bg-primary flex items-center justify-center animate-check-pop"
            style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.15), 0 0 0 8px rgba(0,0,0,0.05)" }}
          >
            <span className="material-symbols-outlined text-white text-[28px]">check</span>
          </div>

          <div>
            <p
              className="font-display font-bold text-primary leading-[1.1] mb-2"
              style={{ fontSize: "clamp(22px, 3vw, 28px)", letterSpacing: "-0.02em" }}
            >
              Your Tenant is ready.
            </p>
            <p className="font-body-md text-[14px] text-on-surface-variant">
              <span className="font-semibold text-primary">{tenantName || "Your Tenant"}</span> is live at{" "}
              <span className="font-mono text-primary/70">{tenantSlug || "your-tenant"}.opero.app</span>
            </p>
          </div>

          <button
            id="launch-enter" type="button" onClick={onEnter}
            className="mt-1 bg-primary text-on-primary font-label-caps text-[11px] uppercase tracking-[0.05em] font-semibold px-8 py-3.5 rounded-xl flex items-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 animate-pulse-glow shadow-[0_4px_16px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.18)] hover:-translate-y-px"
          >
            Enter Dashboard
            <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
          </button>
        </div>
      )}
    </div>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Main page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export default function CreateTenantPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [tenantForm, setTenantForm] = useState({ name: "", slug: "", logo: null as string | null });
  const [selectedPlan, setSelectedPlan] = useState("pro");
  const [eligibility, setEligibility] = useState<{
    loading: boolean;
    canCreate: boolean;
    ownedTenant?: { id: string; name: string; slug: string } | null;
  }>({ loading: true, canCreate: false });

  useEffect(() => {
    let cancelled = false;

    fetch("/api/tenant/create-eligibility", { cache: "no-store" })
      .then((res) => res.json())
      .then((payload) => {
        if (cancelled) return;
        setEligibility({
          loading: false,
          canCreate: Boolean(payload.canCreate),
          ownedTenant: payload.ownedTenant ?? null,
        });
      })
      .catch(() => {
        if (!cancelled) setEligibility({ loading: false, canCreate: false, ownedTenant: null });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleEnterDashboard = async () => {
    // The org was already created in StepLaunch — just set it active
    const { data: orgs } = await authClient.organization.list();
    const created = orgs?.find((o) => o.slug === tenantForm.slug);
    if (created) {
      await authClient.organization.setActive({ organizationId: created.id });
      rememberTenant({ id: created.id, slug: created.slug });
    }
    window.location.assign(getTenantDashboardUrl(tenantForm.slug));
  };

  if (eligibility.loading) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center px-5 sm:px-10 py-12">
        <div className="w-full max-w-[420px] space-y-4 animate-pulse">
          <div className="mx-auto h-8 w-56 rounded bg-black/[0.05]" />
          <div className="mx-auto h-3 w-72 rounded bg-black/[0.035]" />
          <div className="h-48 rounded-2xl border border-outline/10 bg-surface-container-lowest" />
        </div>
      </main>
    );
  }

  if (!eligibility.canCreate) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center px-5 sm:px-10 py-12">
        <div className="w-full max-w-[520px] text-center animate-fade-in-up">
          <span className="inline-flex items-center gap-1.5 font-label-caps text-[10px] uppercase tracking-[0.08em] font-semibold text-on-surface-variant/50 mb-4">
            Tenant limit reached
          </span>
          <h1 className="font-display text-primary font-bold leading-[1.1] mb-4" style={{ fontSize: "clamp(26px, 4vw, 38px)" }}>
            You already created a tenant.
          </h1>
          <p className="font-body-md text-[14px] text-on-surface-variant leading-relaxed mb-8">
            Each account can create one tenant. You can still join other tenants using an invite code.
            {eligibility.ownedTenant ? ` Your tenant is "${eligibility.ownedTenant.name}".` : ""}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/onboarding/join"
              className="w-full sm:w-auto bg-primary text-on-primary font-label-caps text-[11px] uppercase tracking-[0.05em] font-semibold px-6 py-3 rounded-xl"
            >
              Join with invite code
            </Link>
            <Link
              href="/tenants"
              className="w-full sm:w-auto border border-outline/20 text-primary font-label-caps text-[11px] uppercase tracking-[0.05em] font-semibold px-6 py-3 rounded-xl"
            >
              My tenants
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-5 sm:px-10 py-12">
      <div className="w-full max-w-[580px]">

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {STEPS.map((label, idx) => {
            const s = idx + 1;
            const done   = s < step;
            const active = s === step;
            return (
              <div key={label} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center font-label-caps text-[11px] font-semibold transition-all duration-300"
                    style={{
                      background: done || active ? "var(--color-primary)" : "transparent",
                      color: done || active ? "#fff" : "var(--color-on-surface-variant)",
                      border: done || active ? "none" : "1.5px solid rgba(116,120,120,0.25)",
                    }}
                  >
                    {done ? <span className="material-symbols-outlined text-[13px]">check</span> : s}
                  </div>
                  <span
                    className="font-label-caps text-[10px] uppercase tracking-[0.06em] font-semibold hidden sm:block transition-colors duration-200"
                    style={{ color: active ? "var(--color-primary)" : "var(--color-on-surface-variant)", opacity: active ? 1 : 0.4 }}
                  >
                    {label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className="w-10 sm:w-16 h-px mx-3 transition-all duration-500"
                    style={{ background: done ? "var(--color-primary)" : "rgba(116,120,120,0.15)" }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Card */}
        <div className="bg-surface-container-lowest border border-outline/12 rounded-2xl p-8 shadow-[0_8px_40px_rgba(0,0,0,0.06)]">

          {/* Step heading */}
          <div className="mb-7">
            <span className="font-label-caps text-[10px] uppercase tracking-[0.08em] font-semibold text-on-surface-variant/50 block mb-2">
              Step {step} of {STEPS.length}
            </span>
            <h1
              className="font-display text-primary font-bold leading-[1.1]"
              style={{ fontSize: "clamp(22px, 3vw, 28px)", letterSpacing: "-0.02em" }}
            >
              {step === 1 && "Tell us about your business"}
              {step === 2 && "Choose the right plan"}
              {step === 3 && "Launching your Tenant…"}
            </h1>
            {step < 3 && (
              <p className="mt-1.5 font-body-md text-[14px] text-on-surface-variant">
                {step === 1 && "Give your Tenant a name and choose a unique subdomain."}
                {step === 2 && "Pick a plan that fits your team. You can always upgrade later."}
              </p>
            )}
          </div>

          {step === 1 && <StepInfo form={tenantForm} setForm={setTenantForm} onNext={() => setStep(2)} />}
          {step === 2 && <StepPlan selected={selectedPlan} onSelect={setSelectedPlan} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
          {step === 3 && (
            <StepLaunch
              tenantName={tenantForm.name}
              tenantSlug={tenantForm.slug}
              tenantLogo={tenantForm.logo}
              onEnter={handleEnterDashboard}
            />
          )}
        </div>

        {step === 1 && (
          <p className="mt-5 text-center font-body-sm text-[12px] text-on-surface-variant/50">
            Changed your mind?{" "}
            <Link href="/onboarding" className="text-primary font-semibold hover:underline underline-offset-2">
              Back to options
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}

