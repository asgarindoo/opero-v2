"use client";

import type { Flow } from "../types";


interface FlowOverviewCardsProps {
  flows: Flow[];
}

export default function FlowOverviewCards({ flows }: FlowOverviewCardsProps) {
  const totalFlows = flows.length;
  const activeFlows = flows.filter(f => f.isActive).length;
  const totalTasks = flows.reduce((sum, f) => sum + f.tasksCount, 0);
  const mostUsedFlow = flows.reduce((max, f) => (f.tasksCount > max.tasksCount ? f : max), flows[0] || null);

  const avgCompletionTime = flows.length > 0
    ? Math.round(flows.reduce((sum, f) => sum + (f.usageStats?.avgCompletionDays || 0), 0) / flows.length)
    : 0;

  const cards = [
    {
      title: "Total Flows",
      value: totalFlows.toString(),
      subtitle: `${activeFlows} active`,
      color: "rgba(0,0,0,0.05)",
    },
    {
      title: "Tasks in Workflows",
      value: totalTasks.toString(),
      subtitle: `avg ${avgCompletionTime} days`,
      color: "rgba(0,0,0,0.035)",
    },
    {
      title: "Most Used",
      value: mostUsedFlow?.name || "—",
      subtitle: `${mostUsedFlow?.tasksCount || 0} tasks processed`,
      color: "rgba(0,0,0,0.04)",
    },
    {
      title: "Success Rate",
      value: mostUsedFlow && mostUsedFlow.usageStats?.successRate
        ? `${Math.round(mostUsedFlow.usageStats.successRate * 100)}%`
        : "—",
      subtitle: "Best performing flow",
      color: "rgba(0,120,60,0.05)",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {cards.map((card, i) => (
        <div
          key={i}
          className="rounded-xl p-4 border transition-all hover:shadow-sm hover:border-black/10"
          style={{
            background: card.color,
            borderColor: "rgba(0,0,0,0.06)",
          }}
        >
          <div className="font-label-caps text-[9px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }}>
            {card.title}
          </div>
          <div className="font-display text-2xl font-bold mb-2" style={{ color: "var(--color-on-surface)" }}>
            {card.value}
          </div>
          <div className="font-body-sm text-[11px]" style={{ color: "var(--color-on-surface-variant)", opacity: 0.6 }}>
            {card.subtitle}
          </div>
        </div>
      ))}
    </div>
  );
}
