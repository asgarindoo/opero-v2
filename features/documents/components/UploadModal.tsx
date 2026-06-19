"use client";

import React, { useState } from "react";
import { useDocuments } from "../context/DocumentsContext";
import { Upload, Tag, Layers, Folder, AlignLeft, ChevronDown, Plus, X, Check } from "lucide-react";
import { FileType } from "@/features/documents";

import { ModalShell } from "@/components/ui/global/modal/ModalShell";
import { ModalHeader } from "@/components/ui/global/modal/ModalHeader";
import { ModalContent } from "@/components/ui/global/modal/ModalContent";
import { ModalFooter } from "@/components/ui/global/modal/ModalFooter";
import { GlobalInput } from "@/components/ui/global/form/GlobalInput";
import Dropdown from "@/components/ui/Dropdown";

function SL({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      {icon}
      <span className="font-label-caps text-[9px] uppercase tracking-[0.12em] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }}>
        {children}
      </span>
    </div>
  );
}

function DocumentTagsInput({ tags, setTags, max = 8 }: { tags: string[]; setTags: (tags: string[]) => void; max?: number }) {
  const [creating, setCreating] = useState(false);
  const [newTag, setNewTag] = useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (creating) inputRef.current?.focus();
  }, [creating]);

  function confirmCreate() {
    const trimmed = newTag.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < max) {
      setTags([...tags, trimmed]);
    }
    setNewTag("");
    setCreating(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      confirmCreate();
    }
    if (e.key === "Escape") {
      setCreating(false);
      setNewTag("");
    }
  }

  function removeTag(tag: string) {
    setTags(tags.filter(t => t !== tag));
  }

  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {tags.map(t => (
        <div key={t} className="relative group flex items-center">
          <div className="flex items-center gap-1 font-label-caps text-[9px] font-bold px-2.5 py-1 rounded-full transition-all max-w-full border bg-zinc-900 text-white border-transparent shadow-sm cursor-default">
            <Check size={8} strokeWidth={3} className="shrink-0" />
            <span className="truncate max-w-[100px] tracking-wide">{t}</span>
          </div>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeTag(t); }}
            className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all z-10 shadow-sm opacity-100 hover:scale-110 bg-zinc-700 text-zinc-300 hover:bg-red-500 hover:text-white"
          >
            <X size={7} strokeWidth={3} />
          </button>
        </div>
      ))}

      {creating ? (
        <div
          className="flex items-center gap-1 px-2 py-1 rounded-full"
          style={{ border: "1.5px solid var(--color-primary)", background: "rgba(0,0,0,0.02)" }}
        >
          <input
            ref={inputRef}
            maxLength={10}
            value={newTag}
            onChange={e => setNewTag(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={confirmCreate}
            placeholder="Tag name..."
            className="bg-transparent outline-none font-label-caps text-[9px] font-semibold"
            style={{ color: "var(--color-on-surface)", width: 80 }}
          />
          <button type="button" onClick={confirmCreate}>
            <Check size={9} strokeWidth={3} style={{ color: "var(--color-primary)" }} />
          </button>
        </div>
      ) : tags.length < max && (
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex items-center gap-1 font-label-caps text-[9px] font-semibold px-2.5 py-1 rounded-full transition-all hover:bg-black/[0.06]"
          style={{ border: "1.5px dashed rgba(0,0,0,0.2)", color: "var(--color-on-surface-variant)", opacity: 0.7 }}
        >
          <Plus size={9} strokeWidth={2.5} />
          New Tag
        </button>
      )}
    </div>
  );
}

export default function UploadModal({ onClose }: { onClose: () => void }) {
  const { addDocument, folders, activeFolderId } = useDocuments();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [folderId, setFolderId] = useState(activeFolderId || "none");
  const [type, setType] = useState<FileType | string>("other");
  const [tags, setTags] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const folderOptions = [
    { value: "none", label: "No Folder" },
    ...folders.map(f => ({ value: f.id, label: f.title }))
  ];

  const ALLOWED_EXTENSIONS = new Set([
    "pdf", "docx", "xlsx", "pptx", "txt", "csv",
    "png", "jpg", "jpeg", "webp", "svg",
    "zip", "rar"
  ]);
  const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB

  const selectFile = (selected: File) => {
    setError(null);
    if (selected.size > MAX_FILE_SIZE) {
      setError("Maximum upload size is 30MB.");
      setFile(null);
      return;
    }

    const ext = selected.name.split(".").pop()?.toLowerCase();
    if (!ext || !ALLOWED_EXTENSIONS.has(ext)) {
      setError("Unsupported file type.");
      setFile(null);
      return;
    }

    setFile(selected);
    setTitle((current) => current || selected.name);

    if (selected.type.startsWith("image/")) setType("image");
    else if (ext === "pdf") setType("pdf");
    else if (["xls", "xlsx", "csv"].includes(ext)) setType("spreadsheet");
    else if (["doc", "docx", "txt"].includes(ext)) setType("document");
    else setType("other");
  };

  const isValid = title.trim() && file && !isUploading;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!isValid) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "documents");

      const res = await fetch("/api/tenant/files", {
        method: "POST",
        body: formData,
      });
      const payload = await res.json();

      if (!res.ok) {
        throw new Error(payload.error ?? "Upload failed.");
      }

      addDocument({
        title,
        description,
        folderId: folderId === "none" ? undefined : folderId,
        fileName: file.name,
        fileType: type,
        fileSize: payload.size ?? file.size,
        tags,
        storagePath: payload.storagePath,
        downloadUrl: payload.downloadUrl,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ModalShell onClose={onClose} maxWidth={480}>
      <ModalHeader title="Upload Document" onClose={onClose} />

      <ModalContent className="db-sidebar space-y-6">
        <div className="space-y-4">
          <GlobalInput
            autoFocus
            required
            maxLength={60}
            placeholder="Project Proposal Q2"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === "Enter" && isValid && handleSubmit()}
            className="font-display font-semibold"
            style={{ fontSize: "16px", background: "transparent", border: "none", padding: "0" }}
          />
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            const dropped = e.dataTransfer.files[0];
            if (dropped) selectFile(dropped);
          }}
          className="relative aspect-[21/9] rounded-[12px] border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all cursor-pointer"
          style={isDragOver ? { borderColor: "var(--color-primary)", background: "rgba(0,0,0,0.03)" } : { borderColor: "rgba(0,0,0,0.1)", background: "rgba(0,0,0,0.01)" }}
        >
          <div className="w-10 h-10 rounded-[10px] bg-white shadow-sm flex items-center justify-center text-on-surface-variant opacity-40">
            <Upload size={18} strokeWidth={1.75} />
          </div>
          <div className="text-center px-4">
            <p className="font-display font-medium text-[13px] text-center px-4 truncate max-w-full" style={{ color: "var(--color-on-surface)" }} title={file ? file.name : ""}>
              {file ? file.name : "Click or drag files to upload"}
            </p>
            <p className="font-body-md text-[11px] mt-1" style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }}>
              {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB • Auto-detected type` : "PDF, DOCX, XLSX, Images up to 30MB"}
            </p>
          </div>
          <input
            type="file"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={(e) => {
              const selected = e.target.files?.[0];
              if (selected) selectFile(selected);
            }}
          />
        </div>

        <div>
          <SL icon={<AlignLeft size={11} strokeWidth={1.75} style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }} />}>
            Description (Optional)
          </SL>
          <textarea
            maxLength={250}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Brief description of the document..."
            className="w-full min-h-[60px] text-[13px] p-3 rounded-[8px] bg-black/[0.02] border border-black/[0.06] outline-none focus:border-primary/30 transition-all font-body-md"
            style={{ color: "var(--color-on-surface)", resize: "none" }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <SL icon={<Folder size={11} strokeWidth={1.75} style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }} />}>
              Folder
            </SL>
            <Dropdown
              value={folderId}
              onChange={setFolderId}
              options={folderOptions}
            />
          </div>
          <div>
            <SL icon={<Tag size={11} strokeWidth={1.75} style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }} />}>
              Tags
            </SL>
            <div className="pt-1.5">
              <DocumentTagsInput tags={tags} setTags={setTags} max={8} />
            </div>
          </div>
        </div>
      </ModalContent>

      <ModalFooter summary={
        error ? (
          <span className="text-red-600 font-display text-[11px] font-medium bg-red-50/50 border border-red-100 px-2.5 py-1 rounded-md">
            {error}
          </span>
        ) : null
      }>
        <button type="button" onClick={onClose} className="font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold px-3.5 py-2 rounded-[6px] hover:bg-black/[0.05] transition-colors" style={{ color: "var(--color-on-surface-variant)", opacity: 0.65 }}>
          Cancel
        </button>
        <button type="button" onClick={handleSubmit} disabled={!isValid} className="font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold px-4 py-2 rounded-[6px] disabled:opacity-30 hover:-translate-y-px transition-all flex items-center justify-center min-w-[100px]" style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
          {isUploading ? (
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : "Start Upload"}
        </button>
      </ModalFooter>
    </ModalShell>
  );
}
