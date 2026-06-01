"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { Invoice, InvoiceActivity, InvoiceStatus } from "@/features/invoices";
import { createInvoice, deleteInvoice, listInvoices, updateInvoice as saveInvoice } from "@/features/invoices/services/invoices.client";
import { useTenant } from "@/components/providers/TenantProvider";

interface InvoicesContextType {
  invoices: Invoice[];
  addInvoice: (invoice: Partial<Invoice>) => void;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  markAsPaid: (id: string) => void;
  deleteInvoices: (ids: string[]) => void;
  loading: boolean;
}

const InvoicesContext = createContext<InvoicesContextType | undefined>(undefined);

export function InvoicesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useTenant();
  const userName = user?.name || "You";

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const items = await listInvoices<Invoice>();
        if (!cancelled) setInvoices(items);
      } catch (err) {
        console.error("Failed to load invoices:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const reloadInvoices = useCallback(async () => {
    try {
      const items = await listInvoices<Invoice>();
      setInvoices(items);
    } catch (err) {
      console.error("Failed to reload invoices:", err);
    }
  }, []);

  const handleSaveError = useCallback((err: unknown, label: string) => {
    const message = err instanceof Error ? err.message : "";
    if (message === "Record not found") {
      reloadInvoices();
      return;
    }

    console.error(label, err);
  }, [reloadInvoices]);

  const addInvoice = useCallback((partial: Partial<Invoice>) => {
    const totalAmount = (partial.items || []).reduce((acc, curr) => acc + curr.amount, 0);
    const newInvoice: Invoice = {
      id: "inv" + Date.now(),
      invoiceNumber: partial.invoiceNumber || "INV-" + new Date().getFullYear() + "-" + Math.floor(Math.random() * 1000),
      contactName: partial.contactName || undefined,
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: partial.dueDate || new Date().toISOString().split("T")[0],
      status: (partial.status as InvoiceStatus) || "Unpaid",
      items: partial.items || [],
      subtotal: partial.subtotal ?? totalAmount,
      taxRate: partial.taxRate,
      taxTotal: partial.taxTotal ?? (totalAmount * 0.1),
      discountRate: partial.discountRate,
      discountTotal: partial.discountTotal ?? 0,
      totalAmount: partial.totalAmount ?? (totalAmount * 1.1),
      currency: partial.currency ?? "USD",
      notes: partial.notes ?? "",
      activities: [{
        id: "a" + Date.now(),
        type: "status_change",
        description: "Invoice created",
        timestamp: new Date().toISOString(),
        author: userName || "You"
      }],
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
    let recordIdToSave: string | undefined;
    let payloadToSave: Invoice | undefined;

    setInvoices(prev => prev.map(inv => {
      if (inv.id !== id) return inv;
      const updated = { ...inv, ...updates, updatedAt: new Date().toISOString() };
      recordIdToSave = (inv as { recordId?: string }).recordId ?? inv.id;
      payloadToSave = updated;
      return updated;
    }));

    if (recordIdToSave && payloadToSave) {
      saveInvoice<Invoice>(recordIdToSave, payloadToSave).catch((err) => {
        handleSaveError(err, "Failed to update invoice:");
      });
    }
  }, [handleSaveError]);

  const markAsPaid = useCallback((id: string) => {
    let recordIdToSave: string | undefined;
    let payloadToSave: Invoice | undefined;

    setInvoices(prev => prev.map(inv => {
      if (inv.id !== id) return inv;
      const newActivity: InvoiceActivity = {
        id: Math.random().toString(36).substring(7),
        type: "payment",
        description: "Invoice marked as paid manually",
        timestamp: new Date().toISOString(),
        author: userName
      };
      const updated: Invoice = {
        ...inv,
        status: "Paid",
        activities: [newActivity, ...inv.activities],
        updatedAt: newActivity.timestamp
      };
      recordIdToSave = (inv as { recordId?: string }).recordId ?? inv.id;
      payloadToSave = updated;
      return updated;
    }));

    if (recordIdToSave && payloadToSave) {
      saveInvoice<Invoice>(recordIdToSave, payloadToSave).catch((err) => {
        handleSaveError(err, "Failed to mark invoice as paid:");
      });
    }
  }, [handleSaveError, userName]);

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
    deleteInvoices,
    loading
  }), [invoices, addInvoice, updateInvoice, markAsPaid, deleteInvoices, loading]);

  return <InvoicesContext.Provider value={value}>{children}</InvoicesContext.Provider>;
}

export function useInvoices() {
  const context = useContext(InvoicesContext);
  if (context === undefined) {
    throw new Error("useInvoices must be used within an InvoicesProvider");
  }
  return context;
}

