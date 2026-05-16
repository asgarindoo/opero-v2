"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { Transaction, TransactionStatus, FinanceActivity, TransactionType, FinancialSummary, DateRange } from "../types";

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "t1",
    date: "2026-05-12",
    type: "Income",
    category: "Product Sales",
    amount: 12500,
    currency: "USD",
    status: "Paid",
    reference: "INV-2024-001",
    contactName: "Acme Corp",
    paymentMethod: "Stripe",
    notes: "Payment for Q2 license",
    activities: [
      { id: "act1", type: "payment", description: "Payment confirmed via Stripe", timestamp: "2026-05-12T09:00:00Z", author: "System" }
    ],
    attachments: ["receipt_001.pdf"],
    createdAt: "2026-05-12T08:00:00Z",
    updatedAt: "2026-05-12T09:00:00Z"
  },
  {
    id: "t2",
    date: "2026-05-11",
    type: "Expense",
    category: "Infrastructure",
    amount: 1200,
    currency: "USD",
    status: "Approved",
    reference: "BILL-8892",
    contactName: "AWS",
    paymentMethod: "Credit Card",
    notes: "Monthly cloud hosting",
    activities: [
      { id: "act2", type: "approval", description: "Expense approved by CFO", timestamp: "2026-05-11T14:30:00Z", author: "Sarah Connor" }
    ],
    attachments: [],
    createdAt: "2026-05-11T10:00:00Z",
    updatedAt: "2026-05-11T14:30:00Z"
  },
  {
    id: "t3",
    date: "2026-04-10",
    type: "Expense",
    category: "Office Supplies",
    amount: 450,
    currency: "USD",
    status: "Pending",
    reference: "PUR-099",
    contactName: "Office Depot",
    paymentMethod: "Bank Transfer",
    notes: "Stationery for new wing",
    activities: [],
    attachments: [],
    createdAt: "2026-04-10T08:00:00Z",
    updatedAt: "2026-04-10T08:00:00Z"
  }
];

interface FinanceContextType {
  transactions: Transaction[];
  addTransaction: (tx: Partial<Transaction>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  approveTransaction: (id: string) => void;
  summary: FinancialSummary;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedType: "All" | TransactionType;
  setSelectedType: (type: "All" | TransactionType) => void;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  deleteTransactions: (ids: string[]) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"All" | TransactionType>("All");
  const [dateRange, setDateRange] = useState<DateRange>("All Time");

  const addTransaction = useCallback((partial: Partial<Transaction>) => {
    const newTx: Transaction = {
      id: "t" + Date.now(),
      date: new Date().toISOString().split("T")[0],
      type: "Expense",
      category: "General",
      amount: 0,
      currency: "USD",
      status: "Pending",
      reference: "TX-" + Math.floor(Math.random() * 10000),
      paymentMethod: "Bank Transfer",
      notes: "",
      activities: [],
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...partial
    };
    setTransactions(prev => [newTx, ...prev]);
  }, []);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, ...updates, updatedAt: new Date().toISOString() } : tx));
  }, []);

  const approveTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.map(tx => {
      if (tx.id !== id) return tx;
      const newActivity: FinanceActivity = {
        id: Math.random().toString(36).substring(7),
        type: "approval",
        description: "Transaction approved",
        timestamp: new Date().toISOString(),
        author: "You"
      };
      return {
        ...tx,
        status: "Approved",
        activities: [newActivity, ...tx.activities],
        updatedAt: newActivity.timestamp
      };
    }));
  }, []);

  const deleteTransactions = useCallback((ids: string[]) => {
    setTransactions(prev => prev.filter(tx => !ids.includes(tx.id)));
  }, []);

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    // Normalize now to start of day for accurate comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return transactions.filter(t => {
      // Date filter
      if (dateRange !== "All Time") {
        const txDate = new Date(t.date);
        const diffTime = today.getTime() - txDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        const maxDays = dateRange === "Today" ? 1 : dateRange === "Last 7 Days" ? 7 : dateRange === "Last 30 Days" ? 30 : 365;
        if (diffDays < 0 || diffDays > maxDays) return false;
      }

      const matchesSearch = t.category.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            t.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            t.contactName?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === "All" || t.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [transactions, searchQuery, selectedType, dateRange]);

  const summary = useMemo(() => {
    const totalIncome = filteredTransactions.filter(t => t.type === "Income").reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = filteredTransactions.filter(t => t.type === "Expense").reduce((acc, t) => acc + t.amount, 0);
    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense
    };
  }, [filteredTransactions]);

  const value = useMemo(() => ({
    transactions: filteredTransactions,
    addTransaction,
    updateTransaction,
    approveTransaction,
    summary,
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType,
    dateRange,
    setDateRange,
    deleteTransactions
  }), [filteredTransactions, addTransaction, updateTransaction, approveTransaction, summary, searchQuery, selectedType, dateRange, deleteTransactions]);

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
}
