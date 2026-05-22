import React from "react";
import { useSales } from "../context/SalesContext";
import { SaleStatus } from "@/features/sales";
import { User, DollarSign, Plus, MoreHorizontal } from "lucide-react";

interface Props {
  searchQuery: string;
  filterMode: string;
  onSelectSale: (id: string) => void;
  onAddNew: () => void;
}

const STATUSES: SaleStatus[] = ["Pending", "Processing", "Completed"];

function formatCurrency(val: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(val);
}

export default function SalesKanban({ searchQuery, filterMode, onSelectSale, onAddNew }: Props) {
  const { sales } = useSales();

  const filteredSales = sales.filter(s => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = s.title.toLowerCase().includes(q) ||
      (s.contactName ?? "").toLowerCase().includes(q) ||
      s.orderNumber.toLowerCase().includes(q);

    if (filterMode === "all") return matchesSearch;
    if (filterMode === "pending") return matchesSearch && s.status === "Pending";
    if (filterMode === "paid") return matchesSearch && s.paymentStatus === "Paid";
    if (filterMode === "completed") return matchesSearch && s.status === "Completed";

    return matchesSearch;
  });

  return (
    <div className="flex-1 flex gap-1 p-6 min-h-full overflow-x-auto bg-surface-container-low/30">
      {STATUSES.map(status => {
        const stageSales = filteredSales.filter(s => s.status === status);
        const stageTotal = stageSales.reduce((acc, curr) => acc + curr.total, 0);

        return (
          <div key={status} className="flex-1 min-w-[260px] max-w-[300px] flex flex-col gap-3">
            <div className="flex items-center justify-between px-2 mb-1">
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-[11px] text-on-surface opacity-80 uppercase tracking-widest">{status}</h3>
                <span className="font-body-sm text-[10px] text-on-surface-variant opacity-60 px-1.5 py-0.5 bg-black/5 rounded">{stageSales.length}</span>
              </div>
              <div className="font-display font-semibold text-[11px] text-on-surface opacity-60">
                {formatCurrency(stageTotal)}
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-3">
              {stageSales.map(sale => (
                <button
                  key={sale.id}
                  onClick={() => onSelectSale(sale.id)}
                  className="group relative flex flex-col gap-3 p-3.5 bg-surface-container-lowest rounded-xl border border-black/[0.04] text-left hover:border-black/[0.1] hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all animate-fade-in"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-display font-semibold text-[12.5px] text-on-surface leading-tight truncate group-hover:text-primary transition-colors">
                        {sale.title}
                      </h4>
                      <MoreHorizontal size={12} className="shrink-0 opacity-0 group-hover:opacity-60" />
                    </div>
                    <div className="font-mono text-[10px] text-on-surface-variant opacity-60 mb-1.5 tracking-tight font-bold">{sale.orderNumber}</div>
                    {sale.contactName && (
                      <div className="flex items-center gap-1.5 font-body-sm text-[11px] text-on-surface-variant opacity-60">
                        <User size={10} />
                        {sale.contactName}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-1.5 font-body-sm text-[12px] font-medium text-on-surface opacity-80 break-all">
                      <DollarSign size={10} className="text-on-surface-variant opacity-60 shrink-0" />
                      {formatCurrency(sale.total, sale.currency)}
                    </div>
                    <span className="font-label-caps text-[7.5px] font-bold px-1.5 py-0.5 rounded bg-black/5 text-on-surface-variant opacity-60 border border-black/[0.02]">
                      {sale.paymentStatus.toUpperCase()}
                    </span>
                  </div>
                </button>
              ))}

              <button
                onClick={onAddNew}
                className="flex items-center justify-center py-2.5 rounded-lg border border-dashed border-black/5 text-on-surface-variant opacity-60 hover:opacity-100 hover:border-black/10 hover:bg-black/[0.01] transition-all"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
