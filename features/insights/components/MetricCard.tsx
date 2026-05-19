"use client";

import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { Metric } from "../types";

export default function MetricCard({ metric }: { metric: Metric }) {
  const isPositive = metric.trend > 0;
  const isNegative = metric.trend < 0;
  
  return (
    <div className="flex flex-col min-w-[140px] group transition-all">
      <div className="flex items-center gap-2 mb-3">
        <span className="font-label-caps text-[9px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest transition-opacity">
          {metric.label}
        </span>
      </div>
      
      <div className="flex items-baseline gap-3">
        <span className="font-display text-[26px] font-bold text-on-surface tracking-tighter leading-none">
          {metric.prefix}{metric.value}{metric.suffix}
        </span>
        
        <div className={`flex items-center gap-1 font-display text-[11px] font-bold ${
          isPositive ? "text-emerald-500" : isNegative ? "text-red-500" : "text-on-surface-variant opacity-60"
        }`}>
          {isPositive ? <ArrowUpRight size={12} /> : isNegative ? <ArrowDownRight size={12} /> : <Minus size={12} />}
          <span>{Math.abs(metric.trend)}%</span>
        </div>
      </div>
      
      <div className="h-0.5 w-8 bg-primary/10 rounded-full mt-4 group-hover:w-full group-hover:bg-primary/20 transition-all duration-500" />
    </div>
  );
}
