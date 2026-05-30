export type AssetStatus = "Available" | "In Use" | "Maintenance" | "Damaged" | "Archived";

export interface AssetActivity {
  id: string;
  type: "assignment" | "status_change" | "note";
  description: string;
  detail?: string;
  timestamp: string;
  authorId?: string;
  author: string;
  email?: string;
  avatar?: string | null;
  initials?: string;
}

export interface AssetComment {
  id: string;
  userId?: string;
  author: string;
  email?: string;
  initials: string;
  avatar?: string | null;
  body: string;
  timestamp: string;
}

export interface Asset {
  id: string;
  name: string; // Asset Name
  category: string; // Electronics, Vehicle, Furniture, Equipment, Property, Tools, Other
  assetCode: string; // Unique tracking code
  status: AssetStatus;
  
  // Optional Fields
  assignedTo?: string[];
  assignedToId?: string;
  location?: string;
  purchaseDate?: string;
  purchaseValue?: number;
  currency?: string;
  warrantyExpiry?: string;
  supplierName?: string;
  imageUrl?: string;
  quantity: number;
  
  activities?: AssetActivity[];
  comments?: AssetComment[];
  
  createdAt: string;
  updatedAt: string;
}
