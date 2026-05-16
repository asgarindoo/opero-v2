export type AssetStatus = "Active" | "In Use" | "Maintenance" | "Reserved" | "Damaged" | "Archived";

export interface AssetActivity {
  id: string;
  type: "assignment" | "maintenance" | "note" | "status_change";
  description: string;
  timestamp: string;
  author: string;
}

export interface MaintenanceRecord {
  id: string;
  date: string;
  description: string;
  technician: string;
  cost?: number;
}

export interface Asset {
  id: string;
  name: string;
  category: string;
  assetCode: string; // SKU / Serial Number
  status: AssetStatus;
  assignedTo?: string; // Staff name
  assignedToId?: string;
  department?: string;
  location?: string;
  purchaseDate?: string;
  purchaseValue?: number;
  warrantyExpiry?: string;
  supplierName?: string;
  maintenanceHistory: MaintenanceRecord[];
  activities: AssetActivity[];
  notes: string;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
}
