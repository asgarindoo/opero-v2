"use client";

import { ActivityPoint } from "@/features/insights";

export default function ActivityHeatmap({ data }: { data: ActivityPoint[] }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h5 className="font-display text-[15px] font-semibold text-on-surface tracking-tight">System Activity</h5>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm bg-black/[0.04]" />
            <span className="font-label-caps text-[8px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">Low</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm bg-primary/80" />
            <span className="font-label-caps text-[8px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">High</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-3">
        {days.map((day, dIdx) => (
          <div key={day} className="space-y-4">
            <span className="block font-label-caps text-[9px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest text-center">{day}</span>
            <div className="flex flex-col gap-2.5">
              {Array.from({ length: 6 }).map((_, hIdx) => {
                // Try to find matching data point
                const point = data.find(p => p.day === dIdx && Math.floor(p.hour / 4) === hIdx);
                const intensity = point ? point.intensity : Math.random() * 0.4; // Default low random for empty

                return (
                  <div
                    key={hIdx}
                    className={`aspect-square rounded-md transition-all hover:scale-110 cursor-pointer shadow-sm shadow-black/[0.02] ${intensity > 0.8 ? "bg-primary" :
                        intensity > 0.5 ? "bg-primary/60" :
                          intensity > 0.3 ? "bg-primary/30" :
                            "bg-black/[0.04]"
                      }`}
                    title={`${Math.round(intensity * 100)}% Activity`}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
