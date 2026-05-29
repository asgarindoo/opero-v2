"use client";

import React, { useState } from "react";
import { useSales } from "../context/SalesContext";
import {
  ChevronRight,
  Trash2,
  User,
} from "lucide-react";
import { SaleStatus, PaymentStatus, SaleType } from "@/features/sales";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { EmptyState } from "@/components/common/DataState";
import Button from "@/components/ui/Button";
import ListFooter from "@/components/common/ListFooter";
import SelectionBar from "@/components/common/SelectionBar";
import ConfirmationModal from "@/components/common/ConfirmationModal";

interface Props {
  searchQuery: string;
  filterMode: string;
  onSelectSale: (id: string) => void;
}

function formatCurrency(val: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(val);
}

const SALE_TYPE_LABELS: Record<SaleType, string> = {
  "Product Sale": "Product",
  "Service Order": "Service",
  "Retail": "Retail",
  "Manual": "Manual",
};

const STATUS_STYLE: Record<SaleStatus, string> = {
  "Pending": "bg-black/5 text-on-surface-variant",
  "Processing": "bg-amber-50 text-amber-700",
  "Completed": "bg-emerald-50 text-emerald-700",
  "Cancelled": "bg-red-50 text-red-600",
};

const PAYMENT_STYLE: Record<PaymentStatus, string> = {
  "Unpaid": "text-red-500",
  "Partially Paid": "text-amber-600",
  "Paid": "text-emerald-600",
  "Refunded": "text-on-surface-variant opacity-60",
};

export default function SalesList({ searchQuery, filterMode, onSelectSale }: Props) {
  const { sales, deleteSales, loading } = useSales();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<string | null>(null);

  const filteredSales = sales.filter(s => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      s.title.toLowerCase().includes(q) ||
      (s.contactName ?? "").toLowerCase().includes(q) ||
      s.orderNumber.toLowerCase().includes(q);

    if (filterMode === "all") return matchesSearch;
    if (filterMode === "pending") return matchesSearch && s.status === "Pending";
    if (filterMode === "paid") return matchesSearch && s.paymentStatus === "Paid";
    if (filterMode === "completed") return matchesSearch && s.status === "Completed";
    return matchesSearch;
  });

  const toggleAll = () => {
    if (selectedIds.size === filteredSales.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredSales.map(s => s.id)));
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
    setSaleToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (saleToDelete) {
      deleteSales([saleToDelete]);
      setSaleToDelete(null);
    } else {
      deleteSales(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
    setIsDeleteModalOpen(false);
  };

  if (!loading && filteredSales.length === 0) {
    return (
      <EmptyState
        icon="shopping_bag"
        title="No sales found"
        description="Try adjusting your filters or create a new sale."
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-background relative">
      <div className="flex-1 overflow-auto bg-background">
        <Table className="min-w-[800px] table-fixed">
          <TableHeader className="bg-[#faf5f5]/50">
            <TableRow>
              <TableHead className="w-10">
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.size > 0 && selectedIds.size === filteredSales.length}
                    onChange={toggleAll}
                    className="w-3.5 h-3.5 rounded-sm border-black/10 accent-primary cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                  />
                </div>
              </TableHead>
              <TableHead>Order #</TableHead>
              <TableHead className="w-[20%]">Sale</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-28 px-4"><div className="w-full text-center">Actions</div></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i} className="h-12 hover:bg-black/[0.015] transition-colors">
                  <TableCell className="px-4">
                    <div className="w-3 h-3 rounded-[3px] bg-black/[0.04] animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-3 w-16 bg-black/[0.04] rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1.5 ml-2">
                      <div className="h-3.5 w-32 bg-black/[0.04] rounded animate-pulse" />
                      <div className="h-2 w-20 bg-black/[0.04] rounded animate-pulse" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="h-3 w-24 bg-black/[0.04] rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4.5 w-16 bg-black/[0.04] rounded-sm animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-3 w-16 bg-black/[0.04] rounded animate-pulse" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="h-3.5 w-20 bg-black/[0.04] rounded animate-pulse ml-auto" />
                  </TableCell>
                  <TableCell className="px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 bg-black/[0.04] rounded animate-pulse" />
                      <div className="h-4 w-4 bg-black/[0.04] rounded animate-pulse" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              filteredSales.map((sale) => {
                const isSelected = selectedIds.has(sale.id);

                return (
                  <TableRow
                    key={sale.id}
                    onClick={() => onSelectSale(sale.id)}
                    className={`group ${isSelected ? "bg-primary/[0.02]" : ""}`}
                  >
                    <TableCell onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => toggleOne(sale.id, e as any)}
                          className={`w-3.5 h-3.5 rounded-sm border-black/10 accent-primary cursor-pointer transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-60"}`}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div 
                        className="font-mono text-[10.5px] font-bold text-on-surface opacity-50 tracking-tight truncate max-w-[80px] md:max-w-[120px]"
                        title={sale.orderNumber}
                      >
                        {sale.orderNumber}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5 ml-2">
                        <span 
                          className="font-display font-semibold text-[13px] text-on-surface opacity-90 group-hover:text-primary transition-colors leading-tight truncate max-w-[100px] sm:max-w-[140px] md:max-w-[180px] lg:max-w-[240px] xl:max-w-[300px] block"
                          title={sale.title}
                        >
                          {sale.title}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-label-caps text-[7.5px] font-bold px-1 py-0.5 rounded bg-black/[0.04] text-on-surface-variant opacity-60 uppercase tracking-wide">
                            {SALE_TYPE_LABELS[sale.saleType]}
                          </span>
                          <span className="font-body-sm text-[9px] text-on-surface-variant opacity-50">
                            {sale.items.length} item{sale.items.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {sale.contactName ? (
                        <div className="flex items-center gap-1.5 text-on-surface-variant opacity-60">
                          <User size={11} className="opacity-60 shrink-0" />
                          <span className="font-display text-[11.5px] truncate max-w-[120px]">{sale.contactName}</span>
                        </div>
                      ) : (
                        <span className="font-display text-[11.5px] text-on-surface-variant opacity-30">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className={`inline-flex px-2 py-0.5 rounded-[4px] ${STATUS_STYLE[sale.status]}`}>
                        <span className="font-label-caps text-[8px] font-bold tracking-wider uppercase">{sale.status}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`font-display text-[11.5px] font-semibold ${PAYMENT_STYLE[sale.paymentStatus]}`}>
                        {sale.paymentStatus}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span 
                        className="font-bold text-on-surface font-display text-[12.5px] opacity-80 block truncate max-w-[100px] ml-auto"
                        title={formatCurrency(sale.total, sale.currency)}
                      >
                        {formatCurrency(sale.total, sale.currency)}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-0.5 opacity-30 group-hover:opacity-100 transition-all">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6.5 w-6.5 text-on-surface-variant hover:text-red-500 hover:bg-red-50"
                          onClick={(e) => handleDeleteOne(e, sale.id)}
                        >
                          <Trash2 size={12} />
                        </Button>
                        <ChevronRight size={13} className="text-on-surface-variant ml-0.5" />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>



      <SelectionBar
        count={selectedIds.size}
        onClear={() => setSelectedIds(new Set())}
        onDelete={() => setIsDeleteModalOpen(true)}
        label="sales"
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSaleToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title={saleToDelete ? "Delete Sale" : "Delete Selected Sales"}
        description={saleToDelete ? "Are you sure you want to delete this sale? This will permanently remove all item associations and transaction history." : `Are you sure you want to delete ${selectedIds.size} selected sales? This action cannot be undone.`}
      />
    </div>
  );
}
