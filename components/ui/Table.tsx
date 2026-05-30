"use client";

import React from "react";

interface TableProps {
  children?: React.ReactNode;
  className?: string;
}

export function Table({ children, className = "" }: TableProps) {
  return (
    <div className="w-full">
      <table className={`w-full border-collapse ${className}`}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className = "" }: TableProps) {
  return (
    <thead className={`border-b border-black/[0.03] bg-[#fbf5f5] sticky top-0 z-10 ${className}`}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className = "" }: TableProps) {
  return (
    <tbody className={className}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className = "", onClick }: TableProps & { onClick?: () => void }) {
  return (
    <tr 
      onClick={onClick}
      className={`
        group transition-colors border-b border-black/[0.02]
        ${onClick ? 'cursor-pointer hover:bg-black/[0.01]' : ''}
        ${className}
      `}
    >
      {children}
    </tr>
  );
}

export function TableHead({ children, className = "" }: TableProps) {
  return (
    <th className={`
      px-6 py-2 text-left font-label-caps text-[9px] font-bold 
      text-on-surface-variant opacity-50 uppercase tracking-[0.15em]
      ${className}
    `}>
      {children}
    </th>
  );
}

export function TableCell({ children, className = "", onClick, ...props }: TableProps & { onClick?: (e: React.MouseEvent) => void } & React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td 
      onClick={onClick}
      className={`px-6 py-2 font-display text-[12px] text-on-surface ${className}`}
      {...props}
    >
      {children}
    </td>
  );
}
