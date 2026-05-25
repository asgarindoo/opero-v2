"use client";

import React, { useState } from "react";
import { Search, Grid, List, Upload, Filter } from "lucide-react";
import { useDocuments } from "../context/DocumentsContext";
import Button from "@/components/ui/Button";
import UploadModal from "./UploadModal";

export default function DocumentsToolbar() {
  const { searchQuery, setSearchQuery, viewMode, setViewMode } = useDocuments();
  const [showUpload, setShowUpload] = useState(false);

  return (
    <>
      <div className="h-14 border-b border-black/[0.06] bg-surface flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-40" />
            <input
              type="text"
              placeholder="Search documents, folders, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-black/[0.03] border border-transparent rounded-[8px] font-display text-[13px] outline-none focus:bg-white focus:border-black/10 transition-all placeholder:text-on-surface-variant/40"
            />
          </div>
          <button className="p-1.5 rounded-md hover:bg-black/5 transition-colors text-on-surface-variant opacity-60 hover:opacity-100">
            <Filter size={15} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center p-0.5 bg-black/[0.04] rounded-[8px]">
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-[6px] transition-all ${
                viewMode === "list" 
                  ? "bg-white shadow-sm text-primary" 
                  : "text-on-surface-variant opacity-50 hover:opacity-100"
              }`}
            >
              <List size={14} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-[6px] transition-all ${
                viewMode === "grid" 
                  ? "bg-white shadow-sm text-primary" 
                  : "text-on-surface-variant opacity-50 hover:opacity-100"
              }`}
            >
              <Grid size={14} />
            </button>
          </div>

          <Button variant="primary" size="sm" icon={Upload} onClick={() => setShowUpload(true)}>
            UPLOAD
          </Button>
        </div>
      </div>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
    </>
  );
}
