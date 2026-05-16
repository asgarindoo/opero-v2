import Link from "next/link";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col relative">

      {/* ── Background: dot-grid (same as landing & login) ── */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none opacity-35"
        style={{
          backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          color: "var(--color-outline)",
        }}
      />

      {/* ── Background: soft glow blobs for depth ── */}
      <div className="ob-glow-tl" />
      <div className="ob-glow-br" />

      {/* ── Background: corner dot clusters ── */}
      <div className="fixed top-[72px] left-5 pointer-events-none -z-10 grid grid-cols-4 gap-[7px] opacity-30">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="w-[3px] h-[3px] rounded-full bg-primary"
            style={{ opacity: 0.15 + (i % 4) * 0.08 }} />
        ))}
      </div>
      <div className="fixed bottom-12 right-5 pointer-events-none -z-10 grid grid-cols-4 gap-[7px] opacity-25">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="w-[3px] h-[3px] rounded-full bg-primary"
            style={{ opacity: 0.15 + ((3 - i % 4)) * 0.08 }} />
        ))}
      </div>

      {/* ── Topbar ── */}
      <header
        className="flex items-center justify-between px-6 sm:px-10 h-16 sm:h-[72px] shrink-0 sticky top-0 z-40"
        style={{
          background: "rgba(253,248,248,0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(116,120,120,0.08)",
        }}
      >
        {/* Wordmark */}
        <Link
          href="/"
          className="font-display font-bold tracking-[-0.05em] text-primary select-none"
          style={{ fontSize: "clamp(20px, 2.5vw, 24px)" }}
        >
          OP<span className="opacity-20">E</span>RO
        </Link>

        {/* Back to home */}
        <Link
          href="/"
          className="flex items-center gap-1.5 font-label-caps text-[10px] uppercase tracking-[0.06em] font-semibold text-on-surface-variant/55 hover:text-primary transition-colors duration-200"
        >
          <span className="material-symbols-outlined text-[13px]">arrow_back</span>
          Back to home
        </Link>
      </header>

      {/* ── Page content ── */}
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}
