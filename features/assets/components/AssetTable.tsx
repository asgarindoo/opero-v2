"use client";

import React, { useState } from "react";
import { useAssets } from "../context/AssetsContext";
import { AssetStatus } from "@/features/assets";
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
import { EmptyState } from "@/components/common/DataState";

interface Props {
  searchQuery: string;
  filterMode: string;
  onSelectAsset: (id: string) => void;
}

export default function AssetTable({ searchQuery, filterMode, onSelectAsset }: Props) {
  const { assets, deleteAssets, loading } = useAssets();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<string | null>(null);
  const itemsPerPage = 20;

  const filteredAssets = assets.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.assetCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterMode === "all") return matchesSearch;
    if (filterMode === "available") return matchesSearch && a.status === "Available";
    if (filterMode === "in_use") return matchesSearch && a.status === "In Use";
    if (filterMode === "maintenance") return matchesSearch && a.status === "Maintenance";
    if (filterMode === "damaged") return matchesSearch && a.status === "Damaged";
    if (filterMode === "archived") return matchesSearch && a.status === "Archived";

    return matchesSearch;
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAssets = filteredAssets.slice(startIndex, startIndex + itemsPerPage);

  const getStatusVariant = (status: AssetStatus): any => {
    switch (status) {
      case "Available": return "success";
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

  if (!loading && filteredAssets.length === 0) {
    return (
      <EmptyState
        icon="web_asset"
        title="No assets found"
        description="Register your business assets to monitor inventory and maintenance."
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-background relative">
      <div className="flex-1 overflow-auto">
        <Table className="min-w-[800px]">
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
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Purchased</TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
                  <TableCell className="max-w-[0px]">
                    <div className="h-3 w-16 bg-black/[0.04] rounded animate-pulse" />
                  </TableCell>
                  <TableCell className="max-w-[0px]">
                    <div className="flex flex-col gap-1.5 w-full ml-3">
                      <div className="h-3.5 w-32 bg-black/[0.04] rounded animate-pulse" />
                      <div className="h-2 w-20 bg-black/[0.04] rounded animate-pulse" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4.5 w-16 bg-black/[0.04] rounded-sm animate-pulse" />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell max-w-[0px]">
                    <div className="h-3 w-20 bg-black/[0.04] rounded animate-pulse" />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell max-w-[0px]">
                    <div className="h-3 w-16 bg-black/[0.04] rounded animate-pulse" />
                  </TableCell>
                  <TableCell className="text-right hidden lg:table-cell max-w-[0px]">
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
              paginatedAssets.map((asset) => {
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
                    <TableCell className="max-w-[0px]">
                      <span className="font-mono text-[10.5px] font-bold text-on-surface opacity-60 tracking-tight truncate block w-full">
                        {asset.assetCode}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[0px]">
                      <div className="min-w-0 ml-3">
                        <p className="font-display font-semibold text-[13px] text-on-surface truncate w-full group-hover:text-primary transition-colors opacity-90 leading-tight flex items-center gap-1.5">
                          <span>{asset.name}</span>
                          {asset.quantity > 1 && (
                            <span className="font-label-caps text-[9px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest bg-black/5 px-1 rounded shrink-0">x{asset.quantity}</span>
                          )}
                        </p>
                        <p className="font-body-sm text-[9px] text-on-surface-variant opacity-60 truncate w-full uppercase font-bold tracking-widest mt-0.5 leading-none block">
                          {asset.category}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(asset.status)}>
                        {asset.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell max-w-[0px]">
                      <div className="min-w-0">
                        <p className="font-display text-[11.5px] text-on-surface-variant opacity-70 truncate w-full block">{asset.location || "N/A"}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right hidden lg:table-cell max-w-[0px]">
                      <span className="font-display text-[11px] text-on-surface-variant opacity-60 truncate block w-full">
                        {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : "N/A"}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 text-center">
                      <div className="w-full flex justify-center items-center gap-0.5 opacity-30 group-hover:opacity-100 transition-all">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6.5 w-6.5 text-on-surface-variant hover:text-red-500 hover:bg-red-50 transition-all"
                          onClick={(e) => handleDeleteOne(e, asset.id)}
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
        title={assetToDelete ? "Delete asset?" : "Delete selected assets?"}
        description={assetToDelete ? "This action permanently removes the asset from your inventory." : `This action permanently removes ${selectedIds.size} assets. This action cannot be undone.`}
        confirmLabel={assetToDelete ? "Delete Asset" : "Delete Assets"}
      />
    </div>
  );
}
