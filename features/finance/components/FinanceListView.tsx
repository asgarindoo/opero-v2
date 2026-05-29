"use client";

import React, { useState } from "react";
import { useFinance } from "../context/FinanceContext";
import {
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Inbox,
  Trash2,
  MoreVertical
} from "lucide-react";
import type { Transaction } from "@/features/finance";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import { EmptyState } from "@/components/common/DataState";
import SelectionBar from "@/components/common/SelectionBar";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import Button from "@/components/ui/Button";

interface FinanceListViewProps {
  transactions: Transaction[];
  onTransactionClick: (transaction: Transaction) => void;
}

const getStatusVariant = (status: string): any => {
  switch (status) {
    case "Completed":
      return "success";
    case "Pending":
      return "warning";
    case "Cancelled":
      return "error";
    default:
      return "neutral";
  }
};

export default function FinanceListView({ transactions, onTransactionClick }: FinanceListViewProps) {
  const { deleteTransactions, loading } = useFinance();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [txToDelete, setTxToDelete] = useState<string | null>(null);

  const toggleAll = () => {
    if (selectedIds.size === transactions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(transactions.map(t => t.id)));
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
    setTxToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (txToDelete) {
      deleteTransactions([txToDelete]);
      setTxToDelete(null);
    } else {
      deleteTransactions(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
    setIsDeleteModalOpen(false);
  };

  if (!loading && transactions.length === 0) {
    return (
      <EmptyState
        icon="account_balance_wallet"
        title="No transactions found"
        description="Try adjusting your filters or search query to find what you're looking for."
      />
    );
  }

  return (
    <div className="animate-in fade-in duration-500 relative overflow-auto">
      <Table className="min-w-[800px]">
        <TableHeader className="bg-[#faf5f5]/50">
          <TableRow>
            <TableHead className="w-10">
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={selectedIds.size > 0 && selectedIds.size === transactions.length}
                  onChange={toggleAll}
                  className="w-3.5 h-3.5 rounded-sm border-black/10 accent-primary cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                />
              </div>
            </TableHead>
            <TableHead>Reference / Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-28 px-4"><div className="w-full text-center">Actions</div></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            [...Array(5)].map((_, i) => (
              <TableRow key={i} className="h-14 hover:bg-black/[0.015] transition-colors">
                <TableCell>
                  <div className="w-full flex justify-center">
                    <div className="w-3.5 h-3.5 rounded-sm bg-black/[0.04] animate-pulse" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-[5px] bg-black/[0.04] animate-pulse shrink-0" />
                    <div className="flex flex-col gap-1.5 w-full">
                      <div className="h-3.5 w-32 bg-black/[0.04] rounded animate-pulse" />
                      <div className="h-2 w-20 bg-black/[0.04] rounded animate-pulse" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="h-4.5 w-16 bg-black/[0.04] rounded-sm animate-pulse" />
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="h-3 w-20 bg-black/[0.04] rounded animate-pulse" />
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="h-3 w-16 bg-black/[0.04] rounded animate-pulse" />
                </TableCell>
                <TableCell className="text-right">
                  <div className="h-3.5 w-16 bg-black/[0.04] rounded animate-pulse ml-auto" />
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
            transactions.map((tx) => {
              const isIncome = tx.type === "Income";
              const isSelected = selectedIds.has(tx.id);

              return (
                <TableRow
                  key={tx.id}
                  onClick={() => onTransactionClick(tx)}
                  className={`group ${isSelected ? "bg-primary/[0.02]" : ""}`}
                >
                  <TableCell onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => toggleOne(tx.id, e as any)}
                        className={`w-3.5 h-3.5 rounded-sm border-black/10 accent-primary cursor-pointer transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-60"}`}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[0px]">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-6 h-6 rounded-[5px] flex shrink-0 items-center justify-center transition-all bg-black/[0.03] text-on-surface-variant opacity-60 group-hover:opacity-100`}>
                        {isIncome ? <ArrowUpRight size={12} className="text-emerald-600" /> : <ArrowDownRight size={12} className="text-red-500 opacity-60" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span
                          className="font-display text-[12.5px] font-semibold text-on-surface tracking-tight group-hover:text-primary transition-colors block leading-tight opacity-90 truncate w-full"
                          title={tx.title || "Manual Entry"}
                        >
                          {tx.title || "Manual Entry"}
                        </span>
                        <span className="font-mono text-[8.5px] text-on-surface-variant opacity-60 uppercase tracking-tighter truncate block">
                          {tx.reference || tx.id}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(tx.status)}>
                      {tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell max-w-[0px]">
                    <span className="text-on-surface-variant opacity-70 text-[11px] font-medium truncate block w-full" title={tx.category}>{tx.category}</span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell max-w-[0px]">
                    <span className="text-on-surface-variant opacity-70 text-[11px] font-display truncate block w-full">
                      {new Date(tx.transactionDate || (tx as any).date || new Date()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div
                      className={`font-display text-[13px] font-bold truncate max-w-[100px] ml-auto ${isIncome ? "text-emerald-600" : "text-on-surface opacity-70"}`}
                      title={`${isIncome ? "+" : "-"}${new Intl.NumberFormat("en-US", { style: "currency", currency: tx.currency || "USD" }).format(tx.amount)}`}
                    >
                      {isIncome ? "+" : "-"}{new Intl.NumberFormat("en-US", { style: "currency", currency: tx.currency || "USD" }).format(tx.amount)}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 text-center">
                    <div className="w-full flex justify-center items-center gap-0.5 opacity-30 group-hover:opacity-100 transition-all">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6.5 w-6.5 text-on-surface-variant hover:text-red-500 hover:bg-red-50 transition-all"
                        onClick={(e) => handleDeleteOne(e, tx.id)}
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
            })
          )}
        </TableBody>
      </Table>

      <SelectionBar
        count={selectedIds.size}
        onClear={() => setSelectedIds(new Set())}
        onDelete={() => setIsDeleteModalOpen(true)}
        label="transactions"
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTxToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title={txToDelete ? "Delete Transaction" : "Delete Selected Transactions"}
        description={txToDelete ? "Are you sure you want to delete this transaction record? This will permanently remove it from the ledger." : `Are you sure you want to delete ${selectedIds.size} selected transactions? This action cannot be undone.`}
      />
    </div>
  );
}
