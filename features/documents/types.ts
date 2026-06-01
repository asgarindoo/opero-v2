export type FileType = "image" | "pdf" | "spreadsheet" | "document" | "design" | "other";
export type FileStatus = "Active" | "Archived" | "Draft";

export interface DocumentEntry {
  id: string;
  title: string;          // From DB Model
  status: string;         // From DB Model
  createdAt: string;      // From DB Model
  updatedAt: string;      // From DB Model
  
  // From DB include
  createdBy?: { id: string; name: string; email?: string | null; image: string | null };
  
  // Explicit document columns
  description?: string;
  folderId?: string;
  storagePath?: string;
  fileUrl?: string;
  downloadUrl?: string;
  fileName?: string;
  fileType?: FileType | string;
  fileSize?: number;
  tags?: string[];
  uploadedById?: string;
}

export interface Folder {
  id: string;
  title: string;          // From DB Model
  status: string;         // From DB Model
  createdAt: string;      // From DB Model
  updatedAt: string;      // From DB Model

  // From DB include
  createdBy?: { id: string; name: string; email?: string | null; image: string | null };

  // Folder metadata
  parentId?: string;
  description?: string;
}
