"use client";

import React, { useState } from "react";
import { useDocuments } from "../context/DocumentsContext";
import { 
  FileText, 
  Image as ImageIcon, 
  FileSpreadsheet, 
  FileCode, 
  File, 
  MoreVertical, 
  Share2, 
  Tag, 
  Layers, 
  Download,
  ChevronRight,
  Trash2
} from "lucide-react";
import { FileType } from "../types";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import ListFooter from "../../components/shared/ListFooter";
import SelectionBar from "../../components/shared/SelectionBar";
import ConfirmationModal from "../../components/shared/ConfirmationModal";

interface Props {
  searchQuery: string;
  filterMode: string;
  onSelectFile: (id: string) => void;
}

function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export default function DocumentTable({ searchQuery, filterMode, onSelectFile }: Props) {
  const { files, deleteFiles } = useDocuments();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const itemsPerPage = 20;

  const filteredFiles = files.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      f.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      f.relatedTo?.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterMode === "all") return matchesSearch;
    if (filterMode === "recent") return matchesSearch; 
    if (filterMode === "shared") return matchesSearch && f.sharedWith.length > 0;
    if (filterMode === "favorites") return matchesSearch; 
    
    return matchesSearch;
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFiles = filteredFiles.slice(startIndex, startIndex + itemsPerPage);

  const getFileIcon = (type: FileType) => {
    switch (type) {
      case "image": return <ImageIcon size={14} className="text-blue-500/60" />;
      case "pdf": return <FileText size={14} className="text-red-500/60" />;
      case "spreadsheet": return <FileSpreadsheet size={14} className="text-green-500/60" />;
      case "document": return <FileText size={14} className="text-blue-600/60" />;
      case "design": return <FileCode size={14} className="text-purple-500/60" />;
      default: return <File size={14} className="text-on-surface-variant opacity-60" />;
    }
  };

  const toggleAll = () => {
    if (selectedIds.size === paginatedFiles.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedFiles.map(f => f.id)));
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

  return (
    <div className="flex flex-col h-full bg-background relative">
      <div className="flex-1 overflow-hidden">
        <Table>
          <TableHeader className="bg-[#faf5f5]/50">
            <TableRow>
              <TableHead className="w-10">
                <div className="flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.size > 0 && selectedIds.size === paginatedFiles.length}
                    onChange={toggleAll}
                    className="w-3.5 h-3.5 rounded-sm border-black/10 accent-primary cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                  />
                </div>
              </TableHead>
              <TableHead className="w-[35%] ml-3">Name / Tags</TableHead>
              <TableHead>Related To</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Last Modified</TableHead>
              <TableHead>Author</TableHead>
              <TableHead className="px-6 py-4 text-right font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedFiles.map((file) => {
              const isSelected = selectedIds.has(file.id);

              return (
                <TableRow 
                  key={file.id}
                  onClick={() => onSelectFile(file.id)}
                  className={`group ${isSelected ? "bg-primary/[0.02]" : ""}`}
                >
                  <TableCell onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={(e) => toggleOne(file.id, e as any)}
                        className={`w-3.5 h-3.5 rounded-sm border-black/10 accent-primary cursor-pointer transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-60"}`}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3 ml-3">
                      <div className="w-7 h-7 rounded-[6px] bg-black/[0.03] flex items-center justify-center shrink-0">
                        {getFileIcon(file.type)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-display font-semibold text-[13px] text-on-surface opacity-90 truncate group-hover:text-primary transition-colors leading-tight">
                          {file.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {file.tags.map(tag => (
                            <span key={tag} className="font-label-caps text-[7.5px] font-bold text-on-surface-variant opacity-60 bg-black/[0.04] px-1 py-0.5 rounded flex items-center gap-0.5 uppercase tracking-[0.05em]">
                              <Tag size={7} /> {tag}
                            </span>
                          ))}
                          {file.sharedWith.length > 0 && <Share2 size={8} className="text-primary opacity-50" />}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {file.relatedTo ? (
                      <div className="flex items-center gap-1.5 font-display text-[11.5px] text-on-surface-variant opacity-60">
                        <Layers size={10} className="opacity-60" />
                        <span className="truncate max-w-[120px]">{file.relatedTo.name}</span>
                      </div>
                    ) : (
                      <span className="font-body-sm text-[11px] text-on-surface-variant opacity-60 italic">— Internal</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="font-display text-[11px] text-on-surface-variant opacity-60">
                      {formatBytes(file.size)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-display text-[11px] text-on-surface-variant opacity-60">
                      {new Date(file.updatedAt).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 font-display text-[11.5px] text-on-surface opacity-70">
                      <div className="w-5 h-5 rounded-full bg-black/5 flex items-center justify-center font-bold text-[8px] text-on-surface-variant">
                        {file.author.charAt(0)}
                      </div>
                      <span className="truncate max-w-[80px]">{file.author}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-5 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-on-surface-variant opacity-40 hover:text-red-500 hover:opacity-100 hover:bg-red-50"
                        onClick={(e) => handleDeleteOne(e, file.id)}
                      >
                        <Trash2 size={13} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-on-surface-variant opacity-60">
                        <Download size={13} />
                      </Button>
                      <ChevronRight size={12} className="text-on-surface-variant opacity-60 ml-1" />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <ListFooter 
        totalItems={filteredFiles.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        label="documents"
      />

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
