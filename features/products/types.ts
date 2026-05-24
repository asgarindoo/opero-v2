export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock" | "Archived";
export type ProductType = "Physical" | "Service";

export interface StockActivity {
  id: string;
  type: "stock_in" | "stock_out" | "adjustment" | "note" | "creation";
  description: string;
  quantity?: number;
  timestamp: string;
  author: string;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g. "Size L", "Blue"
  sku: string;
  price?: number;
  quantity: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  type: ProductType; // Physical or Service
  price: number; // Base selling price
  currency: string;
  status: StockStatus;
  totalQuantity: number;
  minThreshold: number; // Low stock alert
  variants: ProductVariant[];
  activities: StockActivity[];
  notes: string;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
}
