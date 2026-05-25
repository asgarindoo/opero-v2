"use client";

import React, { useState } from "react";
import { useDocuments } from "../context/DocumentsContext";
import {
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  FileCode,
  File,
  Tag,
  Download,
  ChevronRight,
  Trash2
} from "lucide-react";
import { FileType } from "@/features/documents";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import ListFooter from "@/components/common/ListFooter";
import SelectionBar from "@/components/common/SelectionBar";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { EmptyState } from "@/components/common/DataState";

interface Props {
  onSelectFile: (id: string) => void;
}

function formatBytes(bytes?: number, decimals = 1) {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export default function DocumentList({ onSelectFile }: Props) {
  const { documents, deleteDocuments, activeFolderId, searchQuery } = useDocuments();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const itemsPerPage = 20;

  const filteredDocs = documents.filter(d => {
    if (activeFolderId && d.folderId !== activeFolderId) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesTitle = d.title?.toLowerCase().includes(q);
      const matchesFileName = d.fileName?.toLowerCase().includes(q);
      const matchesTag = d.tags?.some(t => t.toLowerCase().includes(q));
      if (!matchesTitle && !matchesFileName && !matchesTag) return false;
    }

    return true;
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDocs = filteredDocs.slice(startIndex, startIndex + itemsPerPage);

  const getFileIcon = (type?: FileType | string) => {
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
    if (selectedIds.size === paginatedDocs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedDocs.map(f => f.id)));
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
      deleteDocuments([fileToDelete]);
      setFileToDelete(null);
    } else {
      deleteDocuments(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
    setIsDeleteModalOpen(false);
  };

  if (filteredDocs.length === 0) {
    return (
      <EmptyState
        icon="folder"
        title="No documents here"
        description="Upload a document or create a new one to get started."
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-surface-container-lowest relative">
      <div className="flex-1 overflow-auto p-4">
        <Table className="min-w-[800px]">
          <TableHeader className="bg-black/[0.02]">
            <TableRow>
              <TableHead className="w-10">
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.size > 0 && selectedIds.size === paginatedDocs.length}
                    onChange={toggleAll}
                    className="w-3.5 h-3.5 rounded-sm border-black/10 accent-primary cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                  />
                </div>
              </TableHead>
              <TableHead className="w-[35%] ml-3">Name / Tags</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead>Author</TableHead>
              <TableHead className="w-28 px-4"><div className="w-full text-center">Actions</div></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedDocs.map((doc) => {
              const isSelected = selectedIds.has(doc.id);

              return (
                <TableRow
                  key={doc.id}
                  onClick={() => onSelectFile(doc.id)}
                  className={`group ${isSelected ? "bg-primary/[0.02]" : ""}`}
                >
                  <TableCell onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => toggleOne(doc.id, e as any)}
                        className={`w-3.5 h-3.5 rounded-sm border-black/10 accent-primary cursor-pointer transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-60"}`}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[0px]">
                    <div className="flex items-center gap-3 ml-3">
                      <div className="w-7 h-7 rounded-[6px] bg-black/[0.03] flex items-center justify-center shrink-0">
                        {getFileIcon(doc.fileType)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-display font-semibold text-[13px] text-on-surface opacity-90 truncate w-full group-hover:text-primary transition-colors leading-tight block">
                          {doc.title}
                        </p>
                        {doc.tags && doc.tags.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-0.5 w-full truncate block">
                            {doc.tags.map((tag, i) => (
                              <span key={`${tag}-${i}`} className="font-label-caps text-[7.5px] font-bold text-on-surface-variant opacity-60 bg-black/[0.04] px-1 py-0.5 rounded flex items-center gap-0.5 uppercase tracking-[0.05em] inline-flex">
                                <Tag size={7} /> {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[0px]">
                    <span className="font-label-caps text-[9px] text-on-surface-variant opacity-60 truncate block w-full uppercase tracking-widest">
                      {doc.fileName ? doc.fileName.split('.').pop() : 'BIN'}
                    </span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell max-w-[0px]">
                    <span className="font-display text-[11.5px] text-on-surface-variant opacity-60 truncate block w-full">
                      {formatBytes(doc.fileSize)}
                    </span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell max-w-[0px]">
                    <span className="font-display text-[11.5px] text-on-surface-variant opacity-60 truncate block w-full">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell max-w-[0px]">
                    <div className="flex items-center gap-1.5 font-display text-[11.5px] text-on-surface opacity-70 w-full">
                      {doc.createdBy && (
                        <div className="w-5 h-5 shrink-0 rounded-full bg-black/5 flex items-center justify-center font-bold text-[8px] text-on-surface-variant">
                          {doc.createdBy.name.charAt(0)}
                        </div>
                      )}
                      <span className="truncate block w-full">{doc.createdBy?.name || "System"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 text-center">
                    <div className="w-full flex justify-center items-center gap-0.5 opacity-30 group-hover:opacity-100 transition-all">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6.5 w-6.5 text-on-surface-variant hover:text-red-500 hover:bg-red-50 transition-all"
                        onClick={(e) => handleDeleteOne(e, doc.id)}
                      >
                        <Trash2 size={12} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6.5 w-6.5 text-on-surface-variant hover:text-on-surface hover:bg-black/5 transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (doc.downloadUrl) {
                            const url = `${doc.downloadUrl}&download=true&filename=${encodeURIComponent(doc.fileName || "file")}`;
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = doc.fileName || "file";
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                          }
                        }}
                      >
                        <Download size={12} />
                      </Button>
                      <div className="ml-1 opacity-60">
                        <ChevronRight size={13} />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <ListFooter
        totalItems={filteredDocs.length}
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
