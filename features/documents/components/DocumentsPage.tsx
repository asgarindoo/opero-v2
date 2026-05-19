"use client";

import React, { useState, useMemo } from "react";
import { Plus, Clock, Share2, Upload, Grid, List, BarChart3, Shield, Star } from "lucide-react";
import { DocumentsProvider, useDocuments } from "@/features/documents/context/DocumentsContext";
import DocumentTable from "@/features/documents/components/DocumentTable";
import DocumentGrid from "@/features/documents/components/DocumentGrid";
import DocumentDetail from "@/features/documents/components/DocumentDetail";
import UploadModal from "@/features/documents/components/UploadModal";

import ModuleHeader from "@/components/common/ModuleHeader";
import ModuleTabs from "@/components/common/ModuleTabs";
import SearchInput from "@/components/common/SearchInput";
import Button from "@/components/ui/Button";

type ViewMode = "list" | "grid";
type FilterMode = "all" | "recent" | "shared" | "favorites";

function DocumentsPageContent() {
  const { files } = useDocuments();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Removed icons for cleaner look
  const tabs = [
    { id: "all", label: "All Assets" },
    { id: "recent", label: "Recent" },
    { id: "shared", label: "Shared" },
    { id: "favorites", label: "Favorites" },
  ];

  const selectedFile = useMemo(() => 
    files.find(f => f.id === selectedFileId) || null
  , [files, selectedFileId]);

  if (selectedFile) {
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#fef8f8]">
         <DocumentDetail 
           fileId={selectedFile.id} 
           onClose={() => setSelectedFileId(null)} 
         />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#fef8f8]">
      <ModuleHeader 
        title="Documents"
        count={files.length}
        rightContent={(
          <>
            <div className="flex items-center p-0.5 bg-black/[0.03] rounded-lg mr-1.5">
               <button 
                 onClick={() => setViewMode("list")}
                 className={`p-1 rounded-md transition-all ${viewMode === "list" ? "bg-white shadow-sm text-primary" : "text-on-surface-variant opacity-60 hover:opacity-100"}`}
               >
                  <List size={13} />
               </button>
               <button 
                 onClick={() => setViewMode("grid")}
                 className={`p-1 rounded-md transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-primary" : "text-on-surface-variant opacity-60 hover:opacity-100"}`}
               >
                  <Grid size={13} />
               </button>
            </div>

            <SearchInput 
              value={searchQuery} 
              onChange={setSearchQuery} 
              placeholder="Search assets..." 
              width={180}
            />

            <Button 
              variant="primary" 
              size="sm" 
              icon={Upload}
              onClick={() => setShowUploadModal(true)}
            >
              UPLOAD ASSETS
            </Button>
          </>
        )}
      />

      <ModuleTabs 
        tabs={tabs}
        activeTab={filterMode}
        onTabChange={(id) => setFilterMode(id as FilterMode)}
        background="bg-[#fbf5f5]" 
        rightContent={(
          <div className="flex items-center gap-6 mr-4">
            <div className="flex items-center gap-2">
               <Shield size={12} strokeWidth={1.75} style={{ color: "var(--color-on-surface-variant)", opacity: 0.6 }} />
               <span className="font-label-caps text-[9px] font-semibold text-on-surface-variant opacity-60 uppercase">Encrypted Storage</span>
            </div>
            <div className="flex items-center gap-2">
               <BarChart3 size={12} strokeWidth={1.75} style={{ color: "var(--color-on-surface-variant)", opacity: 0.6 }} />
               <span className="font-label-caps text-[9px] font-semibold text-on-surface-variant opacity-60 uppercase">1.2 GB Used</span>
            </div>
          </div>
        )}
      />

      <main className="flex-1 overflow-y-auto bg-[#fef8f8]">
        {viewMode === "list" ? (
          <DocumentTable searchQuery={searchQuery} filterMode={filterMode} onSelectFile={setSelectedFileId} />
        ) : (
          <div className="h-full">
             <DocumentGrid searchQuery={searchQuery} filterMode={filterMode} onSelectFile={setSelectedFileId} />
          </div>
        )}
      </main>

      {showUploadModal && <UploadModal onClose={() => setShowUploadModal(false)} />}
    </div>
  );
}

export default function DocumentsPage() {
  return (
    <DocumentsProvider>
      <DocumentsPageContent />
    </DocumentsProvider>
  );
}
