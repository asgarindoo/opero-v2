"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { ProductsProvider, useProducts } from "@/features/products";
import ProductTable from "@/features/products/components/ProductTable";
import ProductDrawer from "@/features/products/components/ProductDrawer";
import AddProductModal from "@/features/products/components/AddProductModal";
import ModuleHeader from "@/components/common/ModuleHeader";
import ModuleTabs from "@/components/common/ModuleTabs";
import SearchInput from "@/components/common/SearchInput";
import Button from "@/components/ui/Button";
import ExportButton from "@/components/common/ExportButton";
import { useTenant } from "@/components/providers/TenantProvider";
import { canUse } from "@/lib/client/rbac";

function ProductsContent() {
  const { role } = useTenant();
  const canDeleteProducts = canUse(role, "products.delete");
  const {
    products,
    allProducts,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus
  } = useProducts();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const statuses: { id: string; label: string }[] = [
    { id: "All", label: "All Products" },
    { id: "In Stock", label: "In Stock" },
    { id: "Low Stock", label: "Low Stock" },
    { id: "Out of Stock", label: "Out of Stock" },
    { id: "Archived", label: "Archived" },
  ];

  const lowStockCount = allProducts.filter(p => p.status === "Low Stock" && p.type === "Physical").length;
  const outOfStockCount = allProducts.filter(p => p.status === "Out of Stock" && p.type === "Physical").length;
  const serviceCount = allProducts.filter(p => p.type === "Service").length;

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">

      <ModuleHeader
        title="Products"
        count={products.length}
        leftContent={(
          <div className="flex items-center gap-6">
            {serviceCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-black/[0.15]" />
                <span className="font-label-caps text-[9px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">Services:</span>
                <span className="font-display text-[14px] font-bold text-on-surface opacity-60">{serviceCount}</span>
              </div>
            )}
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
              placeholder="Search products..."
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
        background="bg-[#faf5f5]"
        rightContent={(
          <ExportButton label="Export Catalog" className="mr-4" />
        )}
      />

      <main className="flex-1 overflow-y-auto bg-background">
        <div className="animate-fade-in">
          <ProductTable onSelectProduct={setSelectedProductId} canDelete={canDeleteProducts} />
        </div>
      </main>

      {selectedProductId && (
        <ProductDrawer productId={selectedProductId} onClose={() => setSelectedProductId(null)} canDelete={canDeleteProducts} />
      )}

      {isAddModalOpen && (
        <AddProductModal onClose={() => setIsAddModalOpen(false)} />
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <ProductsProvider>
      <ProductsContent />
    </ProductsProvider>
  );
}
