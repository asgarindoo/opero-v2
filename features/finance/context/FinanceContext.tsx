"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { Transaction, TransactionStatus, FinanceActivity, TransactionType, FinancialSummary, DateRange } from "../types";
import { createTransaction, deleteTransaction, listTransactions, updateTransaction as saveTransaction } from "@/features/finance/services/finance.client";

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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"All" | TransactionType>("All");
  const [dateRange, setDateRange] = useState<DateRange>("All Time");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const items = await listTransactions<Transaction>();
        if (!cancelled) setTransactions(items);
      } catch (err) {
        console.error("Failed to load transactions:", err);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

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
    createTransaction<Transaction>(newTx)
      .then((created) => setTransactions(prev => [created, ...prev]))
      .catch((err) => console.error("Failed to create transaction:", err));
  }, []);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(tx => {
      if (tx.id !== id) return tx;
      const updated = { ...tx, ...updates, updatedAt: new Date().toISOString() };
      const recordId = (tx as { recordId?: string }).recordId ?? tx.id;
      saveTransaction<Transaction>(recordId, updated).catch((err) => {
        console.error("Failed to update transaction:", err);
      });
      return updated;
    }));
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
      const updated: Transaction = {
        ...tx,
        status: "Approved",
        activities: [newActivity, ...tx.activities],
        updatedAt: newActivity.timestamp
      };
      const recordId = (tx as { recordId?: string }).recordId ?? tx.id;
      saveTransaction<Transaction>(recordId, updated).catch((err) => {
        console.error("Failed to approve transaction:", err);
      });
      return updated;
    }));
  }, []);

  const deleteTransactions = useCallback((ids: string[]) => {
    setTransactions(prev => prev.filter(tx => !ids.includes(tx.id)));
    Promise.all(
      ids.map((id) => {
        const recordId = transactions.find(tx => tx.id === id) as { recordId?: string } | undefined;
        const targetId = recordId?.recordId ?? id;
        return deleteTransaction(targetId).catch((err) => {
          console.error("Failed to delete transaction:", err);
        });
      })
    ).catch(() => undefined);
  }, [transactions]);

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

