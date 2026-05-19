"use client";

import React, { useState } from "react";
import { ContentPost, ContentStatus } from "../types";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { ChevronRight } from "lucide-react";

interface ContentQueueProps {
  posts: ContentPost[];
  onSelectPost: (post: ContentPost) => void;
  onStatusChange: (id: string, status: ContentStatus) => void;
}

function getStatusColor(status: ContentStatus) {
  switch (status) {
    case "Published": return "bg-black text-white";
    case "Published": return "bg-black text-white";
    case "Scheduled": return "bg-black/[0.08] text-black/80";
    case "Approved":  return "bg-black/[0.05] text-black/70";
    case "In Review": return "bg-black/[0.03] text-black/65";
    default:          return "bg-black/[0.02] text-black/60";
  }
}

function initials(name: string) {
  return name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
}

export default function ContentQueue({ posts, onSelectPost }: ContentQueueProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleAll = () => {
    if (selectedIds.size === posts.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(posts.map(p => p.id)));
  };

  const toggleOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 opacity-60">
        <p className="font-display text-[11px] font-bold uppercase tracking-widest">No entries found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Table className="bg-transparent">
        <TableHeader className="bg-[#f9f5f5] border-b border-black/[0.04] sticky top-0 z-10">
          <TableRow className="bg-[#f9f5f5] border-none hover:bg-[#f9f5f5]">
            <TableHead className="w-12 px-0 text-center">
              <input 
                type="checkbox" 
                checked={selectedIds.size > 0 && selectedIds.size === posts.length}
                onChange={toggleAll}
                className="w-3.5 h-3.5 rounded-sm border-black/10 accent-black cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
              />
            </TableHead>
            <TableHead className="w-[30%]">Content Piece</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Channel</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead className="text-right">Schedule</TableHead>
            <TableHead className="w-24 text-right pr-6"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts
            .slice()
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .map(post => {
              const isSelected = selectedIds.has(post.id);
              return (
                <TableRow 
                  key={post.id} 
                  onClick={() => onSelectPost(post)}
                  className={isSelected ? "bg-black/[0.01]" : "bg-[#fef8f8] hover:bg-black/[0.005]"}
                >
                  <TableCell onClick={e => toggleOne(post.id, e)} className="text-center px-0">
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      readOnly
                      className={`w-3.5 h-3.5 rounded-sm border-black/10 accent-black transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-60"}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5 py-2">
                      <span className="font-display font-bold text-[13px] text-black/80 tracking-tight group-hover:text-black transition-colors">
                        {post.title}
                      </span>
                      <span className="font-label-caps text-[7px] font-bold text-black/60 uppercase tracking-[0.15em]">
                        {post.type} {post.category ? `• ${post.category}` : ""}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-[4px] font-label-caps text-[8px] font-bold uppercase tracking-widest ${getStatusColor(post.status)}`}>
                      {post.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-display text-[11px] font-bold text-black/60 uppercase tracking-wider">{post.platform}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="h-6 w-6 rounded-full bg-black/[0.04] border border-black/[0.04] flex items-center justify-center font-display font-bold text-[8px] text-black/60">
                        {initials(post.assignee)}
                      </div>
                      <span className="font-display text-[12px] font-medium text-black/60">{post.assignee}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-display text-[11px] font-bold text-black/60 tabular-nums">
                        {post.date.toLocaleDateString("default", { month: "short", day: "numeric" })}
                      </span>
                      <span className="font-display text-[9px] text-black/60 tabular-nums uppercase">{post.time}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="opacity-60 group-hover:opacity-100 transition-opacity flex justify-end items-center">
                      <ChevronRight size={16} strokeWidth={2.5} />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </div>
  );
}
