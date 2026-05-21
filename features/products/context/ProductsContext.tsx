"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { Product, StockStatus, StockActivity } from "../types";
import { createProduct, deleteProduct, listProducts, updateProduct as saveProduct } from "../services/products.client";

interface ProductsContextType {
  products: Product[];
  allProducts: Product[];
  addProduct: (product: Partial<Product>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  adjustStock: (id: string, quantity: number, type: StockActivity["type"], reason: string) => void;
  getProductById: (id: string) => Product | undefined;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedStatus: "All" | StockStatus;
  setSelectedStatus: (status: "All" | StockStatus) => void;
  deleteProducts: (ids: string[]) => void;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"All" | StockStatus>("All");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const items = await listProducts<Product>();
        if (!cancelled) setProducts(items);
      } catch (err) {
        console.error("Failed to load products:", err);
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
      type: partial.type || "Physical",
      price: partial.price || 0,
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
    createProduct<Product>(newProduct)
      .then((created: Product) => setProducts(prev => [created, ...prev]))
      .catch((err: unknown) => console.error("Failed to create product:", err));
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== id) return p;
      const updated = { ...p, ...updates, updatedAt: new Date().toISOString() };
      const recordId = (p as { recordId?: string }).recordId ?? p.id;
      saveProduct<Product>(recordId, updated).catch((err: unknown) => {
        console.error("Failed to update product:", err);
      });
      return updated;
    }));
  }, []);

  const adjustStock = useCallback((id: string, quantity: number, type: StockActivity["type"], reason: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== id) return p;
      const newActivity: StockActivity = {
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
      saveProduct<Product>(recordId, updated).catch((err: unknown) => {
        console.error("Failed to adjust stock:", err);
      });
      return updated;
    }));
  }, []);

  const getProductById = useCallback((id: string) => {
    return products.find(p => p.id === id);
  }, [products]);

  const deleteProducts = useCallback((ids: string[]) => {
    setProducts(prev => prev.filter(p => !ids.includes(p.id)));
    Promise.all(
      ids.map((id) => {
        const recordId = products.find(p => p.id === id) as { recordId?: string } | undefined;
        const targetId = recordId?.recordId ?? id;
        return deleteProduct(targetId).catch((err: unknown) => {
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
    allProducts: products,
    addProduct,
    updateProduct,
    adjustStock,
    getProductById,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    deleteProducts
  }), [filteredProducts, products, addProduct, updateProduct, adjustStock, getProductById, searchQuery, selectedStatus, deleteProducts]);

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductsProvider");
  }
  return context;
}
