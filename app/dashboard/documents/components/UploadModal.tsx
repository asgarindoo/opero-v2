import React, { useState } from "react";
import { useDocuments } from "../context/DocumentsContext";
import { X, Upload, FileText, Tag, Layers, Lock, ShieldCheck, ChevronDown } from "lucide-react";
import { FileType } from "../types";

export default function UploadModal({ onClose }: { onClose: () => void }) {
  const { addFile } = useDocuments();
  const [name, setName] = useState("");
  const [type, setType] = useState<FileType>("other");
  const [tags, setTags] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addFile({
      name,
      type,
      extension: name.split(".").pop() || "bin",
      size: Math.floor(Math.random() * 5000000) + 100000,
      tags: tags.split(",").map(t => t.trim()).filter(t => t),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/10 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-[480px] bg-surface-container-lowest rounded-2xl shadow-2xl animate-scale-in border border-black/5 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/[0.04]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Upload size={14} />
            </div>
            <h2 className="font-display font-semibold text-[15px] text-on-surface">Upload Documents</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-on-surface-variant opacity-50 hover:opacity-100 hover:bg-black/5 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 max-h-[75vh] overflow-y-auto px-6 py-6 space-y-6">
          
          {/* Dropzone */}
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragOver(false); }}
            className={`aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all ${isDragOver ? "border-primary bg-primary/5" : "border-black/5 bg-surface-container-low"}`}
          >
             <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-on-surface-variant opacity-40">
                <Upload size={20} />
             </div>
             <div className="text-center">
                <p className="font-display font-bold text-[13px] text-on-surface opacity-80">Click or drag files to upload</p>
                <p className="font-body-sm text-[11px] text-on-surface-variant opacity-40 mt-1">PDF, DOCX, XLSX, Images up to 50MB</p>
             </div>
             <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block font-label-caps text-[9px] text-on-surface-variant opacity-60 mb-1.5 uppercase tracking-wider">Document Name</label>
              <input 
                type="text" autoFocus required value={name} onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary/40 outline-none transition-all font-body-sm text-[12.5px] text-on-surface"
                placeholder="e.g. Sales Report Q1.pdf"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-label-caps text-[9px] text-on-surface-variant opacity-60 mb-1.5 uppercase tracking-wider">File Type</label>
                <select 
                  value={type} onChange={e => setType(e.target.value as FileType)}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-surface-container-low font-body-sm text-[12.5px] text-on-surface appearance-none"
                >
                  <option value="other">General</option>
                  <option value="pdf">PDF Document</option>
                  <option value="document">Office Document</option>
                  <option value="spreadsheet">Spreadsheet</option>
                  <option value="image">Image / Media</option>
                  <option value="design">Design Asset</option>
                </select>
              </div>
              <div>
                <label className="block font-label-caps text-[9px] text-on-surface-variant opacity-60 mb-1.5 uppercase tracking-wider">Tags (comma separated)</label>
                <div className="relative flex items-center">
                  <Tag size={13} className="absolute left-3 text-on-surface-variant opacity-40" />
                  <input 
                    type="text" value={tags} onChange={e => setTags(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-black/10 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary/40 outline-none transition-all font-body-sm text-[12.5px] text-on-surface"
                    placeholder="finance, invoice..."
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-low/50 border border-black/[0.03] space-y-4">
            <h3 className="font-display font-medium text-[12px] text-on-surface opacity-80">Visibility & Links</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-label-caps text-[8.5px] text-on-surface-variant opacity-60 mb-1.5 uppercase tracking-wider">Privacy</label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container-lowest border border-black/5">
                   <Lock size={12} className="text-on-surface-variant opacity-40" />
                   <span className="font-body-sm text-[11px] text-on-surface opacity-70">Internal Only</span>
                   <ChevronDown size={10} className="ml-auto opacity-40" />
                </div>
              </div>
              <div>
                <label className="block font-label-caps text-[8.5px] text-on-surface-variant opacity-60 mb-1.5 uppercase tracking-wider">Link Entity</label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container-lowest border border-black/5">
                   <Layers size={12} className="text-on-surface-variant opacity-40" />
                   <span className="font-body-sm text-[11px] text-on-surface opacity-30">Select module...</span>
                </div>
              </div>
            </div>
          </div>
        </form>

        <div className="px-6 py-4 bg-surface-container-low border-t border-black/[0.04] flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg font-label-caps text-[10px] font-bold tracking-wide text-on-surface-variant hover:bg-black/5 transition-colors">CANCEL</button>
          <button 
            type="submit" onClick={handleSubmit} disabled={!name.trim()}
            className="px-6 py-2 rounded-lg font-label-caps text-[10px] font-bold tracking-wide bg-primary text-on-primary hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all disabled:opacity-50"
          >
            START UPLOAD
          </button>
        </div>
      </div>
    </div>
  );
}
