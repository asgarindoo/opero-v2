export default function CTASection() {
  return (
    <section className="max-w-[1440px] mx-auto px-[20px] sm:px-[32px] md:px-[48px] py-[64px] sm:py-[80px] md:py-[96px] relative text-center overflow-hidden">
      {/* Background tint */}
      <div className="absolute inset-0 bg-primary/5 rounded-[1.25rem] sm:rounded-[1.5rem] md:rounded-[1.75rem] mx-[20px] sm:mx-[32px] md:mx-[48px] mb-[20px] sm:mb-[32px] md:mb-[48px]" />

      {/* Decorative icons — always visible, scaled for mobile */}
      <div className="absolute left-4 sm:left-8 md:left-10 bottom-4 sm:bottom-8 md:bottom-10 text-primary/10 rotate-[-20deg]">
        <span className="material-symbols-outlined" style={{ fontSize: "clamp(48px, 8vw, 100px)" }}>
          auto_awesome
        </span>
      </div>
      <div className="absolute right-4 sm:right-8 md:right-10 top-4 sm:top-8 md:top-10 text-primary/10 rotate-[15deg]">
        <span className="material-symbols-outlined" style={{ fontSize: "clamp(40px, 6vw, 80px)" }}>
          gesture
        </span>
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 sm:px-8">
        <h2 className="font-display text-[28px] sm:text-[38px] md:text-[48px] text-primary mb-[10px] sm:mb-[12px] tracking-[-0.02em] font-bold">
          Ready to structure your business?
        </h2>
        <p className="font-accent-note text-[15px] sm:text-[19px] md:text-[24px] text-on-surface-variant mb-[28px] sm:mb-[36px] md:mb-[48px] max-w-lg mx-auto opacity-80">
          Join hundreds of SMBs moving away from fragmented tools to a unified
          work system.
        </p>
        <a
          href="#signup"
          className="inline-block bg-primary text-on-primary font-label-caps text-[11px] uppercase tracking-[0.05em] font-semibold px-8 sm:px-10 md:px-12 py-3.5 sm:py-4 rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.15)] hover:shadow-[0_15px_35px_rgba(0,0,0,0.2)] hover:-translate-y-1 transition-all duration-300"
        >
          Start for Free
        </a>
      </div>
    </section>
  );
}
