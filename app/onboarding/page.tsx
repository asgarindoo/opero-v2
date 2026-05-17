"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const choices = [
  {
    id: "create",
    icon: "add_business",
    label: "Create a Tenant",
    description:
      "Launch your own tenant, invite your team, configure custom workflows, and start managing operations from day one.",
    cta: "Create tenant",
    href: "/onboarding/create",
    chips: ["Custom subdomain", "Choose your plan", "Full control"],
    accent: "rgba(0,0,0,0.88)",
  },
  {
    id: "join",
    icon: "group_add",
    label: "Join a Tenant",
    description:
      "Already have an invite? Enter your invite code or open the link your team admin shared with you.",
    cta: "Use invite code",
    href: "/onboarding/join",
    chips: ["6–8 character code", "Instant access"],
    accent: "rgba(68,71,72,0.75)",
  },
];

export default function TenantGateway() {
  const router = useRouter();
  const [hasOwnedTenant, setHasOwnedTenant] = useState(false);

  useEffect(() => {
    authClient.organization.list().then(({ data }) => {
      setHasOwnedTenant(Boolean(data?.some((org) => (org as { role?: string }).role === "owner")));
    });
  }, []);

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-5 sm:px-10 py-16 relative">

      {/* Large ambient glow behind heading */}
      <div
        className="absolute pointer-events-none -z-10"
        style={{
          top: "20%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 700,
          height: 400,
          background: "radial-gradient(ellipse, rgba(0,0,0,0.05) 0%, transparent 68%)",
        }}
      />

      {/* ── Heading ── */}
      <div className="text-center mb-14 animate-fade-in-up">
        {/* Step label */}
        <div className="inline-flex items-center gap-2 mb-5 px-3.5 py-1.5 rounded-full border border-outline/12 bg-surface-container-low">
          <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" />
          <span className="font-label-caps text-[10px] uppercase tracking-[0.08em] font-semibold text-on-surface-variant/60">
            Welcome to OPERO
          </span>
        </div>

        <h1
          className="font-display text-primary font-bold leading-[1.05] mb-5"
          style={{ fontSize: "clamp(32px, 5vw, 52px)", letterSpacing: "-0.03em" }}
        >
          Your journey<br />
          <span style={{ opacity: 0.3 }}>starts here.</span>
        </h1>

        <p className="font-body-md text-[15px] text-on-surface-variant max-w-sm mx-auto leading-relaxed">
          Create your own tenant or join an existing one using an invitation from your team.
        </p>
      </div>

      {/* ── Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-[800px] animate-fade-in-up delay-200">
        {choices.map((c, idx) => (
          c.id === "create" && hasOwnedTenant ? (
          <button
            key={c.id}
            id={`gateway-${c.id}`}
            type="button"
            disabled
            className="group text-left flex flex-col rounded-2xl outline-none overflow-hidden opacity-55 cursor-not-allowed"
            style={{
              border: "1px solid rgba(116,120,120,0.14)",
              boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
            }}
          >
            <div className="relative px-8 pt-8 pb-7 flex items-start gap-4 bg-[#171717]">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 relative z-10" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
                <span className="material-symbols-outlined text-white/80 text-[20px]">{c.icon}</span>
              </div>
              <div className="flex-1 relative z-10">
                <h2 className="font-h2 font-semibold leading-snug mb-1.5" style={{ fontSize: 17, color: "rgba(255,255,255,0.92)" }}>
                  Tenant already created
                </h2>
                <p className="font-body-md leading-relaxed" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
                  Each account can create one tenant. Use an invite code to join another workspace.
                </p>
              </div>
            </div>
            <div className="px-8 py-5 bg-surface-container-lowest" style={{ borderTop: "1px solid rgba(116,120,120,0.08)" }}>
              <span className="font-label-caps text-[10px] uppercase tracking-[0.06em] font-semibold text-primary/50">
                Join another tenant instead
              </span>
            </div>
          </button>
          ) : (
          <button
            key={c.id}
            id={`gateway-${c.id}`}
            type="button"
            onClick={() => router.push(c.href)}
            className="group text-left flex flex-col rounded-2xl outline-none transition-all duration-300 overflow-hidden"
            style={{
              border: "1px solid rgba(116,120,120,0.14)",
              boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.transform = "translateY(-5px)";
              el.style.boxShadow = "0 24px 56px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.07)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.transform = "";
              el.style.boxShadow = "0 2px 16px rgba(0,0,0,0.05)";
            }}
          >
            {/* Card top — dark accent area */}
            <div
              className="relative px-8 pt-8 pb-7 flex items-start gap-4"
              style={{
                background: idx === 0
                  ? "linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)"
                  : "linear-gradient(135deg, #1a1a1a 0%, #242424 100%)",
              }}
            >
              {/* Subtle top shimmer */}
              <div className="absolute top-0 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              {/* Subtle dot grid on card */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                  maskImage: "radial-gradient(ellipse 100% 100% at 50% 0%, black 30%, transparent 100%)",
                  WebkitMaskImage: "radial-gradient(ellipse 100% 100% at 50% 0%, black 30%, transparent 100%)",
                }}
              />

              {/* Icon */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 relative z-10"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <span className="material-symbols-outlined text-white/80 text-[20px]">{c.icon}</span>
              </div>

              {/* Title + description */}
              <div className="flex-1 relative z-10">
                <h2
                  className="font-h2 font-semibold leading-snug mb-1.5"
                  style={{ fontSize: 17, color: "rgba(255,255,255,0.92)" }}
                >
                  {c.label}
                </h2>
                <p
                  className="font-body-md leading-relaxed"
                  style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}
                >
                  {c.description}
                </p>
              </div>
            </div>

            {/* Card bottom — light area */}
            <div
              className="px-8 py-5 flex items-center justify-between bg-surface-container-lowest"
              style={{ borderTop: "1px solid rgba(116,120,120,0.08)" }}
            >
              {/* Chips */}
              <div className="flex flex-wrap gap-1.5">
                {c.chips.map((chip) => (
                  <span
                    key={chip}
                    className="font-label-caps text-[9px] uppercase tracking-[0.05em] font-semibold px-2 py-1 rounded-full"
                    style={{ background: "rgba(0,0,0,0.05)", color: "var(--color-on-surface-variant)" }}
                  >
                    {chip}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div className="flex items-center gap-1 font-label-caps text-[10px] uppercase tracking-[0.06em] font-semibold text-primary/50 group-hover:text-primary transition-colors duration-200 shrink-0 ml-3">
                {c.cta}
                <span className="material-symbols-outlined text-[14px] group-hover:translate-x-0.5 transition-transform duration-200">
                  arrow_forward
                </span>
              </div>
            </div>
          </button>
          )
        ))}
      </div>

      {/* Footer */}
      <p className="mt-10 font-body-sm text-[12px] text-on-surface-variant/30 text-center animate-fade-in-up delay-400">
        One account can create one tenant and join more tenants by invitation.
      </p>
    </main>
  );
}
