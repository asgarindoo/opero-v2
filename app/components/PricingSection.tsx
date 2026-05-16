import FadeIn from "./FadeIn";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For solo founders trying out the system.",
    highlighted: false,
    features: [
      { text: "1 user", included: true },
      { text: "Work management (create, assign, track)", included: true },
      { text: "Custom flow / status", included: true },
      { text: "1 bot (WA or Telegram)", included: true },
      { text: "Activity log", included: true },
      { text: "Invite team members", included: false },
      { text: "Team chat & work discussion", included: false },
      { text: "Automation hub", included: false },
    ],
    cta: "Get Started Free",
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "For teams that need full collaboration and automation.",
    highlighted: true,
    features: [
      { text: "Multi-user (invite team)", included: true },
      { text: "Work management + task breakdown", included: true },
      { text: "Custom flow / status", included: true },
      { text: "Multiple bots (WA + Telegram)", included: true },
      { text: "Team chat & work discussion", included: true },
      { text: "Mention & notifications", included: true },
      { text: "Automation hub (bot → Work)", included: true },
      { text: "Full activity timeline", included: true },
    ],
    cta: "Start Pro Trial",
  },
  {
    name: "Ultra",
    price: "$99",
    period: "per month",
    description: "For scaling businesses that need unlimited everything.",
    highlighted: false,
    features: [
      { text: "Unlimited users", included: true },
      { text: "Owner / Admin / Staff roles", included: true },
      { text: "Advanced automation & auto-reply", included: true },
      { text: "Multiple bot channels", included: true },
      { text: "Priority usage & support", included: true },
      { text: "Advanced analytics", included: true },
      { text: "Custom workflows & rule builder", included: true },
      { text: "Data isolated per tenant", included: true },
    ],
    cta: "Contact Sales",
  },
];

export default function PricingSection() {
  return (
    <section
      id="pricing"
      className="max-w-[1440px] mx-auto px-[20px] sm:px-[32px] md:px-[48px] py-[64px] sm:py-[80px] md:py-[96px] relative"
    >
      {/* Section header */}
      <FadeIn className="text-center mb-[36px] sm:mb-[48px] md:mb-[64px]">
        <div className="inline-flex items-center gap-2 bg-surface-container border border-outline/10 rounded-full px-4 py-1.5 mb-4">
          <span className="material-symbols-outlined text-primary text-[14px]">payments</span>
          <span className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-[0.05em] font-semibold">
            Pricing
          </span>
        </div>
        <h2 className="font-display text-[26px] sm:text-[32px] md:text-[40px] text-primary mb-3 tracking-[-0.02em] font-bold">
          Start free, scale as you grow
        </h2>
        <p className="font-body-lg text-[16px] text-on-surface-variant max-w-xl mx-auto opacity-80">
          Pick the plan that fits your team today — upgrade anytime.
        </p>
      </FadeIn>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6 items-stretch relative z-10">
        {plans.map((plan) => (
          <FadeIn key={plan.name} animation="scale-in">
            <div className={`relative rounded-[1.5rem] lg:rounded-[2rem] flex flex-col h-full transition-all duration-500 ease-out ${
                plan.highlighted
                  ? "bg-[#0f0f0f] text-white shadow-[0_32px_64px_rgba(0,0,0,0.2)] lg:-translate-y-4 hover:shadow-[0_48px_96px_rgba(0,0,0,0.3)] hover:lg:-translate-y-6"
                  : "bg-surface border border-outline/10 shadow-sm hover:shadow-2xl hover:-translate-y-2"
              }`}>

              {/* Most Popular badge */}
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-white text-[#0f0f0f] font-label-caps text-[10px] px-4 py-1.5 rounded-full whitespace-nowrap uppercase tracking-[0.08em] font-bold shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="p-6 sm:p-7 lg:p-8 flex flex-col flex-1">
                {/* Plan header */}
                <div className="mb-6">
                  <span className={`font-label-caps text-[10px] uppercase tracking-[0.1em] font-bold ${plan.highlighted ? "text-white/50" : "text-on-surface-variant"
                    }`}>
                    {plan.name}
                  </span>

                  <div className="flex items-end gap-1.5 mt-2 mb-3">
                    <span className={`font-display text-[40px] sm:text-[48px] lg:text-[52px] leading-none font-bold tracking-tight ${plan.highlighted ? "text-white" : "text-primary"}`}>
                      {plan.price}
                    </span>
                    <span className={`font-body-sm text-[13px] mb-2 ${plan.highlighted ? "text-white/40" : "text-on-surface-variant"
                      }`}>
                      /{plan.period}
                    </span>
                  </div>

                  <p className={`font-body-sm text-[13px] leading-relaxed ${plan.highlighted ? "text-white/60" : "text-on-surface-variant"
                    }`}>
                    {plan.description}
                  </p>
                </div>

                {/* Divider */}
                <div className={`w-full h-px mb-6 ${plan.highlighted ? "bg-white/10" : "bg-outline/8"}`} />

                {/* Feature list */}
                <ul className="flex flex-col gap-3 flex-1 mb-8">
                  {plan.features.map((f) => (
                    <li key={f.text} className={`flex items-center gap-3 font-body-sm text-[13px] ${f.included
                        ? plan.highlighted ? "text-white/80" : "text-on-surface"
                        : plan.highlighted ? "text-white/20" : "text-on-surface-variant/30"
                      }`}>
                      <span className={`material-symbols-outlined text-[16px] shrink-0 ${f.included
                          ? plan.highlighted ? "text-white/60" : "text-primary"
                          : plan.highlighted ? "text-white/15" : "text-outline/30"
                        }`}>
                        {f.included ? "check" : "remove"}
                      </span>
                      {f.text}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button className={`w-full cursor-pointer font-label-caps text-[11px] uppercase tracking-[0.06em] font-semibold py-3.5 rounded-xl transition-all duration-200 active:scale-[0.97] hover:-translate-y-0.5 ${plan.highlighted
                    ? "bg-white text-[#0f0f0f] hover:bg-white/90 shadow-md hover:shadow-lg"
                    : "border border-outline/20 text-primary hover:bg-surface-container hover:border-outline/40 hover:shadow-sm"
                  }`}>
                  {plan.cta}
                </button>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>

      {/* Bottom note */}
      <FadeIn delay="delay-400" className="text-center mt-10">
        <p className="font-body-sm text-[13px] text-on-surface-variant/60">
          No credit card required · Cancel anytime · 14-day Pro trial
        </p>
      </FadeIn>
    </section>
  );
}
