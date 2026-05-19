"use client";

import React from "react";
import { Download } from "lucide-react";

interface ExportButtonProps {
  onClick?: () => void;
  className?: string;
  label?: string;
}

export default function ExportButton({ 
  onClick, 
  className = "", 
  label = "Export"
}: ExportButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 text-on-surface-variant opacity-60 hover:opacity-100 transition-all ${className}`}
    >
       <Download size={13} />
       <span className="font-label-caps text-[9px] font-bold uppercase">{label}</span>
    </button>
  );
}
