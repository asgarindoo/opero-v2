export default function HeroSection() {
  return (
    <section className="max-w-[1440px] mx-auto px-[20px] sm:px-[32px] md:px-[48px] py-[48px] sm:py-[72px] md:py-[96px] flex flex-col items-center text-center relative">
      {/* ── Decorative: dot-grid pattern ── */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none opacity-40"
        style={{
          backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          color: "var(--color-outline)",
          maskImage: "radial-gradient(ellipse 85% 75% at 50% 35%, black 20%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 85% 75% at 50% 35%, black 20%, transparent 100%)",
        }}
      />

      {/* ── Decorative: dot cluster — bottom-LEFT ── */}
      <div className="absolute bottom-[14%] left-[1.5%] -z-10 pointer-events-none grid grid-cols-4 gap-[8px]">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="w-[4px] h-[4px] sm:w-[5px] sm:h-[5px] rounded-full bg-primary"
            style={{ opacity: 0.12 + (i % 4) * 0.07 }} />
        ))}
      </div>

      {/* ── Decorative: dot cluster — bottom-RIGHT ── */}
      <div className="absolute bottom-[14%] right-[1.5%] -z-10 pointer-events-none grid grid-cols-4 gap-[8px]">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="w-[4px] h-[4px] sm:w-[5px] sm:h-[5px] rounded-full bg-primary"
            style={{ opacity: 0.12 + ((3 - i % 4)) * 0.07 }} />
        ))}
      </div>

      {/* Headline */}
      <h1 className="font-display text-[32px] sm:text-[44px] md:text-[56px] leading-[1.1] tracking-[-0.02em] text-primary max-w-4xl mt-8 sm:mt-12 md:mt-18 mb-[14px] sm:mb-[20px] md:mb-[24px] relative z-10 font-bold">
        One System for All Your Business Operations
      </h1>

      {/* Subtitle */}
      <p className="font-accent-note text-[15px] sm:text-[18px] md:text-[20px] text-on-surface-variant max-w-2xl mb-[28px] sm:mb-[40px] md:mb-[48px] relative z-10 opacity-80">
        Manage your entire business ecosystem through a clean, centralized, and intelligent platform
      </p>

      {/* CTA Buttons */}
      <div className="flex gap-[10px] sm:gap-[12px] mb-[56px] sm:mb-[80px] md:mb-[100px] relative z-10 items-center flex-wrap justify-center">
        <a
          href="#get-started"
          className="bg-primary text-on-primary font-label-caps text-[11px] uppercase tracking-[0.05em] font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_15px_30px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300"
        >
          Get Started
        </a>
        <a
          href="#demo"
          className="border border-outline/20 bg-surface-container-lowest text-primary font-label-caps text-[11px] uppercase tracking-[0.05em] font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-full hover:bg-surface-container-low hover:border-outline/40 shadow-sm transition-all duration-300"
        >
          Watch a Demo
        </a>
      </div>

      {/* ── Hero UI Visual ──
           aspect-video = 16:9 → dashboard ALWAYS landscape rectangle at every screen size.
           overflow:visible lets floating cards extend outside the box.
      */}
      <div className="w-full max-w-6xl relative z-10 mb-12 sm:mb-14 md:mb-12">
        <div className="w-full aspect-video relative" style={{ overflow: "visible" }}>

          {/* Dashboard Frame — inset-2 mobile keeps it nearly full area, sm/md slightly inset */}
          <div className="absolute inset-2 sm:inset-4 md:inset-6 border border-outline/10 rounded-[1rem] sm:rounded-[1.25rem] md:rounded-[1.5rem] bg-surface-container-lowest overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.06)] flex flex-col">
            <div className="flex-1 relative bg-surface-container-lowest">
              <img
                alt="Dashboard preview"
                className="w-full h-full object-cover opacity-60 mix-blend-luminosity"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAskyM5VQ5Vq3sUuXB3597VVKYVQKTOlXSqW6ZicFQbIuvPHnL3tosAI6MYdPw--2vZcWRs-s_M74-GMogVlp4RV6ozuYvCkPs5IzWsM2RkqEcKFxpmh8923lNvQACeZSFMQggcUUPXWVt9mizLuKzKbNd8fpLr3zEW_AKlWWtliwkGTyUY9POwPwoub9hvixKrZKNNwVI03sXFZ-djFqDj9A17Rm1K7S-MoBxvBbnbJLDE2M-w6EuHzxe4GrIieDVHpg-s-aJlOUg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent" />
            </div>
          </div>

          {/* ── Floating Card: Activity/Task (top-left) ── */}
          <div className="absolute top-[-10px] left-[-8px] sm:-left-[40px] md:-left-[48px] lg:-left-[80px] w-[160px] md:w-[220px] lg:w-[300px] bg-surface-container-lowest border border-outline/10 rounded-[1rem] md:rounded-[1.25rem] lg:rounded-[1.75rem] p-3 md:p-4 lg:p-6 shadow-[0_20px_48px_rgba(0,0,0,0.18)] z-20 animate-float">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-lg md:rounded-xl lg:rounded-2xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-[16px] md:text-[20px] lg:text-[24px]">check_circle</span>
              </div>
              <div>
                <div className="font-h3 text-primary text-[12px] md:text-[14px] lg:text-[16px] leading-tight mb-0.5 font-semibold">New Workflow</div>
                <div className="font-body-sm text-[10px] md:text-[11px] lg:text-[12px] text-on-surface-variant">Assigned to team</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-1.5 md:h-2 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary w-3/4 rounded-full" />
              </div>
              <div className="flex justify-between text-[10px] md:text-[11px] font-label-caps text-on-surface-variant uppercase tracking-[0.05em] font-semibold">
                <span>Progress</span><span>75%</span>
              </div>
            </div>
          </div>

          {/* ── Floating Card: Efficiency Stats (right-middle) ── */}
          <div className="absolute top-[20%] right-[-8px] sm:-right-[40px] md:-right-[48px] lg:-right-[80px] w-[150px] md:w-[210px] lg:w-[320px] bg-surface-container-lowest border border-outline/10 rounded-[1rem] md:rounded-[1.5rem] lg:rounded-[2rem] p-3 md:p-4 lg:p-8 shadow-[0_20px_48px_rgba(0,0,0,0.18)] z-30 animate-float-delayed">
            <div className="flex justify-between items-start mb-2.5 md:mb-3 lg:mb-4">
              <div>
                <div className="font-label-caps text-[9px] md:text-[10px] lg:text-[11px] text-on-surface-variant uppercase tracking-[0.05em] font-semibold mb-1 lg:mb-2">Efficiency</div>
                <div className="font-display text-[22px] md:text-[28px] lg:text-[40px] text-primary leading-none font-bold">
                  94<span className="text-[13px] md:text-[16px] lg:text-2xl text-on-surface-variant">%</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-[15px] md:text-[18px] lg:text-[24px] text-primary bg-primary/5 p-1 md:p-1.5 lg:p-2 rounded-lg lg:rounded-xl">trending_up</span>
            </div>
            <div className="flex items-end gap-1 md:gap-1.5 lg:gap-2 h-10 md:h-14 lg:h-20 w-full">
              <div className="flex-1 bg-primary/10 rounded-t h-[30%]" />
              <div className="flex-1 bg-primary/20 rounded-t h-[45%]" />
              <div className="flex-1 bg-primary/40 rounded-t h-[60%]" />
              <div className="flex-1 bg-primary/60 rounded-t h-[80%]" />
              <div className="flex-1 bg-primary rounded-t h-[100%] relative">
                <div className="absolute -top-1.5 md:-top-2 lg:-top-3 left-1/2 -translate-x-1/2 w-1.5 h-1.5 md:w-2 md:h-2 bg-surface-container-lowest rounded-full" />
              </div>
            </div>
          </div>

          {/* ── Floating Card: Team Sync (bottom-center) ── */}
          <div className="absolute bottom-[-14px] left-[6%] sm:left-[10%] md:left-[14%] lg:left-[20%] w-[190px] md:w-[250px] lg:w-[360px] bg-surface-container-lowest border border-outline/10 rounded-[1rem] md:rounded-[1.25rem] lg:rounded-[1.75rem] p-2.5 md:p-3.5 lg:p-6 shadow-[0_20px_48px_rgba(0,0,0,0.18)] z-40 animate-float-slow">
            <div className="flex justify-between items-center mb-2.5 md:mb-3 lg:mb-5 pb-2 md:pb-3 lg:pb-4 border-b border-outline/5">
              <div className="flex items-center gap-1 md:gap-1.5 lg:gap-2">
                <span className="material-symbols-outlined text-primary text-[13px] md:text-[16px] lg:text-[20px]">calendar_month</span>
                <span className="font-h3 text-primary text-[10px] md:text-[12px] lg:text-[15px] font-semibold">Team Sync</span>
              </div>
              <span className="bg-surface-container-high text-primary font-label-caps text-[8px] md:text-[9px] lg:text-[10px] px-1.5 md:px-2 lg:px-3 py-1 lg:py-1.5 rounded-full uppercase tracking-[0.05em] font-semibold">
                10:00 AM
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex -space-x-1.5 md:-space-x-2 lg:-space-x-3">
                <div className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 rounded-full bg-surface-container-high border-2 border-surface-container-lowest flex items-center justify-center text-[8px] md:text-[9px] lg:text-xs font-semibold text-primary">JD</div>
                <div className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 rounded-full bg-surface-variant border-2 border-surface-container-lowest flex items-center justify-center text-[8px] md:text-[9px] lg:text-xs font-semibold text-primary">AS</div>
                <div className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 rounded-full bg-outline/10 border-2 border-surface-container-lowest flex items-center justify-center text-[8px] md:text-[9px] lg:text-xs font-semibold text-primary">+3</div>
              </div>
              <button className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 rounded-full border border-outline/20 flex items-center justify-center text-primary hover:bg-surface-container active:scale-95 transition-all duration-200">
                <span className="material-symbols-outlined text-[12px] md:text-[14px] lg:text-[18px]">add</span>
              </button>
            </div>
          </div>

        </div>{/* end aspect-video */}
      </div>
    </section>
  );
}
