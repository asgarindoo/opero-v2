export type SaleStatus = "Pending" | "Processing" | "Completed" | "Cancelled";
export type PaymentStatus = "Unpaid" | "Partially Paid" | "Paid" | "Refunded";
export type SaleType = "Product Sale" | "Service Order" | "Manual" | "Retail";

export interface SaleActivity {
  id: string;
  type: "note" | "email" | "call" | "status_change" | "payment" | "shipping";
  description: string;
  timestamp: string;
  author: string;
}

export type DiscountType = "percentage" | "fixed";

export interface SaleItem {
  id: string;
  name: string;
  productId?: string; // Reference to a Product
  sku?: string;
  quantity: number;
  price: number;
  discount: number; // Value of discount
  discountType?: DiscountType; // Type of discount
  subtotal: number; // Final line total
}

export interface SaleOpportunity {
  id: string;
  orderNumber: string;
  title: string;
  saleType: SaleType;
  contactName?: string; // Optional — not required
  contactId?: string;
  status: SaleStatus;
  paymentStatus: PaymentStatus;
  items: SaleItem[];
  subtotal: number; // Sum of item subtotals
  orderDiscountValue?: number; // Raw input value for order discount
  orderDiscountType?: DiscountType; // Type of order discount
  discountTotal: number; // Additional order-level discount amount
  total: number; // Final payable amount
  currency: string;
  assignedStaff: string[];
  activities: SaleActivity[];
  attachments: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
  shippingAddress?: string;
  trackingNumber?: string;
}
