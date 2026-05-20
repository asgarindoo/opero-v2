"use client";

import React, { useState } from "react";
import { useSales } from "../context/SalesContext";
import { 
  Building2, 
  MoreVertical, 
  ChevronRight,
  Inbox,
  Trash2
} from "lucide-react";
import { SaleStatus, PaymentStatus } from "@/features/sales";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import ListFooter from "@/components/common/ListFooter";
import SelectionBar from "@/components/common/SelectionBar";
import ConfirmationModal from "@/components/common/ConfirmationModal";

interface Props {
  searchQuery: string;
  filterMode: string;
  onSelectSale: (id: string) => void;
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);
}

export default function SalesList({ searchQuery, filterMode, onSelectSale }: Props) {
  const { sales, deleteSales } = useSales();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<string | null>(null);
  const itemsPerPage = 15;

  const filteredSales = sales.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterMode === "all") return matchesSearch;
    if (filterMode === "processing") return matchesSearch && (s.status === "Processing" || s.status === "Paid" || s.status === "Packed");
    if (filterMode === "shipped") return matchesSearch && s.status === "Shipped";
    if (filterMode === "completed") return matchesSearch && s.status === "Completed";
    
    return matchesSearch;
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSales = filteredSales.slice(startIndex, startIndex + itemsPerPage);

  const getStatusVariant = (status: SaleStatus): any => {
    switch (status) {
      case "Completed": return "success";
      case "Shipped": return "info";
      case "Packed":
      case "Processing": return "warning";
      case "Paid": return "success";
      case "Pending": return "neutral";
      case "Cancelled": return "error";
      default: return "neutral";
    }
  };

  const getPaymentVariant = (status: PaymentStatus): any => {
    switch (status) {
      case "Paid": return "success";
      case "Unpaid": return "error";
      case "Partially Paid": return "warning";
      default: return "neutral";
    }
  };

  const toggleAll = () => {
    if (selectedIds.size === paginatedSales.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedSales.map(s => s.id)));
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

  if (filteredSales.length === 0) {
    return (
      <EmptyState 
        icon={Inbox}
        title="No orders found"
        description="Try adjusting your filters or search query."
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-background relative">
      <div className="flex-1 overflow-hidden">
        <Table>
          <TableHeader className="bg-[#faf5f5]/50">
            <TableRow>
              <TableHead className="w-10">
                <div className="flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.size > 0 && selectedIds.size === paginatedSales.length}
                    onChange={toggleAll}
                    className="w-3.5 h-3.5 rounded-sm border-black/10 accent-primary cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                  />
                </div>
              </TableHead>
              <TableHead>Order #</TableHead>
              <TableHead className="w-[30%] ml-3">Opportunity</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead className="px-6 py-4 text-right font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSales.map((sale) => {
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
                    <span className="font-mono text-[10.5px] font-bold text-on-surface opacity-60 tracking-tight">
                      {sale.orderNumber}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5 ml-3">
                      <span className="font-display font-semibold text-[13px] text-on-surface opacity-90 group-hover:text-primary transition-colors leading-tight">
                        {sale.title}
                      </span>
                      <span className="font-body-sm text-[9px] text-on-surface-variant opacity-60 truncate uppercase tracking-widest font-bold leading-none">
                        {sale.items.length} items • {sale.items[0]?.sku || "N/A"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-on-surface-variant opacity-60">
                      <Building2 size={11} className="opacity-60" />
                      <span className="font-display text-[11.5px] truncate max-w-[120px]">{sale.contactName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(sale.status)}>
                      {sale.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPaymentVariant(sale.paymentStatus)} dot={false} className="opacity-70">
                      {sale.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-bold text-on-surface font-display text-[12.5px] opacity-80">
                      {formatCurrency(sale.value)}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-5 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-on-surface-variant opacity-60 hover:text-red-500 hover:opacity-100 hover:bg-red-50"
                        onClick={(e) => handleDeleteOne(e, sale.id)}
                      >
                        <Trash2 size={13} />
                      </Button>
                      <ChevronRight size={14} className="opacity-60 ml-1" />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <ListFooter 
        totalItems={filteredSales.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        label="orders"
      />

      <SelectionBar 
        count={selectedIds.size}
        onClear={() => setSelectedIds(new Set())}
        onDelete={() => setIsDeleteModalOpen(true)}
        label="orders"
      />

      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSaleToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title={saleToDelete ? "Delete Order" : "Delete Selected Orders"}
        description={saleToDelete ? "Are you sure you want to delete this order? This will permanently remove all item associations and transaction history." : `Are you sure you want to delete ${selectedIds.size} selected orders? This action cannot be undone.`}
      />
    </div>
  );
}
