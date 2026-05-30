"use client";

import React, { useState, useMemo } from "react";
import { DocumentsProvider, useDocuments } from "@/features/documents/context/DocumentsContext";
import DocumentList from "@/features/documents/components/DocumentList";
import DocumentGrid from "@/features/documents/components/DocumentGrid";
import DocumentDetail from "@/features/documents/components/DocumentDetail";
import DocumentsSidebar from "@/features/documents/components/DocumentsSidebar";
import DocumentsToolbar from "@/features/documents/components/DocumentsToolbar";

function DocumentsPageContent() {
  const { viewMode, documents } = useDocuments();
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  const selectedFile = useMemo(() => 
    documents.find(f => f.id === selectedFileId) || null
  , [documents, selectedFileId]);

  if (selectedFile) {
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-surface-container-lowest">
         <DocumentDetail 
           fileId={selectedFile.id} 
           onClose={() => setSelectedFileId(null)} 
         />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden bg-[#faf8f6]">
      <DocumentsToolbar />
      <div className="flex flex-1 min-h-0">
        <DocumentsSidebar />
        <div className="flex-1 overflow-hidden bg-[#faf8f6]">
          {viewMode === "grid" ? (
            <DocumentGrid onSelectFile={setSelectedFileId} />
          ) : (
            <DocumentList onSelectFile={setSelectedFileId} />
          )}
        </div>
      </div>
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
