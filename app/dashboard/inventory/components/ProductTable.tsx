"use client";

import React, { useState } from "react";
import { useInventory } from "../context/InventoryContext";
import { StockStatus } from "../types";
import { 
  Package, 
  ChevronDown, 
  ChevronUp, 
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Truck,
  Archive,
  MapPin,
  Trash2
} from "lucide-react";
import SelectionBar from "../../components/shared/SelectionBar";
import ConfirmationModal from "../../components/shared/ConfirmationModal";
import Button from "../../components/ui/Button";

const STATUS_CONFIG: Record<StockStatus, { label: string; color: string; bg: string; icon: any }> = {
  "In Stock": { label: "In Stock", color: "#10B981", bg: "bg-[#10B981]/10", icon: CheckCircle2 },
  "Low Stock": { label: "Low Stock", color: "#F59E0B", bg: "bg-[#F59E0B]/10", icon: AlertTriangle },
  "Out of Stock": { label: "Out of Stock", color: "#EF4444", bg: "bg-[#EF4444]/10", icon: XCircle },
  "Archived": { label: "Archived", color: "rgba(0,0,0,0.4)", bg: "bg-black/5", icon: Archive }
};

export default function ProductTable() {
  const { products, deleteProducts } = useInventory();
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
    setProductToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteProducts([productToDelete]);
      setProductToDelete(null);
    } else {
      deleteProducts(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
    setIsDeleteModalOpen(false);
  };

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant opacity-60">
        <Package size={40} strokeWidth={1} className="mb-4" />
        <p className="font-display text-[13px] tracking-wide uppercase">No products found</p>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      {/* Table Header */}
      <div className="flex items-center px-6 py-2.5 border-b border-black/[0.05] bg-[#faf5f5]/50">
        <div className="w-10 shrink-0 flex justify-center">
          <input 
            type="checkbox" 
            checked={selectedIds.size > 0 && selectedIds.size === products.length}
            onChange={toggleAll}
            className="w-3.5 h-3.5 rounded-sm border-black/10 accent-primary cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
          />
        </div>
        <div className="flex-1 min-w-0">
          <span className="font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-60 tracking-[0.2em] uppercase ml-3">Product Details</span>
        </div>
        <div className="w-32 hidden lg:block">
          <span className="font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-60 tracking-[0.2em] uppercase">Category</span>
        </div>
        <div className="w-32 hidden lg:block text-right">
          <span className="font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-60 tracking-[0.2em] uppercase">Stock Level</span>
        </div>
        <div className="w-32 flex justify-center ml-4">
          <span className="font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-60 tracking-[0.2em] uppercase">Status</span>
        </div>
        <div className="w-24 text-right pr-6">
          <span className="font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-60 tracking-[0.2em] uppercase">Actions</span>
        </div>
      </div>

      <div className="space-y-px">
        {products.map(product => {
          const isExpanded = expandedId === product.id;
          const isSelected = selectedIds.has(product.id);
          const status = STATUS_CONFIG[product.status];
          
          return (
            <div 
              key={product.id}
              className={`group flex flex-col transition-all border-b border-black/[0.03] ${isSelected ? "bg-primary/[0.02]" : isExpanded ? "bg-black/[0.015]" : "hover:bg-black/[0.01] bg-transparent"}`}
            >
              <div 
                onClick={() => setExpandedId(isExpanded ? null : product.id)}
                className="flex items-center px-6 py-2.5 cursor-pointer"
              >
                <div className="w-10 shrink-0 flex justify-center" onClick={e => e.stopPropagation()}>
                   <input 
                    type="checkbox" 
                    checked={isSelected}
                    onChange={(e) => toggleOne(product.id, e as any)}
                    className={`w-3.5 h-3.5 rounded-sm border-black/10 accent-primary cursor-pointer transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-60"}`}
                  />
                </div>
                <div className="flex items-center gap-3 flex-1 min-w-0 ml-3">
                   <div className={`w-8 h-8 rounded-lg overflow-hidden bg-black/[0.03] flex items-center justify-center text-on-surface-variant opacity-60 group-hover:opacity-100 transition-all ${isExpanded ? "border-primary/20 bg-primary/5 opacity-100" : ""}`}>
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package size={14} strokeWidth={1.5} />
                      )}
                   </div>
                   <div className="min-w-0">
                      <h3 className="font-display font-semibold text-[13px] text-on-surface tracking-tight truncate group-hover:text-primary transition-colors opacity-90">
                        {product.name}
                      </h3>
                      <p className="font-body-sm text-[9px] text-on-surface-variant opacity-60 truncate uppercase tracking-widest font-bold">
                        {product.sku}
                      </p>
                   </div>
                </div>

                <div className="hidden lg:block w-32 shrink-0">
                   <span className="font-display text-[11.5px] text-on-surface-variant opacity-70">
                     {product.category}
                   </span>
                </div>
                
                <div className="hidden lg:block w-32 shrink-0 text-right">
                   <div className="flex flex-col gap-0.5">
                      <span className="font-display text-[12.5px] font-bold text-on-surface opacity-80">
                        {product.totalQuantity.toLocaleString()} <span className="text-[9px] opacity-60 font-medium uppercase tracking-tighter ml-0.5">Units</span>
                      </span>
                   </div>
                </div>

                <div className="w-32 shrink-0 flex justify-center ml-4">
                   <div className={`px-2 py-0.5 rounded-[4px] ${status.bg} flex items-center gap-1.5`}>
                      <span className="font-label-caps text-[8px] font-bold tracking-[0.1em] uppercase" style={{ color: status.color }}>
                        {status.label}
                      </span>
                   </div>
                </div>

                 <div className="w-24 shrink-0 flex justify-end pr-6 items-center">
                   <div className="opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-on-surface-variant opacity-60 hover:text-red-500 hover:opacity-100 hover:bg-red-50 transition-all"
                        onClick={(e) => handleDeleteOne(e, product.id)}
                      >
                        <Trash2 size={13} />
                      </Button>
                      <ChevronRight size={14} className="text-on-surface-variant opacity-60 ml-1" />
                   </div>
                   <div className="ml-1 opacity-60 group-hover:hidden">
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                   </div>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-6 pb-6 animate-fade-in bg-transparent ml-12 border-l border-black/[0.05]">
                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pt-4">
                      <div className="lg:col-span-2 space-y-8">
                         <div>
                            <p className="font-label-caps text-[7.5px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em] mb-4">VARIANTS & STOCK</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                               {product.variants.map(variant => (
                                 <div key={variant.id} className="flex items-center justify-between p-3 rounded-lg border border-black/[0.03] bg-black/[0.015]">
                                    <div className="flex flex-col">
                                       <span className="font-display text-[12px] font-semibold text-on-surface opacity-80">{variant.name}</span>
                                       <span className="font-body-sm text-[9px] text-on-surface-variant opacity-60 uppercase tracking-widest">{variant.sku}</span>
                                    </div>
                                    <div className="text-right">
                                       <p className="font-display text-[12px] font-bold text-on-surface opacity-80">{variant.quantity} <span className="text-[8px] opacity-60 ml-0.5">QTY</span></p>
                                       <p className="font-display text-[9px] text-on-surface-variant opacity-60 flex items-center gap-1 justify-end">
                                          <MapPin size={8} /> {variant.warehouse}
                                       </p>
                                    </div>
                                 </div>
                               ))}
                            </div>
                         </div>
                         <div className="space-y-4">
                            <p className="font-label-caps text-[7.5px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em]">ACTIVITY LOG</p>
                            <div className="space-y-3">
                               {product.activities.map(activity => (
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
                               ))}
                            </div>
                         </div>
                      </div>
                      <div className="space-y-6">
                         <div>
                            <p className="font-label-caps text-[7.5px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em] mb-4">SUPPLIER</p>
                            <div className="p-3.5 rounded-lg border border-black/[0.04] bg-black/[0.01]">
                               <div className="flex items-center gap-2 mb-3">
                                  <Truck size={12} className="opacity-60" />
                                  <span className="font-display text-[12px] font-semibold opacity-70">{product.supplierName || "Direct Sourcing"}</span>
                                </div>
                               <button className="w-full py-1.5 rounded-md border border-black/[0.06] bg-white font-label-caps text-[8.5px] font-bold tracking-widest text-on-surface-variant opacity-80 hover:opacity-100 transition-all">
                                  VIEW PROFILE
                               </button>
                            </div>
                         </div>
                         <div>
                            <p className="font-label-caps text-[7.5px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em] mb-4">ACTIONS</p>
                            <div className="flex flex-col gap-2">
                               <button className="w-full py-2 rounded-lg bg-on-surface text-white font-label-caps text-[8.5px] font-bold tracking-widest hover:opacity-90 transition-all">
                                  ADJUST STOCK
                               </button>
                               <button className="w-full py-2 rounded-lg border border-black/[0.08] bg-white font-label-caps text-[8.5px] font-bold tracking-widest text-on-surface-variant opacity-80 hover:opacity-100 transition-all">
                                  PRINT BARCODES
                               </button>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <SelectionBar 
        count={selectedIds.size}
        onClear={() => setSelectedIds(new Set())}
        onDelete={() => setIsDeleteModalOpen(true)}
        label="products"
      />

      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title={productToDelete ? "Delete Product" : "Delete Selected Products"}
        description={productToDelete ? "Are you sure you want to delete this product? All stock history and variant data will be permanently removed." : `Are you sure you want to delete ${selectedIds.size} products? This action cannot be undone.`}
      />
    </div>
  );
}
