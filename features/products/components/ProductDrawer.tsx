import React, { useState } from "react";
import { useProducts } from "../context/ProductsContext";
import { X, Clock, ArrowUpRight, ArrowDownLeft, AlertTriangle, Package, Wrench, Star, DollarSign, FileText, MessageSquare } from "lucide-react";
import type { StockActivity, ProductVariant } from "../types";
import { useTenant } from "@/components/providers/TenantProvider";
import Drawer from "@/components/ui/Drawer";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(price);
}

export default function ProductDrawer({ productId, onClose }: { productId: string; onClose: () => void }) {
  const { allProducts, adjustStock, addActivity } = useProducts();
  const product = allProducts.find(p => p.id === productId);
  const { user } = useTenant();
  const [adjustQty, setAdjustQty] = useState("");
  const [tab, setTab] = useState<"details" | "activity">("details");
  const [newNote, setNewNote] = useState("");

  if (!product) return null;

  const isService = product.type === "Service";

  const handleAdjustStock = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(adjustQty);
    if (isNaN(qty) || qty === 0) return;
    adjustStock(product.id, qty, qty > 0 ? "stock_in" : "stock_out", `Manual adjustment: ${qty > 0 ? "Stock In" : "Stock Out"}`);
    setAdjustQty("");
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    addActivity(product.id, { 
      type: "note", 
      description: newNote,
      quantity: 0
    });
    setNewNote("");
  };

  return (
    <Drawer
      isOpen={true}
      onClose={onClose}
      title={product.sku}
      size="sm"
      footer={
        <div className="flex items-center justify-end w-full">
          <Button variant="ghost" size="sm" onClick={onClose}>CLOSE</Button>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Title */}
        <div className="space-y-2">
          <h1
            className="font-display text-[22px] font-bold text-on-surface tracking-tight break-words break-all line-clamp-3"
            title={product.name}
          >
            {product.name}
          </h1>
          <div className="flex items-center gap-2">
            <Badge variant={product.status === "In Stock" ? "success" : product.status === "Archived" ? "warning" : "error"}>{product.status.toUpperCase()}</Badge>
            <Badge variant="info">{product.type}</Badge>
            {product.category && <span className="font-label-caps text-[9px] font-bold text-on-surface-variant opacity-30">{product.category.toUpperCase()}</span>}
          </div>
        </div>

        {/* Quick Meta */}
        <div className="grid grid-cols-2 gap-4 py-4 border-y border-black/[0.04]">
          <div className="space-y-1">
            <span className="font-label-caps text-[8px] font-bold text-on-surface-variant opacity-30 uppercase tracking-widest">Price</span>
            <div className="font-body-sm text-[12px] text-on-surface flex items-center gap-1.5"><DollarSign size={13}/> {product.price > 0 ? formatPrice(product.price) : "Not set"}</div>
          </div>
          <div className="space-y-1">
            <span className="font-label-caps text-[8px] font-bold text-on-surface-variant opacity-30 uppercase tracking-widest">Updated</span>
            <div className="font-body-sm text-[12px] text-on-surface flex items-center gap-1.5"><Clock size={13}/> {new Date(product.updatedAt).toLocaleDateString()}</div>
          </div>
        </div>

        {/* Tabs for Details/Activity */}
        <div className="flex gap-6 border-b border-black/[0.04]">
          {(["details", "activity"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-3 font-label-caps text-[10px] font-bold uppercase tracking-wider transition-all relative ${tab === t ? 'text-primary' : 'text-on-surface-variant opacity-30 hover:opacity-100'}`}
            >
              {t === "details" ? "Details" : "Activities & Notes"}
              {tab === t && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full animate-fade-in" />}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in duration-300">
          {tab === "details" && (
            <div className="space-y-8">
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
            </div>
          )}

          {/* Stock History & Notes Timeline */}
          {tab === "activity" && (
            <section className="space-y-6">
              <div className="space-y-4 relative pl-4">
                <div className="absolute left-[3px] top-2 bottom-2 w-px bg-black/[0.04]" />
                {product.activities.length === 0 ? (
                  <div className="text-center py-4 text-on-surface-variant opacity-30 font-body-sm text-[11px]">No activities yet</div>
                ) : (
                  [...product.activities].reverse().map((activity: StockActivity) => {
                    const isNote = activity.type === "note";
                    const Icon = isNote ? MessageSquare : activity.type === "stock_in" ? ArrowDownLeft : activity.type === "stock_out" ? ArrowUpRight : AlertTriangle;
                    const color = isNote ? "text-blue-500" : activity.type === "stock_in" ? "text-green-500" : activity.type === "stock_out" ? "text-red-500" : "text-amber-500";

                    return (
                      <div key={activity.id} className="relative flex items-start gap-4">
                        <div className="absolute -left-[14px] top-1.5 w-2 h-2 rounded-full bg-black/[0.1] border-2 border-white" />
                        <div className={`mt-0.5 opacity-60 ${color}`}><Icon size={12} /></div>
                        <div className="flex-1 space-y-0.5">
                          <p className="font-display text-[12.5px] text-on-surface-variant/80">
                            <span className="font-bold text-on-surface">{activity.author || "System"}</span> {isNote ? 'added a note:' : 'logged an activity:'} <span className={`font-bold text-on-surface ${isNote ? "whitespace-pre-wrap block mt-1 font-normal opacity-90" : ""}`}>{activity.description}</span>
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Clock size={10} className="opacity-20" />
                              <span className="text-[10px] text-on-surface-variant opacity-30">{new Date(activity.timestamp).toLocaleString()}</span>
                            </div>
                            {activity.quantity !== undefined && activity.quantity !== 0 && (
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

              <div className="pt-4 border-t border-black/[0.04]">
                 <div className="flex gap-4">
                   {user?.image ? (
                     <img src={user.image} className="w-8 h-8 rounded-full object-cover shrink-0" alt="" />
                   ) : (
                     <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-[10px] text-on-primary shrink-0">
                       {(user?.name || "U").substring(0, 2).toUpperCase()}
                     </div>
                   )}
                   <div className="flex-1 space-y-2">
                     <textarea
                       rows={2}
                       placeholder="Add a note, update, or log activity..."
                       value={newNote}
                       onChange={e => setNewNote(e.target.value)}
                       onKeyDown={e => {
                         if (e.key === "Enter" && !e.shiftKey) {
                           e.preventDefault();
                           handleAddNote();
                         }
                       }}
                       className="w-full bg-black/[0.02] border border-black/[0.06] rounded-[8px] p-3 font-display text-[13px] outline-none focus:bg-white focus:border-primary/30 transition-all"
                     />
                     <div className="flex items-center justify-end">
                       <Button
                         variant="primary"
                         size="sm"
                         disabled={!newNote.trim()}
                         onClick={handleAddNote}
                       >
                         POST NOTE
                       </Button>
                     </div>
                   </div>
                 </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </Drawer>
  );
}
