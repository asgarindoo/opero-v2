"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { FileEntry, Folder, FileStatus, DocumentActivity } from "../types";
import {
  createDocument,
  createFolder,
  deleteDocument,
  listDocuments,
  listFolders,
  updateDocument,
} from "@/features/documents/services/documents.client";

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
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [fileItems, folderItems] = await Promise.all([
          listDocuments<FileEntry>(),
          listFolders<Folder>(),
        ]);
        if (!cancelled) {
          setFiles(fileItems);
          setFolders(folderItems);
        }
      } catch (err) {
        console.error("Failed to load documents:", err);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

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
    createDocument<FileEntry>(newFile)
      .then((created) => setFiles(prev => [created, ...prev]))
      .catch((err) => console.error("Failed to create file:", err));
  }, []);

  const updateFile = useCallback((id: string, updates: Partial<FileEntry>) => {
    setFiles(prev => prev.map(f => {
      if (f.id !== id) return f;
      const updated = { ...f, ...updates, updatedAt: new Date().toISOString() };
      const recordId = (f as { recordId?: string }).recordId ?? f.id;
      updateDocument<FileEntry>(recordId, updated).catch((err) => {
        console.error("Failed to update file:", err);
      });
      return updated;
    }));
  }, []);

  const deleteFiles = useCallback((ids: string[]) => {
    setFiles(prev => prev.filter(f => !ids.includes(f.id)));
    Promise.all(
      ids.map((id) => {
        const recordId = files.find(f => f.id === id) as { recordId?: string } | undefined;
        const targetId = recordId?.recordId ?? id;
        return deleteDocument(targetId).catch((err) => {
          console.error("Failed to delete file:", err);
        });
      })
    ).catch(() => undefined);
  }, [files]);

  const addFolder = useCallback((name: string, parentId?: string) => {
    const newFolder: Folder = {
      id: "fold" + Date.now(),
      name,
      parentId,
      createdAt: new Date().toISOString()
    };
    createFolder<Folder>(newFolder)
      .then((created) => setFolders(prev => [...prev, created]))
      .catch((err) => console.error("Failed to create folder:", err));
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
