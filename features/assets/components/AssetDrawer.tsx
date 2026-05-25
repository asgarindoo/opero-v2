import React, { useState } from "react";
import { useAssets } from "../context/AssetsContext";
import { X, Building2, Clock, Tag, User, CheckCircle2, ChevronRight, MessageSquare, Briefcase, Star, DollarSign, ListTodo, CalendarClock, MoreHorizontal, TrendingUp, Layers, Paperclip, FileText, ShieldCheck, MapPin, Landmark, History } from "lucide-react";
import { AssetStatus, AssetActivity } from "@/features/assets";

function formatCurrency(val: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);
}

const STATUSES: AssetStatus[] = ["Available", "In Use", "Maintenance", "Damaged", "Archived"];

export default function AssetDrawer({ assetId, onClose }: { assetId: string, onClose: () => void }) {
  const { assets, updateAsset } = useAssets();
  const asset = assets.find(a => a.id === assetId);

  if (!asset) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px] animate-fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-[560px] h-full bg-surface-container-lowest shadow-2xl flex flex-col animate-slide-in-right border-l border-black/[0.05]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0 bg-surface-container-lowest z-10 sticky top-0">
          <div className="flex items-center gap-2">
             <div className="px-2 py-1 rounded bg-black/5 font-mono text-[10px] font-bold text-on-surface-variant opacity-70">
               {asset.assetCode}
             </div>
             <button className="p-1.5 rounded-md hover:bg-black/5 transition-colors text-on-surface-variant">
               <Star size={14} />
             </button>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md text-on-surface-variant opacity-70 hover:opacity-100 hover:bg-black/5 transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-8">
          
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-label-caps text-[8.5px] font-bold px-1.5 py-0.5 rounded bg-black/5 text-on-surface-variant border border-black/[0.03]">
                {asset.status.toUpperCase()}
              </span>
              <span className="font-label-caps text-[8.5px] font-bold px-1.5 py-0.5 rounded bg-black/5 text-on-surface-variant opacity-70">
                {asset.category.toUpperCase()}
              </span>
            </div>
            <h3 
              className="font-display font-bold text-[20px] text-on-surface leading-tight mb-2 break-words break-all line-clamp-3"
              title={asset.name}
            >
              {asset.name}
            </h3>
            <div className="flex items-center gap-4 text-on-surface-variant opacity-70">
              <div className="flex items-center gap-1.5 font-body-sm text-[12px]">
                <MapPin size={13} /> {asset.location || "Unlocated"}
              </div>
            </div>
          </div>

          {/* Operational Status Flow */}
          <div className="flex items-center w-full mb-8 relative">
             {STATUSES.map((status, idx) => {
               const isActive = asset.status === status;
               const statusIndex = STATUSES.indexOf(asset.status);
               const isPast = idx < statusIndex;

               return (
                 <button
                   key={status}
                   onClick={() => updateAsset(asset.id, { status })}
                   className={`flex-1 py-1 font-body-sm text-[9.5px] text-left border-b-2 transition-all ${
                     isActive ? "border-on-surface text-on-surface font-semibold" : 
                     isPast ? "border-on-surface/20 text-on-surface-variant opacity-60" : 
                     "border-black/5 text-on-surface-variant opacity-60 hover:opacity-80"
                   }`}
                 >
                   {status}
                 </button>
               )
             })}
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-surface-container-low/50 border border-black/[0.03] space-y-3">
              <div>
                <div className="font-label-caps text-[8.5px] text-on-surface-variant opacity-50 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <User size={10} /> Current Owner
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                    {asset.assignedTo ? asset.assignedTo.charAt(0) : "?"}
                  </div>
                  <span className="font-display font-bold text-[14px] text-on-surface opacity-90">{asset.assignedTo || "Unassigned"}</span>
                </div>
              </div>
              <div>
                <div className="font-label-caps text-[8.5px] text-on-surface-variant opacity-50 uppercase tracking-wider mb-1">Warranty Thru</div>
                <div className="font-body-sm text-[12px] text-on-surface opacity-80">{asset.warrantyExpiry || "N/A"}</div>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-surface-container-low/50 border border-black/[0.03] space-y-3">
              <div>
                <div className="font-label-caps text-[8.5px] text-on-surface-variant opacity-50 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <DollarSign size={10} /> Value
                </div>
                <div 
                  className="font-display font-bold text-[17px] text-on-surface opacity-90 break-all"
                  title={asset.purchaseValue ? formatCurrency(asset.purchaseValue) : undefined}
                >
                  {asset.purchaseValue ? formatCurrency(asset.purchaseValue) : "—"}
                </div>
              </div>
              <div>
                <div className="font-label-caps text-[8.5px] text-on-surface-variant opacity-50 uppercase tracking-wider mb-1">Supplier</div>
                <div className="font-body-sm text-[12px] text-on-surface opacity-80 truncate">{asset.supplierName || "Direct"}</div>
              </div>
            </div>
          </div>
          
          {asset.notes && (
            <div className="mb-8 p-4 rounded-xl bg-surface-container-low/50 border border-black/[0.03]">
              <div className="font-label-caps text-[8.5px] text-on-surface-variant opacity-50 uppercase tracking-wider mb-2">Notes</div>
              <p className="font-body-sm text-[12px] text-on-surface opacity-80 whitespace-pre-wrap">{asset.notes}</p>
            </div>
          )}

          {/* Activity timeline */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-label-caps text-[9px] text-on-surface-variant opacity-60 uppercase tracking-wider">Asset Activity</h4>
            </div>
            
            <div className="space-y-4">
              {(asset.activities || []).length === 0 ? (
                <div className="py-4 text-center border border-dashed border-black/5 rounded-lg font-body-sm text-[11px] text-on-surface-variant opacity-60">No activity recorded</div>
              ) : (
                (asset.activities || []).map(activity => {
                  const Icon = activity.type === "assignment" ? User : activity.type === "status_change" ? TrendingUp : History;
                  return (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="mt-0.5 opacity-60 text-on-surface-variant"><Icon size={12} /></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-display font-medium text-[12px] text-on-surface opacity-90">{activity.author}</span>
                          <span className="font-body-sm text-[10px] text-on-surface-variant opacity-60">{new Date(activity.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p className="font-body-sm text-[12px] text-on-surface-variant leading-relaxed opacity-80">{activity.description}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
          
        </div>
      </div>
    </div>
  );
}
