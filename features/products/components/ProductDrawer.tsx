import React, { useState } from "react";
import { useProducts } from "../context/ProductsContext";
import { X, Clock, ArrowUpRight, ArrowDownLeft, AlertTriangle, Package, Wrench, Star, DollarSign, FileText } from "lucide-react";
import type { StockActivity, ProductVariant } from "../types";

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(price);
}

export default function ProductDrawer({ productId, onClose }: { productId: string; onClose: () => void }) {
  const { allProducts, adjustStock } = useProducts();
  const product = allProducts.find(p => p.id === productId);
  const [adjustQty, setAdjustQty] = useState("");

  if (!product) return null;

  const isService = product.type === "Service";

  const handleAdjustStock = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(adjustQty);
    if (isNaN(qty) || qty === 0) return;
    adjustStock(product.id, qty, qty > 0 ? "stock_in" : "stock_out", `Manual adjustment: ${qty > 0 ? "Stock In" : "Stock Out"}`);
    setAdjustQty("");
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px] animate-fade-in" onClick={onClose} />

      <div className="relative w-full max-w-[560px] h-full bg-surface-container-lowest shadow-2xl flex flex-col animate-slide-in-right border-l border-black/[0.05]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0 bg-surface-container-lowest z-10 sticky top-0">
          <div className="flex items-center gap-2">
            <div className="px-2 py-1 rounded bg-black/5 font-mono text-[10px] font-bold text-on-surface-variant opacity-60">
              {product.sku}
            </div>
            <span className="font-label-caps text-[8px] font-bold px-1.5 py-0.5 rounded bg-black/5 text-on-surface-variant opacity-60 uppercase tracking-wide">
              {product.type}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md text-on-surface-variant opacity-50 hover:opacity-100 hover:bg-black/5 transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-8">

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-label-caps text-[8.5px] font-bold px-1.5 py-0.5 rounded bg-black/5 text-on-surface-variant border border-black/[0.03]">
                {product.status.toUpperCase()}
              </span>
              {product.category && (
                <span className="font-label-caps text-[8.5px] font-bold px-1.5 py-0.5 rounded bg-black/5 text-on-surface-variant opacity-60">
                  {product.category.toUpperCase()}
                </span>
              )}
            </div>
            <h3 
              className="font-display font-bold text-[20px] text-on-surface leading-tight mb-2 break-words break-all line-clamp-3"
              title={product.name}
            >
              {product.name}
            </h3>
            <div className="flex items-center gap-4 text-on-surface-variant opacity-70">
              <div className="flex items-center gap-1.5 font-body-sm text-[12px]">
                <DollarSign size={13} />
                {product.price > 0 ? formatPrice(product.price) : "Price not set"}
              </div>
              <div className="flex items-center gap-1.5 font-body-sm text-[12px]">
                <Clock size={13} /> Updated {new Date(product.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className={`grid gap-4 mb-8 ${isService ? "grid-cols-2" : "grid-cols-3"}`}>
            <div className="p-4 rounded-xl bg-surface-container-low/50 border border-black/[0.03]">
              <div className="font-label-caps text-[8.5px] text-on-surface-variant opacity-50 uppercase tracking-wider mb-1">Price</div>
              <div 
                className="font-display font-bold text-[18px] text-on-surface opacity-90 break-all"
                title={product.price > 0 ? formatPrice(product.price) : undefined}
              >
                {product.price > 0 ? formatPrice(product.price) : <span className="text-[14px] opacity-40">Not set</span>}
              </div>
            </div>
            {!isService && (
              <>
                <div className="p-4 rounded-xl bg-surface-container-low/50 border border-black/[0.03]">
                  <div className="font-label-caps text-[8.5px] text-on-surface-variant opacity-50 uppercase tracking-wider mb-1">Total Stock</div>
                  <div 
                    className={`font-display font-bold text-[18px] break-all ${product.totalQuantity <= product.minThreshold ? "text-amber-600" : "text-on-surface opacity-90"}`}
                    title={product.totalQuantity.toLocaleString()}
                  >
                    {product.totalQuantity.toLocaleString()}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-surface-container-low/50 border border-black/[0.03]">
                  <div className="font-label-caps text-[8.5px] text-on-surface-variant opacity-50 uppercase tracking-wider mb-1">Alert Threshold</div>
                  <div 
                    className="font-display font-bold text-[18px] text-on-surface opacity-40 break-all"
                    title={product.minThreshold.toLocaleString()}
                  >
                    {product.minThreshold.toLocaleString()}
                  </div>
                </div>
              </>
            )}
            {isService && (
              <div className="p-4 rounded-xl bg-surface-container-low/50 border border-black/[0.03]">
                <div className="font-label-caps text-[8.5px] text-on-surface-variant opacity-50 uppercase tracking-wider mb-1">Type</div>
                <div className="font-display font-bold text-[14px] text-on-surface opacity-70">Service</div>
              </div>
            )}
          </div>

          {/* Stock Adjustment — physical only */}
          {!isService && (
            <section className="mb-8 p-4 rounded-xl bg-surface-container-low/30 border border-dashed border-black/10">
              <h4 className="font-label-caps text-[9px] text-on-surface-variant opacity-40 uppercase tracking-wider mb-3">Quick Stock Adjust</h4>
              <form onSubmit={handleAdjustStock} className="flex gap-2">
                <input
                  type="number" placeholder="+/- Quantity" value={adjustQty} onChange={e => setAdjustQty(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-black/10 bg-surface-container-lowest focus:border-primary/40 outline-none transition-all font-body-sm text-[12px] text-on-surface"
                />
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-on-surface text-surface-container-lowest font-label-caps text-[9px] font-bold tracking-wide hover:opacity-90 transition-opacity">
                  ADJUST
                </button>
              </form>
            </section>
          )}

          {/* Variants */}
          {product.variants.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-label-caps text-[9px] text-on-surface-variant opacity-40 uppercase tracking-wider">Variants</h4>
              </div>
              <div className="space-y-1">
                {product.variants.map((variant: ProductVariant) => (
                  <div key={variant.id} className="flex items-center justify-between py-2.5 px-1 border-b border-black/[0.02]">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded bg-black/5 flex items-center justify-center text-on-surface-variant opacity-40 font-mono text-[9px] font-bold">
                        {variant.sku.slice(-3)}
                      </div>
                      <div>
                        <p className="font-display font-medium text-[12.5px] text-on-surface opacity-90">{variant.name}</p>
                        <p className="font-body-sm text-[10px] text-on-surface-variant opacity-40 font-mono">{variant.sku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {variant.price && (
                        <p className="font-body-sm font-semibold text-[11px] text-on-surface opacity-70">{formatPrice(variant.price)}</p>
                      )}
                      <p className="font-body-sm font-semibold text-[12px] text-on-surface opacity-80">{variant.quantity} units</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="w-full h-px bg-black/5 mb-8" />

          {/* Stock History Timeline */}
          {!isService && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-label-caps text-[9px] text-on-surface-variant opacity-40 uppercase tracking-wider">Stock History</h4>
                <button className="p-1.5 rounded-md hover:bg-black/5 text-on-surface-variant opacity-60 transition-colors">
                  <FileText size={12} />
                </button>
              </div>

              <div className="space-y-4">
                {product.activities.length === 0 ? (
                  <div className="text-center py-4 text-on-surface-variant opacity-30 font-body-sm text-[11px]">No stock movements yet</div>
                ) : (
                  product.activities.map((activity: StockActivity) => {
                    const Icon = activity.type === "stock_in" ? ArrowDownLeft : activity.type === "stock_out" ? ArrowUpRight : AlertTriangle;
                    const color = activity.type === "stock_in" ? "text-green-500" : activity.type === "stock_out" ? "text-red-500" : "text-amber-500";

                    return (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className={`mt-0.5 opacity-40 ${color}`}><Icon size={12} /></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-display font-medium text-[12px] text-on-surface opacity-90">{activity.description}</span>
                            <span className="font-body-sm text-[10px] text-on-surface-variant opacity-40">{new Date(activity.timestamp).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="font-body-sm text-[11px] text-on-surface-variant opacity-60">by {activity.author}</p>
                            {activity.quantity && (
                              <span className={`font-mono text-[11px] font-bold ${activity.quantity > 0 ? "text-green-600" : "text-red-600"}`}>
                                {activity.quantity > 0 ? "+" : ""}{activity.quantity}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
