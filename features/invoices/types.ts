export type InvoiceStatus = "Draft" | "Unpaid" | "Paid" | "Overdue" | "Cancelled" | "Archived";

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
  contactName: string;
  contactId?: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  totalAmount: number;
  currency: string;
  notes: string;
  activities: InvoiceActivity[];
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}
