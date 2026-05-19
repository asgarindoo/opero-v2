"use client";

import React from "react";
import Button from "../ui/Button";

interface ListFooterProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  label?: string;
  className?: string;
  showShowingText?: boolean;
}

export default function ListFooter({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  label = "items",
  className = "",
  showShowingText = true
}: ListFooterProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // If there's only one page and dataset is small, don't show the footer chrome at all
  if (totalPages <= 1 && totalItems < itemsPerPage) {
    return null;
  }

  return (
    <div className={`px-6 py-2.5 bg-white border-t border-black/[0.04] flex items-center justify-between shrink-0 ${className}`}>
      <div className="flex-1">
        {showShowingText && totalItems > 0 && (
          <span className="text-[10px] font-display font-medium text-on-surface-variant opacity-40 uppercase tracking-wider">
            {totalItems > itemsPerPage ? (
              <>Showing {Math.min(itemsPerPage, totalItems)} of {totalItems} {label}</>
            ) : (
              <>{totalItems} {label} total</>
            )}
          </span>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="h-7 px-3 text-[10px] font-bold tracking-widest opacity-60 hover:opacity-100 disabled:opacity-20"
          >
            PREV
          </Button>
          <div className="flex items-center gap-1 px-2">
            <span className="text-[10px] font-bold text-primary">{currentPage}</span>
            <span className="text-[10px] font-bold text-on-surface-variant opacity-20">/</span>
            <span className="text-[10px] font-bold text-on-surface-variant opacity-40">{totalPages}</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="h-7 px-3 text-[10px] font-bold tracking-widest opacity-60 hover:opacity-100 disabled:opacity-20"
          >
            NEXT
          </Button>
        </div>
      )}
    </div>
  );
}
