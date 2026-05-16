"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const navLinks = [
  { label: "Features",     href: "#features" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Pricing",      href: "#pricing" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 flex flex-col transition-all duration-300 ${
        scrolled
          ? "bg-background/85 backdrop-blur-xl shadow-[0_2px_20px_rgba(0,0,0,0.06)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-[20px] sm:px-[32px] md:px-[48px] w-full flex items-center justify-between h-16 sm:h-20">

        {/* ── Logo ── */}
        <div className="flex items-center">
          <Link href="/" className="font-display font-bold tracking-[-0.05em] text-primary" style={{ fontSize: "clamp(20px, 2.5vw, 26px)" }}>
            OP<span className="opacity-25">E</span>RO
          </Link>
        </div>

        {/* ── Nav — desktop (pill) ── */}
        <nav className="hidden md:flex items-center gap-[4px] bg-surface-container/60 border border-outline/8 px-2 py-1.5 rounded-full backdrop-blur-sm">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-on-surface-variant hover:text-primary font-label-caps text-[11px] uppercase tracking-[0.06em] font-semibold px-4 py-2 rounded-full hover:bg-surface-container-low transition-all duration-200"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* ── Actions — Login + Start Free (always visible, side by side) ── */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="/login"
            className="text-on-surface-variant hover:text-primary font-label-caps text-[10px] sm:text-[11px] uppercase tracking-[0.05em] font-semibold px-3 sm:px-4 py-2 sm:py-2.5 rounded-full border border-outline/15 hover:border-outline/40 hover:bg-surface-container transition-all duration-200"
          >
            Login
          </a>
          <a
            href="/register"
            className="bg-primary text-on-primary font-label-caps text-[10px] sm:text-[11px] uppercase tracking-[0.05em] font-semibold px-4 sm:px-6 py-2 sm:py-2.5 rounded-full flex items-center gap-1.5 hover:bg-primary/90 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-px"
          >
            Start Free
            <span className="material-symbols-outlined text-[13px] hidden sm:inline">arrow_forward</span>
          </a>

          {/* Hamburger — mobile nav links only */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            className="md:hidden w-9 h-9 rounded-full border border-outline/15 bg-surface-container-lowest/80 flex items-center justify-center text-primary hover:bg-surface-container active:scale-95 transition-all duration-200"
          >
            <span className="material-symbols-outlined text-[18px]">
              {menuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* ── Mobile nav dropdown ── */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mx-4 mb-3 bg-surface-container-lowest border border-outline/10 rounded-[1.25rem] shadow-lg overflow-hidden">
          <nav className="flex flex-col p-2">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between text-on-surface-variant hover:text-primary font-label-caps text-[11px] uppercase tracking-[0.05em] font-semibold px-4 py-3.5 rounded-xl hover:bg-surface-container transition-all duration-200"
              >
                {item.label}
                <span className="material-symbols-outlined text-[14px] opacity-30">chevron_right</span>
              </a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
