"use client";

import React, { useState } from "react";
import { useProducts } from "../context/ProductsContext";
import {
  Package,
  Wrench,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Archive,
  Trash2,
  DollarSign
} from "lucide-react";
import type { StockStatus, StockActivity } from "../types";
import SelectionBar from "@/components/common/SelectionBar";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import Button from "@/components/ui/Button";
import { EmptyState } from "@/components/common/DataState";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";

const STATUS_CONFIG: Record<StockStatus, { label: string; color: string; bg: string; icon: any }> = {
  "In Stock": { label: "In Stock", color: "var(--color-emerald-600, #059669)", bg: "bg-emerald-50", icon: CheckCircle2 },
  "Low Stock": { label: "Low Stock", color: "var(--color-amber-600, #D97706)", bg: "bg-amber-50", icon: AlertTriangle },
  "Out of Stock": { label: "Out of Stock", color: "var(--color-red-600, #DC2626)", bg: "bg-red-50", icon: XCircle },
  "Archived": { label: "Archived", color: "var(--color-on-surface-variant, #52525B)", bg: "bg-black/5", icon: Archive }
};

function formatPrice(price: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);
}

interface Props {
  onSelectProduct?: (id: string) => void;
  canDelete: boolean;
}

export default function ProductTable({ onSelectProduct, canDelete }: Props) {
  const { products, deleteProducts, loading } = useProducts();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const toggleAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map(p => p.id)));
    }
  };

  const toggleOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleDeleteOne = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!canDelete) return;
    setProductToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!canDelete) return;
    if (productToDelete) {
      deleteProducts([productToDelete]);
      setProductToDelete(null);
    } else {
      deleteProducts(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
    setIsDeleteModalOpen(false);
  };

  if (!loading && products.length === 0) {
    return (
      <EmptyState
        icon="inventory_2"
        title="No products found"
        description="Add products and services to build your catalog."
      />
    );
  }

  return (
    <div className="w-full relative overflow-auto h-full">
      <Table className="table-fixed min-w-[800px]">
        <TableHeader className="bg-[#faf5f5]/50">
          <TableRow className="h-10">
            {canDelete && (
            <TableHead className="w-[50px] !px-2">
              <div className="w-full flex justify-center">
                <input
                  type="checkbox"
                  checked={selectedIds.size > 0 && selectedIds.size === products.length}
                  onChange={toggleAll}
                  className="w-3.5 h-3.5 rounded-sm border-black/10 accent-primary cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                />
              </div>
            </TableHead>
            )}
            <TableHead className="px-4">Product / Service</TableHead>
            <TableHead className="w-32 hidden lg:table-cell px-4">Category</TableHead>
            <TableHead className="w-32 hidden lg:table-cell px-4 text-right">Price</TableHead>
            <TableHead className="w-32 hidden lg:table-cell px-4 text-right">Stock</TableHead>
            <TableHead className="w-32 px-4"><div className="w-full text-center">Status</div></TableHead>
            <TableHead className="w-28 px-4"><div className="w-full text-center">Actions</div></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            [...Array(5)].map((_, i) => (
              <TableRow key={i} className="h-14 hover:bg-black/[0.015] transition-colors">
                <TableCell className="w-[50px] !px-2">
                  <div className="w-full flex justify-center">
                    <div className="w-3.5 h-3.5 rounded-sm bg-black/[0.04] animate-pulse" />
                  </div>
                </TableCell>
                <TableCell className="px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-black/[0.04] animate-pulse shrink-0" />
                    <div className="flex flex-col gap-1.5 w-full">
                      <div className="h-3.5 w-32 bg-black/[0.04] rounded animate-pulse" />
                      <div className="flex gap-2">
                        <div className="h-2 w-12 bg-black/[0.04] rounded animate-pulse" />
                        <div className="h-2.5 w-16 bg-black/[0.04] rounded animate-pulse" />
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell px-4">
                  <div className="h-3 w-20 bg-black/[0.04] rounded animate-pulse" />
                </TableCell>
                <TableCell className="hidden lg:table-cell px-4 text-right">
                  <div className="h-3.5 w-16 bg-black/[0.04] rounded animate-pulse ml-auto" />
                </TableCell>
                <TableCell className="hidden lg:table-cell px-4 text-right">
                  <div className="h-3.5 w-12 bg-black/[0.04] rounded animate-pulse ml-auto" />
                </TableCell>
                <TableCell className="px-4">
                  <div className="w-full flex justify-center">
                    <div className="h-4.5 w-16 bg-black/[0.04] rounded animate-pulse" />
                  </div>
                </TableCell>
                <TableCell className="px-4 text-center">
                  <div className="w-full flex justify-center items-center gap-1.5">
                    <div className="h-5 w-5 bg-black/[0.04] rounded animate-pulse" />
                    <div className="h-4 w-4 bg-black/[0.04] rounded animate-pulse" />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            products.map(product => {
              const isExpanded = expandedId === product.id;
              const isSelected = selectedIds.has(product.id);
              const status = STATUS_CONFIG[product.status as StockStatus];
              const isService = product.type === "Service";

              return (
                <React.Fragment key={product.id}>
                  <TableRow
                    onClick={() => onSelectProduct ? onSelectProduct(product.id) : setExpandedId(isExpanded ? null : product.id)}
                    className={`group transition-all ${isSelected ? "bg-primary/[0.02]" : isExpanded ? "bg-black/[0.015]" : ""}`}
                  >
                    {canDelete && (
                    <TableCell onClick={e => e.stopPropagation()} className="w-[50px] !px-2">
                      <div className="w-full flex justify-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => toggleOne(product.id, e as any)}
                          className={`w-3.5 h-3.5 rounded-sm border-black/10 accent-primary cursor-pointer transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-60"}`}
                        />
                      </div>
                    </TableCell>
                    )}
                    <TableCell className="w-full max-w-[0px]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-lg overflow-hidden bg-black/[0.03] flex items-center justify-center text-on-surface-variant opacity-60 group-hover:opacity-100 transition-all`}>
                          {isService ? (
                            <Wrench size={13} strokeWidth={1.5} />
                          ) : (
                            <Package size={13} strokeWidth={1.5} />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0 gap-0.5">
                          <span
                            className="font-display font-semibold text-[13px] text-on-surface tracking-tight opacity-90 group-hover:text-primary transition-colors leading-tight truncate block w-full"
                            title={product.name}
                          >
                            {product.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <p className="font-body-sm text-[9px] text-on-surface-variant opacity-50 truncate uppercase tracking-widest font-bold">
                              {product.sku}
                            </p>
                            <span className="font-label-caps text-[8px] font-bold px-1 py-0.5 rounded bg-black/[0.04] text-on-surface-variant opacity-60 uppercase tracking-wide">
                              {product.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="hidden lg:table-cell max-w-[0px]">
                      <span className="font-display text-[11.5px] text-on-surface-variant opacity-70 truncate block" title={product.category || ""}>
                        {product.category || "—"}
                      </span>
                    </TableCell>

                    <TableCell className="hidden lg:table-cell text-right max-w-[0px]">
                      <div className="font-display text-[12.5px] font-bold text-on-surface opacity-80 truncate" title={product.price > 0 ? formatPrice(product.price, product.currency) : "—"}>
                        {product.price > 0 ? formatPrice(product.price, product.currency) : <span className="opacity-30">—</span>}
                      </div>
                    </TableCell>

                    <TableCell className="hidden lg:table-cell text-right max-w-[0px]">
                      {isService ? (
                        <div className="font-display text-[11px] text-on-surface-variant opacity-40 italic truncate">N/A</div>
                      ) : (
                        <div className="flex flex-col gap-0.5 items-end min-w-0">
                          <div
                            className={`font-display text-[12.5px] font-bold opacity-80 truncate w-full ${product.totalQuantity <= product.minThreshold && product.totalQuantity > 0 ? "text-amber-600" : product.totalQuantity === 0 ? "text-red-500" : "text-on-surface"}`}
                            title={`${product.totalQuantity.toLocaleString()} Units`}
                          >
                            {product.totalQuantity.toLocaleString()} <span className="text-[9px] opacity-60 font-medium uppercase tracking-tighter ml-0.5">Units</span>
                          </div>
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="w-full flex justify-center">
                        {isService ? (
                          <div className="px-1.5 py-0.5 rounded-[4px] bg-black/5 flex items-center w-fit mx-auto">
                            <span className="font-display text-[11px] font-medium text-on-surface-variant opacity-70">Service</span>
                          </div>
                        ) : (
                          <div className={`px-1.5 py-0.5 rounded-[4px] ${status.bg} flex items-center w-fit mx-auto`}>
                            <span className="font-display text-[11px] font-medium" style={{ color: status.color }}>
                              {status.label}
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="px-4 text-center">
                      <div className="w-full flex justify-center items-center gap-0.5 opacity-30 group-hover:opacity-100 transition-all">
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6.5 w-6.5 text-on-surface-variant hover:text-red-500 hover:bg-red-50 transition-all"
                            onClick={(e) => handleDeleteOne(e, product.id)}
                          >
                            <Trash2 size={12} />
                          </Button>
                        )}
                        <div className="ml-1 opacity-60">
                          <ChevronRight size={13} />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Expanded: stock history for physical products */}
                  {isExpanded && !onSelectProduct && (
                    <TableRow className="border-b-0 hover:bg-transparent">
                      <TableCell colSpan={7} className="p-0 border-0">
                        <div className="px-6 pb-6 animate-fade-in bg-transparent ml-12 border-l border-black/[0.05]">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pt-4">
                            <div className="lg:col-span-2 space-y-4">
                              <p className="font-label-caps text-[7.5px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em]">STOCK HISTORY</p>
                              <div className="space-y-3">
                                {product.activities.length === 0 ? (
                                  <p className="font-body-sm text-[11px] text-on-surface-variant opacity-40">No stock movements recorded.</p>
                                ) : (
                                  product.activities.map((activity: StockActivity) => (
                                    <div key={activity.id} className="flex items-start gap-4">
                                      <div className="w-1 h-1 rounded-full bg-black/20 mt-1.5" />
                                      <div className="flex-1">
                                        <div className="flex items-center justify-between mb-0.5">
                                          <p className="font-body-sm text-[11px] text-on-surface leading-snug opacity-70">
                                            <span className="font-semibold opacity-100">{activity.author}</span> {activity.description}
                                          </p>
                                          {activity.quantity && (
                                            <span className={`font-display text-[10px] font-bold ${activity.type === "stock_in" ? "text-emerald-600" : "text-red-500 opacity-60"}`}>
                                              {activity.type === "stock_in" ? "+" : "-"}{activity.quantity}
                                            </span>
                                          )}
                                        </div>
                                        <p className="font-display text-[9px] text-on-surface-variant opacity-60 uppercase">
                                          {new Date(activity.timestamp).toLocaleString()}
                                        </p>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                            <div className="space-y-4">
                              <p className="font-label-caps text-[7.5px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em]">PRODUCT DETAILS</p>
                              <div className="space-y-2">
                                <div className="flex justify-between text-[12px]">
                                  <span className="text-on-surface-variant opacity-60 font-body-sm">Price</span>
                                  <span className="font-display font-semibold opacity-80">{product.price > 0 ? formatPrice(product.price) : "—"}</span>
                                </div>
                                {!isService && (
                                  <div className="flex justify-between text-[12px]">
                                    <span className="text-on-surface-variant opacity-60 font-body-sm">Low Stock at</span>
                                    <span className="font-display font-semibold opacity-80">{product.minThreshold} units</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })
          )}
        </TableBody>
      </Table>

      {canDelete && (
        <SelectionBar
          count={selectedIds.size}
          onClear={() => setSelectedIds(new Set())}
          onDelete={() => setIsDeleteModalOpen(true)}
          label="products"
        />
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title={productToDelete ? "Delete product?" : "Delete selected products?"}
        description={productToDelete ? "This action permanently removes the product and its stock history." : `This action permanently removes ${selectedIds.size} products. This action cannot be undone.`}
        confirmLabel={productToDelete ? "Delete Product" : "Delete Products"}
      />
    </div>
  );
}
