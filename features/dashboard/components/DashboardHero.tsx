"use client";


import { useState, useEffect } from "react";
import { useDashboardData } from "@/features/dashboard/context/DashboardDataContext";
import { useSession } from "@/lib/auth-client";
import { getUserDisplayName } from "@/lib/user-identity";

export default function DashboardHero() {
  const { data } = useDashboardData();
  const { data: session } = useSession();

  const [timeData, setTimeData] = useState({ timeStr: "", ampm: "" });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 should be 12
      const hh = String(hours).padStart(2, '0');
      setTimeData({ timeStr: `${hh}:${minutes}`, ampm });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  const heroStats = data?.heroStats;
  const userName = getUserDisplayName(session?.user);

  const chips = heroStats
    ? [
      { label: `${heroStats.activeTasks} active task${heroStats.activeTasks !== 1 ? "s" : ""}` },
      { label: `${heroStats.dueToday} due today` },
      { label: `${heroStats.openDeals} open deal${heroStats.openDeals !== 1 ? "s" : ""}` },
      { label: `${heroStats.totalMembers} member${heroStats.totalMembers !== 1 ? "s" : ""}` },
    ]
    : [
      { label: "— active tasks" },
      { label: "— due today" },
      { label: "— open deals" },
      { label: "— members" },
    ];

  return (
    <div className="relative overflow-hidden rounded-full mb-4" style={{ background: "var(--color-primary)" }}>
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

      <div className="relative px-6 py-5 flex flex-col md:flex-row md:items-center gap-4 justify-between">
        {/* Left: Greeting */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span suppressHydrationWarning className="font-label-caps text-[9px] uppercase tracking-widest font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>
              {today}
            </span>
          </div>
          <h1 suppressHydrationWarning className="font-display text-[22px] font-bold leading-tight mb-3" style={{ color: "#fff", letterSpacing: "-0.02em" }}>
            {greeting}, {userName} 👋
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            {chips.map((chip) => (
              <span
                key={chip.label}
                className="font-label-caps text-[9px] uppercase tracking-widest font-semibold px-2 py-1 rounded-full"
                style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}
              >
                {chip.label}
              </span>
            ))}
          </div>
        </div>

        {/* Right side: Large Minimalist Clock with AM/PM */}
        <div className="md:self-center shrink-0 w-full md:w-auto flex md:justify-end select-none">
          <div className="flex items-baseline gap-1">
            <span className="font-display text-[44px] font-semibold tracking-tight" style={{ color: "rgba(255, 255, 255, 0.95)", lineHeight: 1 }}>
              {timeData.timeStr || "—:—"}
            </span>
            <span className="font-label-caps text-[10px] font-bold tracking-wider" style={{ color: "rgba(255, 255, 255, 0.45)", textTransform: "uppercase" }}>
              {timeData.ampm}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
