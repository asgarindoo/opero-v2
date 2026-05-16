"use client";

import { useEffect, useRef, useState } from "react";

const stats = [
  { label: "Tasks completed", value: 24, pct: 80 },
  { label: "Comments added", value: 11, pct: 37 },
  { label: "Work items moved", value: 18, pct: 60 },
  { label: "New work created", value: 7, pct: 23 },
];

function useCountUp(target: number, duration = 1200, started: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!started) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, started]);

  return count;
}

function StatRow({ label, value, pct, started }: { label: string; value: number; pct: number; started: boolean }) {
  const count = useCountUp(value, 1000 + pct * 5, started);
  const barPct = started ? pct : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-body-sm text-[12px] text-white/60">{label}</span>
        <span className="font-label-caps text-[11px] text-white/40 tabular-nums">{count}</span>
      </div>
      <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
        <div
          className="h-full bg-white/70 rounded-full transition-all duration-[1200ms] ease-out"
          style={{ width: `${barPct}%` }}
        />
      </div>
    </div>
  );
}

export default function ActivityStats() {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect(); } },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="flex flex-col gap-2.5">
      {stats.map((s) => (
        <StatRow key={s.label} {...s} started={started} />
      ))}
    </div>
  );
}
