"use client";

import React, { useState } from "react";
import { Grid, List, Upload, Filter } from "lucide-react";
import { useDocuments } from "../context/DocumentsContext";
import Button from "@/components/ui/Button";
import UploadModal from "./UploadModal";
import ModuleHeader from "@/components/common/ModuleHeader";
import SearchInput from "@/components/common/SearchInput";

export default function DocumentsToolbar() {
  const { searchQuery, setSearchQuery, viewMode, setViewMode, documents } = useDocuments();
  const [showUpload, setShowUpload] = useState(false);

  return (
    <>
      <ModuleHeader 
        title="Documents"
        count={documents.length}
        rightContent={(
          <>
            <SearchInput 
              value={searchQuery} 
              onChange={setSearchQuery} 
              placeholder="Search documents, folders, tags..." 
              width={260}
            />
            
            <div className="flex items-center p-1 rounded-[6px] bg-black/[0.04] gap-1 mr-1">
              <button className="p-1 rounded text-on-surface-variant opacity-60 hover:opacity-100 transition-all">
                <Filter size={14} />
              </button>
            </div>

            <div className="flex items-center p-1 rounded-[6px] bg-black/[0.04] gap-1 mr-1">
              <button
                onClick={() => setViewMode("list")}
                className={`p-1 rounded-[4px] transition-all ${
                  viewMode === "list" 
                    ? "bg-white shadow-sm text-primary" 
                    : "text-on-surface-variant opacity-60 hover:opacity-100"
                }`}
              >
                <List size={14} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1 rounded-[4px] transition-all ${
                  viewMode === "grid" 
                    ? "bg-white shadow-sm text-primary" 
                    : "text-on-surface-variant opacity-60 hover:opacity-100"
                }`}
              >
                <Grid size={14} />
              </button>
            </div>

            <Button variant="primary" size="sm" icon={Upload} onClick={() => setShowUpload(true)}>
              UPLOAD
            </Button>
          </>
        )}
      />

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
    </>
  );
}
