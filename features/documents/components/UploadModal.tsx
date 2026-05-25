"use client";

import React, { useState } from "react";
import { useDocuments } from "../context/DocumentsContext";
import { Upload, Tag, Layers, Lock, ChevronDown, Check } from "lucide-react";
import { FileType } from "@/features/documents";

import { ModalShell } from "@/components/ui/global/modal/ModalShell";
import { ModalHeader } from "@/components/ui/global/modal/ModalHeader";
import { ModalContent } from "@/components/ui/global/modal/ModalContent";
import { ModalFooter } from "@/components/ui/global/modal/ModalFooter";
import { GlobalInput } from "@/components/ui/global/form/GlobalInput";
import Dropdown from "@/components/ui/Dropdown";

/* ── Section label ───────────────────────────────────────────────────────── */
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

export default function UploadModal({ onClose }: { onClose: () => void }) {
  const { addFile } = useDocuments();
  const [name, setName] = useState("");
  const [type, setType] = useState<FileType>("other");
  const [tags, setTags] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Extra metadata for looks matching other modules
  const [privacy, setPrivacy] = useState("internal");

  const selectFile = (selected: File) => {
    setFile(selected);
    setError(null);
    setName((current) => current || selected.name);
    const ext = selected.name.split(".").pop()?.toLowerCase();
    if (selected.type.startsWith("image/")) setType("image");
    else if (ext === "pdf") setType("pdf");
    else if (["xls", "xlsx", "csv"].includes(ext ?? "")) setType("spreadsheet");
    else if (["doc", "docx"].includes(ext ?? "")) setType("document");
  };

  const isValid = name.trim() && file && !isUploading;

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

      addFile({
        name,
        type,
        extension: file.name.split(".").pop() || "bin",
        size: payload.size ?? file.size,
        tags: tags.split(",").map(t => t.trim()).filter(t => t),
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
            placeholder="Document Name (e.g. Sales Report Q1)…"
            value={name}
            onChange={e => setName(e.target.value)}
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
              {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "PDF, DOCX, XLSX, Images up to 30MB"}
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <SL>File Type</SL>
            <Dropdown
              value={type}
              onChange={(val) => setType(val as FileType)}
              options={[
                { value: "other", label: "General" },
                { value: "pdf", label: "PDF Document" },
                { value: "document", label: "Office Document" },
                { value: "spreadsheet", label: "Spreadsheet" },
                { value: "image", label: "Image / Media" },
                { value: "design", label: "Design Asset" },
              ]}
            />
          </div>
          <div>
            <SL icon={<Tag size={11} strokeWidth={1.75} style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }} />}>
              Tags
            </SL>
            <GlobalInput
              maxLength={40}
              placeholder="finance, invoice..."
              value={tags}
              onChange={e => setTags(e.target.value)}
            />
          </div>
        </div>

        <div style={{ height: 1, background: "rgba(0,0,0,0.06)" }} />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <SL icon={<Lock size={11} strokeWidth={1.75} style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }} />}>
              Privacy
            </SL>
            <Dropdown
              value={privacy}
              onChange={setPrivacy}
              options={[
                { value: "internal", label: "Internal Only" },
                { value: "public", label: "Public Link" },
                { value: "restricted", label: "Restricted" },
              ]}
            />
          </div>
          <div>
            <SL icon={<Layers size={11} strokeWidth={1.75} style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }} />}>
              Link Entity
            </SL>
            <button className="w-full flex items-center justify-between px-3 py-1.5 rounded-[6px] bg-black/[0.02] border border-black/[0.09] hover:bg-black/[0.04] transition-all font-body-md text-[12px] text-on-surface-variant opacity-70">
              <span className="truncate">Select module...</span>
              <ChevronDown size={14} className="shrink-0 opacity-50" />
            </button>
          </div>
        </div>
      </ModalContent>

      <ModalFooter summary={error}>
        <button type="button" onClick={onClose} className="font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold px-3.5 py-2 rounded-[6px] hover:bg-black/[0.05] transition-colors" style={{ color: "var(--color-on-surface-variant)", opacity: 0.65 }}>
          Cancel
        </button>
        <button type="button" onClick={handleSubmit} disabled={!isValid} className="font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold px-4 py-2 rounded-[6px] disabled:opacity-30 hover:-translate-y-px transition-all" style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
          {isUploading ? "Uploading..." : "Start Upload"}
        </button>
      </ModalFooter>
    </ModalShell>
  );
}
