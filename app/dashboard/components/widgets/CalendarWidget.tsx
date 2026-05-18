"use client";

import { useDashboardData } from "../DashboardDataContext";

const DAYS = ["M","T","W","T","F","S","S"];

const TYPE_STYLE: Record<string, { icon: string; bg: string }> = {
  meeting:  { icon: "videocam",  bg: "rgba(0,0,0,0.06)"       },
  deadline: { icon: "flag",      bg: "rgba(186,26,26,0.07)"    },
  task:     { icon: "task_alt",  bg: "rgba(0,0,0,0.04)"        },
  default:  { icon: "event",     bg: "rgba(0,0,0,0.04)"        },
};

export default function CalendarWidget() {
  const { data } = useDashboardData();

  const now = new Date();
  const today = now.getDay(); // 0=Sun
  const adjustedToday = today === 0 ? 6 : today - 1; // Mon-based index
  const weekDates = DAYS.map((_, i) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (adjustedToday - i));
    return date.getDate();
  });

  // Calendar events from API (currently always empty — shows empty state gracefully)
  const events = (data?.calendar?.events ?? []) as Array<{
    time?: string;
    title: string;
    type?: string;
    duration?: string;
  }>;

  return (
    <div
      className="db-widget rounded-[10px] overflow-hidden"
      style={{ border: "1px solid rgba(0,0,0,0.07)", background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--color-on-surface-variant)", opacity: 0.7 }}>calendar_month</span>
          <span className="font-h3 text-[13px] font-semibold text-on-surface">Schedule</span>
        </div>
        <span className="font-label-caps text-[10px] uppercase tracking-[0.06em] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }}>
          {now.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
      </div>

      <div className="px-4 py-3">
        {/* Week strip */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {DAYS.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="font-label-caps text-[9px] uppercase tracking-[0.06em] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.4 }}>
                {d}
              </span>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center font-body-sm text-[11px] font-semibold transition-colors"
                style={{
                  background: i === adjustedToday ? "var(--color-primary)" : "transparent",
                  color: i === adjustedToday ? "var(--color-on-primary)" : "var(--color-on-surface)",
                  opacity: i === adjustedToday ? 1 : 0.55,
                }}
              >
                {weekDates[i]}
              </div>
            </div>
          ))}
        </div>

        {/* Today's events */}
        <div className="space-y-1.5">
          <span className="font-label-caps text-[9px] uppercase tracking-[0.08em] font-semibold block mb-2" style={{ color: "var(--color-on-surface-variant)", opacity: 0.4 }}>
            Today
          </span>
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 gap-2">
              <span className="material-symbols-outlined" style={{ fontSize: 24, color: "var(--color-on-surface-variant)", opacity: 0.22 }}>event_busy</span>
              <p className="font-body-sm text-[11px] text-on-surface-variant opacity-40">No events scheduled</p>
            </div>
          ) : (
            events.map((event, idx) => {
              const s = TYPE_STYLE[event.type ?? ""] ?? TYPE_STYLE.default;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 p-2 rounded-[6px] hover:bg-black/[0.02] transition-colors cursor-pointer"
                  style={{ border: "1px solid rgba(0,0,0,0.04)" }}
                >
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: s.bg }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 11, color: "var(--color-on-surface-variant)", opacity: 0.75 }}>{s.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body-md text-[12px] font-medium text-on-surface truncate">{event.title}</p>
                  </div>
                  {event.time && (
                    <div className="text-right shrink-0">
                      <span className="font-label-caps text-[9px] font-semibold block" style={{ color: "var(--color-on-surface-variant)", opacity: 0.55 }}>{event.time}</span>
                      {event.duration && (
                        <span className="font-label-caps text-[8px]" style={{ color: "var(--color-on-surface-variant)", opacity: 0.35 }}>{event.duration}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
