import FadeIn from "./FadeIn";
import StatCounter from "./StatCounter";

const testimonials = [
  {
    quote:
      '"OPERO transformed our chaotic Slack channels into structured workflows. We finally have visibility into what everyone is doing without micromanaging."',
    name: "Sarah Jenkins",
    role: "Head of Operations, TechFlow",
    initials: "SJ",
  },
  {
    quote:
      '"The best decision we made for our ops team. The ability to treat every request as an organized unit of work has doubled our efficiency."',
    name: "Marcus Chen",
    role: "Founder, BuildRight",
    initials: "MC",
  },
];


export default function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="max-w-[1440px] mx-auto px-[20px] sm:px-[32px] md:px-[48px] py-[64px] sm:py-[80px] md:py-[96px] relative"
    >
      {/* Background accents */}
      <div className="absolute left-0 top-1/2 w-24 h-24 sm:w-32 sm:h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute right-0 top-1/4 w-28 h-28 sm:w-40 sm:h-40 bg-primary/5 rounded-full blur-3xl" />

      {/* Section header */}
      <div className="text-center mb-[36px] sm:mb-[48px]">
        {/* Label chip */}
        <div className="inline-flex items-center gap-2 bg-surface-container border border-outline/10 rounded-full px-4 py-1.5 mb-4 relative z-10">
          <span className="material-symbols-outlined text-primary text-[14px]">format_quote</span>
          <span className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-[0.05em] font-semibold">
            Testimonials
          </span>
        </div>

        <h2 className="font-display text-[26px] sm:text-[32px] text-primary mb-3 tracking-[-0.02em] relative z-10 font-bold">
          Trusted by teams who mean business
        </h2>
        <p className="font-body-lg text-[14px] sm:text-[16px] text-on-surface-variant max-w-xl mx-auto opacity-80 relative z-10">
          Real results from operations teams that replaced scattered tools with one unified work system.
        </p>
      </div>

      {/* Testimonial Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[18px] sm:gap-[24px] relative z-10 mb-4">
        {testimonials.map((t) => (
          <div
            key={t.name}
            className="relative border border-outline/10 rounded-[1.5rem] pt-8 pb-8 pl-8 pr-10 sm:pt-10 sm:pb-10 sm:pl-10 sm:pr-16 bg-surface-container-lowest shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between min-h-[300px] sm:min-h-[360px] overflow-hidden"
          >
            {/* Subtle background glow */}
            <div className="absolute -right-16 -top-16 w-40 h-40 sm:w-56 sm:h-56 bg-primary/[0.03] rounded-full blur-[40px] pointer-events-none group-hover:bg-primary/[0.06] transition-colors duration-700" />

            {/* ── Decorative: large quote mark bottom-right ── */}
            <div
              className="absolute bottom-[-160] md:bottom-[-260] lg:bottom-[-320] right-0 pointer-events-none select-none z-0 leading-none text-primary/[0.07] group-hover:text-primary/[0.13] transition-colors duration-500"
              aria-hidden="true"
              style={{
                fontSize: "clamp(300px, 55vw, 600px)",
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontWeight: 700,
                lineHeight: 0.85,
              }}
            >
              &rdquo;
            </div>

            {/* Quote */}
            <p className="font-display text-[20px] sm:text-[28px] text-primary/40 group-hover:text-primary leading-tight tracking-[-0.01em] relative z-10 mb-8 flex-1 font-bold transition-colors duration-300">
              {t.quote}
            </p>

            {/* Author */}
            <div className="flex items-center gap-4 relative z-10 pt-5">
              <div className="absolute top-0 left-0 w-1/2 h-px bg-outline/15" />
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-surface-container-high flex items-center justify-center font-semibold text-primary text-[13px] sm:text-[14px] shrink-0">
                {t.initials}
              </div>
              <div>
                <div className="font-h3 text-[14px] sm:text-[15px] text-primary font-semibold leading-tight">
                  {t.name}
                </div>
                <div className="font-body-sm text-[11px] sm:text-[12px] text-on-surface-variant mt-0.5">
                  {t.role}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Social proof line */}
      <div className="relative z-10 mb-8">
        <p className="font-body-lg text-[14px] sm:text-[16px] text-on-surface-variant/70">
          Trusted by 1,000+ tenants — from solo founders to global product teams.
        </p>
      </div>

      {/* Stats row */}
      <div className="relative z-10 pt-[32px] sm:pt-[48px] mt-8 border-t border-outline/10 max-w-6xl mx-auto">
        <StatCounter />
      </div>
    </section>
  );
}
