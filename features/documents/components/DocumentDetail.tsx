"use client";

import React, { useState } from "react";
import { 
  ArrowLeft, FileText, Download, Share2, Trash2, 
  Image as ImageIcon, FileSpreadsheet, FileCode, File, 
  Folder, Tag, Clock, User, MoreHorizontal, ExternalLink,
  ZoomIn, ZoomOut, Maximize, RotateCw, Edit2, MoveRight
} from "lucide-react";
import { useDocuments } from "../context/DocumentsContext";
import { FileType } from "@/features/documents";
import Dropdown from "@/components/ui/Dropdown";
import UserAvatar from "@/components/common/UserAvatar";
import { getUserDisplayName } from "@/lib/user-identity";

interface DocumentDetailProps {
  fileId: string;
  onClose: () => void;
}

export default function DocumentDetail({ fileId, onClose }: DocumentDetailProps) {
  const { documents, deleteDocuments, updateDocumentEntry, folders } = useDocuments();
  const file = documents.find(f => f.id === fileId);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  if (!file) return null;

  const dateStr = new Date(file.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const createdStr = new Date(file.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  
  const getFileIcon = (type?: FileType | string, size: number = 24) => {
    switch (type) {
      case "image": return <ImageIcon size={size} />;
      case "pdf": return <FileText size={size} />;
      case "spreadsheet": return <FileSpreadsheet size={size} />;
      case "design": return <FileCode size={size} />;
      default: return <File size={size} />;
    }
  };

  const folderOptions = [
    { value: "none", label: "No Folder" },
    ...folders.map(f => ({ value: f.id, label: f.title }))
  ];

  const handleTitleSubmit = () => {
    if (editedTitle.trim() && editedTitle !== file.title) {
      updateDocumentEntry(file.id, { title: editedTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#faf8f6] animate-fade-in overflow-hidden relative">
      {/* HEADER */}
      <header className="px-5 py-3.5 flex items-center justify-between bg-transparent border-b border-black/[0.04] z-10 shrink-0">
        <div className="flex items-center gap-4 min-w-0">
          <button 
            onClick={onClose}
            className="p-1.5 rounded-[6px] hover:bg-black/[0.04] transition-all text-on-surface-variant opacity-70 hover:opacity-100 shrink-0"
          >
            <ArrowLeft size={16} />
          </button>
          
          <div className="w-px h-4 bg-black/[0.08]" />

          <div className="flex items-center gap-3 min-w-0">
            <div className="w-7 h-7 rounded-md bg-black/[0.03] flex items-center justify-center text-on-surface-variant shrink-0">
              {getFileIcon(file.fileType, 14)}
            </div>
            <div className="min-w-0 flex flex-col">
              {isEditingTitle ? (
                <input 
                  autoFocus
                  value={editedTitle}
                  onChange={e => setEditedTitle(e.target.value)}
                  onBlur={handleTitleSubmit}
                  onKeyDown={e => e.key === "Enter" && handleTitleSubmit()}
                  className="font-display text-[14px] font-semibold text-on-surface tracking-tight outline-none border-b border-primary bg-transparent w-full min-w-[200px]"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <h1 
                    onClick={() => {
                      setEditedTitle(file.title);
                      setIsEditingTitle(true);
                    }}
                    className="font-display text-[14px] font-semibold text-on-surface tracking-tight truncate cursor-text hover:bg-black/[0.02] rounded px-1 -ml-1 transition-colors"
                    title="Click to rename"
                  >
                    {file.title}
                  </h1>
                  <span className="font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-50 uppercase tracking-widest px-1.5 py-0.5 rounded bg-black/[0.03]">{file.fileType || 'FILE'}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {file.downloadUrl ? (
             <a 
               href={`${file.downloadUrl}&download=true&filename=${encodeURIComponent(file.fileName || "file")}`}
               target="_blank"
               download
               className="flex items-center justify-center w-8 h-8 rounded-[6px] hover:bg-black/[0.04] text-on-surface-variant transition-all"
               title="Download"
             >
                <Download size={14} />
             </a>
           ) : (
             <button disabled className="flex items-center justify-center w-8 h-8 rounded-[6px] opacity-30 text-on-surface-variant cursor-not-allowed">
                <Download size={14} />
             </button>
           )}
           <button 
             onClick={() => {
               deleteDocuments([file.id]);
               onClose();
             }}
             className="flex items-center justify-center w-8 h-8 rounded-[6px] hover:bg-red-50 text-red-600 transition-all ml-1"
             title="Delete"
           >
             <Trash2 size={14} />
           </button>
        </div>
      </header>

      {/* CONTENT */}
      <div className="flex-1 flex overflow-hidden bg-black/[0.02]">
        
        {/* PREVIEW WORKSPACE */}
        <div className="flex-1 relative flex flex-col items-center justify-center bg-[#F4F4F5] overflow-hidden">
          
          {file.fileType === "image" || file.fileType === "pdf" ? (
            <>
              {/* Document Canvas */}
              <div className="absolute inset-0 overflow-auto flex justify-center py-10 px-4 scroll-smooth">
                <div 
                  className="relative bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04] transition-transform duration-200 origin-top flex items-center justify-center"
                  style={{ 
                    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                    width: file.fileType === "pdf" ? '800px' : 'auto',
                    minHeight: file.fileType === "pdf" ? '1050px' : 'auto',
                    maxWidth: file.fileType === "image" ? '100%' : 'none',
                  }}
                >
                  {file.fileType === "pdf" ? (
                    <iframe 
                      src={`${file.downloadUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} 
                      title={file.title} 
                      className="w-full h-full border-none absolute inset-0" 
                    />
                  ) : (
                    <img src={file.downloadUrl!} alt={file.title} className="max-w-full h-auto object-contain block p-4" />
                  )}
                </div>
              </div>

              {/* Floating Toolbar */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1.5 rounded-full bg-[#1A1A1A]/95 backdrop-blur-md shadow-2xl border border-white/10 text-white/90 z-20">
                <button onClick={() => setZoom(z => Math.max(50, z - 10))} className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Zoom Out">
                  <ZoomOut size={14} />
                </button>
                <div className="px-1 font-display text-[12px] font-medium min-w-[3rem] text-center">{zoom}%</div>
                <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Zoom In">
                  <ZoomIn size={14} />
                </button>
                
                <div className="w-px h-4 bg-white/20 mx-1" />
                
                <button onClick={() => setRotation(r => r + 90)} className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Rotate">
                  <RotateCw size={14} />
                </button>
                <button onClick={() => { setZoom(100); setRotation(0); }} className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Reset View">
                  <Maximize size={14} />
                </button>
                
                <div className="w-px h-4 bg-white/20 mx-1" />
                
                <a href={file.downloadUrl!} target="_blank" className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Open in New Tab">
                  <ExternalLink size={14} />
                </a>
              </div>
            </>
          ) : (
            /* Fallback State */
            <div className="w-full max-w-[420px] bg-white border border-black/[0.04] rounded-xl shadow-sm flex flex-col items-center text-center p-10 m-6">
              <div className="w-14 h-14 rounded-2xl bg-[#F4F4F5] flex items-center justify-center text-on-surface-variant opacity-70 mb-5 shrink-0 border border-black/[0.02]">
                 {getFileIcon(file.fileType, 24)}
              </div>
              <h3 className="font-display text-[14px] font-semibold text-on-surface mb-1.5 truncate max-w-full w-full">{file.fileName}</h3>
              <p className="font-body-md text-[12.5px] text-on-surface-variant opacity-60 mb-6 leading-relaxed px-4">
                Preview is not available for this file type.
              </p>
              {file.downloadUrl && (
                <div className="flex items-center gap-3 w-full px-4">
                  <a 
                    href={file.downloadUrl}
                    target="_blank"
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-black/[0.03] hover:bg-black/[0.06] text-on-surface font-display text-[12px] font-medium transition-all shrink-0"
                  >
                    <ExternalLink size={14} className="opacity-60" /> Open
                  </a>
                  <a 
                    href={`${file.downloadUrl}&download=true&filename=${encodeURIComponent(file.fileName || "file")}`}
                    download
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-primary text-on-primary font-display text-[12px] font-medium shadow-sm hover:-translate-y-px transition-all shrink-0"
                  >
                    <Download size={14} className="opacity-80" /> Download
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <aside className="w-[280px] shrink-0 bg-transparent border-l border-black/[0.04] flex flex-col">
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            
            {/* Properties */}
            <section>
               <h4 className="font-label-caps text-[9px] font-bold text-on-surface-variant opacity-40 uppercase tracking-[0.15em] mb-3">Properties</h4>
               <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                     <div className="flex items-center gap-2 text-on-surface-variant opacity-60 min-w-0">
                       <User size={12} className="shrink-0" />
                       <span className="font-body-sm text-[11px] truncate">Uploaded by</span>
                     </div>
                     <div className="flex min-w-0 max-w-[150px] items-center justify-end gap-1.5">
                       {file.createdBy && <UserAvatar user={file.createdBy} size="sm" />}
                       <div className="font-display text-[11px] font-medium text-on-surface truncate text-right">{getUserDisplayName(file.createdBy, "System")}</div>
                     </div>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                     <div className="flex items-center gap-2 text-on-surface-variant opacity-60 min-w-0">
                       <Clock size={12} className="shrink-0" />
                       <span className="font-body-sm text-[11px] truncate">Created</span>
                     </div>
                     <div className="font-display text-[11px] font-medium text-on-surface truncate text-right">{createdStr}</div>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                     <div className="flex items-center gap-2 text-on-surface-variant opacity-60 min-w-0">
                       <File size={12} className="shrink-0" />
                       <span className="font-body-sm text-[11px] truncate">Size</span>
                     </div>
                     <div className="font-display text-[11px] font-medium text-on-surface truncate text-right">{formatBytes(file.fileSize)}</div>
                  </div>
               </div>
            </section>

            <div className="h-px bg-black/[0.03]" />

            {/* Location & Tags */}
            <section className="space-y-4">
               <div>
                 <h4 className="font-label-caps text-[9px] font-bold text-on-surface-variant opacity-40 uppercase tracking-[0.15em] mb-2.5">Folder</h4>
                 <Dropdown 
                   value={file.folderId || "none"}
                   onChange={(val) => {
                     updateDocumentEntry(file.id, { folderId: val === "none" ? undefined : val });
                   }}
                   options={folderOptions}
                   variant="minimal"
                 />
               </div>

               <div>
                 <h4 className="font-label-caps text-[9px] font-bold text-on-surface-variant opacity-40 uppercase tracking-[0.15em] mb-2.5">Tags</h4>
                 <div className="flex flex-wrap gap-1.5 w-[200px]">
                    {file.tags && file.tags.length > 0 ? (
                      file.tags.map((tag, i) => (
                        <span key={`${tag}-${i}`} className="font-label-caps text-[9px] font-bold text-on-surface-variant opacity-60 bg-black/[0.04] px-1.5 py-0.5 rounded uppercase tracking-widest inline-flex items-center gap-1">
                          <Tag size={8} /> {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-on-surface-variant opacity-40 font-body-sm text-[11px] italic px-1">No tags</span>
                    )}
                 </div>
               </div>
            </section>

            <div className="h-px bg-black/[0.03]" />
          </div>
        </aside>
      </div>
    </div>
  );
}

function formatBytes(bytes?: number, decimals = 1) {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
