"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, useActiveOrganization } from "@/lib/auth-client";

const QUICK_CREATE_ITEMS = [
  { icon: "task_alt",    label: "New Task",       shortcut: "T" },
  { icon: "view_kanban", label: "New Board",      shortcut: "B" },
  { icon: "bolt",        label: "New Automation", shortcut: "A" },
  { icon: "forum",       label: "New Message",    shortcut: "M" },
  { icon: "inventory_2", label: "New Resource",   shortcut: "R" },
];

const NOTIFICATIONS = [
  { icon: "task_alt",    text: "New task assigned: Client Onboarding Q2",     time: "2m ago",  unread: true },
  { icon: "bolt",        text: "Automation triggered: Lead → Task Created",    time: "8m ago",  unread: true },
  { icon: "forum",       text: "Andi mentioned you in Design Sprint thread",   time: "15m ago", unread: true },
  { icon: "warning",     text: "Task overdue: Revamp product catalog",         time: "1h ago",  unread: false },
  { icon: "smart_toy",   text: "Bot received 3 new messages from WhatsApp",    time: "2h ago",  unread: false },
];

interface Props {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onMobileMenuOpen: () => void;
}

export default function Topbar({ collapsed, onToggleCollapse, onMobileMenuOpen }: Props) {
  const { data: session }           = useSession();
  const { data: activeOrg }         = useActiveOrganization();
  const tenantName = activeOrg?.name ?? "Workspace";
  const userInitial = session?.user?.name?.charAt(0)?.toUpperCase() ?? "U";

  const [showCreate, setShowCreate]         = useState(false);
  const [showNotifs, setShowNotifs]         = useState(false);
  const [searchFocused, setSearchFocused]   = useState(false);

  const createRef = useRef<HTMLDivElement>(null);
  const notifRef  = useRef<HTMLDivElement>(null);

  /* Close dropdowns on outside click */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (createRef.current && !createRef.current.contains(e.target as Node)) setShowCreate(false);
      if (notifRef.current  && !notifRef.current.contains(e.target as Node))  setShowNotifs(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;

  return (
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

        {/* Breadcrumb */}
        <div className="hidden sm:flex items-center gap-1.5">
          <span className="font-body-sm text-[12px] font-medium" style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }}>
            {tenantName}
          </span>
          <span className="material-symbols-outlined" style={{ fontSize: 13, color: "var(--color-on-surface-variant)", opacity: 0.3 }}>
            chevron_right
          </span>
          <span className="font-body-sm text-[12px] font-semibold" style={{ color: "var(--color-on-surface)" }}>
            Dashboard
          </span>
        </div>
      </div>

      {/* ── Center: search ── */}
      <div className="flex-1 flex justify-center px-4 max-w-xl mx-auto">
        <div
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-[6px] transition-all duration-200"
          style={{
            border: searchFocused ? "1px solid rgba(0,0,0,0.2)" : "1px solid rgba(0,0,0,0.08)",
            background: searchFocused ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.025)",
          }}
        >
          <span className="material-symbols-outlined shrink-0" style={{ fontSize: 15, color: "var(--color-on-surface-variant)", opacity: 0.45 }}>
            search
          </span>
          <input
            type="text"
            placeholder="Search or run a command..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
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
      </div>

      {/* ── Right: actions ── */}
      <div className="flex items-center gap-1 shrink-0">

        {/* Quick Create */}
        <div ref={createRef} className="relative">
          <button
            onClick={() => { setShowCreate((s) => !s); setShowNotifs(false); }}
            className="flex items-center gap-1.5 h-8 px-3 rounded-[6px] transition-all duration-150 hover:bg-black/[0.05]"
            style={{ border: "1px solid rgba(0,0,0,0.1)", background: showCreate ? "rgba(0,0,0,0.05)" : "transparent" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 15, color: "var(--color-on-surface)" }}>add</span>
            <span className="hidden sm:inline font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold" style={{ color: "var(--color-on-surface)" }}>
              Create
            </span>
          </button>

          {showCreate && (
            <div
              className="absolute right-0 top-full mt-1.5 py-1 rounded-[8px] min-w-[200px] z-50"
              style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.09)", boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }}
            >
              {QUICK_CREATE_ITEMS.map((item) => (
                <button
                  key={item.label}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-black/[0.03] transition-colors duration-100"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--color-on-surface-variant)", opacity: 0.7 }}>
                    {item.icon}
                  </span>
                  <span className="font-body-sm text-[13px] font-medium text-on-surface flex-1 text-left">{item.label}</span>
                  <kbd
                    className="font-label-caps text-[9px] font-semibold px-1.5 py-0.5 rounded"
                    style={{ background: "rgba(0,0,0,0.05)", color: "var(--color-on-surface-variant)", letterSpacing: "0.06em" }}
                  >
                    {item.shortcut}
                  </kbd>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setShowNotifs((s) => !s); setShowCreate(false); }}
            className="relative w-8 h-8 flex items-center justify-center rounded-[6px] hover:bg-black/[0.05] transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--color-on-surface-variant)", opacity: 0.65 }}>
              notifications
            </span>
            {unreadCount > 0 && (
              <span
                className="absolute top-1 right-1 w-[14px] h-[14px] rounded-full flex items-center justify-center font-label-caps text-[8px] font-bold"
                style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div
              className="absolute right-0 top-full mt-1.5 rounded-[8px] w-[320px] z-50 overflow-hidden"
              style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.09)", boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                <span className="font-h3 text-[13px] font-semibold text-on-surface">Notifications</span>
                <button className="font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold hover:text-primary transition-colors" style={{ color: "var(--color-on-surface-variant)", opacity: 0.6 }}>
                  Mark all read
                </button>
              </div>
              {NOTIFICATIONS.map((n, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-black/[0.02] cursor-pointer transition-colors border-b"
                  style={{ borderColor: "rgba(0,0,0,0.04)", background: n.unread ? "rgba(0,0,0,0.015)" : "transparent" }}
                >
                  <span className="material-symbols-outlined mt-0.5 shrink-0" style={{ fontSize: 15, color: "var(--color-on-surface-variant)", opacity: 0.6 }}>
                    {n.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-body-sm text-[12px] text-on-surface leading-snug">{n.text}</p>
                    <p className="font-label-caps text-[10px] mt-0.5" style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }}>{n.time}</p>
                  </div>
                  {n.unread && (
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: "var(--color-primary)" }} />
                  )}
                </div>
              ))}
              <div className="px-4 py-2.5 text-center">
                <button className="font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold hover:text-primary transition-colors" style={{ color: "var(--color-on-surface-variant)", opacity: 0.6 }}>
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Workspace pill */}
        <div
          className="hidden sm:flex items-center gap-1.5 h-8 px-2.5 rounded-[6px] cursor-pointer hover:bg-black/[0.05] transition-colors"
          style={{ border: "1px solid rgba(0,0,0,0.08)" }}
        >
          <div
            className="w-5 h-5 rounded-[4px] flex items-center justify-center font-display font-bold text-[9px]"
            style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
          >
            {tenantName.charAt(0)}
          </div>
          <span className="font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold max-w-[80px] truncate" style={{ color: "var(--color-on-surface)" }}>
            {tenantName}
          </span>
          <span className="material-symbols-outlined" style={{ fontSize: 13, color: "var(--color-on-surface-variant)", opacity: 0.4 }}>
            unfold_more
          </span>
        </div>

        {/* User avatar */}
        <button
          className="w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-[11px] hover:opacity-80 transition-opacity"
          style={{ background: "var(--color-surface-container-highest)", color: "var(--color-on-surface)" }}
        >
          {userInitial}
        </button>
      </div>
    </header>
  );
}
