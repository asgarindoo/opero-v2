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
    case "Paid":
    case "Approved":
      return "success";
    case "Pending":
    case "Processing":
      return "warning";
    case "Overdue":
    case "Rejected":
      return "error";
    default:
      return "neutral";
  }
};

export default function FinanceListView({ transactions, onTransactionClick }: FinanceListViewProps) {
  const { deleteTransactions } = useFinance();
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

  if (transactions.length === 0) {
    return (
      <EmptyState 
        icon="account_balance_wallet"
        title="No transactions found"
        description="Try adjusting your filters or search query to find what you're looking for."
      />
    );
  }

  return (
    <div className="animate-in fade-in duration-500 relative">
      <Table>
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
            <TableHead>Reference / Entity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="px-6 py-4 text-right font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => {
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
                <TableCell>
                  <div className="flex items-center gap-2.5">
                     <div className={`w-6 h-6 rounded-[5px] flex items-center justify-center transition-all bg-black/[0.03] text-on-surface-variant opacity-60 group-hover:opacity-100`}>
                        {isIncome ? <ArrowUpRight size={12} className="text-emerald-600" /> : <ArrowDownRight size={12} className="text-red-500 opacity-60" />}
                     </div>
                     <div>
                        <span className="font-display text-[12.5px] font-semibold text-on-surface tracking-tight group-hover:text-primary transition-colors block leading-tight opacity-90">
                          {tx.contactName || "Direct Ledger Entry"}
                        </span>
                        <span className="font-mono text-[8.5px] text-on-surface-variant opacity-60 uppercase tracking-tighter">
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
                <TableCell>
                   <span className="text-on-surface-variant opacity-60 text-[11px] font-medium font-label-caps tracking-wider uppercase">{tx.category}</span>
                </TableCell>
                <TableCell>
                   <span className="text-on-surface-variant opacity-60 text-[10.5px] font-display">
                     {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                   </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className={`font-display text-[13px] font-bold ${isIncome ? "text-emerald-600" : "text-on-surface opacity-70"}`}>
                    {isIncome ? "+" : "-"}${tx.amount.toLocaleString()}
                  </div>
                </TableCell>
                <TableCell className="px-6 py-5 whitespace-nowrap text-right">
                   <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-on-surface-variant opacity-60 hover:text-red-500 hover:opacity-100 hover:bg-red-50"
                        onClick={(e) => handleDeleteOne(e, tx.id)}
                      >
                        <Trash2 size={13} />
                      </Button>
                      <ChevronRight size={12} className="text-on-surface-variant opacity-60 ml-1" />
                   </div>
                </TableCell>
              </TableRow>
            );
          })}
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
