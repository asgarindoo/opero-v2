"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, LogOut, Users } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { getRootAppUrl } from "@/lib/tenant-url";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Pricing", href: "#pricing" },
];

export default function Header() {
  const { data: session, isPending } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const user = session?.user;
  const userName = user?.name ?? "User";
  const userInitial = userName.charAt(0).toUpperCase();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSignOut = async () => {
    window.location.assign(getRootAppUrl("/logout"));
  };

  return (
    <header
      className={`fixed top-0 w-full z-50 flex flex-col transition-all duration-300 ${scrolled
        ? "bg-background/85 backdrop-blur-xl shadow-[0_2px_20px_rgba(0,0,0,0.06)]"
        : "bg-transparent"
        }`}
    >
      <div className="max-w-container-max mx-auto px-5 sm:px-[32px] md:px-[48px] w-full flex items-center justify-between h-16 sm:h-20">
        <div className="flex items-center">
          <Link href="/" className="font-display font-bold tracking-tighter text-primary" style={{ fontSize: "clamp(20px, 2.5vw, 26px)" }}>
            OP<span className="opacity-25">E</span>RO
          </Link>
        </div>

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

        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((current) => !current)}
                className="flex items-center gap-2 rounded-full border border-outline/15 bg-surface-container-lowest/85 px-2 py-1.5 pr-3 hover:border-outline/35 hover:bg-surface-container transition-all duration-200"
              >
                <span className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center font-display font-bold text-[11px]">
                  {userInitial}
                </span>
                <span className="hidden sm:inline max-w-30 truncate font-body-sm text-[12px] font-semibold text-primary">
                  {userName}
                </span>
                <span className="material-symbols-outlined text-[14px] text-on-surface-variant/50">expand_more</span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-57.5 overflow-hidden rounded-xl border border-outline/10 bg-surface-container-lowest shadow-[0_16px_44px_rgba(0,0,0,0.12)]">
                  <div className="border-b border-outline/10 px-4 py-3">
                    <p className="font-body-sm text-[13px] font-semibold text-primary truncate">{userName}</p>
                    <p className="font-body-sm text-[11px] text-on-surface-variant/60 truncate">{user.email}</p>
                  </div>
                  <div className="p-1.5">
                    <HeaderMenuLink href="/tenants" icon={LayoutDashboard} label="My tenants" onClick={() => setProfileOpen(false)} />
                    <HeaderMenuLink href="/onboarding" icon={Users} label="Tenant options" onClick={() => setProfileOpen(false)} />

                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left font-body-sm text-[13px] text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={14} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <a
                href="/login"
                className="text-on-surface-variant hover:text-primary font-label-caps text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold px-3 sm:px-4 py-2 sm:py-2.5 rounded-full border border-outline/15 hover:border-outline/40 hover:bg-surface-container transition-all duration-200"
              >
                Login
              </a>
              <a
                href="/register"
                className="bg-primary text-on-primary font-label-caps text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold px-4 sm:px-6 py-2 sm:py-2.5 rounded-full flex items-center gap-1.5 hover:bg-primary/90 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-px"
              >
                Start Free
                <span className="material-symbols-outlined text-[13px] hidden sm:inline">arrow_forward</span>
              </a>
            </>
          )}

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

      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <div className="mx-4 mb-3 bg-surface-container-lowest border border-outline/10 rounded-[1.25rem] shadow-lg overflow-hidden">
          <nav className="flex flex-col p-2">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between text-on-surface-variant hover:text-primary font-label-caps text-[11px] uppercase tracking-wider font-semibold px-4 py-3.5 rounded-xl hover:bg-surface-container transition-all duration-200"
              >
                {item.label}
                <span className="material-symbols-outlined text-[14px] opacity-30">chevron_right</span>
              </a>
            ))}
            {user && !isPending && (
              <>
                <div className="my-1 h-px bg-outline/10" />
                <MobileMenuLink href="/tenants" label="My tenants" onClick={() => setMenuOpen(false)} />
                <MobileMenuLink href="/onboarding/join" label="Join tenant" onClick={() => setMenuOpen(false)} />
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

function HeaderMenuLink({
  href,
  icon: Icon,
  label,
  onClick,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg px-3 py-2.5 font-body-sm text-[13px] text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors"
    >
      <Icon size={14} />
      {label}
    </Link>
  );
}

function MobileMenuLink({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center justify-between text-on-surface-variant hover:text-primary font-label-caps text-[11px] uppercase tracking-wider font-semibold px-4 py-3.5 rounded-xl hover:bg-surface-container transition-all duration-200"
    >
      {label}
      <span className="material-symbols-outlined text-[14px] opacity-30">chevron_right</span>
    </Link>
  );
}
