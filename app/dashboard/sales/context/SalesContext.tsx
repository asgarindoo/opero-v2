"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { SaleOpportunity, SaleStatus, PaymentStatus, SalePriority, SaleActivity } from "../types";
import { createSale, deleteSale, listSales, updateSale as saveSale } from "@/lib/client/services/sale.service";

interface SalesContextType {
  sales: SaleOpportunity[];
  addSale: (sale: Partial<SaleOpportunity>) => void;
  updateSale: (id: string, updates: Partial<SaleOpportunity>) => void;
  addActivity: (saleId: string, activity: Omit<SaleActivity, "id" | "timestamp" | "author">) => void;
  deleteSales: (ids: string[]) => void;
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export function SalesProvider({ children }: { children: React.ReactNode }) {
  const [sales, setSales] = useState<SaleOpportunity[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const items = await listSales<SaleOpportunity>();
        if (!cancelled) setSales(items);
      } catch (err) {
        console.error("Failed to load sales:", err);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const addSale = useCallback((partial: Partial<SaleOpportunity>) => {
    const nextOrderNum = "ORD-2024-" + (sales.length + 1).toString().padStart(3, "0");
    const newSale: SaleOpportunity = {
      id: "s" + Date.now(),
      orderNumber: nextOrderNum,
      title: partial.title || "New Order",
      contactName: partial.contactName || "Unknown Contact",
      contactId: partial.contactId || "",
      status: partial.status || "Pending",
      paymentStatus: partial.paymentStatus || "Unpaid",
      priority: partial.priority || "Medium",
      value: partial.value || 0,
      currency: "USD",
      assignedStaff: ["You"],
      items: partial.items || [],
      activities: [],
      attachments: [],
      notes: partial.notes || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...partial
    };
    createSale<SaleOpportunity>(newSale)
      .then((created) => setSales(prev => [created, ...prev]))
      .catch((err) => console.error("Failed to create sale:", err));
  }, [sales.length]);

  const updateSale = useCallback((id: string, updates: Partial<SaleOpportunity>) => {
    setSales(prev => prev.map(s => {
      if (s.id !== id) return s;
      const updated = { ...s, ...updates, updatedAt: new Date().toISOString() };
      const recordId = (s as { recordId?: string }).recordId ?? s.id;
      saveSale<SaleOpportunity>(recordId, updated).catch((err) => {
        console.error("Failed to update sale:", err);
      });
      return updated;
    }));
  }, []);

  const addActivity = useCallback((saleId: string, activity: Omit<SaleActivity, "id" | "timestamp" | "author">) => {
    setSales(prev => prev.map(s => {
      if (s.id !== saleId) return s;
      const newActivity: SaleActivity = {
        id: Math.random().toString(36).substring(7),
        timestamp: new Date().toISOString(),
        author: "You",
        ...activity
      };
      const updated = {
        ...s,
        activities: [newActivity, ...s.activities],
        updatedAt: newActivity.timestamp
      };
      const recordId = (s as { recordId?: string }).recordId ?? s.id;
      saveSale<SaleOpportunity>(recordId, updated).catch((err) => {
        console.error("Failed to add sale activity:", err);
      });
      return updated;
    }));
  }, []);

  const deleteSales = useCallback((ids: string[]) => {
    setSales(prev => prev.filter(s => !ids.includes(s.id)));
    Promise.all(
      ids.map((id) => {
        const recordId = sales.find(s => s.id === id) as { recordId?: string } | undefined;
        const targetId = recordId?.recordId ?? id;
        return deleteSale(targetId).catch((err) => {
          console.error("Failed to delete sale:", err);
        });
      })
    ).catch(() => undefined);
  }, [sales]);

  const value = useMemo(() => ({
    sales,
    addSale,
    updateSale,
    addActivity,
    deleteSales
  }), [sales, addSale, updateSale, addActivity, deleteSales]);

  return <SalesContext.Provider value={value}>{children}</SalesContext.Provider>;
}

export function useSales() {
  const context = useContext(SalesContext);
  if (context === undefined) {
    throw new Error("useSales must be used within a SalesProvider");
  }
  return context;
}

