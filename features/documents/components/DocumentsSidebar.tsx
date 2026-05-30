"use client";

import React, { useState } from "react";
import { Folder, Plus, Search, Grid, List, MoreHorizontal, Settings2, Trash2 } from "lucide-react";
import { useDocuments } from "../context/DocumentsContext";

export default function DocumentsSidebar() {
  const { folders, activeFolderId, setActiveFolderId, addFolder, removeFolder } = useDocuments();
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      addFolder(newFolderName.trim());
      setNewFolderName("");
      setIsCreating(false);
    }
  };

  return (
    <div className="w-[240px] shrink-0 border-r border-black/[0.06] bg-[#faf8f6] h-full flex flex-col">
      <div className="p-4 flex items-center justify-between border-b border-black/[0.04]">
        <span className="font-label-caps text-[10px] font-bold text-on-surface-variant opacity-50 uppercase tracking-[0.1em]">
          Workspace
        </span>
        <button
          onClick={() => setIsCreating(true)}
          className="p-1 rounded-md hover:bg-black/[0.05] transition-colors"
          title="New Folder"
        >
          <Plus size={14} style={{ color: "var(--color-on-surface-variant)" }} />
        </button>
      </div>

      <div className="p-2 flex-1 overflow-y-auto space-y-0.5">
        <button
          onClick={() => setActiveFolderId(null)}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${
            activeFolderId === null 
              ? "bg-primary/5 text-primary" 
              : "hover:bg-black/[0.03] text-on-surface opacity-80"
          }`}
        >
          <Folder size={15} strokeWidth={activeFolderId === null ? 2 : 1.5} />
          <span className="font-display text-[13px] font-medium">All Documents</span>
        </button>

        <div className="pt-3 pb-1 px-3">
          <span className="font-label-caps text-[9px] font-bold text-on-surface-variant opacity-40 uppercase tracking-[0.1em]">
            Folders
          </span>
        </div>

        {isCreating && (
          <form onSubmit={handleCreate} className="px-2 mb-1">
            <input
              autoFocus
              type="text"
              placeholder="Folder name..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onBlur={() => setIsCreating(false)}
              className="w-full bg-white border border-black/10 rounded-md px-3 py-1.5 font-display text-[12.5px] outline-none focus:border-primary/40"
            />
          </form>
        )}

        {folders.map(folder => (
          <div key={folder.id} className="relative group/folder">
            <button
              onClick={() => setActiveFolderId(folder.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors text-left ${
                activeFolderId === folder.id 
                  ? "bg-primary/5 text-primary" 
                  : "hover:bg-black/[0.03] text-on-surface opacity-80"
              }`}
            >
              <Folder size={15} strokeWidth={activeFolderId === folder.id ? 2 : 1.5} />
              <span className="font-display text-[13px] font-medium truncate flex-1">{folder.title}</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete folder "${folder.title}"?`)) {
                  removeFolder(folder.id);
                }
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md opacity-0 group-hover/folder:opacity-100 hover:bg-black/5 transition-all"
            >
              <Trash2 size={12} className="text-error/70" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
