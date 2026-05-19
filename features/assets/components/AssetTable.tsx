"use client";

import React, { useState } from "react";
import { useAssets } from "../context/AssetsContext";
import { AssetStatus } from "../types";
import { 
  MoreVertical, 
  ChevronRight,
  Search,
  Trash2
} from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ListFooter from "@/components/common/ListFooter";
import SelectionBar from "@/components/common/SelectionBar";
import ConfirmationModal from "@/components/common/ConfirmationModal";

interface Props {
  searchQuery: string;
  filterMode: string;
  onSelectAsset: (id: string) => void;
}

export default function AssetTable({ searchQuery, filterMode, onSelectAsset }: Props) {
  const { assets, deleteAssets } = useAssets();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<string | null>(null);
  const itemsPerPage = 20;

  const filteredAssets = assets.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      a.assetCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.assignedTo?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterMode === "all") return matchesSearch;
    if (filterMode === "in_use") return matchesSearch && a.status === "In Use";
    if (filterMode === "maintenance") return matchesSearch && a.status === "Maintenance";
    if (filterMode === "damaged") return matchesSearch && a.status === "Damaged";
    
    return matchesSearch;
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAssets = filteredAssets.slice(startIndex, startIndex + itemsPerPage);

  const getStatusVariant = (status: AssetStatus): any => {
    switch (status) {
      case "Active": return "success";
      case "In Use": return "info";
      case "Maintenance": return "warning";
      case "Damaged": return "error";
      case "Archived": return "neutral";
      default: return "neutral";
    }
  };

  const toggleAll = () => {
    if (selectedIds.size === paginatedAssets.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedAssets.map(a => a.id)));
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
    setAssetToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (assetToDelete) {
      deleteAssets([assetToDelete]);
      setAssetToDelete(null);
    } else {
      deleteAssets(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
    setIsDeleteModalOpen(false);
  };

  if (filteredAssets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant opacity-60">
        <Search size={40} strokeWidth={1} className="mb-4" />
        <p className="font-display text-[13px] tracking-wide uppercase">No assets found</p>
      </div>
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
                    checked={selectedIds.size > 0 && selectedIds.size === paginatedAssets.length}
                    onChange={toggleAll}
                    className="w-3.5 h-3.5 rounded-sm border-black/10 accent-primary cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                  />
                </div>
              </TableHead>
              <TableHead>Asset Code</TableHead>
              <TableHead className="w-[30%] ml-3">Asset Name / Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Location / Dept</TableHead>
              <TableHead className="text-right">Purchased</TableHead>
              <TableHead className="px-6 py-4 text-right font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAssets.map((asset) => {
              const isSelected = selectedIds.has(asset.id);

              return (
                <TableRow 
                  key={asset.id}
                  onClick={() => onSelectAsset(asset.id)}
                  className={`group ${isSelected ? "bg-primary/[0.02]" : ""}`}
                >
                  <TableCell onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={(e) => toggleOne(asset.id, e as any)}
                        className={`w-3.5 h-3.5 rounded-sm border-black/10 accent-primary cursor-pointer transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-60"}`}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-[10.5px] font-bold text-on-surface opacity-60 tracking-tight">
                      {asset.assetCode}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="min-w-0 ml-3">
                      <p className="font-display font-semibold text-[13px] text-on-surface truncate group-hover:text-primary transition-colors opacity-90 leading-tight">
                        {asset.name}
                      </p>
                      <p className="font-body-sm text-[9px] text-on-surface-variant opacity-60 truncate uppercase font-bold tracking-widest mt-0.5 leading-none">
                        {asset.category}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(asset.status)}>
                      {asset.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {asset.assignedTo ? (
                      <div className="flex items-center gap-1.5 font-display text-[11.5px] text-on-surface opacity-80">
                        <div className="w-5 h-5 rounded-full bg-black/5 flex items-center justify-center font-bold text-[8px] text-on-surface-variant">
                          {asset.assignedTo.charAt(0)}
                        </div>
                        {asset.assignedTo}
                      </div>
                    ) : (
                      <span className="font-body-sm text-[11px] text-on-surface-variant opacity-60 italic">— Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="min-w-0">
                      <p className="font-display text-[11.5px] text-on-surface-variant opacity-70 truncate">{asset.location || "N/A"}</p>
                      <p className="font-body-sm text-[9px] text-on-surface-variant opacity-60 truncate uppercase tracking-tighter leading-none mt-0.5">{asset.department || "No Department"}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-display text-[11px] text-on-surface-variant opacity-60">
                      {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : "N/A"}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-5 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-on-surface-variant opacity-60 hover:text-red-500 hover:opacity-100 hover:bg-red-50"
                        onClick={(e) => handleDeleteOne(e, asset.id)}
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
        totalItems={filteredAssets.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        label="assets"
      />

      <SelectionBar 
        count={selectedIds.size}
        onClear={() => setSelectedIds(new Set())}
        onDelete={() => setIsDeleteModalOpen(true)}
        label="assets"
      />

      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setAssetToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title={assetToDelete ? "Delete Asset" : "Delete Selected Assets"}
        description={assetToDelete ? "Are you sure you want to delete this asset? This will permanently remove it from your inventory and assignment history." : `Are you sure you want to delete ${selectedIds.size} selected assets? This action cannot be undone.`}
      />
    </div>
  );
}
