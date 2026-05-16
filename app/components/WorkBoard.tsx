"use client";

import { useState } from "react";

const works = [
  { label: "Design homepage revamp", status: "In Progress", assignee: "JD" },
  { label: "Client onboarding — PT Maju", status: "Pending", assignee: "AS" },
  { label: "Fix checkout flow bug", status: "Done", assignee: "RZ" },
  { label: "Q2 campaign brief", status: "In Progress", assignee: "JD" },
];

const tabs = ["All", "In Progress", "Done", "Pending"] as const;
type Tab = (typeof tabs)[number];

export default function WorkBoard() {
  const [active, setActive] = useState<Tab>("All");

  const filtered = active === "All" ? works : works.filter((w) => w.status === active);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-[40px] leading-[1.1] text-primary mb-2 tracking-tight font-bold">
          Everything becomes structured work.
        </h2>
        <p className="font-body-lg text-[16px] text-on-surface-variant leading-relaxed">
          Every request, task, and operation — organized as trackable work units.
        </p>
      </div>

      {/* Board header */}
      <div className="flex items-center justify-between border-b border-outline/8 pb-3">
        <div className="flex gap-2 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className={`font-label-caps text-[11px] uppercase tracking-wider font-semibold px-3 py-1.5 rounded-full transition-all duration-200 active:scale-95 ${active === tab
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant hover:bg-surface-container"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex -space-x-2">
          {["JD", "AS", "RZ"].map((u) => (
            <div
              key={u}
              className="w-8 h-8 rounded-full bg-surface-container-high border-2 border-surface-container-lowest flex items-center justify-center text-[10px] font-bold text-primary"
            >
              {u}
            </div>
          ))}
        </div>
      </div>

      {/* Work rows */}
      <div className="flex flex-col gap-2">
        {filtered.length === 0 && (
          <div className="text-center py-6 text-on-surface-variant font-body-sm text-[15px]">
            No items
          </div>
        )}
        {filtered.map((w) => (
          <div
            key={w.label}
            className="flex items-center gap-4 bg-surface-container rounded-xl px-4 py-3.5 border border-outline/5"
          >
            <div
              className={`w-2 h-2 rounded-full shrink-0 ${w.status === "Done"
                  ? "bg-outline/30"
                  : w.status === "In Progress"
                    ? "bg-primary"
                    : "bg-outline/50"
                }`}
            />
            <span className="font-body-md text-[15px] text-on-surface flex-1 truncate">
              {w.label}
            </span>
            <span
              className={`font-label-caps text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0 ${w.status === "Done"
                  ? "bg-surface-container-high text-on-surface-variant"
                  : w.status === "In Progress"
                    ? "bg-primary/10 text-primary"
                    : "bg-surface-container-high text-on-surface-variant"
                }`}
            >
              {w.status}
            </span>
            <div className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
              {w.assignee}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
