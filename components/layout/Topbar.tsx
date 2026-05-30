"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession, useActiveOrganization, useListOrganizations } from "@/lib/auth-client";
import { usePathname, useRouter } from "next/navigation";
import { NAV_GROUPS } from "./navConfig";
import { getRootAppUrl } from "@/lib/tenant-url";
import { markPresenceOffline } from "@/features/presence";

/* ─── Command palette items (searchable) ─── */
interface CommandItem {
  icon: string;
  label: string;
  sublabel?: string;
  href: string;
  category: string;
}

function buildCommandItems(): CommandItem[] {
  return NAV_GROUPS.flatMap((g) =>
    g.items.map((item) => ({
      icon: item.materialIcon,
      label: item.label,
      sublabel: g.label ?? "Main",
      href: item.href,
      category: g.label ?? "Main",
    }))
  );
}

interface Props {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onMobileMenuOpen: () => void;
}

export default function Topbar({ collapsed, onToggleCollapse, onMobileMenuOpen }: Props) {
  const { data: session } = useSession();
  const { data: activeOrg } = useActiveOrganization();
  const { data: orgs } = useListOrganizations();
  const pathname = usePathname();
  const router = useRouter();

  const tenantName = activeOrg?.name ?? "Workspace";
  const userName = session?.user?.name ?? "User";
  const userImage = session?.user?.image ?? null;
  const userInitial = userName.charAt(0).toUpperCase();

  // Check if user belongs to more than one tenant to show selection link
  const hasMultipleOrgs = (orgs ?? []).length > 1;

  /* ── Dynamic breadcrumb ── */
  const currentPage = (() => {
    const allItems = NAV_GROUPS.flatMap((g) => g.items);
    // Find the most specific matching route
    const sorted = [...allItems].sort((a, b) => b.href.length - a.href.length);
    const match = sorted.find((item) => {
      if (item.href === "/dashboard") return pathname === "/dashboard";
      return pathname === item.href || pathname.startsWith(item.href + "/");
    });
    if (match?.label) return match.label;
    if (pathname === "/dashboard/profile") return "Profile Settings";
    if (pathname === "/dashboard/settings") return "Settings";
    return "Dashboard";
  })();

  /* ── Search / Command palette ── */
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const allCommands = buildCommandItems();

  const filtered = searchQuery.trim()
    ? allCommands.filter(
      (c) =>
        c.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.sublabel ?? "").toLowerCase().includes(searchQuery.toLowerCase())
    )
    : allCommands;

  /* ── Profile dropdown ── */
  const [showProfile, setShowProfile] = useState(false);

  /* ── Close on outside click ── */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setSearchQuery("");
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Open search on ⌘K / Ctrl+K ── */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
        setSearchQuery("");
        setSelectedIdx(0);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setSearchQuery("");
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  /* ── Keyboard nav inside palette ── */
  const onSearchKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIdx((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && filtered[selectedIdx]) {
        router.push(filtered[selectedIdx].href);
        setSearchOpen(false);
        setSearchQuery("");
      }
    },
    [filtered, selectedIdx, router]
  );

  /* ── Logout ── */
  async function handleLogout() {
    await markPresenceOffline().catch(() => null);
    window.location.assign(getRootAppUrl("/logout"));
  }

  return (
    <>
      <header
        className="flex items-center gap-3 px-4 shrink-0 z-30"
        style={{
          height: 52,
          background: "rgba(253,248,248,0.92)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          position: "sticky",
          top: 0,
        }}
      >
        {/* ── Left: sidebar toggle + breadcrumb ── */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile hamburger */}
          <button
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-[6px] hover:bg-black/[0.05] transition-colors"
            onClick={onMobileMenuOpen}
            aria-label="Open menu"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--color-on-surface-variant)" }}>
              menu
            </span>
          </button>

          {/* Desktop collapse toggle */}
          <button
            className="hidden lg:flex w-8 h-8 items-center justify-center rounded-[6px] hover:bg-black/[0.05] transition-colors"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--color-on-surface-variant)", opacity: 0.6 }}>
              {collapsed ? "menu_open" : "menu"}
            </span>
          </button>

          {/* Breadcrumb — dynamic */}
          <div className="hidden sm:flex items-center gap-1.5">
            <span
              className="font-body-sm text-[12px] font-medium"
              style={{ color: "var(--color-on-surface-variant)", opacity: 0.55 }}
              suppressHydrationWarning
            >
              {tenantName}
            </span>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 13, color: "var(--color-on-surface-variant)", opacity: 0.3 }}
            >
              chevron_right
            </span>
            <span
              className="font-body-sm text-[12px] font-semibold"
              style={{ color: "var(--color-on-surface)" }}
            >
              {currentPage}
            </span>
          </div>
        </div>

        {/* ── Center: search ── */}
        <div ref={searchRef} className="flex-1 flex justify-center px-4 max-w-xl mx-auto relative">
          <div
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-[6px] transition-all duration-200 cursor-text"
            style={{
              border: searchFocused || searchOpen ? "1px solid rgba(0,0,0,0.2)" : "1px solid rgba(0,0,0,0.08)",
              background: searchFocused || searchOpen ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.025)",
            }}
            onClick={() => {
              setSearchOpen(true);
              setSearchQuery("");
              setSelectedIdx(0);
              setTimeout(() => searchInputRef.current?.focus(), 30);
            }}
          >
            <span
              className="material-symbols-outlined shrink-0"
              style={{ fontSize: 15, color: "var(--color-on-surface-variant)", opacity: 0.45 }}
            >
              search
            </span>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search or run a command..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedIdx(0);
              }}
              onFocus={() => { setSearchFocused(true); setSearchOpen(true); }}
              onBlur={() => setSearchFocused(false)}
              onKeyDown={onSearchKeyDown}
              className="flex-1 bg-transparent outline-none font-body-md text-[13px] placeholder:opacity-40"
              style={{ color: "var(--color-on-surface)" }}
            />
            <kbd
              className="hidden sm:inline-flex items-center font-label-caps text-[9px] font-semibold px-1.5 py-0.5 rounded"
              style={{ background: "rgba(0,0,0,0.05)", color: "var(--color-on-surface-variant)", opacity: 0.5, letterSpacing: "0.06em" }}
            >
              ⌘K
            </kbd>
          </div>

          {/* Command palette dropdown */}
          {searchOpen && (
            <div
              className="absolute left-4 right-4 top-full mt-1.5 rounded-[10px] overflow-hidden z-50"
              style={{
                background: "#fff",
                border: "1px solid rgba(0,0,0,0.09)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.13)",
                maxHeight: 380,
                overflowY: "auto",
              }}
            >
              {/* Header */}
              <div
                className="flex items-center gap-2 px-4 py-2.5 border-b"
                style={{ borderColor: "rgba(0,0,0,0.06)" }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 13, color: "var(--color-on-surface-variant)", opacity: 0.5 }}
                >
                  search
                </span>
                <span
                  className="font-label-caps text-[10px] uppercase tracking-[0.06em] font-semibold"
                  style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }}
                >
                  {searchQuery ? `Results for "${searchQuery}"` : "Navigate to…"}
                </span>
                <span
                  className="ml-auto font-label-caps text-[9px] uppercase tracking-[0.06em] px-1.5 py-0.5 rounded"
                  style={{ background: "rgba(0,0,0,0.05)", color: "var(--color-on-surface-variant)", opacity: 0.5 }}
                >
                  ESC
                </span>
              </div>

              {/* Results */}
              {filtered.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <span
                    className="font-body-sm text-[13px]"
                    style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }}
                  >
                    No results found
                  </span>
                </div>
              ) : (
                <div className="py-1">
                  {filtered.map((cmd, i) => (
                    <button
                      key={cmd.href}
                      className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors duration-100 text-left"
                      style={{
                        background: i === selectedIdx ? "rgba(0,0,0,0.04)" : "transparent",
                      }}
                      onMouseEnter={() => setSelectedIdx(i)}
                      onClick={() => {
                        router.push(cmd.href);
                        setSearchOpen(false);
                        setSearchQuery("");
                      }}
                    >
                      <span
                        className="material-symbols-outlined shrink-0"
                        style={{
                          fontSize: 16,
                          color: "var(--color-on-surface-variant)",
                          opacity: i === selectedIdx ? 0.9 : 0.55,
                        }}
                      >
                        {cmd.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div
                          className="font-body-sm text-[13px] font-medium"
                          style={{ color: "var(--color-on-surface)" }}
                        >
                          {cmd.label}
                        </div>
                      </div>
                      <span
                        className="font-label-caps text-[9px] uppercase tracking-[0.06em] font-semibold shrink-0"
                        style={{ color: "var(--color-on-surface-variant)", opacity: 0.4 }}
                      >
                        {cmd.category ?? ""}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Right: profile ── */}
        <div className="flex items-center gap-1 shrink-0">
          <div ref={profileRef} className="relative">
            <button
              id="topbar-profile-btn"
              className="flex items-center gap-2 h-8 px-2 rounded-[6px] hover:bg-black/[0.05] transition-colors"
              onClick={() => setShowProfile((s) => !s)}
            >
              {/* Avatar */}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center font-display font-bold text-[11px] shrink-0 overflow-hidden"
                style={{ background: "var(--color-surface-container-highest)", color: "var(--color-on-surface)" }}
                suppressHydrationWarning
              >
                {userImage ? (
                  <img src={userImage} alt="" className="h-full w-full object-cover" />
                ) : (
                  userInitial
                )}
              </div>
              {/* Name (hidden on small screens) */}
              <span
                className="hidden md:inline font-body-sm text-[12.5px] font-medium max-w-[96px] truncate"
                style={{ color: "var(--color-on-surface)" }}
                suppressHydrationWarning
              >
                {userName}
              </span>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 14, color: "var(--color-on-surface-variant)", opacity: 0.5 }}
              >
                expand_more
              </span>
            </button>

            {/* Profile dropdown */}
            {showProfile && (
              <div
                className="absolute right-0 top-full mt-1.5 rounded-[8px] min-w-[200px] z-50 overflow-hidden"
                style={{
                  background: "#fff",
                  border: "1px solid rgba(0,0,0,0.09)",
                  boxShadow: "0 8px 28px rgba(0,0,0,0.11)",
                }}
              >
                {/* User info header */}
                <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-[11px] shrink-0 overflow-hidden"
                      style={{ background: "var(--color-surface-container-highest)", color: "var(--color-on-surface)" }}
                    >
                      {userImage ? (
                        <img src={userImage} alt="" className="h-full w-full object-cover" />
                      ) : (
                        userInitial
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-body-sm text-[13px] font-semibold truncate" style={{ color: "var(--color-on-surface)" }}>
                        {userName}
                      </div>
                      <div
                        className="font-body-sm text-[11px] mt-0.5 truncate"
                        style={{ color: "var(--color-on-surface-variant)", opacity: 0.6 }}
                      >
                        {session?.user?.email ?? ""}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tenant switcher — only shown if user has multiple orgs */}
                {hasMultipleOrgs && (
                  <div className="py-1">
                    <button
                      className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-black/[0.03] transition-colors"
                      onClick={() => {
                        setShowProfile(false);
                        window.location.assign(getRootAppUrl("/tenants"));
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 15, color: "var(--color-on-surface-variant)", opacity: 0.7 }}>
                        domain
                      </span>
                      <span className="font-body-sm text-[13px] text-on-surface">Pilih Tenant</span>
                    </button>
                    <div className="mx-4 my-1" style={{ height: 1, background: "rgba(0,0,0,0.05)" }} />
                  </div>
                )}

                {/* Profile Settings */}
                <div className="py-1">
                  <button
                    className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-black/[0.03] transition-colors"
                    onClick={() => { router.push("/dashboard/profile"); setShowProfile(false); }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 15, color: "var(--color-on-surface-variant)", opacity: 0.7 }}>
                      manage_accounts
                    </span>
                    <span className="font-body-sm text-[13px] text-on-surface">Profile Settings</span>
                  </button>

                  <div className="mx-4 my-1" style={{ height: 1, background: "rgba(0,0,0,0.05)" }} />

                  <button
                    id="topbar-logout-btn"
                    className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-red-50 transition-colors"
                    onClick={handleLogout}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 15, color: "#ef4444" }}>
                      logout
                    </span>
                    <span className="font-body-sm text-[13px]" style={{ color: "#ef4444" }}>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
