export type FileType = "image" | "pdf" | "spreadsheet" | "document" | "design" | "other";
export type FileStatus = "Active" | "Archived" | "Draft";

export interface FileVersion {
  id: string;
  version: string;
  updatedAt: string;
  author: string;
  size: number;
}

export interface DocumentActivity {
  id: string;
  type: "upload" | "view" | "edit" | "share" | "note";
  description: string;
  timestamp: string;
  author: string;
}

export interface FileEntry {
  id: string;
  name: string;
  type: FileType;
  extension: string;
  size: number;
  status: FileStatus;
  folderId?: string;
  tags: string[];
  relatedTo?: {
    type: "Contact" | "Sale" | "Invoice" | "Asset";
    name: string;
    id: string;
  };
  storagePath?: string;
  downloadUrl?: string;
  thumbnailUrl?: string;
  versions: FileVersion[];
  activities: DocumentActivity[];
  notes: string;
  sharedWith: string[]; // List of names or emails
  createdAt: string;
  updatedAt: string;
  author: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  createdAt: string;
}
