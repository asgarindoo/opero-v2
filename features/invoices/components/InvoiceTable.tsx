"use client";

import React, { useState } from "react";
import { useInvoices } from "../context/InvoicesContext";
import { InvoiceStatus } from "@/features/invoices";
import {
  MoreVertical,
  ChevronRight,
  Download,
  FileText,
  Clock,
  Trash2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ListFooter from "@/components/common/ListFooter";
import SelectionBar from "@/components/common/SelectionBar";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { EmptyState } from "@/components/common/DataState";

interface Props {
  searchQuery: string;
  filterMode: string;
  onSelectInvoice: (id: string) => void;
}

export default function InvoiceTable({ searchQuery, filterMode, onSelectInvoice }: Props) {
  const { invoices, deleteInvoices } = useInvoices();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const itemsPerPage = 15;

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.contactName ?? "").toLowerCase().includes(searchQuery.toLowerCase());

    if (filterMode === "all") return matchesSearch;
    if (filterMode === "paid") return matchesSearch && inv.status === "Paid";
    if (filterMode === "unpaid") return matchesSearch && inv.status === "Unpaid";
    if (filterMode === "overdue") return matchesSearch && inv.status === "Overdue";

    return matchesSearch;
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + itemsPerPage);

  const getStatusVariant = (status: InvoiceStatus): any => {
    switch (status) {
      case "Paid": return "success";
      case "Unpaid": return "neutral";
      case "Overdue": return "error";
      case "Draft": return "neutral";
      case "Cancelled": return "error";
      default: return "neutral";
    }
  };

  const toggleAll = () => {
    if (selectedIds.size === paginatedInvoices.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedInvoices.map(i => i.id)));
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
    setInvoiceToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (invoiceToDelete) {
      deleteInvoices([invoiceToDelete]);
      setInvoiceToDelete(null);
    } else {
      deleteInvoices(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
    setIsDeleteModalOpen(false);
  };

  if (filteredInvoices.length === 0) {
    return (
      <EmptyState
        icon="receipt_long"
        title="No invoices found"
        description="Create an invoice to request payments from clients."
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#fef8f8] relative">
      <div className="flex-1 overflow-auto">
        <Table className="min-w-[800px]">
          <TableHeader className="bg-[#fbf5f5]">
            <TableRow>
              <TableHead className="w-10">
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.size > 0 && selectedIds.size === paginatedInvoices.length}
                    onChange={toggleAll}
                    className="w-3.5 h-3.5 rounded-sm border-black/10 accent-primary cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                  />
                </div>
              </TableHead>
              <TableHead>Invoice #</TableHead>
              <TableHead className="w-[25%] ml-3">Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Total Amount</TableHead>
              <TableHead className="px-6 py-4 text-right font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedInvoices.map((inv) => {
              const isSelected = selectedIds.has(inv.id);

              return (
                <TableRow
                  key={inv.id}
                  onClick={() => onSelectInvoice(inv.id)}
                  className={`group ${isSelected ? "bg-primary/[0.02]" : "hover:bg-black/[0.01]"}`}
                >
                  <TableCell onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => toggleOne(inv.id, e as any)}
                        className={`w-3.5 h-3.5 rounded-sm border-black/10 accent-primary cursor-pointer transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-60"}`}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[0px]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 shrink-0 rounded-[5px] bg-black/[0.03] flex items-center justify-center text-on-surface-variant opacity-60 group-hover:opacity-100 transition-opacity">
                        <FileText size={11} />
                      </div>
                      <span className="font-mono text-[10.5px] font-bold text-on-surface opacity-60 tracking-tight truncate block">
                        {inv.invoiceNumber}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[0px]">
                    <div className="min-w-0 ml-3">
                      <p className="font-display font-semibold text-[13px] text-on-surface opacity-90 truncate w-full group-hover:text-primary transition-colors leading-tight block">
                        {inv.contactName ?? <span className="opacity-30">—</span>}
                      </p>
                      <p className="font-body-sm text-[9px] text-on-surface-variant opacity-60 truncate w-full uppercase tracking-widest font-bold leading-none mt-0.5 block">
                        {inv.items.length} items
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(inv.status)}>
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-display text-[11px] text-on-surface-variant opacity-60">
                      {new Date(inv.issueDate).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Clock size={10} className="text-on-surface-variant opacity-60" />
                      <span className={`font-display text-[11.5px] ${inv.status === "Overdue" ? "text-red-500 opacity-80 font-semibold" : "text-on-surface-variant opacity-60"}`}>
                        {new Date(inv.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className="font-bold text-on-surface font-display text-[12.5px] opacity-80 block truncate max-w-[100px] ml-auto"
                      title={new Intl.NumberFormat("en-US", { style: "currency", currency: inv.currency || "USD" }).format(inv.totalAmount)}
                    >
                      {new Intl.NumberFormat("en-US", { style: "currency", currency: inv.currency || "USD" }).format(inv.totalAmount)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 text-center">
                    <div className="w-full flex justify-center items-center gap-0.5 opacity-30 group-hover:opacity-100 transition-all">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6.5 w-6.5 text-on-surface-variant hover:text-red-500 hover:bg-red-50 transition-all"
                        onClick={(e) => handleDeleteOne(e, inv.id)}
                      >
                        <Trash2 size={12} />
                      </Button>
                      <div className="ml-1 opacity-60">
                        <ChevronRight size={13} />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <ListFooter
        totalItems={filteredInvoices.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        label="invoices"
      />

      <SelectionBar
        count={selectedIds.size}
        onClear={() => setSelectedIds(new Set())}
        onDelete={() => setIsDeleteModalOpen(true)}
        label="invoices"
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setInvoiceToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title={invoiceToDelete ? "Delete Invoice" : "Delete Selected Invoices"}
        description={invoiceToDelete ? "Are you sure you want to delete this invoice? This action will permanently remove it from your ledger and cannot be undone." : `Are you sure you want to delete ${selectedIds.size} selected invoices? This action cannot be undone.`}
      />
    </div>
  );
}
