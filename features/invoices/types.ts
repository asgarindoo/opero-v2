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

export interface Invoice {
  id: string;
  invoiceNumber: string;
  title?: string;
  contactName?: string; // Optional — not required
  contactId?: string;
  contactEmail?: string;
  saleId?: string; // Optional link to a Sale
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  subtotal: number;
  discountAmount?: number;
  taxRate?: number;
  taxAmount?: number;
  taxTotal: number;
  discountRate?: number;
  discountTotal: number;
  grandTotal?: number;
  totalAmount: number;
  currency: string;
  paymentStatus?: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}
