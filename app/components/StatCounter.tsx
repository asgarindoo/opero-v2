"use client";

import { useEffect, useRef, useState } from "react";

const stats = [
  { prefix: "", value: 1000, suffix: "+", label: "Tenants" },
  { prefix: "", value: 98, suffix: "%", label: "Efficiency" },
  { prefix: "", value: 24, suffix: "/7", label: "Bot Availability" },
  { prefix: "", value: 99, suffix: ".9%", label: "Uptime" },
  { prefix: "", value: 30, suffix: "%", label: "Cost Reduction" },
];

function useCountUp(target: number, duration: number, started: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, started]);
  return count;
}

function StatItem({ prefix, value, suffix, label, started }: {
  prefix: string; value: number; suffix: string; label: string; started: boolean;
}) {
  const count = useCountUp(value, 1400, started);
  return (
    <div className="text-center px-1">
      <div
        className="text-primary font-bold tabular-nums font-display leading-none"
        style={{ fontSize: "clamp(18px, 3.8vw, 52px)" }}
      >
        {prefix}{count}{suffix}
      </div>
      <div className="font-label-caps text-[9px] sm:text-[11px] text-on-surface-variant uppercase tracking-[0.04em] sm:tracking-[0.05em] font-semibold mt-1 leading-tight">
        {label}
      </div>
    </div>
  );
}

export default function StatCounter() {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setStarted(true); observer.disconnect(); }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="grid grid-cols-5 gap-x-2 sm:gap-x-4 gap-y-6"
    >
      {stats.map((s) => (
        <StatItem key={s.label} {...s} started={started} />
      ))}
    </div>
  );
}
