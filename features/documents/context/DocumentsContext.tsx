"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { DocumentEntry, Folder } from "@/features/documents";
import {
  createDocument,
  createFolder,
  deleteDocument,
  deleteFolder,
  listDocuments,
  listFolders,
  updateDocument,
  updateFolder,
} from "@/features/documents/services/documents.client";

interface DocumentsContextType {
  documents: DocumentEntry[];
  folders: Folder[];
  activeFolderId: string | null;
  setActiveFolderId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;

  addDocument: (doc: Partial<DocumentEntry>) => void;
  updateDocumentEntry: (id: string, updates: Partial<DocumentEntry>) => void;
  deleteDocuments: (ids: string[]) => void;
  
  addFolder: (name: string, parentId?: string) => void;
  renameFolder: (id: string, newName: string) => void;
  removeFolder: (id: string) => void;
}

const DocumentsContext = createContext<DocumentsContextType | undefined>(undefined);

export function DocumentsProvider({ children }: { children: React.ReactNode }) {
  const [documents, setDocuments] = useState<DocumentEntry[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [docItems, folderItems] = await Promise.all([
          listDocuments<DocumentEntry>(),
          listFolders<Folder>(),
        ]);
        if (!cancelled) {
          setDocuments(docItems);
          setFolders(folderItems);
        }
      } catch (err) {
        console.error("Failed to load documents workspace:", err);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const addDocument = useCallback((partial: Partial<DocumentEntry>) => {
    const newDoc: DocumentEntry = {
      id: partial.id || "doc-" + Date.now(),
      title: partial.title || partial.fileName || "Untitled Document",
      status: "Active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      folderId: activeFolderId || undefined,
      ...partial
    };
    
    // Optimistic update
    setDocuments(prev => [newDoc, ...prev]);

    createDocument<DocumentEntry>(newDoc)
      .then((created) => {
        setDocuments(prev => prev.map(d => d.id === newDoc.id ? created : d));
      })
      .catch((err) => {
        console.error("Failed to create document:", err);
        setDocuments(prev => prev.filter(d => d.id !== newDoc.id));
      });
  }, [activeFolderId]);

  const updateDocumentEntry = useCallback((id: string, updates: Partial<DocumentEntry>) => {
    setDocuments(prev => prev.map(d => {
      if (d.id !== id) return d;
      const updated = { ...d, ...updates, updatedAt: new Date().toISOString() };
      
      const recordId = (d as any).recordId ?? d.id;
      updateDocument<DocumentEntry>(recordId, updated).catch((err) => {
        console.error("Failed to update document:", err);
      });
      return updated;
    }));
  }, []);

  const deleteDocuments = useCallback((ids: string[]) => {
    setDocuments(prev => prev.filter(d => !ids.includes(d.id)));
    Promise.all(
      ids.map((id) => {
        return deleteDocument(id).catch((err) => {
          console.error("Failed to delete document:", err);
        });
      })
    ).catch(() => undefined);
  }, []);

  const addFolderItem = useCallback((name: string, parentId?: string) => {
    const newFolder: Folder = {
      id: "fold-" + Date.now(),
      title: name,
      status: "Active",
      parentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setFolders(prev => [...prev, newFolder]);

    createFolder<Folder>(newFolder)
      .then((created) => {
        setFolders(prev => prev.map(f => f.id === newFolder.id ? created : f));
      })
      .catch((err) => {
        console.error("Failed to create folder:", err);
        setFolders(prev => prev.filter(f => f.id !== newFolder.id));
      });
  }, []);

  const renameFolder = useCallback((id: string, newName: string) => {
    setFolders(prev => prev.map(f => {
      if (f.id !== id) return f;
      const updated = { ...f, title: newName };
      updateFolder<Folder>(id, { title: newName }).catch(err => console.error(err));
      return updated;
    }));
  }, []);

  const removeFolder = useCallback((id: string) => {
    setFolders(prev => prev.filter(f => f.id !== id));
    if (activeFolderId === id) setActiveFolderId(null);
    deleteFolder(id).catch(err => console.error(err));
  }, [activeFolderId]);

  const value = useMemo(() => ({
    documents,
    folders,
    activeFolderId,
    setActiveFolderId,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    addDocument,
    updateDocumentEntry,
    deleteDocuments,
    addFolder: addFolderItem,
    renameFolder,
    removeFolder
  }), [documents, folders, activeFolderId, searchQuery, viewMode, addDocument, updateDocumentEntry, deleteDocuments, addFolderItem, renameFolder, removeFolder]);

  return <DocumentsContext.Provider value={value}>{children}</DocumentsContext.Provider>;
}

export function useDocuments() {
  const context = useContext(DocumentsContext);
  if (context === undefined) {
    throw new Error("useDocuments must be used within a DocumentsProvider");
  }
  return context;
}
