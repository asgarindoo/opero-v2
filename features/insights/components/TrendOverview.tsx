"use client";

import { InsightTrend } from "../types";

export default function TrendOverview({ trend }: { trend: InsightTrend }) {
  const values = trend.data.map(d => d.value);
  const maxVal = Math.max(...values);
  const minVal = Math.min(...values);
  const range = maxVal - minVal;

  return (
    <div className="space-y-6 group">
      <div className="flex items-center justify-between">
        <h5 className="font-display text-[15px] font-semibold text-on-surface tracking-tight group-hover:text-primary transition-colors">
          {trend.title}
        </h5>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/[0.03] text-on-surface-variant opacity-60 font-display text-[10px] font-bold">
          High: {maxVal}
        </div>
      </div>

      <div className="h-16 flex items-end gap-1.5 w-full">
        {trend.data.map((dp, i) => {
          const height = range === 0 ? 50 : ((dp.value - minVal) / range) * 100;
          return (
            <div
              key={i}
              className="flex-1 bg-black/[0.04] rounded-sm relative group/bar hover:bg-primary/20 transition-all"
              style={{ height: '100%' }}
              title={`${dp.label}: ${dp.value}`}
            >
              <div
                className="absolute bottom-0 left-0 right-0 bg-primary/40 rounded-sm group-hover/bar:bg-primary transition-all duration-500"
                style={{ height: `${Math.max(10, height)}%` }}
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-between font-label-caps text-[8px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em]">
        <span>{trend.data[0]?.label || "Start"}</span>
        <span>{trend.data[trend.data.length - 1]?.label || "End"}</span>
      </div>
    </div>
  );
}
