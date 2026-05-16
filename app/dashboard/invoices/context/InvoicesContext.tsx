"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { Invoice, InvoiceStatus, InvoiceActivity, InvoiceItem } from "../types";

const MOCK_INVOICES: Invoice[] = [
  {
    id: "inv1",
    invoiceNumber: "INV-2024-001",
    contactName: "Acme Corp",
    issueDate: "2024-05-01",
    dueDate: "2024-05-15",
    status: "Paid",
    items: [
      { id: "itm1", description: "Cloud Infrastructure (Monthly)", quantity: 1, unitPrice: 2500, amount: 2500 },
      { id: "itm2", description: "Maintenance Support", quantity: 5, unitPrice: 150, amount: 750 }
    ],
    subtotal: 3250,
    taxTotal: 325,
    discountTotal: 0,
    totalAmount: 3575,
    currency: "USD",
    notes: "Thanks for your business!",
    activities: [
      { id: "act1", type: "payment", description: "Payment received via Stripe", timestamp: "2024-05-05T10:00:00Z", author: "System" }
    ],
    attachments: ["INV-001.pdf"],
    createdAt: "2024-05-01T08:00:00Z",
    updatedAt: "2024-05-05T10:00:00Z"
  },
  {
    id: "inv2",
    invoiceNumber: "INV-2024-002",
    contactName: "Global Tech Solutions",
    issueDate: "2024-05-10",
    dueDate: "2024-05-24",
    status: "Unpaid",
    items: [
      { id: "itm3", description: "Professional Services", quantity: 20, unitPrice: 200, amount: 4000 }
    ],
    subtotal: 4000,
    taxTotal: 400,
    discountTotal: 200,
    totalAmount: 4200,
    currency: "USD",
    notes: "PO #8892",
    activities: [
      { id: "act2", type: "creation", description: "Invoice created and sent", timestamp: "2024-05-10T11:00:00Z", author: "You" }
    ],
    attachments: [],
    createdAt: "2024-05-10T11:00:00Z",
    updatedAt: "2024-05-10T11:00:00Z"
  },
  {
    id: "inv3",
    invoiceNumber: "INV-2024-003",
    contactName: "Vertex Media",
    issueDate: "2024-04-15",
    dueDate: "2024-04-29",
    status: "Overdue",
    items: [
      { id: "itm4", description: "Marketing Campaign Q1", quantity: 1, unitPrice: 8500, amount: 8500 }
    ],
    subtotal: 8500,
    taxTotal: 850,
    discountTotal: 0,
    totalAmount: 9350,
    currency: "USD",
    notes: "Pending follow up.",
    activities: [
      { id: "act3", type: "reminder", description: "Overdue reminder sent to client", timestamp: "2024-05-01T09:00:00Z", author: "System" }
    ],
    attachments: [],
    createdAt: "2024-04-15T08:00:00Z",
    updatedAt: "2024-05-01T09:00:00Z"
  }
];

interface InvoicesContextType {
  invoices: Invoice[];
  addInvoice: (invoice: Partial<Invoice>) => void;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  markAsPaid: (id: string) => void;
  deleteInvoices: (ids: string[]) => void;
}

const InvoicesContext = createContext<InvoicesContextType | undefined>(undefined);

export function InvoicesProvider({ children }: { children: React.ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);

  const addInvoice = useCallback((partial: Partial<Invoice>) => {
    const totalAmount = (partial.items || []).reduce((acc, curr) => acc + curr.amount, 0);
    const newInvoice: Invoice = {
      id: "inv" + Date.now(),
      invoiceNumber: partial.invoiceNumber || "INV-" + new Date().getFullYear() + "-" + Math.floor(Math.random() * 1000),
      contactName: partial.contactName || "New Customer",
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: partial.dueDate || new Date().toISOString().split("T")[0],
      status: "Draft",
      items: partial.items || [],
      subtotal: totalAmount,
      taxTotal: totalAmount * 0.1,
      discountTotal: 0,
      totalAmount: totalAmount * 1.1,
      currency: "USD",
      notes: "",
      activities: [],
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...partial
    };
    setInvoices(prev => [newInvoice, ...prev]);
  }, []);

  const updateInvoice = useCallback((id: string, updates: Partial<Invoice>) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, ...updates, updatedAt: new Date().toISOString() } : inv));
  }, []);

  const markAsPaid = useCallback((id: string) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== id) return inv;
      const newActivity: InvoiceActivity = {
        id: Math.random().toString(36).substring(7),
        type: "payment",
        description: "Invoice marked as paid manually",
        timestamp: new Date().toISOString(),
        author: "You"
      };
      return {
        ...inv,
        status: "Paid",
        activities: [newActivity, ...inv.activities],
        updatedAt: newActivity.timestamp
      };
    }));
  }, []);

  const deleteInvoices = useCallback((ids: string[]) => {
    setInvoices(prev => prev.filter(inv => !ids.includes(inv.id)));
  }, []);

  const value = useMemo(() => ({
    invoices,
    addInvoice,
    updateInvoice,
    markAsPaid,
    deleteInvoices
  }), [invoices, addInvoice, updateInvoice, markAsPaid, deleteInvoices]);

  return <InvoicesContext.Provider value={value}>{children}</InvoicesContext.Provider>;
}

export function useInvoices() {
  const context = useContext(InvoicesContext);
  if (context === undefined) {
    throw new Error("useInvoices must be used within an InvoicesProvider");
  }
  return context;
}
