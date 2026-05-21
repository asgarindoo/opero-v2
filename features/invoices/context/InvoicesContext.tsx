"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { Invoice, InvoiceActivity } from "@/features/invoices";
import { createInvoice, deleteInvoice, listInvoices, updateInvoice as saveInvoice } from "@/features/invoices";

interface InvoicesContextType {
  invoices: Invoice[];
  addInvoice: (invoice: Partial<Invoice>) => void;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  markAsPaid: (id: string) => void;
  deleteInvoices: (ids: string[]) => void;
}

const InvoicesContext = createContext<InvoicesContextType | undefined>(undefined);

export function InvoicesProvider({ children }: { children: React.ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const items = await listInvoices<Invoice>();
        if (!cancelled) setInvoices(items);
      } catch (err) {
        console.error("Failed to load invoices:", err);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const addInvoice = useCallback((partial: Partial<Invoice>) => {
    const totalAmount = (partial.items || []).reduce((acc, curr) => acc + curr.amount, 0);
    const newInvoice: Invoice = {
      id: "inv" + Date.now(),
      invoiceNumber: partial.invoiceNumber || "INV-" + new Date().getFullYear() + "-" + Math.floor(Math.random() * 1000),
      contactName: partial.contactName || undefined,
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
    createInvoice<Invoice>(newInvoice)
      .then((created) => setInvoices(prev => [created, ...prev]))
      .catch((err) => console.error("Failed to create invoice:", err));
  }, []);

  const updateInvoice = useCallback((id: string, updates: Partial<Invoice>) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== id) return inv;
      const updated = { ...inv, ...updates, updatedAt: new Date().toISOString() };
      const recordId = (inv as { recordId?: string }).recordId ?? inv.id;
      saveInvoice<Invoice>(recordId, updated).catch((err) => {
        console.error("Failed to update invoice:", err);
      });
      return updated;
    }));
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
      const updated: Invoice = {
        ...inv,
        status: "Paid",
        activities: [newActivity, ...inv.activities],
        updatedAt: newActivity.timestamp
      };
      const recordId = (inv as { recordId?: string }).recordId ?? inv.id;
      saveInvoice<Invoice>(recordId, updated).catch((err) => {
        console.error("Failed to mark invoice as paid:", err);
      });
      return updated;
    }));
  }, []);

  const deleteInvoices = useCallback((ids: string[]) => {
    setInvoices(prev => prev.filter(inv => !ids.includes(inv.id)));
    Promise.all(
      ids.map((id) => {
        const recordId = invoices.find(inv => inv.id === id) as { recordId?: string } | undefined;
        const targetId = recordId?.recordId ?? id;
        return deleteInvoice(targetId).catch((err) => {
          console.error("Failed to delete invoice:", err);
        });
      })
    ).catch(() => undefined);
  }, [invoices]);

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

