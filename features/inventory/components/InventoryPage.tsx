"use client";

import React, { useState } from "react";
import { 
  Plus
} from "lucide-react";
import { InventoryProvider, useInventory } from "@/features/inventory/context/InventoryContext";
import ProductTable from "@/features/inventory/components/ProductTable";
import AddProductModal from "@/features/inventory/components/AddProductModal";
import ModuleHeader from "@/components/common/ModuleHeader";
import ModuleTabs from "@/components/common/ModuleTabs";
import SearchInput from "@/components/common/SearchInput";
import Button from "@/components/ui/Button";
import ExportButton from "@/components/common/ExportButton";

function InventoryContent() {
  const { 
    products,
    allProducts,
    searchQuery, 
    setSearchQuery, 
    selectedStatus, 
    setSelectedStatus 
  } = useInventory();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const statuses: { id: string; label: string }[] = [
    { id: "All", label: "All Items" },
    { id: "In Stock", label: "In Stock" },
    { id: "Low Stock", label: "Low Stock" },
    { id: "Out of Stock", label: "Out of Stock" },
    { id: "Archived", label: "Archived" },
  ];

  // Stats are calculated from allProducts to remain static regardless of filters
  const lowStockCount = allProducts.filter(p => p.status === "Low Stock").length;
  const outOfStockCount = allProducts.filter(p => p.status === "Out of Stock").length;

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      
      <ModuleHeader 
        title="Inventory"
        count={products.length}
        leftContent={(
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
               <div className={`w-1.5 h-1.5 rounded-full ${lowStockCount > 0 ? "bg-[#F59E0B]" : "bg-black/[0.1]"}`} />
               <span className="font-label-caps text-[9px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">Low Stock:</span>
               <span className={`font-display text-[14px] font-bold ${lowStockCount > 0 ? "text-[#F59E0B] opacity-80" : "text-on-surface opacity-60"}`}>{lowStockCount}</span>
            </div>
            <div className="flex items-center gap-2">
               <div className={`w-1.5 h-1.5 rounded-full ${outOfStockCount > 0 ? "bg-[#EF4444]" : "bg-black/[0.1]"}`} />
               <span className="font-label-caps text-[9px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">Out of Stock:</span>
               <span className={`font-display text-[14px] font-bold ${outOfStockCount > 0 ? "text-[#EF4444] opacity-80" : "text-on-surface opacity-60"}`}>{outOfStockCount}</span>
            </div>
          </div>
        )}
        rightContent={(
          <>
            <SearchInput 
              value={searchQuery} 
              onChange={setSearchQuery} 
              placeholder="Search inventory..." 
              width={180}
            />
            <Button 
              variant="primary" 
              size="sm" 
              icon={Plus}
              onClick={() => setIsAddModalOpen(true)}
            >
              NEW PRODUCT
            </Button>
          </>
        )}
      />

      <ModuleTabs 
        tabs={statuses}
        activeTab={selectedStatus}
        onTabChange={(id) => setSelectedStatus(id as any)}
        background="bg-[#faf5f5]" // Applied specific brand tone
        rightContent={(
            <ExportButton label="Export Catalog" className="mr-4" />
        )}
      />

      {/* ── Main Workspace Area ── */}
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="animate-fade-in">
          <ProductTable />
        </div>
      </main>

      {isAddModalOpen && (
        <AddProductModal onClose={() => setIsAddModalOpen(false)} />
      )}
    </div>
  );
}

export default function InventoryPage() {
  return (
    <InventoryProvider>
      <InventoryContent />
    </InventoryProvider>
  );
}
