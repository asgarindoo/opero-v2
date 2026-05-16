"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/* Simulated tenant data â€” replace with real API */
const MOCK_TENANTS = [
  {
    id: "t1",
    name: "Acme Corporation",
    slug: "acme-corp",
    role: "Owner" as const,
    memberCount: 12,
    plan: "Pro",
    initial: "A",
    color: "hsl(220, 12%, 20%)",
    lastActive: "Active now",
  },
  {
    id: "t2",
    name: "Globex Systems",
    slug: "globex",
    role: "Admin" as const,
    memberCount: 8,
    plan: "Business",
    initial: "G",
    color: "hsl(190, 12%, 22%)",
    lastActive: "2 hours ago",
  },
  {
    id: "t3",
    name: "Initech",
    slug: "initech",
    role: "Member" as const,
    memberCount: 45,
    plan: "Free",
    initial: "I",
    color: "hsl(260, 10%, 24%)",
    lastActive: "Yesterday",
  },
];

const roleMeta: Record<string, { label: string; bg: string; color: string }> = {
  Owner:  { label: "Owner",  bg: "rgba(0,0,0,0.07)", color: "var(--color-primary)" },
  Admin:  { label: "Admin",  bg: "rgba(0,0,0,0.045)", color: "var(--color-secondary)" },
  Member: { label: "Member", bg: "rgba(0,0,0,0.03)",  color: "var(--color-on-surface-variant)" },
};

export default function TenantSelectionPage() {
  const router = useRouter();
  const [selecting, setSelecting] = useState<string | null>(null);

  const handleSelect = (tenant: typeof MOCK_TENANTS[number]) => {
    setSelecting(tenant.id);
    setTimeout(() => {
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
      const base    = `; path=/; expires=${expires}; SameSite=Lax`;
      document.cookie = `opero_active_tenant=${tenant.slug}${base}`;
      router.push("/dashboard");
    }, 900);
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-5 sm:px-10 py-12">
      <div className="w-full max-w-[640px]">

        {/* Heading */}
        <div className="text-center mb-10 animate-fade-in-up">
          <span className="inline-flex items-center gap-1.5 font-label-caps text-[10px] uppercase tracking-[0.08em] font-semibold text-on-surface-variant/50 mb-4">
            <span className="w-3 h-px bg-outline/30" />
            Welcome back
            <span className="w-3 h-px bg-outline/30" />
          </span>
          <h1
            className="font-display text-primary font-bold leading-[1.1] mb-3"
            style={{ fontSize: "clamp(26px, 4vw, 38px)", letterSpacing: "-0.025em" }}
          >
            Choose a tenant
          </h1>
          <p className="font-body-md text-[14px] text-on-surface-variant">
            You belong to multiple tenants. Select one to continue.
          </p>
        </div>

        {/* Tenant cards */}
        <div className="flex flex-col gap-3 animate-fade-in-up delay-200">
          {MOCK_TENANTS.map((t, idx) => {
            const isSelecting = selecting === t.id;
            const meta = roleMeta[t.role];
            return (
              <button
                key={t.id}
                id={`tenant-${t.id}`}
                type="button"
                onClick={() => handleSelect(t)}
                disabled={!!selecting}
                className="group flex items-center gap-4 p-5 rounded-2xl border border-outline/12 bg-surface-container-lowest text-left w-full outline-none disabled:cursor-wait transition-all duration-300"
                style={{
                  animationDelay: `${idx * 60}ms`,
                  boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                }}
                onMouseEnter={(e) => {
                  if (selecting) return;
                  const el = e.currentTarget;
                  el.style.borderColor = "rgba(116,120,120,0.32)";
                  el.style.transform   = "translateY(-3px)";
                  el.style.boxShadow   = "0 12px 36px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.borderColor = "";
                  el.style.transform   = "";
                  el.style.boxShadow   = "0 2px 10px rgba(0,0,0,0.03)";
                }}
              >
                {/* Avatar */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-white text-[16px] shrink-0 shadow-sm"
                  style={{ background: t.color }}
                >
                  {isSelecting ? (
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    t.initial
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="font-h3 text-[15px] font-semibold text-primary truncate">{t.name}</span>
                    <span
                      className="font-label-caps text-[9px] uppercase tracking-[0.06em] font-semibold px-2 py-0.5 rounded-full shrink-0"
                      style={{ background: meta.bg, color: meta.color }}
                    >
                      {meta.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-body-sm text-[12px] text-on-surface-variant/55 font-mono">{t.slug}.opero.app</span>
                    <span className="w-0.5 h-0.5 rounded-full bg-outline/40 shrink-0" />
                    <span className="font-body-sm text-[12px] text-on-surface-variant/50">
                      <span className="material-symbols-outlined text-[11px] align-middle mr-0.5">group</span>
                      {t.memberCount} members
                    </span>
                    <span className="w-0.5 h-0.5 rounded-full bg-outline/40 shrink-0" />
                    <span className="font-body-sm text-[12px] text-on-surface-variant/40">{t.lastActive}</span>
                  </div>
                </div>

                {/* Plan chip + arrow */}
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className="hidden sm:block font-label-caps text-[9px] uppercase tracking-[0.05em] font-semibold px-2 py-1 rounded-full"
                    style={{ background: "rgba(0,0,0,0.04)", color: "var(--color-on-surface-variant)" }}
                  >
                    {t.plan}
                  </span>
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant/25 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200">
                    arrow_forward
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Create new tenant */}
        <div className="mt-6 pt-6 border-t border-outline/10 flex items-center justify-center animate-fade-in-up delay-400">
          <Link
            href="/onboarding/create"
            className="flex items-center gap-2 font-label-caps text-[10px] uppercase tracking-[0.06em] font-semibold text-on-surface-variant/50 hover:text-primary border border-outline/15 hover:border-outline/35 px-5 py-2.5 rounded-full transition-all duration-200 hover:bg-surface-container"
          >
            <span className="material-symbols-outlined text-[14px]">add</span>
            Create a new tenant
          </Link>
        </div>
      </div>
    </main>
  );
}

