export type TransactionType = "Income" | "Expense" | "Transfer";
export type DateRange = "Today" | "Last 7 Days" | "Last 30 Days" | "Last 12 Months" | "All Time";
export type TransactionStatus = "Pending" | "Paid" | "Processing" | "Approved" | "Rejected" | "Overdue" | "Cancelled";
export type PaymentMethod = "Bank Transfer" | "Credit Card" | "Cash" | "PayPal" | "Stripe";

export interface FinanceActivity {
  id: string;
  type: "approval" | "payment" | "note" | "status_change";
  description: string;
  timestamp: string;
  author: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  category: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  reference: string; // Invoice # or Ref #
  contactName?: string; // Vendor or Customer
  contactId?: string;
  paymentMethod: PaymentMethod;
  notes: string;
  activities: FinanceActivity[];
  attachments: string[];
  /** Traces back to a sale or invoice that created this transaction */
  sourceRef?: string;
  /** "sale" | "invoice" | "manual" */
  sourceType?: "sale" | "invoice" | "manual";
  createdAt: string;
  updatedAt: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}
