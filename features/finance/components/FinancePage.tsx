"use client";

import React, { useState, useMemo } from "react";
import { 
  Inbox,
  ArrowUpRight,
  ArrowDownRight,
  Plus
} from "lucide-react";
import { FinanceProvider, useFinance } from "@/features/finance";
import FinanceListView from "@/features/finance/components/FinanceListView";
import FinanceDetail from "@/features/finance/components/FinanceDetail";
import AddTransactionModal from "@/features/finance/components/AddTransactionModal";
import ModuleHeader from "@/components/common/ModuleHeader";
import ModuleTabs from "@/components/common/ModuleTabs";
import SearchInput from "@/components/common/SearchInput";
import DateRangePicker from "@/components/common/DateRangePicker";
import Button from "@/components/ui/Button";
import ExportButton from "@/components/common/ExportButton";

function FinanceContent() {
  const { 
    transactions,
    summary, 
    searchQuery, 
    setSearchQuery, 
    selectedType, 
    setSelectedType,
    dateRange,
    setDateRange
  } = useFinance();
  
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const categories: { id: string; label: string }[] = [
    { id: "All", label: "All" },
    { id: "Income", label: "Income" },
    { id: "Expense", label: "Expense" },
    { id: "Transfer", label: "Transfer" },
  ];

  const filtered = transactions;

  const selectedTx = useMemo(() => 
    transactions.find(tx => tx.id === selectedTxId) || null
  , [transactions, selectedTxId]);

  if (selectedTx) {
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
         <FinanceDetail 
           transaction={selectedTx} 
           onClose={() => setSelectedTxId(null)} 
         />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      <ModuleHeader 
        title="Finance"
        count={transactions.length}
        leftContent={(
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
               <span className="font-label-caps text-[9px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">Balance</span>
               <span className="font-display text-[14px] font-bold text-on-surface">${summary.balance.toLocaleString()}</span>
            </div>
            <div className="h-4 w-px bg-black/[0.06]" />
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2">
                 <ArrowUpRight size={12} className="text-emerald-500 opacity-60" />
                 <span className="font-label-caps text-[9px] font-bold text-on-surface-variant opacity-60 uppercase">Income: ${summary.totalIncome.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                 <ArrowDownRight size={12} className="text-red-500 opacity-60" />
                 <span className="font-label-caps text-[9px] font-bold text-on-surface-variant opacity-60 uppercase">Expense: ${summary.totalExpense.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
        rightContent={(
          <>
            <SearchInput 
              value={searchQuery} 
              onChange={setSearchQuery} 
              placeholder="Search..." 
              width={160}
            />
            <DateRangePicker 
              value={dateRange} 
              onChange={(v) => setDateRange(v as any)} 
            />
            <Button 
              variant="primary" 
              size="sm" 
              icon={Plus}
              onClick={() => setIsAddModalOpen(true)}
            >
              NEW ENTRY
            </Button>
          </>
        )}
      />

      <ModuleTabs 
        tabs={categories}
        activeTab={selectedType}
        onTabChange={(id) => setSelectedType(id as any)}
        background="bg-black/[0.01]"
        rightContent={(
            <ExportButton className="mr-4" />
        )}
      />

      <main className="flex-1 overflow-y-auto">
         {filtered.length > 0 ? (
           <FinanceListView 
             transactions={filtered} 
             onTransactionClick={(tx) => setSelectedTxId(tx.id)} 
           />
         ) : (
           <div className="flex flex-col items-center justify-center py-40 text-on-surface-variant opacity-60">
             <Inbox size={48} strokeWidth={1} className="mb-6" />
             <p className="font-display text-[14px] font-semibold tracking-[0.2em] uppercase">No transactions found</p>
           </div>
         )}
      </main>

      {isAddModalOpen && (
        <AddTransactionModal onClose={() => setIsAddModalOpen(false)} />
      )}
    </div>
  );
}

export default function FinancePage() {
  return (
    <FinanceProvider>
      <FinanceContent />
    </FinanceProvider>
  );
}
