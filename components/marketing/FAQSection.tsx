"use client";

import { useState } from "react";
import FadeIn from "./FadeIn";

const faqs = [
  {
    q: "What exactly is a 'Work' in OPERO?",
    a: "A Work is the core unit of the system — it can represent anything: a client order, a project, a service request, or a daily task. Everything your business does gets organized as a Work, so nothing gets lost or forgotten.",
  },
  {
    q: "How does the WhatsApp and Telegram bot work?",
    a: "You create a bot inside OPERO and connect it to your WhatsApp or Telegram number. When a client messages your bot, the system captures it and can automatically convert it into a Work item — ready for your team to pick up.",
  },
  {
    q: "Can I customize the status flow for my business?",
    a: "Yes. OPERO lets you define your own flow — for example: Pending → In Progress → Done, or Open → Handling → Resolved. Every business works differently, and the flow adapts to yours.",
  },
  {
    q: "Is OPERO only for large teams?",
    a: "Not at all. OPERO is built specifically for SMBs, agencies, and service businesses. You can start solo on the Free plan and scale up as your team grows.",
  },
  {
    q: "What's the difference between Team Chat and Work Discussion?",
    a: "Team Chat is a global space for general communication. Work Discussion is contextual — it lives inside a specific Work, so every conversation stays attached to the relevant task. No more digging through old messages to find context.",
  },
  {
    q: "Is my data safe and isolated from other businesses?",
    a: "Yes. Every account operates on its own tenant — your data is fully isolated and never shared with other organizations on the platform.",
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="max-w-[1440px] mx-auto px-[20px] sm:px-[32px] md:px-[48px] py-[64px] sm:py-[80px] md:py-[96px] relative">

      <div className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-16 items-start">

        {/* Left — sticky header */}
        <FadeIn className="md:col-span-2 md:sticky md:top-32">
          <div className="inline-flex items-center gap-2 bg-surface-container border border-outline/10 rounded-full px-4 py-1.5 mb-5">
            <span className="material-symbols-outlined text-primary text-[14px]">help</span>
            <span className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-[0.05em] font-semibold">FAQ</span>
          </div>

          <h2 className="font-display text-[28px] sm:text-[34px] md:text-[40px] text-primary font-bold tracking-tight leading-[1.1] mb-4">
            Questions we get<br />a lot.
          </h2>
          <p className="font-body-lg text-[14px] sm:text-[15px] text-on-surface-variant leading-relaxed mb-8">
            Still unclear on something? Reach out and we'll get back to you within a day.
          </p>

          <a
            href="mailto:hello@opero.app"
            className="inline-flex items-center gap-2 font-label-caps text-[11px] uppercase tracking-wider font-semibold text-primary border border-outline/20 rounded-full px-5 py-2.5 hover:bg-surface-container transition-all duration-200 active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">mail</span>
            Ask a question
          </a>

          {/* Decorative "FAQ" text — scaled down on mobile, always visible */}
          <div className="mt-10 md:mt-16 font-display text-[64px] sm:text-[90px] md:text-[120px] font-bold text-primary/[0.04] leading-none select-none">
            FAQ
          </div>
        </FadeIn>

        {/* Right — accordion */}
        <FadeIn animation="scale-in" className="md:col-span-3 flex flex-col divide-y divide-outline/8">
          {faqs.map((faq, i) => (
            <div key={i} className="group">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-start justify-between gap-4 py-5 sm:py-6 text-left"
              >
                <span className={`font-display text-[15px] sm:text-[17px] md:text-[18px] font-semibold leading-snug transition-colors duration-200 ${
                  open === i ? "text-primary" : "text-on-surface group-hover:text-primary"
                }`}>
                  {faq.q}
                </span>
                <span className={`material-symbols-outlined text-[18px] sm:text-[20px] shrink-0 mt-0.5 transition-all duration-300 ${
                  open === i ? "text-primary rotate-45" : "text-on-surface-variant rotate-0"
                }`}>
                  add
                </span>
              </button>

              <div className={`overflow-hidden transition-all duration-300 ease-out ${
                open === i ? "max-h-96 pb-5 sm:pb-6" : "max-h-0"
              }`}>
                <p className="font-body-lg text-[13px] sm:text-[15px] text-on-surface-variant leading-relaxed">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </FadeIn>

      </div>
    </section>
  );
}
