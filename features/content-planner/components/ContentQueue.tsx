"use client";

import React, { useState } from "react";
import { useSocialChannels } from "@/features/social-channels";
import { ContentPost, ContentStatus } from "@/features/content-planner";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { ChevronRight, Trash2 } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useContentPlanner } from "@/features/content-planner/context/ContentPlannerContext";

interface ContentQueueProps {
  posts: ContentPost[];
  onSelectPost: (post: ContentPost) => void;
  onStatusChange: (id: string, status: ContentStatus) => void;
}

  const getStatusVariant = (status: ContentStatus | string): any => {
    switch (status) {
      case "Published": return "success";
      case "Ready": return "info";
      case "Planned": return "neutral";
      case "Skipped": return "error";
      default: return "neutral";
    }
  };

export default function ContentQueue({ posts, onSelectPost }: ContentQueueProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { channels } = useSocialChannels();
  const { deletePosts } = useContentPlanner();

  const handleDeleteOne = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deletePosts([id]);
  };

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
    <div className="flex flex-col h-full relative min-w-0">
      <div className="flex-1 overflow-auto">
        <Table className="bg-transparent min-w-[800px]">
          <TableHeader className="bg-[#fbf5f5]">
            <TableRow className="h-10">
              <TableHead className="w-10 px-4">
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.size > 0 && selectedIds.size === posts.length}
                    onChange={toggleAll}
                    className="w-3 h-3 rounded-[3px] border-black/10 accent-primary cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                  />
                </div>
              </TableHead>
              <TableHead className="w-[30%] px-4 text-left font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em]">Content Piece</TableHead>
              <TableHead className="w-[20%] px-4 text-left font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em]">Target Account</TableHead>
              <TableHead className="w-[10%] px-4 text-left font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em]">Status</TableHead>
              <TableHead className="w-[15%] px-4 text-left font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em]">Type</TableHead>
              <TableHead className="w-[15%] px-4 text-left font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em]">Schedule</TableHead>
              <TableHead className="w-[10%] px-4"><div className="w-full text-center font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em]">Actions</div></TableHead>
            </TableRow>
          </TableHeader>
        <TableBody>
          {posts
            .slice()
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(post => {
              const isSelected = selectedIds.has(post.id);
              const targetChannel = channels.find(c => c.id === post.targetAccountId);
              return (
                <TableRow
                  key={post.id}
                  onClick={() => onSelectPost(post)}
                  className={`group h-12 hover:bg-black/[0.015] cursor-pointer transition-colors ${isSelected ? "bg-primary/[0.02]" : ""}`}
                >
                  <TableCell className="px-4" onClick={e => toggleOne(post.id, e as any)}>
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        readOnly
                        className={`w-3 h-3 rounded-[3px] border-black/10 accent-primary cursor-pointer transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-60"}`}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="px-4 whitespace-nowrap">
                    <div className="flex flex-col min-w-0 gap-0.5">
                      <span
                        className="font-display font-semibold text-[12px] text-on-surface opacity-90 group-hover:text-primary transition-colors leading-tight truncate block max-w-[150px] md:max-w-[200px] lg:max-w-[250px] xl:max-w-[320px]"
                        title={post.title}
                      >
                        {post.title}
                      </span>
                      {post.tags && post.tags.length > 0 && (
                        <p className="font-body-sm text-[7px] truncate uppercase font-bold tracking-[0.2em] leading-none mt-1 text-on-surface-variant opacity-60">
                          {post.tags.join(", ")}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 whitespace-nowrap">
                    <div className="flex flex-col min-w-0 gap-1.5">
                      {targetChannel ? (
                        <span className="font-display font-medium text-[11px] text-on-surface truncate block max-w-[150px]">
                          {targetChannel.name}
                        </span>
                      ) : (
                        <span className="font-body-sm text-[10px] text-on-surface-variant opacity-40 italic">None</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 whitespace-nowrap">
                    <Badge variant={getStatusVariant(post.status)} className="text-[10px] py-0 px-1.5 h-4.5">
                      {post.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 whitespace-nowrap">
                    <span className="font-display font-medium text-[11px] text-on-surface truncate block max-w-[150px]">{post.type}</span>
                  </TableCell>
                  <TableCell className="px-4 whitespace-nowrap">
                    <span className="font-display text-[11px] text-on-surface-variant opacity-80">
                      {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                    <span className="font-body-sm text-[9px] text-on-surface-variant opacity-50 block mt-0.5 uppercase">
                      {post.time}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 whitespace-nowrap text-center">
                    <div className="flex justify-center items-center gap-0.5 opacity-30 group-hover:opacity-100 transition-all">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6.5 w-6.5 text-on-surface-variant hover:text-red-500 hover:bg-red-50"
                        onClick={(e) => handleDeleteOne(e, post.id)}
                      >
                        <Trash2 size={12} />
                      </Button>
                      <ChevronRight size={13} className="text-on-surface-variant ml-0.5" />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}
