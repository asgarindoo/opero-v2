export type SaleStatus = "Pending" | "Paid" | "Processing" | "Packed" | "Shipped" | "Completed" | "Cancelled";
export type PaymentStatus = "Unpaid" | "Partially Paid" | "Paid" | "Refunded";
export type SalePriority = "Low" | "Medium" | "High";

export interface SaleActivity {
  id: string;
  type: "note" | "email" | "call" | "status_change" | "payment" | "shipping";
  description: string;
  timestamp: string;
  author: string;
}

export interface SaleItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  sku?: string;
}

export interface SaleOpportunity {
  id: string;
  orderNumber: string;
  title: string;
  contactName: string;
  contactId: string;
  status: SaleStatus;
  paymentStatus: PaymentStatus;
  priority: SalePriority;
  value: number;
  currency: string;
  assignedStaff: string[];
  items: SaleItem[];
  activities: SaleActivity[];
  attachments: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
  shippingAddress?: string;
  trackingNumber?: string;
}
