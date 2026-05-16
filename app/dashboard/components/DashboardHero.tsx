"use client";

import {
  CheckSquare,
  Kanban,
  GitFork,
  ShoppingCart,
  UserRound,
  BarChart2,
  type LucideIcon,
} from "lucide-react";

const QUICK_ACTIONS: { icon: LucideIcon; label: string; href: string }[] = [
  { icon: CheckSquare, label: "New Task",  href: "/dashboard/tasks" },
  { icon: Kanban,      label: "Boards",    href: "/dashboard/boards" },
  { icon: GitFork,     label: "Flows",     href: "/dashboard/flows" },
  { icon: ShoppingCart,label: "Sales",     href: "/dashboard/sales" },
  { icon: UserRound,   label: "Clients",   href: "/dashboard/clients" },
  { icon: BarChart2,   label: "Insights",  href: "/dashboard/insights" },
];

interface Props {
  tenantName: string;
}

export default function DashboardHero({ tenantName }: Props) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  return (
    <div className="relative overflow-hidden rounded-[12px] mb-4" style={{ background: "var(--color-primary)" }}>
      {/* Dot pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.35) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* Glow accents */}
      <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)" }} />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)" }} />

      <div className="relative px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Left: Greeting */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "rgba(255,255,255,0.5)" }} />
            <span className="font-label-caps text-[9px] uppercase tracking-[0.1em] font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>
              {today}
            </span>
          </div>
          <h1 className="font-display text-[22px] font-bold leading-tight mb-1" style={{ color: "#fff", letterSpacing: "-0.02em" }}>
            {greeting}, {tenantName} 👋
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            {[
              { label: "24 active tasks" },
              { label: "3 due today" },
              { label: "5 open deals" },
              { label: "2 pending invoices" },
            ].map((chip) => (
              <span
                key={chip.label}
                className="font-label-caps text-[9px] uppercase tracking-[0.07em] font-semibold px-2 py-1 rounded-full"
                style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}
              >
                {chip.label}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Quick actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <a
                key={action.label}
                href={action.href}
                className="flex items-center gap-1.5 px-3 py-2 rounded-[6px] transition-all duration-150 hover:-translate-y-0.5"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.85)",
                }}
              >
                <Icon size={13} strokeWidth={1.75} style={{ color: "rgba(255,255,255,0.85)" }} />
                <span className="font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold hidden sm:inline">
                  {action.label}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
