"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { getTenantDashboardUrl, getTenantHost, rememberTenant } from "@/lib/tenant-url";

/* ── Plan data ── */
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
];

const STEPS = ["Workspace Details", "Select Plan", "Launch"];

function slugify(val: string) {
  return val
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

/* ── Availability badge ── */
type AvailState = "idle" | "checking" | "available" | "taken";

function AvailBadge({ state }: { state: AvailState }) {
  if (state === "idle") return null;
  if (state === "checking")
    return (
      <span className="flex items-center gap-1.5 font-label-caps text-[10px] uppercase tracking-[0.06em] font-semibold text-on-surface-variant/60">
        <span className="material-symbols-outlined text-[13px] animate-spin">progress_activity</span>
        Checking
      </span>
    );
  if (state === "available")
    return (
      <span className="flex items-center gap-1.5 font-label-caps text-[10px] uppercase tracking-[0.06em] font-semibold text-green-600">
        <span className="material-symbols-outlined text-[13px]">check_circle</span>
        Available
      </span>
    );
  return (
    <span className="flex items-center gap-1.5 font-label-caps text-[10px] uppercase tracking-[0.06em] font-semibold text-red-500">
      <span className="material-symbols-outlined text-[13px]">error</span>
      Taken
    </span>
  );
}

/* ─────────────── Step 1: Business Setup ─────────────── */
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

  const inputCls = "w-full py-3.5 px-4 rounded-xl bg-surface-container-lowest text-primary text-[15px] font-medium placeholder:text-on-surface-variant/30 outline-none transition-all";

  const canProceed = form.name.trim() && form.slug.trim() && avail !== "taken" && avail !== "checking";

  return (
    <div className="flex flex-col gap-8 animate-fade-in-up">
      {/* Workspace Name */}
      <div className="flex flex-col gap-2">
        <label htmlFor="tenant-name" className="font-label-caps text-[11px] uppercase tracking-[0.08em] font-semibold text-on-surface-variant">
          Workspace Name
        </label>
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
            <span className={`material-symbols-outlined text-[18px] transition-colors ${focused === "name" ? "text-primary" : "text-on-surface-variant/40 group-hover:text-on-surface-variant/60"}`}>domain</span>
          </div>
          <input
            id="tenant-name" type="text" required autoFocus
            placeholder="Acme Corporation"
            value={form.name} onChange={handleNameChange}
            onFocus={() => setFocused("name")} onBlur={() => setFocused(null)}
            className={`${inputCls} pl-12 ${focused === "name" ? "shadow-[0_0_0_2px_rgba(0,0,0,0.1)]" : "shadow-[0_0_0_1px_rgba(116,120,120,0.14)] hover:shadow-[0_0_0_1px_rgba(116,120,120,0.25)]"}`}
          />
        </div>
      </div>

      {/* Subdomain */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label htmlFor="tenant-slug" className="font-label-caps text-[11px] uppercase tracking-[0.08em] font-semibold text-on-surface-variant">
            Workspace URL
          </label>
          <AvailBadge state={avail} />
        </div>
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
            <span className={`material-symbols-outlined text-[18px] transition-colors ${avail === "taken" ? "text-red-500"
                : avail === "available" ? "text-green-500"
                  : focused === "slug" ? "text-primary"
                    : "text-on-surface-variant/40 group-hover:text-on-surface-variant/60"
              }`}>link</span>
          </div>
          <input
            id="tenant-slug" type="text" required
            placeholder="acme"
            value={form.slug} onChange={handleSlugChange}
            onFocus={() => setFocused("slug")} onBlur={() => setFocused(null)}
            className={`${inputCls} pl-12 pr-28 ${avail === "taken" ? "shadow-[0_0_0_2px_rgba(239,68,68,0.5)] bg-red-50"
                : avail === "available" ? "shadow-[0_0_0_2px_rgba(34,197,94,0.5)] bg-green-50"
                  : focused === "slug" ? "shadow-[0_0_0_2px_rgba(0,0,0,0.1)]"
                    : "shadow-[0_0_0_1px_rgba(116,120,120,0.14)] hover:shadow-[0_0_0_1px_rgba(116,120,120,0.25)]"
              }`}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <span className="font-mono text-[13px] text-on-surface-variant/50">.opero.com</span>
          </div>
        </div>
        <p className="font-body-sm text-[13px] text-on-surface-variant/60 mt-1">
          Your portal will be accessible at: <span className="font-semibold text-primary">{getTenantHost(form.slug || "your-workspace")}</span>
        </p>
      </div>

      {/* Logo Upload */}
      <div className="flex flex-col gap-2">
        <label className="font-label-caps text-[11px] uppercase tracking-[0.08em] font-semibold text-on-surface-variant">
          Workspace Icon <span className="text-on-surface-variant/40 normal-case tracking-normal font-normal ml-1">Optional</span>
        </label>
        <div
          className={`relative flex items-center gap-5 p-5 rounded-xl border border-dashed transition-all cursor-pointer ${dragOver ? "border-primary bg-primary/[0.02]" : "border-outline/20 hover:border-outline/40 bg-surface-container-lowest"
            }`}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        >
          <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          {form.logo ? (
            <>
              <Image src={form.logo} alt="Logo" width={56} height={56} className="w-14 h-14 rounded-xl object-cover shadow-sm ring-1 ring-outline/10" />
              <div className="flex flex-col gap-1">
                <span className="font-body-md text-[14px] font-semibold text-primary">Change logo</span>
                <span className="font-body-sm text-[13px] text-on-surface-variant/60">Click or drag a new image</span>
              </div>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-xl bg-surface-container flex items-center justify-center shrink-0 border border-outline/5 shadow-sm">
                <span className="material-symbols-outlined text-[24px] text-on-surface-variant/40">upload_file</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-body-md text-[14px] font-semibold text-primary">Upload icon</span>
                <span className="font-body-sm text-[13px] text-on-surface-variant/60">PNG, JPG, SVG up to 2MB</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-2 flex justify-end">
        <button
          id="step1-next" type="button"
          disabled={!canProceed}
          onClick={onNext}
          className="group relative bg-primary text-on-primary font-label-caps text-[11px] uppercase tracking-[0.06em] font-bold px-8 py-3.5 rounded-full flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all overflow-hidden"
          style={{ boxShadow: "0 4px 14px rgba(0,0,0,0.15)" }}
        >
          <span className="relative z-10">Continue</span>
          <span className="material-symbols-outlined text-[16px] relative z-10 group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
        </button>
      </div>
    </div>
  );
}

/* ─────────────── Step 2: Choose Plan ─────────────── */
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
    <div className="flex flex-col gap-8 animate-fade-in-up">
      {/* Plan cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {plans.map((plan) => {
          const active = selected === plan.id;
          return (
            <button
              key={plan.id}
              id={`plan-${plan.id}`}
              type="button"
              onClick={() => onSelect(plan.id)}
              className="group text-left flex flex-col rounded-2xl outline-none transition-all duration-300 overflow-hidden relative"
              style={{
                background: active
                  ? "linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)"
                  : "var(--color-surface-container-lowest)",
                border: active ? "1px solid rgba(0,0,0,0.9)" : "1px solid rgba(116,120,120,0.14)",
                boxShadow: active ? "0 12px 32px rgba(0,0,0,0.12), 0 0 0 2px rgba(0,0,0,0.9)" : "0 2px 12px rgba(0,0,0,0.03)",
                transform: active ? "translateY(-4px)" : "none",
              }}
            >
              {active && (
                <>
                  {/* Subtle top shimmer */}
                  <div className="absolute top-0 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-white/15 to-transparent z-10" />
                  {/* Subtle dot grid on card */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-20 z-0"
                    style={{
                      backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)",
                      backgroundSize: "16px 16px",
                      maskImage: "radial-gradient(ellipse 100% 100% at 50% 0%, black 40%, transparent 100%)",
                      WebkitMaskImage: "radial-gradient(ellipse 100% 100% at 50% 0%, black 40%, transparent 100%)",
                    }}
                  />
                </>
              )}

              <div className="p-6 relative z-10 flex flex-col h-full">
                {/* Popular badge */}
                {plan.highlighted && (
                  <span
                    className={`absolute top-5 right-5 font-label-caps text-[9px] uppercase tracking-[0.06em] font-bold px-2.5 py-1 rounded-full ${active ? "bg-white/10 text-white/90" : "bg-primary/10 text-primary"
                      }`}
                  >
                    Recommended
                  </span>
                )}

                <div className="flex items-center gap-2.5 mb-4">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${active ? "border-white/30" : "border-outline/30"}`}>
                    {active && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <h3 className={`font-display font-bold text-lg ${active ? "text-white" : "text-primary"}`}>
                    {plan.name}
                  </h3>
                </div>

                <div className="mb-2">
                  <span className={`font-display font-bold text-3xl tracking-tight ${active ? "text-white" : "text-primary"}`}>
                    {plan.price}
                  </span>
                  <span className={`font-body-sm text-[13px] ml-1.5 ${active ? "text-white/60" : "text-on-surface-variant/70"}`}>
                    {plan.period}
                  </span>
                </div>

                <p className={`font-body-sm text-[13px] leading-relaxed mb-6 ${active ? "text-white/50" : "text-on-surface-variant/60"}`}>
                  {plan.tagline}
                </p>

                <ul className={`flex flex-col gap-2.5 pt-5 border-t mt-auto ${active ? "border-white/10" : "border-outline/10"}`}>
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <span className={`material-symbols-outlined text-[16px] mt-0.5 ${active ? "text-white/70" : "text-primary/60"}`}>check</span>
                      <span className={`font-body-md text-[13.5px] ${active ? "text-white/80" : "text-on-surface-variant/90"}`}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-center font-body-sm text-[13px] text-on-surface-variant/50">
        Annual billing saves up to 20%. All paid plans include a 14-day free trial.
      </p>

      <div className="flex items-center justify-between mt-2 pt-6 border-t border-outline/10">
        <button
          type="button" id="step2-back" onClick={onBack}
          className="font-label-caps text-[11px] uppercase tracking-[0.06em] font-bold text-on-surface-variant/60 hover:text-primary transition-colors flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Back
        </button>
        <button
          id="step2-next" type="button" onClick={onNext}
          className="group relative bg-primary text-on-primary font-label-caps text-[11px] uppercase tracking-[0.06em] font-bold px-8 py-3.5 rounded-full flex items-center justify-center gap-2 hover:bg-primary/90 transition-all overflow-hidden"
          style={{ boxShadow: "0 4px 14px rgba(0,0,0,0.15)" }}
        >
          <span className="relative z-10">Launch Workspace</span>
          <span className="material-symbols-outlined text-[16px] relative z-10 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform">rocket_launch</span>
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
        </button>
      </div>
    </div>
  );
}

/* ─────────────────── Step 3: Launch ─────────────────── */
const LAUNCH_STEPS = [
  "Provisioning workspace",
  "Configuring domain routing",
  "Setting up environment",
  "Finalizing permissions",
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
  const [doneCount, setDoneCount] = useState(0);
  const [phase, setPhase] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [retryNonce, setRetryNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let isApiDone = false;
    let isError = false;
    let errMsg = "";
    let progressTimer: ReturnType<typeof setTimeout> | null = null;
    let apiStartTimer: ReturnType<typeof setTimeout> | null = null;
    let settleTimer: ReturnType<typeof setTimeout> | null = null;
    const controller = new AbortController();

    setDoneCount(0);
    setPhase("loading");
    setErrorMsg("");

    const finish = () => {
      if (cancelled) return;
      setDoneCount(LAUNCH_STEPS.length);
      settleTimer = setTimeout(() => {
        if (cancelled) return;
        if (isError) {
          setPhase("error");
          setErrorMsg(errMsg);
        } else {
          setPhase("success");
        }
      }, 350);
    };

    const waitForApi = () => {
      if (cancelled) return;
      if (isApiDone) {
        finish();
        return;
      }
      settleTimer = setTimeout(waitForApi, 120);
    };

    const advanceProgress = (completed: number) => {
      progressTimer = setTimeout(() => {
        if (cancelled) return;
        setDoneCount(completed);
        if (completed >= LAUNCH_STEPS.length - 1) {
          waitForApi();
        } else {
          advanceProgress(completed + 1);
        }
      }, 800);
    };

    // Delay the POST until after the effect survives React dev re-runs.
    apiStartTimer = setTimeout(() => {
      fetch("/api/tenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: tenantName, slug: tenantSlug, logo: tenantLogo ?? "" }),
        signal: controller.signal,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            isError = true;
            errMsg = data.error;
          }
          isApiDone = true;
        })
        .catch(() => {
          if (controller.signal.aborted) return;
          isError = true;
          errMsg = "Failed to create workspace. Please try again.";
          isApiDone = true;
        });
    }, 0);

    advanceProgress(1);

    return () => {
      cancelled = true;
      controller.abort();
      if (progressTimer) clearTimeout(progressTimer);
      if (apiStartTimer) clearTimeout(apiStartTimer);
      if (settleTimer) clearTimeout(settleTimer);
    };
  }, [retryNonce, tenantLogo, tenantName, tenantSlug]);

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-8 animate-fade-in min-h-[360px]">
      {phase === "loading" ? (
        <div className="w-full max-w-sm animate-fade-in">
          {/* Header */}
          <div className="flex items-center gap-5 mb-10">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center" aria-hidden="true">
              <svg className="h-14 w-14 animate-spin text-primary" viewBox="0 0 48 48" fill="none">
                <circle
                  className="text-primary/15"
                  cx="24"
                  cy="24"
                  r="19"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="19"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="88 32"
                />
              </svg>
            </div>
            <div>
              <p className="font-h2 font-bold text-lg text-primary">Creating workspace</p>
              <p className="font-body-sm text-[13px] text-on-surface-variant/60 mt-0.5">Please hold on a moment...</p>
            </div>
          </div>

          {/* List */}
          <div className="flex flex-col gap-5">
            {LAUNCH_STEPS.map((label, i) => {
              const done = i < doneCount;
              const active = i === doneCount;
              return (
                <div key={i} className="flex items-center gap-4 transition-opacity duration-300">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${done ? "bg-primary text-on-primary" : active ? "border-2 border-primary" : "border-2 border-outline/20"
                      }`}
                  >
                    {done && <span className="material-symbols-outlined text-[12px] font-bold">check</span>}
                  </div>
                  <span
                    className={`font-body-md text-[14px] transition-colors duration-300 ${done ? "text-primary font-medium" : active ? "text-primary font-semibold" : "text-on-surface-variant/40"
                      }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : phase === "error" ? (
        <div className="flex flex-col w-full max-w-sm animate-fade-in">
          <div className="flex items-center gap-5 mb-8">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">error</span>
            </div>
            <div>
              <p className="font-h2 font-bold text-lg text-primary">Setup failed</p>
              <p className="font-body-sm text-[13px] text-on-surface-variant/60 mt-0.5">We encountered a problem.</p>
            </div>
          </div>

          <div className="p-5 rounded-xl border border-red-500/20 bg-red-50 mb-8">
            <p className="font-body-sm text-[13px] text-red-700 font-medium">
              {errorMsg || "An unknown error occurred while creating your workspace."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setDoneCount(0);
              setPhase("loading");
              setErrorMsg("");
              setRetryNonce((value) => value + 1);
            }}
            className="w-full bg-primary text-on-primary font-label-caps text-[11px] uppercase tracking-[0.06em] font-bold px-6 py-3.5 rounded-full flex items-center justify-center gap-2 hover:bg-primary/90 transition-all"
            style={{ boxShadow: "0 4px 14px rgba(0,0,0,0.15)" }}
          >
            Try Again
            <span className="material-symbols-outlined text-[16px]">refresh</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col w-full max-w-sm animate-fade-in text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-[32px]">check_circle</span>
          </div>

          <h2 className="font-display font-bold text-2xl text-primary mb-2">Workspace ready</h2>
          <p className="font-body-md text-[14px] text-on-surface-variant/60 mb-8">
            Your new workspace has been successfully created and configured.
          </p>

          {/* Receipt/Summary Card */}
          <div className="p-5 rounded-2xl border border-outline/10 bg-surface-container-lowest mb-8 flex items-center gap-4 text-left shadow-sm">
            {tenantLogo ? (
              <img src={tenantLogo} alt="Logo" className="w-12 h-12 rounded-xl border border-outline/10 object-cover shadow-sm" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center border border-outline/10 shadow-sm shrink-0">
                <span className="material-symbols-outlined text-[20px] text-on-surface-variant/40">domain</span>
              </div>
            )}
            <div className="flex flex-col overflow-hidden">
              <span className="font-h2 font-semibold text-[15px] text-primary truncate">{tenantName}</span>
              <span className="font-mono text-[12px] text-on-surface-variant/50 truncate mt-0.5">{tenantSlug}.opero.com</span>
            </div>
          </div>

          <button
            id="launch-enter" type="button" onClick={onEnter}
            className="group w-full bg-primary text-on-primary font-label-caps text-[11px] uppercase tracking-[0.06em] font-bold px-6 py-4 rounded-full flex items-center justify-center gap-2 hover:bg-primary/90 transition-all overflow-hidden relative"
            style={{ boxShadow: "0 4px 14px rgba(0,0,0,0.15)" }}
          >
            <span className="relative z-10">Enter Dashboard</span>
            <span className="material-symbols-outlined text-[16px] relative z-10 group-hover:translate-x-1 transition-transform">arrow_forward</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────────── Main page ─────────────── */
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
    const res = await fetch("/api/tenant", { cache: "no-store" });
    const payload = await res.json().catch(() => ({}));
    const created = payload.organizations?.find((o: { slug?: string }) => o.slug === tenantForm.slug);
    if (created) {
      await authClient.organization.setActive({ organizationId: created.id });
      rememberTenant({ id: created.id, slug: created.slug });
    }
    window.location.assign(getTenantDashboardUrl(tenantForm.slug));
  };

  if (eligibility.loading) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-[640px] space-y-12 animate-pulse">
          <div className="flex justify-center gap-6">
            <div className="h-2 w-12 rounded-full bg-outline/10" />
            <div className="h-2 w-12 rounded-full bg-outline/5" />
            <div className="h-2 w-12 rounded-full bg-outline/5" />
          </div>
          <div className="h-96 rounded-2xl bg-outline/5" />
        </div>
      </main>
    );
  }

  if (!eligibility.canCreate) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center px-5 py-12">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center mx-auto mb-6 shadow-sm border border-outline/10 text-on-surface-variant">
            <span className="material-symbols-outlined text-[32px]">domain_disabled</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-primary mb-3 tracking-tight">
            Limit Reached
          </h1>
          <p className="font-body-md text-[14.5px] text-on-surface-variant/80 leading-relaxed mb-8">
            You can only create one workspace per account. You can still join other workspaces using an invite code.
            {eligibility.ownedTenant ? ` Your current workspace is "${eligibility.ownedTenant.name}".` : ""}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/onboarding/join"
              className="w-full sm:w-auto bg-primary text-on-primary font-label-caps text-[11px] uppercase tracking-[0.06em] font-bold px-8 py-3.5 rounded-full hover:bg-primary/90 transition-all shadow-sm"
            >
              Join with code
            </Link>
            <Link
              href="/tenants"
              className="w-full sm:w-auto bg-surface-container-low text-primary font-label-caps text-[11px] uppercase tracking-[0.06em] font-bold px-8 py-3.5 rounded-full hover:bg-surface-container border border-outline/10 transition-all"
            >
              My workspaces
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col items-center px-5 sm:px-8 py-10 sm:py-16 relative">
      {/* Ambient glow behind main container */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none -z-10"
        style={{
          width: 600,
          height: 400,
          background: "radial-gradient(ellipse, rgba(0,0,0,0.03) 0%, transparent 70%)",
        }}
      />

      <div className="w-full max-w-[640px]">

        {/* Sleek Horizontal Stepper */}
        <div className="flex justify-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-3">
            {STEPS.map((label, idx) => {
              const s = idx + 1;
              const done = s < step;
              const active = s === step;
              return (
                <div key={label} className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {/* Indicator dot */}
                    <div className="relative flex items-center justify-center">
                      {active && (
                        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                      )}
                      <div
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 relative z-10 ${active ? "bg-primary scale-110" : done ? "bg-primary/40" : "bg-outline/20"
                          }`}
                      />
                    </div>
                    {/* Label */}
                    <span
                      className={`font-label-caps text-[10px] uppercase tracking-[0.08em] font-bold hidden sm:block transition-colors duration-300 ${active ? "text-primary" : done ? "text-primary/60" : "text-on-surface-variant/40"
                        }`}
                    >
                      {label}
                    </span>
                  </div>
                  {/* Separator Line */}
                  {idx < STEPS.length - 1 && (
                    <div
                      className={`w-6 sm:w-10 h-px transition-all duration-500 ${done ? "bg-primary/30" : "bg-outline/10"
                        }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="animate-fade-in-up">
          {/* Header (Hidden in Step 3 for cleaner launch screen) */}
          {step < 3 && (
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full border border-outline/10 bg-surface-container-lowest">
                <span className="font-label-caps text-[9px] uppercase tracking-[0.08em] font-bold text-primary/60">
                  Step {step} of {STEPS.length}
                </span>
              </div>
              <h1 className="font-display text-primary font-bold text-3xl sm:text-4xl tracking-tight mb-3">
                {step === 1 && "Create your workspace"}
                {step === 2 && "Choose your plan"}
              </h1>
              <p className="font-body-md text-[15px] text-on-surface-variant/70 max-w-md mx-auto">
                {step === 1 && "Set up a new operational hub for your team."}
                {step === 2 && "Select the features that fit your team's needs."}
              </p>
            </div>
          )}

          <div className={`transition-all duration-500 ${step === 3 ? "mt-4" : ""}`}>
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
        </div>

        {step === 1 && (
          <p className="mt-12 text-center font-body-sm text-[13px] text-on-surface-variant/50">
            <Link href="/onboarding" className="hover:text-primary transition-colors inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">arrow_back</span>
              Return to choices
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}
