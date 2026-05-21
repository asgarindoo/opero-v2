"use client";

import React, { useState } from "react";
import { useDocuments } from "../context/DocumentsContext";
import { 
  FileText, 
  Image as ImageIcon, 
  FileSpreadsheet, 
  FileCode, 
  File, 
  MoreHorizontal, 
  Download, 
  Share2, 
  Star,
  Trash2
} from "lucide-react";
import { FileType } from "@/features/documents";
import SelectionBar from "@/components/common/SelectionBar";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { EmptyState } from "@/components/common/DataState";

interface Props {
  searchQuery: string;
  filterMode: string;
  onSelectFile: (id: string) => void;
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export default function DocumentGrid({ searchQuery, filterMode, onSelectFile }: Props) {
  const { files, deleteFiles } = useDocuments();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);

  const filteredFiles = files.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterMode === "all") return matchesSearch;
    if (filterMode === "shared") return matchesSearch && f.sharedWith.length > 0;
    return matchesSearch;
  });

  const getFileIcon = (type: FileType) => {
    switch (type) {
      case "image": return <ImageIcon size={20} className="text-blue-500/60" />;
      case "pdf": return <FileText size={20} className="text-red-500/60" />;
      case "spreadsheet": return <FileSpreadsheet size={20} className="text-green-500/60" />;
      case "design": return <FileCode size={20} className="text-purple-500/60" />;
      default: return <File size={20} className="text-on-surface-variant opacity-60" />;
    }
  };

  const toggleOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleDeleteOne = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFileToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (fileToDelete) {
      deleteFiles([fileToDelete]);
      setFileToDelete(null);
    } else {
      deleteFiles(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
    setIsDeleteModalOpen(false);
  };

  if (filteredFiles.length === 0) {
    return (
      <EmptyState
        icon="folder"
        title="No documents found"
        description="Try adjusting your filters or search query."
      />
    );
  }

  return (
    <div className="p-6 overflow-y-auto h-full relative db-sidebar">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
        {filteredFiles.map(file => {
          const isSelected = selectedIds.has(file.id);

          return (
            <div 
              key={file.id}
              onClick={() => onSelectFile(file.id)}
              className={`group relative flex flex-col bg-white rounded-xl border transition-all duration-300 cursor-pointer animate-fade-in ${
                isSelected 
                  ? "border-primary shadow-[0_4px_12px_rgba(var(--primary-rgb),0.08)] ring-1 ring-primary/20" 
                  : "border-black/[0.04] hover:border-black/[0.1] hover:shadow-[0_8px_20px_rgba(0,0,0,0.03)]"
              }`}
            >
              {/* Thumbnail Container */}
              <div className="aspect-[4/3] bg-[#fafafa] flex items-center justify-center relative overflow-hidden rounded-t-xl border-b border-black/[0.02]">
                 <div className="transition-transform duration-500 group-hover:scale-110 opacity-60 group-hover:opacity-100">
                   {getFileIcon(file.type)}
                 </div>
                 
                 {/* Selection Checkbox - reveal on hover */}
                 <div 
                  className={`absolute top-3 left-3 transition-all duration-200 ${isSelected ? "opacity-100 scale-100" : "opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100"}`}
                  onClick={e => e.stopPropagation()}
                 >
                   <input 
                    type="checkbox" 
                    checked={isSelected}
                    onChange={(e) => toggleOne(file.id, e as any)}
                    className="w-4 h-4 rounded-[4px] border-black/10 accent-primary cursor-pointer shadow-sm" 
                   />
                 </div>

                 {/* Quick Actions - reveal on hover */}
                 <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200">
                    <button 
                      onClick={(e) => handleDeleteOne(e, file.id)}
                      className="p-1.5 rounded-lg bg-white/90 backdrop-blur shadow-sm text-on-surface-variant hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                    <button className="p-1.5 rounded-lg bg-white/90 backdrop-blur shadow-sm text-on-surface-variant hover:text-primary transition-colors">
                      <Star size={12} />
                    </button>
                 </div>
              </div>

              {/* Content / Metadata */}
              <div className="p-3">
                 <div className="flex items-start justify-between gap-2">
                   <h4 className="font-display font-semibold text-[12.5px] text-on-surface opacity-90 truncate flex-1 leading-tight group-hover:text-primary transition-colors">
                     {file.name}
                   </h4>
                   <button className="shrink-0 text-on-surface-variant opacity-60 hover:opacity-100 transition-opacity">
                     <MoreHorizontal size={12} />
                   </button>
                 </div>
                 <div className="flex items-center justify-between mt-3">
                   <div className="flex flex-col gap-0.5">
                      <span className="font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest leading-none">
                        {file.extension}
                      </span>
                      <span className="font-display text-[9.5px] text-on-surface-variant opacity-60 font-medium leading-none">
                        {formatBytes(file.size)}
                      </span>
                   </div>
                   <div className="w-5 h-5 rounded-full bg-black/5 flex items-center justify-center font-bold text-[7px] text-on-surface-variant opacity-60 border border-black/[0.02] shadow-sm">
                      {file.author.charAt(0)}
                   </div>
                 </div>
              </div>
            </div>
          );
        })}
      </div>

      <SelectionBar 
        count={selectedIds.size}
        onClear={() => setSelectedIds(new Set())}
        onDelete={() => setIsDeleteModalOpen(true)}
        label="documents"
      />

      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setFileToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title={fileToDelete ? "Delete Document" : "Delete Selected Documents"}
        description={fileToDelete ? "Are you sure you want to delete this document? This action will permanently remove it from your storage." : `Are you sure you want to delete ${selectedIds.size} selected documents? This action cannot be undone.`}
      />
    </div>
  );
}
