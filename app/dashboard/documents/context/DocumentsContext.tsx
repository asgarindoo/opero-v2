"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { FileEntry, Folder, FileStatus, DocumentActivity } from "../types";

const MOCK_FILES: FileEntry[] = [
  {
    id: "f1",
    name: "Q2 Financial Report.pdf",
    type: "pdf",
    extension: "pdf",
    size: 2400000,
    status: "Active",
    tags: ["Finance", "Report"],
    relatedTo: { type: "Invoice", name: "INV-2024-001", id: "inv1" },
    versions: [{ id: "v1", version: "1.0", updatedAt: "2024-05-10T10:00:00Z", author: "You", size: 2400000 }],
    activities: [
      { id: "act1", type: "upload", description: "Uploaded initial version", timestamp: "2024-05-10T10:00:00Z", author: "You" }
    ],
    notes: "Final version for board review.",
    sharedWith: ["Alice Smith", "Sarah Connor"],
    createdAt: "2024-05-10T10:00:00Z",
    updatedAt: "2024-05-10T10:00:00Z",
    author: "You"
  },
  {
    id: "f2",
    name: "Product Design Assets.zip",
    type: "design",
    extension: "zip",
    size: 156000000,
    status: "Active",
    tags: ["Branding", "Assets"],
    relatedTo: { type: "Sale", name: "Acme Product Launch", id: "s1" },
    versions: [{ id: "v2", version: "1.0", updatedAt: "2024-05-08T14:00:00Z", author: "Sarah Connor", size: 156000000 }],
    activities: [],
    notes: "Includes logos and font files.",
    sharedWith: ["Design Team"],
    createdAt: "2024-05-08T14:00:00Z",
    updatedAt: "2024-05-08T14:00:00Z",
    author: "Sarah Connor"
  },
  {
    id: "f3",
    name: "Employee Handbook.docx",
    type: "document",
    extension: "docx",
    size: 1200000,
    status: "Active",
    tags: ["HR", "Internal"],
    versions: [{ id: "v3", version: "2.1", updatedAt: "2024-05-05T09:00:00Z", author: "You", size: 1200000 }],
    activities: [
      { id: "act2", type: "edit", description: "Updated benefits section", timestamp: "2024-05-05T09:00:00Z", author: "You" }
    ],
    notes: "Latest HR guidelines.",
    sharedWith: ["All Staff"],
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-05-05T09:00:00Z",
    author: "You"
  }
];

const MOCK_FOLDERS: Folder[] = [
  { id: "fold1", name: "Finance Records", createdAt: "2024-01-01T00:00:00Z" },
  { id: "fold2", name: "Project Alpha Assets", createdAt: "2024-03-01T00:00:00Z" }
];

interface DocumentsContextType {
  files: FileEntry[];
  folders: Folder[];
  addFile: (file: Partial<FileEntry>) => void;
  updateFile: (id: string, updates: Partial<FileEntry>) => void;
  deleteFiles: (ids: string[]) => void;
  addFolder: (name: string, parentId?: string) => void;
}

const DocumentsContext = createContext<DocumentsContextType | undefined>(undefined);

export function DocumentsProvider({ children }: { children: React.ReactNode }) {
  const [files, setFiles] = useState<FileEntry[]>(MOCK_FILES);
  const [folders, setFolders] = useState<Folder[]>(MOCK_FOLDERS);

  const addFile = useCallback((partial: Partial<FileEntry>) => {
    const newFile: FileEntry = {
      id: "f" + Date.now(),
      name: partial.name || "Untitled File",
      type: partial.type || "other",
      extension: partial.extension || "bin",
      size: partial.size || 0,
      status: "Active",
      tags: partial.tags || [],
      versions: [{ id: "v" + Date.now(), version: "1.0", updatedAt: new Date().toISOString(), author: "You", size: partial.size || 0 }],
      activities: [{ id: "act" + Date.now(), type: "upload", description: "Uploaded file", timestamp: new Date().toISOString(), author: "You" }],
      notes: "",
      sharedWith: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: "You",
      ...partial
    };
    setFiles(prev => [newFile, ...prev]);
  }, []);

  const updateFile = useCallback((id: string, updates: Partial<FileEntry>) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f));
  }, []);

  const deleteFiles = useCallback((ids: string[]) => {
    setFiles(prev => prev.filter(f => !ids.includes(f.id)));
  }, []);

  const addFolder = useCallback((name: string, parentId?: string) => {
    const newFolder: Folder = {
      id: "fold" + Date.now(),
      name,
      parentId,
      createdAt: new Date().toISOString()
    };
    setFolders(prev => [...prev, newFolder]);
  }, []);

  const value = useMemo(() => ({
    files,
    folders,
    addFile,
    updateFile,
    deleteFiles,
    addFolder
  }), [files, folders, addFile, updateFile, deleteFiles, addFolder]);

  return <DocumentsContext.Provider value={value}>{children}</DocumentsContext.Provider>;
}

export function useDocuments() {
  const context = useContext(DocumentsContext);
  if (context === undefined) {
    throw new Error("useDocuments must be used within a DocumentsProvider");
  }
  return context;
}
