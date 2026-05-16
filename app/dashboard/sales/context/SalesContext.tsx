"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { SaleOpportunity, SaleStatus, PaymentStatus, SalePriority, SaleActivity } from "../types";

const MOCK_SALES: SaleOpportunity[] = [
  {
    id: "s1",
    orderNumber: "ORD-2024-001",
    title: "Enterprise Software License Expansion",
    contactName: "Acme Corp",
    contactId: "c1",
    status: "Processing",
    paymentStatus: "Paid",
    priority: "High",
    value: 12500,
    currency: "USD",
    assignedStaff: ["You (Owner)"],
    items: [
      { id: "item1", name: "User Seats (50)", quantity: 1, price: 10000, sku: "SW-001" },
      { id: "item2", name: "Premium Support Plan", quantity: 1, price: 2500, sku: "SRV-002" }
    ],
    activities: [
      { id: "act1", type: "payment", description: "Payment of $12,500 received via Wire Transfer.", timestamp: "2024-05-10T10:00:00Z", author: "System" },
      { id: "act2", type: "status_change", description: "Moved to Processing stage.", timestamp: "2024-05-11T14:30:00Z", author: "You" }
    ],
    attachments: ["invoice_ORD-2024-001.pdf"],
    notes: "Client requested early deployment.",
    createdAt: "2024-05-09T08:00:00Z",
    updatedAt: "2024-05-11T14:30:00Z",
    shippingAddress: "123 Business Way, Silicon Valley, CA"
  },
  {
    id: "s2",
    orderNumber: "ORD-2024-002",
    title: "Hardware Equipment Batch A",
    contactName: "Globex Dynamics",
    contactId: "c2",
    status: "Pending",
    paymentStatus: "Unpaid",
    priority: "Medium",
    value: 8400,
    currency: "USD",
    assignedStaff: ["Sarah Connor"],
    items: [
      { id: "item3", name: "Wireless Hubs", quantity: 12, price: 700, sku: "HW-HUB-99" }
    ],
    activities: [
      { id: "act3", type: "note", description: "Waiting for purchase order document.", timestamp: "2024-05-11T09:00:00Z", author: "Sarah Connor" }
    ],
    attachments: [],
    notes: "Batch delivery expected next week.",
    createdAt: "2024-05-10T09:00:00Z",
    updatedAt: "2024-05-11T09:00:00Z"
  },
  {
    id: "s3",
    orderNumber: "ORD-2024-003",
    title: "Strategic Consulting Retainer",
    contactName: "Stark Industries",
    contactId: "c3",
    status: "Shipped",
    paymentStatus: "Paid",
    priority: "High",
    value: 25000,
    currency: "USD",
    assignedStaff: ["You"],
    items: [
      { id: "item4", name: "Monthly Consulting", quantity: 1, price: 25000, sku: "CON-RET" }
    ],
    activities: [
      { id: "act4", type: "shipping", description: "Consulting report delivered via Secure Portal.", timestamp: "2024-05-12T08:00:00Z", author: "You" }
    ],
    attachments: ["consulting_report_v1.pdf"],
    notes: "High priority client.",
    createdAt: "2024-05-01T08:00:00Z",
    updatedAt: "2024-05-12T08:00:00Z",
    trackingNumber: "TRK99887766"
  }
];

interface SalesContextType {
  sales: SaleOpportunity[];
  addSale: (sale: Partial<SaleOpportunity>) => void;
  updateSale: (id: string, updates: Partial<SaleOpportunity>) => void;
  addActivity: (saleId: string, activity: Omit<SaleActivity, "id" | "timestamp" | "author">) => void;
  deleteSales: (ids: string[]) => void;
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export function SalesProvider({ children }: { children: React.ReactNode }) {
  const [sales, setSales] = useState<SaleOpportunity[]>(MOCK_SALES);

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
    setSales(prev => [newSale, ...prev]);
  }, [sales.length]);

  const updateSale = useCallback((id: string, updates: Partial<SaleOpportunity>) => {
    setSales(prev => prev.map(s => s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s));
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
      return {
        ...s,
        activities: [newActivity, ...s.activities],
        updatedAt: newActivity.timestamp
      };
    }));
  }, []);

  const deleteSales = useCallback((ids: string[]) => {
    setSales(prev => prev.filter(s => !ids.includes(s.id)));
  }, []);

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
