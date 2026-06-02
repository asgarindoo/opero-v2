export type TransactionType = "Income" | "Expense" | "Refund";
export type DateRange = "Today" | "Last 7 Days" | "Last 30 Days" | "Last 12 Months" | "All Time";
export type TransactionStatus = "Completed" | "Pending" | "Cancelled";
export type PaymentMethod = "Bank Transfer" | "Credit Card" | "Cash" | "PayPal" | "Stripe";

export interface Transaction {
  id: string;
  title: string;
  transactionDate: string;
  type: TransactionType;
  category: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  reference: string;
  contactName?: string;
  contactId?: string;
  paymentMethod: PaymentMethod;
  notes: string;
  sourceType: "Manual" | "Invoice" | "Sale";
  sourceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  pendingIncome: number;
}
