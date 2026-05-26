import React, { useState } from "react";
import { useAssets } from "../context/AssetsContext";
import { useTenant } from "@/components/providers/TenantProvider";
import { X, Star, DollarSign, TrendingUp, Layers, MapPin, History, User, Trash2, Clock, Maximize2, CheckCircle2, Tag, UploadCloud, Loader2, Pencil, Check, Wallet, Calendar } from "lucide-react";
import { AssetStatus, AssetComment } from "@/features/assets/types";
import Button from "@/components/ui/Button";
import Dropdown from "@/components/ui/Dropdown";
import MemberPicker from "@/features/tasks/components/MemberPicker";

function formatCurrency(val: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, currencyDisplay: "code", maximumFractionDigits: 0 }).format(val);
}

const CURRENCY_OPTIONS = [
  { label: "USD", value: "USD" },
  { label: "IDR", value: "IDR" },
  { label: "EUR", value: "EUR" },
  { label: "GBP", value: "GBP" },
  { label: "SGD", value: "SGD" },
];

const STATUSES: AssetStatus[] = ["Available", "In Use", "Maintenance", "Damaged", "Archived"];

const CATEGORY_OPTIONS = [
  { label: "Electronics", value: "Electronics" },
  { label: "Vehicle", value: "Vehicle" },
  { label: "Furniture", value: "Furniture" },
  { label: "Equipment", value: "Equipment" },
  { label: "Property", value: "Property" },
  { label: "Tools", value: "Tools" },
  { label: "Other", value: "Other" },
];

function Section({ label, count, children, defaultOpen = true }: { label: string; count?: number; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="space-y-3">
      <button onClick={() => setOpen(v => !v)} className="flex items-center gap-2 group w-full focus:outline-none">
        <span className="font-label-caps text-[10px] font-bold text-on-surface-variant opacity-30 uppercase tracking-[0.15em] flex-1 text-left">
          {label} {count !== undefined && `(${count})`}
        </span>
        <div className="h-px flex-1 bg-black/[0.03]" />
      </button>
      {open && children}
    </div>
  );
}

export default function AssetDrawer({ assetId, onClose }: { assetId: string, onClose: () => void }) {
  const { assets, updateAsset } = useAssets();
  const { user } = useTenant();
  const asset = assets.find(a => a.id === assetId);

  const [tab, setTab] = useState<"details" | "activity">("details");
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [comment, setComment] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editCurrency, setEditCurrency] = useState("USD");

  if (!asset) return null;

  const saveEdit = () => {
    if (editingField === "location") handleUpdate({ location: editValue.trim() || undefined }, "updated location to", editValue.trim() || "Unlocated");
    if (editingField === "quantity") handleUpdate({ quantity: parseInt(editValue) || 1 }, "updated quantity to", (parseInt(editValue) || 1).toString());
    if (editingField === "purchaseValue") {
      handleUpdate({ purchaseValue: parseFloat(editValue) || undefined, currency: editCurrency }, "updated value to", parseFloat(editValue) ? `${editCurrency} ${parseFloat(editValue)}` : "None");
    }
    setEditingField(null);
  };

  const deleteImageFromStorage = (imageUrl: string) => {
    try {
      const url = new URL(imageUrl, window.location.origin);
      const path = url.searchParams.get("path");
      if (path) {
        fetch(`/api/tenant/files?path=${encodeURIComponent(path)}`, { method: "DELETE" }).catch(console.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveImage = () => {
    if (asset?.imageUrl) {
      deleteImageFromStorage(asset.imageUrl);
    }
    handleUpdate({ imageUrl: undefined }, "removed asset image");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB.");
      return;
    }

    try {
      setIsUploadingImage(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "assets");

      const res = await fetch("/api/tenant/files", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (data.downloadUrl) {
        if (asset?.imageUrl) {
          deleteImageFromStorage(asset.imageUrl);
        }
        handleUpdate({ imageUrl: data.downloadUrl }, "updated asset image");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to upload image");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleUpdate = (patch: Partial<typeof asset>, actionDesc?: string, detail?: string, type: "assignment" | "status_change" | "note" = "note") => {
    if (actionDesc) {
      const newActivity = {
        id: `act${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        type,
        author: user?.name || "System",
        description: actionDesc,
        detail,
        timestamp: new Date().toISOString()
      };
      patch.activities = [...(asset.activities || []), newActivity];
    }
    updateAsset(asset.id, patch);
  };

  function submitComment() {
    if (!comment.trim()) return;
    const author = user?.name || "Current User";
    const initials = author.substring(0, 2).toUpperCase();
    const c: AssetComment = {
      id: `c${Date.now()}`,
      author,
      initials,
      avatar: user?.image,
      body: comment.trim(),
      timestamp: new Date().toLocaleString()
    };
    if (!asset) return;
    handleUpdate({ comments: [...(asset.comments || []), c] }, "added a note", c.body, "note");
    setComment("");
  }

  function deleteComment(id: string) {
    if (!asset) return;
    if (!confirm("Delete this note?")) return;
    handleUpdate({ comments: (asset.comments || []).filter(c => c.id !== id) }, "deleted a note");
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end">
        <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px] animate-fade-in" onClick={onClose} />

        <div className="relative w-full max-w-[440px] h-full bg-surface-container-lowest shadow-2xl flex flex-col animate-slide-in-right border-l border-black/[0.05]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 shrink-0 bg-surface-container-lowest z-10 sticky top-0 border-b border-black/[0.04]">
            <div className="flex items-center gap-2">
              <div className="px-2 py-1 rounded bg-black/5 font-mono text-[10px] font-bold text-on-surface-variant opacity-70">
                {asset.assetCode}
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-md text-on-surface-variant opacity-70 hover:opacity-100 hover:bg-black/5 transition-colors">
              <X size={14} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 pb-8 pt-6 space-y-8">

            {/* Title & Meta */}
            <div className="space-y-4">
              <div className="w-full h-48 bg-black/5 rounded-xl border border-black/[0.03] flex items-center justify-center group relative overflow-hidden">
                {asset.imageUrl ? (
                  <>
                    <img onClick={() => setIsImageExpanded(true)} src={asset.imageUrl} alt={asset.name} className="w-full h-full object-cover cursor-pointer transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                      <button onClick={() => setIsImageExpanded(true)} className="p-2 bg-black/40 backdrop-blur-md text-white rounded-full hover:bg-black/60 transition-colors" title="View Full Image">
                        <Maximize2 size={13} />
                      </button>
                      <label className="p-2 bg-black/40 backdrop-blur-md text-white rounded-full hover:bg-black/60 transition-colors cursor-pointer" title="Replace Image">
                        {isUploadingImage ? <Loader2 size={13} className="animate-spin" /> : <UploadCloud size={13} />}
                        <input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} disabled={isUploadingImage} className="hidden" />
                      </label>
                      <button onClick={handleRemoveImage} className="p-2 bg-black/40 backdrop-blur-md text-white hover:bg-red-500/90 rounded-full transition-colors" title="Remove Image">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </>
                ) : (
                  <label className="flex flex-col items-center gap-2 cursor-pointer text-on-surface-variant opacity-50 hover:opacity-100 transition-opacity w-full h-full justify-center">
                    {isUploadingImage ? <Loader2 size={24} className="animate-spin" /> : <UploadCloud size={24} strokeWidth={1.5} />}
                    <span className="font-display font-semibold text-[12px]">{isUploadingImage ? "Uploading..." : "Add Image"}</span>
                    <input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} disabled={isUploadingImage} className="hidden" />
                  </label>
                )}
              </div>

              <div className="space-y-1">
                <input
                  type="text"
                  value={asset.name}
                  onChange={e => updateAsset(asset.id, { name: e.target.value })}
                  className="w-full font-display text-[22px] font-bold text-on-surface tracking-tight bg-transparent border-none outline-none rounded -ml-1 px-1 transition-all"
                  placeholder="Asset Name"
                />
              </div>
            </div>

            {/* Quick Meta */}
            <div className="flex flex-col gap-5 py-4 border-y border-black/[0.04] mb-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 flex flex-col justify-center">
                  <span className="font-label-caps text-[8px] font-bold text-on-surface-variant opacity-40 uppercase tracking-widest flex items-center gap-1"><CheckCircle2 size={10} /> Status</span>
                  <div className="-ml-2">
                    <Dropdown
                      value={asset.status}
                      onChange={(val) => handleUpdate({ status: val as AssetStatus }, "changed status to", val, "status_change")}
                      options={STATUSES.map(s => ({ label: s, value: s }))}
                    />
                  </div>
                </div>

                <div className="space-y-1.5 flex flex-col justify-center">
                  <span className="font-label-caps text-[8px] font-bold text-on-surface-variant opacity-40 uppercase tracking-widest flex items-center gap-1"><Tag size={10} /> Category</span>
                  <div className="-ml-2">
                    <Dropdown
                      value={asset.category}
                      onChange={(val) => handleUpdate({ category: val }, "changed category to", val)}
                      options={CATEGORY_OPTIONS}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 flex flex-col justify-center">
                <span className="font-label-caps text-[8px] font-bold text-on-surface-variant opacity-40 uppercase tracking-widest flex items-center gap-1"><User size={10} /> Assignees</span>
                <div className="-ml-1 mt-0.5 relative z-20">
                  <MemberPicker
                    selected={(() => {
                      const arr = Array.isArray(asset.assignedTo) ? asset.assignedTo : (asset.assignedTo ? [asset.assignedTo as unknown as string] : []);
                      return arr.map(name => ({ id: name, name, initials: name.charAt(0).toUpperCase(), role: "" }));
                    })()}
                    onChange={members => handleUpdate({ assignedTo: members.map(m => m.name) }, "assigned to", members.map(m => m.name).join(", ") || "Unassigned", "assignment")}
                  />
                </div>
              </div>

              <div className="space-y-1.5 flex flex-col justify-center group/loc relative">
                <span className="font-label-caps text-[8px] font-bold text-on-surface-variant opacity-40 uppercase tracking-widest flex items-center gap-1"><MapPin size={10} /> Location</span>
                {editingField === "location" ? (
                  <div className="flex items-center gap-1.5 mt-1">
                    <input autoFocus type="text" value={editValue} onChange={e => setEditValue(e.target.value)} onKeyDown={e => e.key === "Enter" && saveEdit()} className="flex-1 font-display font-semibold text-[12.5px] text-on-surface px-1.5 py-1 bg-black/5 border-none outline-none focus:ring-2 focus:ring-primary/20 rounded min-w-0 transition-all" placeholder="Location..." />
                    <button onClick={saveEdit} className="p-1.5 rounded bg-primary/10 text-primary hover:bg-primary/20 shrink-0 transition-all"><Check size={14} strokeWidth={3} /></button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="font-display font-semibold text-[12.5px] text-on-surface opacity-90 px-1 truncate pr-6">{asset.location || "Unlocated"}</div>
                    <button onClick={() => { setEditValue(asset.location || ""); setEditingField("location"); }} className="absolute right-0 opacity-0 group-hover/loc:opacity-100 p-1 rounded hover:bg-black/5 text-on-surface-variant transition-all"><Pencil size={11} /></button>
                  </div>
                )}
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
                  {t}
                  {tab === t && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full animate-fade-in" />}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="animate-in fade-in duration-300">
              {tab === "details" && (
                <div className="space-y-8">
                  <Section label="Details">
                    <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                      <div className="space-y-1.5">
                        <div className="font-label-caps text-[8.5px] text-on-surface-variant opacity-50 uppercase tracking-wider flex items-center gap-1">
                          <Calendar size={10} /> Purchase Date
                        </div>
                        <div className="font-body-sm text-[12.5px] text-on-surface opacity-90">
                          {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : "N/A"}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="font-label-caps text-[8.5px] text-on-surface-variant opacity-50 uppercase tracking-wider flex items-center gap-1">Warranty Thru</div>
                        <div className="font-body-sm text-[12.5px] text-on-surface opacity-90">
                          {asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toLocaleDateString() : "N/A"}
                        </div>
                      </div>
                      <div className="space-y-1.5 group/qty relative">
                        <div className="font-label-caps text-[8.5px] text-on-surface-variant opacity-50 uppercase tracking-wider flex items-center gap-1">
                          <Layers size={10} /> Quantity
                        </div>
                        {editingField === "quantity" ? (
                          <div className="flex items-center gap-1.5 mt-1">
                            <input autoFocus type="number" min={1} value={editValue} onChange={e => setEditValue(e.target.value)} onKeyDown={e => e.key === "Enter" && saveEdit()} className="flex-1 font-body-sm text-[12.5px] text-on-surface px-1.5 py-1 bg-black/5 border-none outline-none focus:ring-2 focus:ring-primary/20 rounded min-w-0 transition-all" />
                            <button onClick={saveEdit} className="p-1.5 rounded bg-primary/10 text-primary hover:bg-primary/20 shrink-0 transition-all"><Check size={14} strokeWidth={3} /></button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="font-body-sm text-[12.5px] text-on-surface opacity-90">{asset.quantity || 1} {(asset.quantity || 1) === 1 ? "Unit" : "Units"}</div>
                            <button onClick={() => { setEditValue((asset.quantity || 1).toString()); setEditingField("quantity"); }} className="absolute right-0 top-3 opacity-0 group-hover/qty:opacity-100 p-1 rounded hover:bg-black/5 text-on-surface-variant transition-all"><Pencil size={11} /></button>
                          </div>
                        )}
                      </div>
                      <div className="space-y-1.5 group/val relative">
                        <div className="font-label-caps text-[8.5px] text-on-surface-variant opacity-50 uppercase tracking-wider flex items-center gap-1">
                          <Wallet size={10} /> Value
                        </div>
                        {editingField === "purchaseValue" ? (
                          <div className="flex items-center gap-1.5 w-full mt-1">
                            <div className="w-[85px] shrink-0"><Dropdown value={editCurrency} onChange={setEditCurrency} options={CURRENCY_OPTIONS} /></div>
                            <input autoFocus type="number" min={0} value={editValue} onChange={e => setEditValue(e.target.value)} onKeyDown={e => e.key === "Enter" && saveEdit()} className="flex-1 font-body-sm text-[12.5px] text-on-surface px-1.5 py-1 bg-black/5 border-none outline-none focus:ring-2 focus:ring-primary/20 rounded min-w-0 transition-all" placeholder="0.00" />
                            <button onClick={saveEdit} className="p-1.5 rounded bg-primary/10 text-primary hover:bg-primary/20 shrink-0 transition-all"><Check size={14} strokeWidth={3} /></button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="font-display font-bold text-[15px] text-on-surface opacity-90 break-all pr-6" title={asset.purchaseValue ? formatCurrency(asset.purchaseValue, asset.currency) : undefined}>
                              {asset.purchaseValue ? formatCurrency(asset.purchaseValue, asset.currency) : "—"}
                            </div>
                            <button onClick={() => { setEditValue(asset.purchaseValue?.toString() || ""); setEditCurrency(asset.currency || "USD"); setEditingField("purchaseValue"); }} className="absolute right-0 top-3 opacity-0 group-hover/val:opacity-100 p-1 rounded hover:bg-black/5 text-on-surface-variant transition-all"><Pencil size={11} /></button>
                          </div>
                        )}
                      </div>
                      <div className="space-y-1.5 col-span-2">
                        <div className="font-label-caps text-[8.5px] text-on-surface-variant opacity-50 uppercase tracking-wider flex items-center gap-1">Supplier</div>
                        <div className="font-body-sm text-[12.5px] text-on-surface opacity-90 break-words">{asset.supplierName || "N/A"}</div>
                      </div>
                    </div>
                  </Section>

                  <Section label="Notes" count={(asset.comments || []).length}>
                    <div className="space-y-6">
                      {(asset.comments || []).map(c => (
                        <div key={c.id} className="flex gap-4 group">
                          {c.avatar ? (
                            <img src={c.avatar} className="w-8 h-8 rounded-full object-cover shrink-0" alt="" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-black/[0.04] border border-black/[0.04] flex items-center justify-center font-bold text-[10px] text-on-surface-variant shrink-0">
                              {c.initials}
                            </div>
                          )}
                          <div className="flex-1 space-y-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-display text-[13px] font-bold">{c.author}</span>
                                <span className="text-[10px] text-on-surface-variant opacity-30">{c.timestamp}</span>
                              </div>
                              <button
                                onClick={() => deleteComment(c.id)}
                                className="text-red-500 opacity-20 hover:opacity-100 hover:bg-red-50 p-1 rounded transition-all"
                                title="Delete note"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                            <p className="font-display text-[13px] text-on-surface-variant/80 leading-relaxed break-words break-all whitespace-pre-wrap">{c.body}</p>
                          </div>
                        </div>
                      ))}
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
                              placeholder="Add a note or log activity..."
                              value={comment}
                              onChange={e => setComment(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  submitComment();
                                }
                              }}
                              className="w-full bg-black/[0.02] border border-black/[0.06] rounded-[8px] p-3 font-display text-[13px] outline-none focus:bg-white focus:border-primary/30 transition-all resize-none"
                            />
                            <div className="flex items-center justify-end">
                              <Button
                                variant="primary"
                                size="sm"
                                disabled={!comment.trim()}
                                onClick={submitComment}
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

              {tab === "activity" && (
                <div className="space-y-8">
                  <Section label="Timeline" defaultOpen={true}>
                    <div className="space-y-6 relative pl-4">
                      <div className="absolute left-[3px] top-2 bottom-2 w-px bg-black/[0.04]" />
                      {asset.activities && asset.activities.length > 0 ? (
                        [...asset.activities].reverse().map(a => (
                          <div key={a.id} className="relative flex items-start gap-4">
                            <div className="absolute -left-[14px] top-1.5 w-2 h-2 rounded-full bg-black/[0.1] border-2 border-white" />
                            <div className="flex-1 space-y-0.5">
                              <p className="font-display text-[12.5px] text-on-surface-variant/80">
                                <span className="font-bold text-on-surface">{a.author}</span>
                                {' '}
                                {a.description === 'added a note' ? (
                                  <>
                                    added a note:{" "}
                                    {a.detail && (
                                      <span className="whitespace-pre-wrap font-normal opacity-90 text-on-surface">
                                        "{a.detail}"
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    {a.description} {a.detail && <span className="font-bold text-on-surface">{a.detail}</span>}
                                  </>
                                )}
                              </p>
                              <div className="flex items-center gap-1.5">
                                <Clock size={10} className="opacity-20" />
                                <span className="text-[10px] text-on-surface-variant opacity-30">{new Date(a.timestamp).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-[12px] text-on-surface-variant opacity-50 py-4 text-center">No activity recorded yet</div>
                      )}
                    </div>
                  </Section>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Fullscreen Image Overlay */}
      {isImageExpanded && asset.imageUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-8 animate-fade-in">
          <button
            onClick={() => setIsImageExpanded(false)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X size={24} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset.imageUrl}
            alt={asset.name}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        </div>
      )}
    </>
  );
}
