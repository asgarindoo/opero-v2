"use client";

import React, { useState } from "react";
import { Plus, LayoutList, LayoutGrid } from "lucide-react";
import { SalesProvider, useSales } from "@/features/sales/context/SalesContext";
import SalesList from "@/features/sales/components/SalesList";
import SalesKanban from "@/features/sales/components/SalesKanban";
import SalesDrawer from "@/features/sales/components/SalesDrawer";
import AddSaleModal from "@/features/sales/components/AddSaleModal";

import ModuleHeader from "@/components/common/ModuleHeader";
import ModuleTabs from "@/components/common/ModuleTabs";
import SearchInput from "@/components/common/SearchInput";
import Button from "@/components/ui/Button";

type ViewMode = "kanban" | "list";
type FilterMode = "all" | "processing" | "shipped" | "completed";

function SalesPageContent() {
  const { sales } = useSales();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Removed icons from tabs as requested
  const tabs = [
    { id: "all", label: "All Orders" },
    { id: "processing", label: "Processing" },
    { id: "shipped", label: "Shipped" },
    { id: "completed", label: "Completed" },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      
      <ModuleHeader 
        title="Order Management"
        count={sales.length}
        rightContent={(
          <>
            <div className="flex items-center p-0.5 bg-black/[0.03] rounded-lg mr-1.5">
               <button 
                 onClick={() => setViewMode("list")}
                 className={`p-1 rounded-md transition-all ${viewMode === "list" ? "bg-white shadow-sm text-primary" : "text-on-surface-variant opacity-60 hover:opacity-100"}`}
               >
                  <LayoutList size={13} strokeWidth={2} />
               </button>
               <button 
                 onClick={() => setViewMode("kanban")}
                 className={`p-1 rounded-md transition-all ${viewMode === "kanban" ? "bg-white shadow-sm text-primary" : "text-on-surface-variant opacity-60 hover:opacity-100"}`}
               >
                  <LayoutGrid size={13} strokeWidth={2} />
               </button>
            </div>

            <SearchInput 
              value={searchQuery} 
              onChange={setSearchQuery} 
              placeholder="Search orders, customers..." 
              width={180}
            />

            <Button 
              variant="primary" 
              size="sm" 
              icon={Plus}
              onClick={() => setShowAddModal(true)}
            >
              NEW ORDER
            </Button>
          </>
        )}
      />

      <ModuleTabs 
        tabs={tabs}
        activeTab={filterMode}
        onTabChange={(id) => setFilterMode(id as FilterMode)}
        background="bg-[#faf5f5]" // Applied brand tone background
      />

      <div className="flex-1 overflow-hidden bg-background">
        {viewMode === "kanban" ? (
          <SalesKanban searchQuery={searchQuery} filterMode={filterMode} onSelectSale={setSelectedSaleId} onAddNew={() => setShowAddModal(true)} />
        ) : (
          <SalesList searchQuery={searchQuery} filterMode={filterMode} onSelectSale={setSelectedSaleId} />
        )}
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
