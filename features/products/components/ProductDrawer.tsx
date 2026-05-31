import React, { useState } from "react";
import { useProducts } from "../context/ProductsContext";
import { X, Clock, ArrowUpRight, ArrowDownLeft, AlertTriangle, Package, Wrench, Star, DollarSign, FileText, MessageSquare } from "lucide-react";
import type { StockActivity, ProductVariant } from "../types";
import { useTenant } from "@/components/providers/TenantProvider";
import Drawer from "@/components/ui/Drawer";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import UserAvatar from "@/components/common/UserAvatar";
import { getUserDisplayName } from "@/lib/user-identity";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { Trash2 } from "lucide-react";

function Section({ label, count, children, defaultOpen = true }: { label: string; count?: number; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="space-y-3">
      <button onClick={() => setOpen(v => !v)} className="flex items-center gap-2 group w-full">
        <span className="font-label-caps text-[10px] font-bold text-on-surface-variant opacity-30 uppercase tracking-[0.15em] flex-1 text-left">
          {label} {count !== undefined && `(${count})`}
        </span>
        <div className="h-px flex-1 bg-black/[0.03]" />
      </button>
      {open && children}
    </div>
  );
}

function formatPrice(price: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(price);
}

export default function ProductDrawer({ productId, onClose }: { productId: string; onClose: () => void }) {
  const { allProducts, adjustStock, addActivity, updateProduct } = useProducts();
  const product = allProducts.find(p => p.id === productId);
  const { user } = useTenant();
  const [adjustQty, setAdjustQty] = useState("");
  const [tab, setTab] = useState<"details" | "activity">("details");
  const [newNote, setNewNote] = useState("");
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  if (!product) return null;

  const isService = product.type === "Service";

  const handleAdjustStock = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(adjustQty);
    if (isNaN(qty) || qty === 0) return;
    adjustStock(product.id, qty, qty > 0 ? "stock_in" : "stock_out", "manually adjusted stock");
    setAdjustQty("");
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    addActivity(product.id, {
      type: "note",
      description: newNote.trim(),
      quantity: 0,
      userId: user?.id,
      email: user?.email ?? undefined,
      avatar: user?.image ?? null
    });
    setNewNote("");
  };

  const notes = product.activities.filter(a => a.type === "note");
  const actualActivities = product.activities.filter(a => a.type !== "note");

  return (
    <Drawer
      isOpen={true}
      onClose={onClose}
      title={product.sku}
      size="sm"
    >
      <div className="space-y-8">
        {/* Title */}
        <div className="space-y-2">
          <h1
            className="font-display text-[22px] font-bold text-on-surface tracking-tight break-words line-clamp-3"
            title={product.name}
          >
            {product.name}
          </h1>
          <div className="flex items-center gap-2">
            <Badge variant={
              product.status === "In Stock" ? "success" : 
              product.status === "Low Stock" ? "warning" : 
              product.status === "Archived" ? "neutral" : 
              "error"
            }>{product.status}</Badge>
            <Badge variant="info">{product.type}</Badge>
            {product.category && <span className="font-label-caps text-[9px] font-bold text-on-surface-variant opacity-40 uppercase tracking-wider">{product.category}</span>}
          </div>
        </div>

        {/* Quick Meta */}
        <div className="py-4 border-y border-black/[0.04]">
          <div className="space-y-1">
            <span className="font-label-caps text-[8px] font-bold text-on-surface-variant opacity-30 uppercase tracking-widest">Updated</span>
            <div className="font-body-sm text-[12px] text-on-surface flex items-center gap-1.5"><Clock size={13} /> {new Date(product.updatedAt).toLocaleDateString()}</div>
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
              {t === "details" ? "Details" : "Activity"}
              {tab === t && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full animate-fade-in" />}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in duration-300">
          {tab === "details" && (
            <div className="space-y-8">
              {/* Quick Stats */}
              <Section label="Overview">
                <div className="flex flex-col gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-40 uppercase tracking-wider mb-1">Price</div>
                    <div
                      className="font-display font-bold text-[18px] text-on-surface opacity-90 truncate"
                      title={product.price > 0 ? formatPrice(product.price, product.currency) : undefined}
                    >
                      {product.price > 0 ? formatPrice(product.price, product.currency) : <span className="text-[14px] opacity-40">Not set</span>}
                    </div>
                  </div>
                  <div className={`grid gap-4 ${isService ? "grid-cols-1" : "grid-cols-2"}`}>
                    {!isService && (
                      <>
                        <div className="space-y-1 min-w-0">
                          <div className="font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-40 uppercase tracking-wider mb-1">Total Stock</div>
                          <div
                            className={`font-display font-bold text-[18px] truncate ${product.totalQuantity <= product.minThreshold ? "text-amber-600" : "text-on-surface opacity-90"}`}
                            title={product.totalQuantity.toLocaleString()}
                          >
                            {product.totalQuantity.toLocaleString()}
                          </div>
                        </div>
                        <div className="space-y-1 min-w-0">
                          <div className="font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-40 uppercase tracking-wider mb-1">Alert Threshold</div>
                          <div
                            className="font-display font-bold text-[18px] text-on-surface opacity-90 truncate"
                            title={product.minThreshold.toLocaleString()}
                          >
                            {product.minThreshold.toLocaleString()}
                          </div>
                        </div>
                      </>
                    )}
                    {isService && (
                      <div className="space-y-1 min-w-0">
                        <div className="font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-40 uppercase tracking-wider mb-1">Type</div>
                        <div className="font-display font-bold text-[14px] text-on-surface opacity-70">Service</div>
                      </div>
                    )}
                  </div>
                </div>
              </Section>

              {/* Stock Adjustment — physical only */}
              {!isService && (
                <Section label="Stock Adjustment">
                  <form onSubmit={handleAdjustStock} className="flex gap-2">
                    <input
                      type="number" placeholder="+/- Quantity" value={adjustQty} onChange={e => setAdjustQty(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-black/10 bg-surface-container-lowest focus:border-primary/40 outline-none transition-all font-body-sm text-[12px] text-on-surface"
                    />
                    <button type="submit" className="px-4 py-1.5 rounded-lg bg-on-surface text-surface-container-lowest font-label-caps text-[9px] font-bold tracking-wide hover:opacity-90 transition-opacity">
                      ADJUST
                    </button>
                  </form>
                </Section>
              )}

              {/* Variants */}
              {product.variants.length > 0 && (
                <Section label="Variants" count={product.variants.length}>
                  <div className="space-y-1">
                    {product.variants.map((variant: ProductVariant) => (
                      <div key={variant.id} className="flex items-center justify-between py-2.5 px-1 border-b border-black/[0.02]">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-7 h-7 shrink-0 rounded bg-black/5 flex items-center justify-center text-on-surface-variant opacity-40 font-mono text-[9px] font-bold">
                            {variant.sku.slice(-3)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-display font-medium text-[12.5px] text-on-surface opacity-90 truncate" title={variant.name}>{variant.name}</p>
                            <p className="font-body-sm text-[10px] text-on-surface-variant opacity-40 font-mono truncate">{variant.sku}</p>
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
                </Section>
              )}

              <Section label="Notes" count={notes.length}>
                <div className="space-y-6">
                  {notes.length === 0 ? (
                    <div className="text-center py-2 text-on-surface-variant opacity-30 font-body-sm text-[11px]">No notes yet</div>
                  ) : (
                    notes.map(c => (
                      <div key={c.id} className="flex gap-4 group">
                        <UserAvatar
                          user={c.userId === user?.id ? user : { name: c.author, email: c.email, image: c.avatar, initials: c.initials }}
                          size="lg"
                          className="bg-primary/10 text-primary"
                        />
                        <div className="flex-1 space-y-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-display text-[13px] font-bold">
                                {c.userId === user?.id ? getUserDisplayName(user, c.author) : getUserDisplayName({ name: c.author, email: c.email }, "System")}
                              </span>
                              <span className="text-[10px] text-on-surface-variant opacity-30">{new Date(c.timestamp).toLocaleString()}</span>
                            </div>
                            <button
                              onClick={() => setNoteToDelete(c.id)}
                              className="text-red-500 opacity-20 hover:opacity-100 hover:bg-red-50 p-1 rounded transition-all"
                              title="Delete note"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                          <p className="font-display text-[13px] text-on-surface-variant/80 leading-relaxed break-words break-all whitespace-pre-wrap">{c.description}</p>
                        </div>
                      </div>
                    ))
                  )}
                  <div className="pt-4 border-t border-black/[0.04]">
                    <div className="flex gap-4">
                      <UserAvatar user={user} size="lg" className="bg-primary text-on-primary" />
                      <div className="flex-1 space-y-2">
                        <textarea
                          rows={2}
                          placeholder="Add a note..."
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
                </div>
              </Section>
            </div>
          )}

          {/* Stock History Timeline */}
          {tab === "activity" && (
            <section className="space-y-6">
              <div className="space-y-4 relative pl-4">
                <div className="absolute left-[3px] top-2 bottom-2 w-px bg-black/[0.04]" />
                {product.activities.length === 0 ? (
                  <div className="text-center py-4 text-on-surface-variant opacity-30 font-body-sm text-[11px]">No activities yet</div>
                ) : (
                  [...product.activities].reverse().map((a: StockActivity) => {
                    const isNote = a.type === "note";
                    return (
                      <div key={a.id} className="relative flex items-start gap-4">
                        <div className="absolute -left-[14px] top-1.5 w-2 h-2 rounded-full bg-black/[0.1] border-2 border-white" />
                        <div className="flex-1 space-y-0.5">
                          <p className="font-display text-[12.5px] text-on-surface-variant/80">
                            <span className="font-bold text-on-surface">
                              {a.userId === user?.id ? getUserDisplayName(user, a.author) : getUserDisplayName({ name: a.author, email: a.email }, "System")}
                            </span>
                            {' '}
                            {isNote ? (
                              <>
                                added a note:{" "}
                                <span className="whitespace-pre-wrap font-normal opacity-90 text-on-surface">
                                  "{a.description}"
                                </span>
                              </>
                            ) : (
                              <>
                                {a.description}
                                {a.quantity !== undefined && a.quantity !== 0 && (
                                  <span className="font-bold text-on-surface">
                                    {' '}({a.quantity > 0 ? "+" : ""}{a.quantity})
                                  </span>
                                )}
                              </>
                            )}
                          </p>
                          <span className="font-label-caps text-[9px] text-on-surface-variant opacity-40">
                            {new Date(a.timestamp).toLocaleString(undefined, { 
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                            })}
                          </span>
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
      <ConfirmationModal
        isOpen={!!noteToDelete}
        onClose={() => setNoteToDelete(null)}
        onConfirm={() => {
          if (noteToDelete) {
            const updatedActivities = product.activities.filter(a => a.id !== noteToDelete);
            updateProduct(product.id, { activities: updatedActivities });
            setNoteToDelete(null);
          }
        }}
        title="Delete Note"
        description="Are you sure you want to delete this note? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </Drawer>
  );
}
