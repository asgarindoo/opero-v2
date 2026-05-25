export type AssetStatus = "Available" | "In Use" | "Maintenance" | "Damaged" | "Archived";

export interface AssetActivity {
  id: string;
  type: "assignment" | "status_change" | "note";
  description: string;
  timestamp: string;
  author: string;
}

export interface Asset {
  id: string;
  name: string; // Asset Name
  category: string; // Electronics, Vehicle, Furniture, Equipment, Property, Tools, Other
  assetCode: string; // Unique tracking code
  status: AssetStatus;
  
  // Optional Fields
  assignedTo?: string;
  assignedToId?: string;
  location?: string;
  purchaseDate?: string;
  purchaseValue?: number;
  warrantyExpiry?: string;
  supplierName?: string;
  notes?: string;
  imageUrl?: string;
  
  activities?: AssetActivity[];
  
  createdAt: string;
  updatedAt: string;
}
