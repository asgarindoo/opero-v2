"use client";

import React, { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { ContentPost } from "@/features/content-planner";

interface ContentCalendarProps {
  posts: ContentPost[];
  onUpdatePost: (post: ContentPost) => void;
  onSelectPost: (post: ContentPost) => void;
  onCreateAtDate: (date: Date) => void;
  viewMode: "month" | "week";
  currentDate: Date;
  onNavigate: (date: Date) => void;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function ContentCard({
  post,
  isDragging,
  onDragStart,
  onClick,
}: {
  post: ContentPost;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onClick: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className={`cursor-pointer select-none transition-all duration-150 ${
        isDragging ? "opacity-20" : ""
      }`}
    >
      <div className="bg-white border border-black/[0.07] rounded-[4px] px-2.5 py-2 hover:border-black/[0.18] hover:shadow-[0_1px_6px_rgba(0,0,0,0.05)] transition-all duration-150">
        {/* Title */}
        <p className="font-display text-[10.5px] font-semibold text-black/80 leading-snug line-clamp-2 tracking-tight">
          {post.title}
        </p>

        {/* Category */}
        {post.category && (
          <p className="font-display text-[9px] text-black/60 mt-0.5 leading-none truncate">
            {post.category}
          </p>
        )}

        {/* Bottom: type + time */}
        <div className="flex items-center justify-between mt-2 gap-1">
          {post.type && (
            <span className="font-display text-[8px] font-semibold uppercase tracking-[0.07em] text-black/60 bg-black/[0.035] px-1.5 py-[2px] rounded-[2px]">
              {post.type}
            </span>
          )}
          <span className="font-display text-[9px] text-black/60 tabular-nums ml-auto">
            {post.time}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ContentCalendar({
  posts,
  onUpdatePost,
  onSelectPost,
  onCreateAtDate,
  viewMode,
  currentDate,
}: ContentCalendarProps) {
  const [draggedPostId, setDraggedPostId] = useState<string | null>(null);

  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    const prevLast = new Date(year, month, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--)
      days.push({ date: new Date(year, month - 1, prevLast - i), isCurrentMonth: false });

    const total = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= total; d++)
      days.push({ date: new Date(year, month, d), isCurrentMonth: true });

    const rem = 42 - days.length;
    for (let i = 1; i <= rem; i++)
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });

    return days;
  }, [currentDate]);

  const weekDays = useMemo(() => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return { date: d, isCurrentMonth: d.getMonth() === currentDate.getMonth() };
    });
  }, [currentDate]);

  const days = viewMode === "week" ? weekDays : monthDays;
  const todayStr = new Date().toDateString();

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("postId");
    const post = posts.find(p => p.id === id);
    if (post) onUpdatePost({ ...post, date });
    setDraggedPostId(null);
  };

  return (
    <div className="flex flex-col bg-white overflow-hidden border-b border-black/[0.05]">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-black/[0.05]">
        {DAYS.map(d => (
          <div key={d} className="py-2.5 text-center border-r border-black/[0.04] last:border-r-0">
            <span className="font-display text-[9px] font-bold uppercase tracking-[0.18em] text-black/60">
              {d}
            </span>
          </div>
        ))}
      </div>

      {/* Cells */}
      <div
        className="grid grid-cols-7"
        style={{ background: "rgba(0,0,0,0.02)" }}
      >
        {days.map(({ date, isCurrentMonth }, idx) => {
          const dateStr = date.toDateString();
          const isToday = dateStr === todayStr;
          const items = posts.filter(p => p.date.toDateString() === dateStr);

          return (
            <div
              key={idx}
              onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
              onDrop={e => handleDrop(e, date)}
              className={`min-h-[120px] bg-white border-r border-b border-black/[0.04] last:border-r-0 flex flex-col group/cell transition-colors ${
                !isCurrentMonth ? "bg-black/[0.01]" : "hover:bg-black/[0.006]"
              } ${viewMode === "week" ? "min-h-[380px]" : ""}`}
            >
              {/* Date number row */}
              <div className="flex items-center justify-between px-2.5 pt-2 pb-1.5">
                <span className={`font-display text-[11px] leading-none font-semibold ${
                  isToday
                    ? "w-5 h-5 flex items-center justify-center bg-black text-white rounded-sm text-[10px] font-bold"
                    : !isCurrentMonth
                    ? "text-black/60"
                    : "text-black/80"
                }`}>
                  {date.getDate() === 1 && !isCurrentMonth
                    ? `${date.toLocaleString("default", { month: "short" })} 1`
                    : date.getDate()}
                </span>
                {isCurrentMonth && (
                  <button
                    onClick={() => onCreateAtDate(date)}
                    className="opacity-0 group-hover/cell:opacity-100 transition-opacity p-0.5 text-black/60 hover:text-black"
                  >
                    <Plus size={11} />
                  </button>
                )}
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-1 px-1.5 pb-2 overflow-y-auto no-scrollbar">
                {items.map(item => (
                  <ContentCard
                    key={item.id}
                    post={item}
                    isDragging={draggedPostId === item.id}
                    onDragStart={e => {
                      setDraggedPostId(item.id);
                      e.dataTransfer.setData("postId", item.id);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onClick={() => onSelectPost(item)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
