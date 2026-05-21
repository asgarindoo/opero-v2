"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { SalesProvider, useSales } from "@/features/sales";
import SalesList from "@/features/sales/components/SalesList";
import SalesDrawer from "@/features/sales/components/SalesDrawer";
import AddSaleModal from "@/features/sales/components/AddSaleModal";

import ModuleHeader from "@/components/common/ModuleHeader";
import ModuleTabs from "@/components/common/ModuleTabs";
import SearchInput from "@/components/common/SearchInput";
import Button from "@/components/ui/Button";

type FilterMode = "all" | "pending" | "paid" | "completed";

function SalesPageContent() {
  const { sales } = useSales();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const tabs = [
    { id: "all", label: "All Sales" },
    { id: "pending", label: "Pending" },
    { id: "paid", label: "Paid" },
    { id: "completed", label: "Completed" },
  ];

  // Summary stats
  const totalRevenue = sales.filter(s => s.paymentStatus === "Paid").reduce((acc, s) => acc + s.total, 0);
  const unpaidCount = sales.filter(s => s.paymentStatus === "Unpaid").length;

  function formatCurrency(val: number) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">

      <ModuleHeader
        title="Sales"
        count={sales.length}
        leftContent={(
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="font-label-caps text-[9px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">Revenue:</span>
              <span className="font-display text-[14px] font-bold text-on-surface opacity-80">{formatCurrency(totalRevenue)}</span>
            </div>
            {unpaidCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <span className="font-label-caps text-[9px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">Unpaid:</span>
                <span className="font-display text-[14px] font-bold text-red-500 opacity-80">{unpaidCount}</span>
              </div>
            )}
          </div>
        )}
        rightContent={(
          <>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search sales..."
              width={180}
            />
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setShowAddModal(true)}
            >
              NEW SALE
            </Button>
          </>
        )}
      />

      <ModuleTabs
        tabs={tabs}
        activeTab={filterMode}
        onTabChange={(id) => setFilterMode(id as FilterMode)}
        background="bg-[#faf5f5]"
      />

      <div className="flex-1 overflow-hidden bg-background">
        <SalesList searchQuery={searchQuery} filterMode={filterMode} onSelectSale={setSelectedSaleId} />
      </div>

      {selectedSaleId && <SalesDrawer saleId={selectedSaleId} onClose={() => setSelectedSaleId(null)} />}
      {showAddModal && <AddSaleModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}

export default function SalesPage() {
  return (
    <SalesProvider>
      <SalesPageContent />
    </SalesProvider>
  );
}
