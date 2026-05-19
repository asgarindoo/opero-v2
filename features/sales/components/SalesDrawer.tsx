import React, { useState } from "react";
import { useSales } from "../context/SalesContext";
import { X, Building2, Clock, Mail, User, CheckCircle2, ChevronRight, MessageSquare, Briefcase, Star, DollarSign, ListTodo, CalendarClock, MoreHorizontal, TrendingUp, Layers, Paperclip, FileText, Truck, MapPin, Receipt, ShieldCheck, Package } from "lucide-react";
import { SaleStatus, PaymentStatus } from "../types";

function formatCurrency(val: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);
}

const STATUSES: SaleStatus[] = ["Pending", "Paid", "Processing", "Packed", "Shipped", "Completed", "Cancelled"];

export default function SalesDrawer({ saleId, onClose }: { saleId: string, onClose: () => void }) {
  const { sales, addActivity, updateSale } = useSales();
  const sale = sales.find(s => s.id === saleId);
  const [newNote, setNewNote] = useState("");

  if (!sale) return null;

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    addActivity(sale.id, { type: "note", description: newNote });
    setNewNote("");
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px] animate-fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-[540px] h-full bg-surface-container-lowest shadow-2xl flex flex-col animate-slide-in-right border-l border-black/[0.05]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0 bg-surface-container-lowest z-10 sticky top-0">
          <div className="flex items-center gap-2">
             <div className="px-2 py-1 rounded bg-black/5 font-mono text-[10px] font-bold text-on-surface-variant opacity-70">
               {sale.orderNumber}
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
                {sale.status.toUpperCase()}
              </span>
              <span className={`font-label-caps text-[8.5px] font-bold px-1.5 py-0.5 rounded bg-black/5 text-on-surface-variant opacity-70 flex items-center gap-1`}>
                <Receipt size={10} /> {sale.paymentStatus.toUpperCase()}
              </span>
            </div>
            <h3 className="font-display font-bold text-[19px] text-on-surface leading-tight mb-2">{sale.title}</h3>
            <div className="flex items-center gap-4 text-on-surface-variant opacity-70">
              <div className="flex items-center gap-1.5 font-body-sm text-[11.5px]">
                <Building2 size={13} /> {sale.contactName}
              </div>
              <div className="flex items-center gap-1.5 font-body-sm text-[11.5px]">
                <Clock size={13} /> Created {new Date(sale.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Operational Status Flow */}
          <div className="flex items-center w-full mb-8 relative">
             {STATUSES.map((status, idx) => {
               const isActive = sale.status === status;
               const statusIndex = STATUSES.indexOf(sale.status);
               const isPast = idx < statusIndex;

               return (
                 <button
                   key={status}
                   onClick={() => updateSale(sale.id, { status })}
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

          {/* Logistics & Financial Overview */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-surface-container-low/50 border border-black/[0.03] space-y-3">
              <div>
                <div className="font-label-caps text-[8.5px] text-on-surface-variant opacity-50 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <DollarSign size={10} /> Total Value
                </div>
                <div className="font-display font-bold text-[17px] text-on-surface opacity-90">{formatCurrency(sale.value)}</div>
              </div>
              <div>
                <div className="font-label-caps text-[8.5px] text-on-surface-variant opacity-50 uppercase tracking-wider mb-1">Assigned PIC</div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-primary/10 text-primary flex items-center justify-center font-bold text-[8px]">
                    {sale.assignedStaff[0].charAt(0)}
                  </div>
                  <span className="font-body-sm text-[11.5px] text-on-surface opacity-80">{sale.assignedStaff[0]}</span>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-surface-container-low/50 border border-black/[0.03] space-y-3">
              <div>
                <div className="font-label-caps text-[8.5px] text-on-surface-variant opacity-50 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Truck size={10} /> Shipping
                </div>
                <div className="font-body-sm text-[11.5px] text-on-surface opacity-80 truncate">
                  {sale.shippingAddress || "No address provided"}
                </div>
              </div>
              <div>
                <div className="font-label-caps text-[8.5px] text-on-surface-variant opacity-50 uppercase tracking-wider mb-1">Tracking</div>
                <div className="font-body-sm text-[11.5px] text-on-surface opacity-80 font-mono tracking-tight">
                  {sale.trackingNumber || "Not available"}
                </div>
              </div>
            </div>
          </div>

          {/* Item List with SKUs */}
          <section className="mb-8">
             <div className="flex items-center justify-between mb-3">
               <h4 className="font-label-caps text-[9px] text-on-surface-variant opacity-60 uppercase tracking-wider">Line Items</h4>
               <span className="font-body-sm text-[10px] text-on-surface-variant opacity-60">{sale.items.length} items</span>
             </div>
             <div className="space-y-1">
               {sale.items.map(item => (
                 <div key={item.id} className="flex items-center justify-between py-2.5 px-1 border-b border-black/[0.02]">
                   <div className="flex items-center gap-3">
                     <div className="w-7 h-7 rounded bg-black/5 flex items-center justify-center text-on-surface-variant opacity-60">
                       <Package size={12} />
                     </div>
                     <div>
                       <p className="font-display font-medium text-[12.5px] text-on-surface opacity-90">{item.name}</p>
                       <p className="font-body-sm text-[10px] text-on-surface-variant opacity-50 flex items-center gap-2">
                         <span>SKU: {item.sku || "—"}</span>
                         <span>•</span>
                         <span>Qty: {item.quantity}</span>
                       </p>
                     </div>
                   </div>
                   <div className="text-right">
                     <p className="font-body-sm font-semibold text-[12px] text-on-surface opacity-80">{formatCurrency(item.price * item.quantity)}</p>
                     <p className="font-body-sm text-[9px] text-on-surface-variant opacity-60">{formatCurrency(item.price)} ea</p>
                   </div>
                 </div>
               ))}
             </div>
          </section>

          {/* Activity & Notes */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-label-caps text-[9px] text-on-surface-variant opacity-40 uppercase tracking-wider">Activity Log</h4>
              <div className="flex gap-1">
                <button className="p-1.5 rounded-md hover:bg-black/5 text-on-surface-variant opacity-80 transition-colors">
                  <Paperclip size={12} />
                </button>
                <button className="p-1.5 rounded-md hover:bg-black/5 text-on-surface-variant opacity-80 transition-colors">
                  <ShieldCheck size={12} />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleAddNote} className="mb-6 relative">
              <input 
                type="text"
                placeholder="Log a note or operational update..."
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                className="w-full px-0 py-2 border-b border-black/10 bg-transparent focus:border-primary/40 outline-none transition-all font-body-sm text-[12px] placeholder:opacity-60"
              />
              {newNote.trim() && (
                <button type="submit" className="absolute right-0 top-1.5 font-label-caps text-[9px] font-bold text-on-surface">LOG</button>
              )}
            </form>

            <div className="space-y-4">
              {sale.activities.map(activity => {
                const Icon = activity.type === "payment" ? DollarSign : activity.type === "shipping" ? Truck : activity.type === "status_change" ? TrendingUp : FileText;
                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="mt-0.5 opacity-30 text-on-surface-variant"><Icon size={11} /></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-display font-medium text-[12px] text-on-surface opacity-90">{activity.author}</span>
                        <span className="font-body-sm text-[10px] text-on-surface-variant opacity-60">{new Date(activity.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="font-body-sm text-[12px] text-on-surface-variant leading-relaxed opacity-80">{activity.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
          
        </div>
      </div>
    </div>
  );
}
