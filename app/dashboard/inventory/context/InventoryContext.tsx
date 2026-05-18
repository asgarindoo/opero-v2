"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { Product, StockStatus, InventoryActivity } from "../types";
import {
  createTenantRecord,
  deleteTenantRecord,
  listTenantRecords,
  updateTenantRecord,
} from "@/lib/client/tenant-records";

interface InventoryContextType {
  products: Product[];
  allProducts: Product[];
  addProduct: (product: Partial<Product>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  adjustStock: (id: string, quantity: number, type: InventoryActivity["type"], reason: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedStatus: "All" | StockStatus;
  setSelectedStatus: (status: "All" | StockStatus) => void;
  deleteProducts: (ids: string[]) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"All" | StockStatus>("All");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const items = await listTenantRecords<Product>("inventory");
        if (!cancelled) setProducts(items);
      } catch (err) {
        console.error("Failed to load inventory:", err);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const addProduct = useCallback((partial: Partial<Product>) => {
    const newProduct: Product = {
      id: "p" + Date.now(),
      name: partial.name || "New Product",
      sku: partial.sku || "SKU-TBD",
      category: partial.category || "Uncategorized",
      status: "In Stock",
      totalQuantity: partial.totalQuantity || 0,
      minThreshold: partial.minThreshold || 10,
      variants: partial.variants || [],
      activities: [],
      notes: partial.notes || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...partial
    };
    createTenantRecord<Product>("inventory", newProduct)
      .then((created) => setProducts(prev => [created, ...prev]))
      .catch((err) => console.error("Failed to create product:", err));
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== id) return p;
      const updated = { ...p, ...updates, updatedAt: new Date().toISOString() };
      const recordId = (p as { recordId?: string }).recordId ?? p.id;
      updateTenantRecord<Product>("inventory", recordId, updated).catch((err) => {
        console.error("Failed to update product:", err);
      });
      return updated;
    }));
  }, []);

  const adjustStock = useCallback((id: string, quantity: number, type: InventoryActivity["type"], reason: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== id) return p;
      const newActivity: InventoryActivity = {
        id: Math.random().toString(36).substring(7),
        type,
        description: reason,
        quantity,
        timestamp: new Date().toISOString(),
        author: "You"
      };
      const newTotal = p.totalQuantity + quantity;
      let newStatus: StockStatus = "In Stock";
      if (newTotal <= 0) newStatus = "Out of Stock";
      else if (newTotal <= p.minThreshold) newStatus = "Low Stock";

      const updated = {
        ...p,
        totalQuantity: newTotal,
        status: newStatus,
        activities: [newActivity, ...p.activities],
        updatedAt: newActivity.timestamp
      };
      const recordId = (p as { recordId?: string }).recordId ?? p.id;
      updateTenantRecord<Product>("inventory", recordId, updated).catch((err) => {
        console.error("Failed to adjust stock:", err);
      });
      return updated;
    }));
  }, []);

  const deleteProducts = useCallback((ids: string[]) => {
    setProducts(prev => prev.filter(p => !ids.includes(p.id)));
    Promise.all(
      ids.map((id) => {
        const recordId = products.find(p => p.id === id) as { recordId?: string } | undefined;
        const targetId = recordId?.recordId ?? id;
        return deleteTenantRecord("inventory", targetId).catch((err) => {
          console.error("Failed to delete product:", err);
        });
      })
    ).catch(() => undefined);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatus === "All" || p.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [products, searchQuery, selectedStatus]);

  const value = useMemo(() => ({
    products: filteredProducts,
    allProducts: products, // Expose unfiltered products
    addProduct,
    updateProduct,
    adjustStock,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    deleteProducts
  }), [filteredProducts, products, addProduct, updateProduct, adjustStock, searchQuery, selectedStatus, deleteProducts]);

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
}
