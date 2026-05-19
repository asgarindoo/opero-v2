export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock" | "Archived";

export interface InventoryActivity {
  id: string;
  type: "stock_in" | "stock_out" | "adjustment" | "note";
  description: string;
  quantity?: number;
  timestamp: string;
  author: string;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g. "Size L", "Blue"
  sku: string;
  price: number;
  quantity: number;
  warehouse: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string; // Parent SKU
  category: string;
  status: StockStatus;
  totalQuantity: number;
  minThreshold: number; // For low stock alerts
  variants: ProductVariant[];
  activities: InventoryActivity[];
  supplierName?: string;
  supplierId?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
}
