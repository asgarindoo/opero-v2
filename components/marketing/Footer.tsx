const resources = ["Documentation", "Components", "Pricing", "Changelog"];
const legal = ["Privacy Policy", "Terms of Use", "Security"];

const socials = [
  { icon: "language",       label: "Website" },
  { icon: "alternate_email", label: "Contact" },
  { icon: "code",           label: "GitHub" },
];

export default function Footer() {
  return (
    <footer className="w-full bg-[#0f0f0f] rounded-t-[2rem] sm:rounded-t-[3rem] relative overflow-hidden">
      {/* Subtle top gradient line */}
      <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="max-w-[1440px] mx-auto px-[20px] sm:px-[32px] md:px-[48px] pt-[48px] sm:pt-[56px] md:pt-[72px] pb-[32px] sm:pb-[40px]">

        {/* ── Main grid: brand + links ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10 mb-[48px] sm:mb-[56px]">

          {/* Brand column */}
          <div className="col-span-2 md:col-span-2 pr-0 md:pr-16">
            {/* Wordmark */}
            <div className="mb-4">
              <span
                className="font-display font-bold tracking-[-0.05em] text-white"
                style={{ fontSize: "clamp(28px, 4vw, 40px)", letterSpacing: "-0.05em" }}
              >
                <span className="text-white">OP</span><span className="text-white/30">E</span><span className="text-white">RO</span>
              </span>
            </div>

            <p className="font-body-sm text-[13px] sm:text-[14px] text-white/40 leading-relaxed mb-6 max-w-xs">
              One unified system for all your business operations — structured, intelligent, and built for teams that mean it.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-2 mb-4">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all duration-200"
                >
                  <span className="material-symbols-outlined text-[16px]">{s.icon}</span>
                </a>
              ))}
            </div>

            <p className="font-body-sm text-[12px] text-white/20">
              © 2024 OPERO. All rights reserved.
            </p>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-label-caps text-[10px] text-white/30 uppercase tracking-[0.1em] font-bold mb-5">
              Resources
            </h4>
            <ul className="flex flex-col gap-3">
              {resources.map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="font-body-sm text-[13px] text-white/40 hover:text-white transition-colors duration-200"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-label-caps text-[10px] text-white/30 uppercase tracking-[0.1em] font-bold mb-5">
              Legal
            </h4>
            <ul className="flex flex-col gap-3">
              {legal.map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="font-body-sm text-[13px] text-white/40 hover:text-white transition-colors duration-200"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="pt-6 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-body-sm text-[12px] text-white/20">
            Architectural precision for business workflows.
          </p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse" />
            <span className="font-label-caps text-[10px] text-white/20 uppercase tracking-[0.06em] font-semibold">
              All systems operational
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
