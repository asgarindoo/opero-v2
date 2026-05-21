"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { SaleOpportunity, SaleStatus, PaymentStatus, SaleType, SaleActivity, SaleItem } from "@/features/sales";
import { createSale, deleteSale, listSales, updateSale as saveSale } from "@/features/sales";
import { listProducts, updateProduct } from "@/features/products/services/products.client";
import type { Product, StockActivity } from "@/features/products/types";

interface SalesContextType {
  sales: SaleOpportunity[];
  addSale: (sale: Partial<SaleOpportunity>) => void;
  updateSale: (id: string, updates: Partial<SaleOpportunity>) => void;
  addActivity: (saleId: string, activity: Omit<SaleActivity, "id" | "timestamp" | "author">) => void;
  deleteSales: (ids: string[]) => void;
  /** Callback bridge: when a sale is marked Paid, this fires so Finance can record income */
  onSalePaid?: (sale: SaleOpportunity) => void;
  setSalePaidCallback: (cb: ((sale: SaleOpportunity) => void) | undefined) => void;
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export function SalesProvider({ children }: { children: React.ReactNode }) {
  const [sales, setSales] = useState<SaleOpportunity[]>([]);
  const [onSalePaid, setOnSalePaid] = useState<((sale: SaleOpportunity) => void) | undefined>(undefined);

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

  const setSalePaidCallback = useCallback((cb: ((sale: SaleOpportunity) => void) | undefined) => {
    setOnSalePaid(() => cb);
  }, []);

  /** Compute subtotal and total from items */
  function computeTotals(items: SaleItem[], discountTotal = 0) {
    const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
    const total = Math.max(0, subtotal - discountTotal);
    return { subtotal, total };
  }

  const addSale = useCallback((partial: Partial<SaleOpportunity>) => {
    const nextOrderNum = "SAL-" + new Date().getFullYear() + "-" + (sales.length + 1).toString().padStart(3, "0");
    const items = partial.items || [];
    const { subtotal, total } = computeTotals(items, partial.discountTotal || 0);

    const partialWithoutTotals = { ...partial };
    delete (partialWithoutTotals as any).subtotal;
    delete (partialWithoutTotals as any).total;

    const newSale: SaleOpportunity = {
      id: "s" + Date.now(),
      orderNumber: nextOrderNum,
      title: partial.title || "New Sale",
      saleType: partial.saleType || "Product Sale",
      contactName: partial.contactName || undefined,
      contactId: partial.contactId || undefined,
      status: partial.status || "Pending",
      paymentStatus: partial.paymentStatus || "Unpaid",
      currency: "USD",
      assignedStaff: ["You"],
      items,
      subtotal,
      discountTotal: partial.discountTotal || 0,
      total,
      activities: [],
      attachments: [],
      notes: partial.notes || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...partialWithoutTotals,
    };
    createSale<SaleOpportunity>(newSale)
      .then((created) => setSales(prev => [created, ...prev]))
      .catch((err) => console.error("Failed to create sale:", err));
  }, [sales.length]);

  const updateSale = useCallback((id: string, updates: Partial<SaleOpportunity>) => {
    setSales(prev => prev.map(s => {
      if (s.id !== id) return s;

      // Recompute totals if items changed
      const items = updates.items ?? s.items;
      const discountTotal = updates.discountTotal ?? s.discountTotal;
      const { subtotal, total } = computeTotals(items, discountTotal);

      const updated = {
        ...s,
        ...updates,
        subtotal,
        total,
        updatedAt: new Date().toISOString()
      };

      // Auto-trigger Finance income record when paymentStatus → Paid
      if (updates.paymentStatus === "Paid" && s.paymentStatus !== "Paid") {
        onSalePaid?.(updated);
      }

      // Auto-deduct stock when status → Completed for Product Sales
      if (updates.status === "Completed" && s.status !== "Completed" && updated.items.length > 0) {
        (async () => {
          try {
            const products = await listProducts<Product>();
            for (const item of updated.items) {
              if (item.productId && item.quantity > 0) {
                const product = products.find(p => p.id === item.productId);
                if (product && product.type === "Physical") {
                  const newActivity: StockActivity = {
                    id: Math.random().toString(36).substring(7),
                    type: "stock_out",
                    quantity: -item.quantity,
                    description: `Sold via Sale ${updated.orderNumber}`,
                    timestamp: new Date().toISOString(),
                    author: "System"
                  };
                  const recordId = (product as any).recordId ?? product.id;
                  await updateProduct<Product>(recordId, {
                    totalQuantity: Math.max(0, product.totalQuantity - item.quantity),
                    activities: [newActivity, ...product.activities]
                  });
                }
              }
            }
          } catch (err) {
            console.error("Failed to auto-deduct stock:", err);
          }
        })();
      }

      const recordId = (s as { recordId?: string }).recordId ?? s.id;
      saveSale<SaleOpportunity>(recordId, updated).catch((err) => {
        console.error("Failed to update sale:", err);
      });
      return updated;
    }));
  }, [onSalePaid]);

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
    deleteSales,
    onSalePaid,
    setSalePaidCallback,
  }), [sales, addSale, updateSale, addActivity, deleteSales, onSalePaid, setSalePaidCallback]);

  return <SalesContext.Provider value={value}>{children}</SalesContext.Provider>;
}

export function useSales() {
  const context = useContext(SalesContext);
  if (context === undefined) {
    throw new Error("useSales must be used within a SalesProvider");
  }
  return context;
}
