export type InvoiceStatus = "Unpaid" | "Paid" | "Cancelled";

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  discount?: number;
  amount: number;
}

export interface InvoiceActivity {
  id: string;
  type: "creation" | "payment" | "reminder" | "status_change" | "note";
  description: string;
  timestamp: string;
  author: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  contactName?: string; // Optional — not required
  contactId?: string;
  saleId?: string; // Optional link to a Sale
  saleOrderNumber?: string; // Display reference to sale
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  subtotal: number;
  taxRate?: number;
  taxTotal: number;
  discountRate?: number;
  discountTotal: number;
  totalAmount: number;
  currency: string;
  notes: string;
  activities: InvoiceActivity[];
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}
