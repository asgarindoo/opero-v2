"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { AssetsProvider, useAssets } from "@/features/assets/context/AssetsContext";
import AssetTable from "@/features/assets/components/AssetTable";
import AssetDrawer from "@/features/assets/components/AssetDrawer";
import AddAssetModal from "@/features/assets/components/AddAssetModal";

import ModuleHeader from "@/components/common/ModuleHeader";
import ModuleTabs from "@/components/common/ModuleTabs";
import SearchInput from "@/components/common/SearchInput";
import Button from "@/components/ui/Button";

type FilterMode = "all" | "in_use" | "maintenance" | "damaged";

function AssetsPageContent() {
  const { assets } = useAssets();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Removed icons for a cleaner, unified high-density look
  const tabs = [
    { id: "all", label: "All Assets" },
    { id: "in_use", label: "Assigned" },
    { id: "maintenance", label: "Maintenance" },
    { id: "damaged", label: "Damaged" },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <ModuleHeader 
        title="Company Assets"
        count={assets.length}
        rightContent={(
          <>
            <SearchInput 
              value={searchQuery} 
              onChange={setSearchQuery} 
              placeholder="Search by name, SN, owner..." 
              width={180}
            />
            <Button 
              variant="primary" 
              size="sm" 
              icon={Plus}
              onClick={() => setShowAddModal(true)}
            >
              REGISTER ASSET
            </Button>
          </>
        )}
      />

      <ModuleTabs 
        tabs={tabs}
        activeTab={filterMode}
        onTabChange={(id) => setFilterMode(id as FilterMode)}
        background="bg-[#faf5f5]" // Updated to match platform-wide secondary surface
      />

      <div className="flex-1 overflow-hidden bg-background">
        <AssetTable searchQuery={searchQuery} filterMode={filterMode} onSelectAsset={setSelectedAssetId} />
      </div>

      {selectedAssetId && <AssetDrawer assetId={selectedAssetId} onClose={() => setSelectedAssetId(null)} />}
      {showAddModal && <AddAssetModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}

export default function AssetsPage() {
  return (
    <AssetsProvider>
      <AssetsPageContent />
    </AssetsProvider>
  );
}
