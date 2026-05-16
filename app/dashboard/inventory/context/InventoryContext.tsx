"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { Product, StockStatus, InventoryActivity } from "../types";

const MOCK_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Classic Crewneck Sweatshirt",
    sku: "AP-SWE-001",
    category: "Apparel",
    status: "In Stock",
    totalQuantity: 245,
    minThreshold: 50,
    variants: [
      { id: "v1", name: "Size S / Black", sku: "AP-SWE-001-S-BLK", price: 45, quantity: 80, warehouse: "Main WH" },
      { id: "v2", name: "Size M / Black", sku: "AP-SWE-001-M-BLK", price: 45, quantity: 120, warehouse: "Main WH" },
      { id: "v3", name: "Size L / Black", sku: "AP-SWE-001-L-BLK", price: 45, quantity: 45, warehouse: "Secondary WH" }
    ],
    activities: [
      { id: "act1", type: "stock_in", description: "Received batch from Supplier A", quantity: 100, timestamp: "2024-05-10T10:00:00Z", author: "You" },
      { id: "act2", type: "adjustment", description: "Inventory count correction", quantity: -5, timestamp: "2024-05-08T14:30:00Z", author: "Sarah Connor" }
    ],
    supplierName: "Premium Textiles Co.",
    notes: "Best seller for winter season.",
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-05-10T10:00:00Z"
  },
  {
    id: "p2",
    name: "Minimalist Desk Lamp",
    sku: "HO-LMP-99",
    category: "Home Office",
    status: "Low Stock",
    totalQuantity: 12,
    minThreshold: 20,
    variants: [
      { id: "v4", name: "Standard / White", sku: "HO-LMP-99-WHT", price: 89, quantity: 12, warehouse: "Main WH" }
    ],
    activities: [
      { id: "act3", type: "stock_out", description: "Order #ORD-2024-055 shipped", quantity: 2, timestamp: "2024-05-11T09:00:00Z", author: "System" }
    ],
    supplierName: "Lumens Lighting",
    notes: "Restock pending for next week.",
    createdAt: "2024-03-20T09:00:00Z",
    updatedAt: "2024-05-11T09:00:00Z"
  },
  {
    id: "p3",
    name: "Ergonomic Office Chair",
    sku: "HO-CHR-500",
    category: "Furniture",
    status: "Out of Stock",
    totalQuantity: 0,
    minThreshold: 10,
    variants: [
      { id: "v5", name: "Executive / Grey", sku: "HO-CHR-500-GRY", price: 299, quantity: 0, warehouse: "Main WH" }
    ],
    activities: [],
    supplierName: "WorkComfort Ltd.",
    notes: "Supplier issue - discontinued?",
    createdAt: "2024-02-10T08:00:00Z",
    updatedAt: "2024-05-12T08:00:00Z"
  }
];

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
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"All" | StockStatus>("All");

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
    setProducts(prev => [newProduct, ...prev]);
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p));
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

      return {
        ...p,
        totalQuantity: newTotal,
        status: newStatus,
        activities: [newActivity, ...p.activities],
        updatedAt: newActivity.timestamp
      };
    }));
  }, []);

  const deleteProducts = useCallback((ids: string[]) => {
    setProducts(prev => prev.filter(p => !ids.includes(p.id)));
  }, []);

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
