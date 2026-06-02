"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { Product, StockStatus, StockActivity } from "../types";
import { createProduct, deleteProduct, listProducts, updateProduct as saveProduct } from "../services/products.client";
import { useTenant } from "@/components/providers/TenantProvider";
import { getUserDisplayName, getUserInitials } from "@/lib/user-identity";

interface ProductsContextType {
  products: Product[];
  allProducts: Product[];
  addProduct: (product: Partial<Product>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  addActivity: (productId: string, activity: Omit<StockActivity, "id" | "timestamp" | "author"> & { author?: string }) => void;
  adjustStock: (id: string, quantity: number, type: StockActivity["type"], reason: string) => void;
  getProductById: (id: string) => Product | undefined;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedStatus: "All" | StockStatus;
  setSelectedStatus: (status: "All" | StockStatus) => void;
  deleteProducts: (ids: string[]) => void;
  loading: boolean;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

function productPatchForApi(updates: Partial<Product>): Partial<Product> {
  const patch: Partial<Product> = {};
  if (updates.name !== undefined) patch.name = updates.name;
  if (updates.sku !== undefined) patch.sku = updates.sku;
  if (updates.category !== undefined) patch.category = updates.category;
  if (updates.type !== undefined) patch.type = updates.type;
  if (updates.price !== undefined) patch.price = updates.price;
  if (updates.currency !== undefined) patch.currency = updates.currency;
  if (updates.status !== undefined) patch.status = updates.status;
  if (updates.stock !== undefined) patch.stock = updates.stock;
  if (updates.totalQuantity !== undefined) patch.totalQuantity = updates.totalQuantity;
  if (updates.minThreshold !== undefined) patch.minThreshold = updates.minThreshold;
  if (updates.activities !== undefined) patch.activities = updates.activities;
  if (updates.comments !== undefined) patch.comments = updates.comments;
  return patch;
}

function isRecordNotFound(err: unknown) {
  return err instanceof Error && err.message === "Record not found";
}

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useTenant();
  const userName = getUserDisplayName(user, "You");

  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"All" | StockStatus>("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const items = await listProducts<Product>();
        if (!cancelled) setProducts(items);
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const addProduct = useCallback((partial: Partial<Product>) => {
    const qty = partial.totalQuantity || 0;
    const minT = partial.minThreshold || 10;
    let status: StockStatus = "In Stock";
    if (partial.type !== "Service") {
      if (qty === 0) status = "Out of Stock";
      else if (qty <= minT) status = "Low Stock";
    }

    const newProduct: Product = {
      id: "p" + Date.now(),
      name: partial.name || "New Product",
      sku: partial.sku || "SKU-TBD",
      category: partial.category || "Uncategorized",
      type: partial.type || "Physical",
      price: partial.price || 0,
      currency: partial.currency || "USD",
      status: status,
      totalQuantity: qty,
      minThreshold: minT,
      comments: partial.comments || [],
      activities: [{
        id: "a" + Date.now(),
        type: "creation",
        description: "Product record created",
        timestamp: new Date().toISOString(),
        userId: user?.id,
        author: userName,
        email: user?.email ?? undefined,
        avatar: user?.image ?? null,
        initials: getUserInitials(user)
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...partial
    };
    createProduct<Product>(newProduct)
      .then((created: Product) => setProducts(prev => [created, ...prev]))
      .catch((err: unknown) => console.error("Failed to create product:", err));
  }, [user?.email, user?.id, user?.image, userName]);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== id) return p;
      const updated = { ...p, ...updates, updatedAt: new Date().toISOString() };
      const recordId = (p as { recordId?: string }).recordId ?? p.id;
      saveProduct<Product>(recordId, productPatchForApi(updates)).catch((err: unknown) => {
        if (isRecordNotFound(err)) {
          setProducts(current => current.filter(item => item.id !== id));
          return;
        }
        console.error("Failed to update product:", err);
      });
      return updated;
    }));
  }, []);

  const addActivity = useCallback((productId: string, activity: Omit<StockActivity, "id" | "timestamp" | "author"> & { author?: string }) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      const { author = userName, ...rest } = activity;
      const newActivity: StockActivity = {
        id: Math.random().toString(36).substring(7),
        timestamp: new Date().toISOString(),
        userId: user?.id,
        author,
        email: user?.email ?? undefined,
        avatar: user?.image ?? null,
        initials: getUserInitials(user),
        ...rest
      } as StockActivity;
      
      const updated = {
        ...p,
        activities: [newActivity, ...p.activities],
        updatedAt: newActivity.timestamp
      };
      
      const recordId = (p as { recordId?: string }).recordId ?? p.id;
      saveProduct<Product>(recordId, productPatchForApi({ activities: updated.activities })).catch((err: unknown) => {
        if (isRecordNotFound(err)) {
          setProducts(current => current.filter(item => item.id !== productId));
          return;
        }
        console.error("Failed to add activity:", err);
      });
      return updated;
    }));
  }, [user?.email, user?.id, user?.image, userName]);

  const adjustStock = useCallback((id: string, quantity: number, type: StockActivity["type"], reason: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== id) return p;
      const newActivity: StockActivity = {
        id: Math.random().toString(36).substring(7),
        type,
        description: reason,
        quantity,
        timestamp: new Date().toISOString(),
        userId: user?.id,
        author: userName,
        email: user?.email ?? undefined,
        avatar: user?.image ?? null,
        initials: getUserInitials(user)
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
      saveProduct<Product>(recordId, productPatchForApi({
        totalQuantity: updated.totalQuantity,
        status: updated.status,
        activities: updated.activities,
      })).catch((err: unknown) => {
        if (isRecordNotFound(err)) {
          setProducts(current => current.filter(item => item.id !== id));
          return;
        }
        console.error("Failed to adjust stock:", err);
      });
      return updated;
    }));
  }, [user?.email, user?.id, user?.image, userName]);

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
    addActivity,
    adjustStock,
    getProductById,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    deleteProducts,
    loading
  }), [filteredProducts, products, addProduct, updateProduct, addActivity, adjustStock, getProductById, searchQuery, selectedStatus, deleteProducts, loading]);

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductsProvider");
  }
  return context;
}
